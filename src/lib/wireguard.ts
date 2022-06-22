import {
  createRtNetlink,
  createGenericNetlink,
  parseAttribute,
  genl,
  formatAttribute,
  parseAttributes,
  FlagsGet,
  rt,
  NetlinkAttribute,
  GenericNetlinkSocket,
} from 'netlink';

const WG_GENL_NAME = 'wireguard';
const WG_GENL_VERSION = 1;

const WG_CMD_GET_DEVICE = 0;

/* eslint-disable no-unused-vars */
enum AddressFamily {
  INET = 2,
  INET6 = 10,
}

enum WgDeviceAttribute {
  UNSPEC,
  IFINDEX,
  IFNAME,
  PRIVATE_KEY,
  PUBLIC_KEY,
  FLAGS,
  LISTEN_PORT,
  FWMARK,
  PEERS,
}

enum WgPeerAttribute {
  UNSPEC,
  PUBLIC_KEY,
  PRESHARED_KEY,
  FLAGS,
  ENDPOINT,
  PERSISTENT_KEEPALIVE_INTERVAL,
  LAST_HANDSHAKE_TIME,
  RX_BYTES,
  TX_BYTES,
  ALLOWEDIPS,
  PROTOCOL_VERSION,
}

enum WgAllowedIpAttribute {
  UNSPEC,
  FAMILY,
  IPADDR,
  CIDR_MASK,
}
/* eslint-enable no-unused-vars */

export type WireguardPeer = {
  publicKey: string;
  hasPresharedKey: boolean;
  endpoint: string;
  keepAlive: number;
  lastHandshake: string;
  rxBytes: number;
  txBytes: number;
  allowedIps: string[];
}

export type WireguardInterface = {
  name: string;
  index: number;
  up: boolean;
  rxBytes: number;
  txBytes: number;
  listenPort: number;
  publicKey: string;
  peers: WireguardPeer[];
}

type WgSpecificLinkInfo = Pick<WireguardInterface, 'listenPort' | 'publicKey' | 'peers'>;

function isWgLink(link: rt.LinkMessage): boolean {
  if (link.attrs.linkinfo === undefined) {
    return false;
  }

  const linkinfo = parseAttribute(link.attrs.linkinfo);
  return linkinfo.x.data.compare(Buffer.from(`${WG_GENL_NAME}\x00`)) === 0;
}

/*
 * struct in_addr {
 *     unsigned long s_addr;
 * };
 */
function parseInAddr(family: AddressFamily, data: Buffer): string | null {
  if (family === AddressFamily.INET) {
    return [
      data.readUInt8(0),
      data.readUInt8(1),
      data.readUInt8(2),
      data.readUInt8(3),
    ].join('.');
  }

  if (family === AddressFamily.INET6) {
    let addr = '';
    for (let i = 0; i < 16; i += 2) {
      addr += data.readUInt8(i).toString(16) + data.readUInt8(i + 1).toString(16);

      if (i < 18) {
        addr += ':';
      }
    }

    return addr;
  }

  return null;
}

/*
 * struct sockaddr_in {
 *     short            sin_family;
 *     unsigned short   sin_port;
 *     struct in_addr   sin_addr;
 *     char             sin_zero[8];
 * };
 */
function parseSockAddrIn(data: Buffer): string {
  const family = data.readInt16LE(0);
  const port = data.readUint16LE(2);
  const addr = parseInAddr(family, data.subarray(4, 20));

  if (addr !== null) {
    if (family === AddressFamily.INET) {
      return `${addr}:${port}`;
    }

    if (family === AddressFamily.INET6) {
      return `[${addr}]:${port}`;
    }
  }

  return '<invalid>';
}

/*
 *
 * struct __kernel_timespec {
 *     __kernel_time64_t tv_sec;
 *     long long         tv_nsec;
 * };
 *
 */
function parseLinuxTimespec(data: Buffer): string {
  const sec = data.readBigUint64LE();
  const nsec = data.readBigInt64LE(8);
  const timestamp = sec * BigInt(1000) + nsec / BigInt(1000000);

  return new Date(Number(timestamp)).toISOString();
}

function parseAllowedIp(data: Buffer): string {
  let family = AddressFamily.INET;
  let addr;
  let mask;

  parseAttributes(data, (item) => {
    switch (item.type) {
      case WgAllowedIpAttribute.FAMILY:
        family = item.data.readUint16LE();
        break;

      case WgAllowedIpAttribute.IPADDR:
        addr = parseInAddr(family, item.data);
        break;

      case WgAllowedIpAttribute.CIDR_MASK:
        mask = item.data.readUInt8();
        break;

      default:
        break;
    }
  });

  return `${addr}/${mask}`;
}

