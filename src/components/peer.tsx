import type { WireguardPeer } from 'lib/wireguard';
import { formatKeepAlive, formatTimeDelta, formatTraffic } from 'lib/utils';

export default function Peer(props: WireguardPeer) {
  const {
    publicKey,
    hasPresharedKey,
    endpoint,
    keepAlive,
    lastHandshake,
    rxBytes,
    txBytes,
    allowedIps,
  } = props;

  return (
    <div className="card">
      <span className="chip ~neutral">
        Peer
      </span>
      {!endpoint && (
        <span className="chip ~critical ml-2">
          Down
        </span>
      )}
      {hasPresharedKey
        ? (
          <span className="chip ~positive ml-2">
            Has preshared key
          </span>
        ) : (
          <span className="chip ~critical ml-2">
            No preshared key
          </span>
        )}
      <hr className="sep h-2" />

      <div className="flex mb-4">
        <div className="basis-1/4">
          <h4>
            Endpoint
          </h4>
          {endpoint}
        </div>

        <div className="basis-1/2">
          <h4>
            RX traffic
          </h4>
          {formatTraffic(rxBytes)}
        </div>

        <div className="basis-1/4">
          <h4>
            TX traffic
          </h4>
          {formatTraffic(txBytes)}
        </div>
      </div>

      <div className="flex mb-4">
        <div className="basis-1/4">
          <h4>
            Keep alive
          </h4>
          {formatKeepAlive(keepAlive)}
        </div>

        <div className="basis-1/2">
          <h4>
            Last handshake
          </h4>
          {formatTimeDelta(lastHandshake)}
          {' '}
          ago
        </div>

        <div className="basis-1/4">
          <h4>
            Allowed IPs
          </h4>
          {allowedIps.map((ip) => (
            <>
              <span>{ip}</span>
              <br />
            </>
          ))}
        </div>
      </div>

      <div>
        <h4>
          Public key
        </h4>
        <code>
          {publicKey}
        </code>
      </div>
    </div>
  );
}