function parseWgPeer(peerinfo: NetlinkAttribute): WireguardPeer {
  const result: WireguardPeer = {
    publicKey: '',
    hasPresharedKey: false,
    endpoint: '',
    keepAlive: 0,
    lastHandshake: new Date(0).toISOString(),
    rxBytes: 0,
    txBytes: 0,
    allowedIps: [],
  };

  parseAttributes(peerinfo.data, (peer) => {
    switch (peer.type) {
      case WgPeerAttribute.PUBLIC_KEY:
        result.publicKey = peer.data.toString('base64');
        break;

      case WgPeerAttribute.PRESHARED_KEY:
        result.hasPresharedKey = peer.data.compare(Buffer.alloc(peer.data.length)) !== 0;
        break;

      case WgPeerAttribute.ENDPOINT:
        result.endpoint = parseSockAddrIn(peer.data);
        break;

      case WgPeerAttribute.PERSISTENT_KEEPALIVE_INTERVAL:
        result.keepAlive = peer.data.readUint16LE();
        break;

      case WgPeerAttribute.LAST_HANDSHAKE_TIME:
        result.lastHandshake = parseLinuxTimespec(peer.data);
        break;

      case WgPeerAttribute.RX_BYTES:
        result.rxBytes = Number(peer.data.readBigUint64LE());
        break;

      case WgPeerAttribute.TX_BYTES:
        result.txBytes = Number(peer.data.readBigUint64LE());
        break;

      case WgPeerAttribute.ALLOWEDIPS:
        parseAttributes(peer.data, (item) => {
          result.allowedIps.push(parseAllowedIp(item.data));
        });
        break;

      default:
        break;
    }
  });

  return result;
}

async function getWgFamilyId(socket: GenericNetlinkSocket): Promise<number> {
  const families = await socket
    .ctrlRequest(genl.Commands.GET_FAMILY, {}, { flags: FlagsGet.DUMP });

  const family = families
    .find((fam) => fam.familyName === WG_GENL_NAME && fam.version === WG_GENL_VERSION);

  if (family === undefined || family.familyId === undefined) {
    throw new Error('Failed to retrieve WireGuard family ID');
  }

  return family.familyId;
}

function unpackWgLinkInfo(info: any): WgSpecificLinkInfo {
  const result: WgSpecificLinkInfo = {
    listenPort: 0,
    publicKey: '<unknown>',
    peers: [],
  };

  if (info.length === 0 || info[0].length === 0) {
    return result;
  }

  const { data } = info[0][0];
  if (!Buffer.isBuffer(data)) {
    return result;
  }

  parseAttributes(data, (item) => {
    switch (item.type) {
      case WgDeviceAttribute.LISTEN_PORT:
        result.listenPort = item.data.readUint16LE();
        break;

      case WgDeviceAttribute.PUBLIC_KEY:
        result.publicKey = item.data.toString('base64');
        break;

      case WgDeviceAttribute.PEERS:
        parseAttributes(item.data, (peer) => result.peers.push(parseWgPeer(peer)));
        break;

      default:
        break;
    }
  });

  return result;
}

async function getWgLinkInfo(link: rt.LinkMessage): Promise<WireguardInterface> {
  const socket = createGenericNetlink();
  const familyId = await getWgFamilyId(socket)
    .catch((err) => Promise.reject(new Error(`Failed to retrieve WireGuard family id: ${err}`)));

  const message = formatAttribute({
    type: WgDeviceAttribute.IFNAME,
    data: Buffer.from(`${link.attrs.ifname}\x00`),
  });

  const response = await socket
    .request(familyId, WG_CMD_GET_DEVICE, WG_GENL_VERSION, message, { flags: FlagsGet.DUMP })
    .catch((err) => Promise.reject(new Error(`Failed to retrieve WireGuard link info: ${err}`)));

  const wgInfo = unpackWgLinkInfo(response);

  return {
    name: link.attrs!.ifname!,
    index: link.data!.index!,
    up: link.data.flags!.up!,
    rxBytes: Number(link.attrs.stats64!.rxBytes),
    txBytes: Number(link.attrs.stats64!.txBytes),
    ...wgInfo,
  };
}

export async function getWireguardInterfaces(): Promise<WireguardInterface[]> {
  const socket = createRtNetlink();

  return socket.getLinks()
    .then((links) => (
      links
        .filter(isWgLink)
        .map(getWgLinkInfo)
    ))
    .then((ifs) => Promise.all(ifs));
}
