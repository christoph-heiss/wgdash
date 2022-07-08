import Peer from 'components/peer';
import type { WireguardInterface } from 'lib/wireguard';
import { formatTraffic } from 'lib/utils';

export default function Interface(props: WireguardInterface) {
  const {
    name,
    up,
    rxBytes,
    txBytes,
    listenPort,
    publicKey,
    peers,
  } = props;

  return (
    <div className="md:flex">
      <aside className="w-2/12 content">
        <h2 style={{ marginBottom: -5 }}>
          {name}
        </h2>
        {up
          ? <div className="chip ~positive">Up</div>
          : <div className="chip ~critical">Down</div>}
      </aside>
      <div className="md:w-10/12 content">
        <div className="flex">
          <div className="grow">
            <h4>
              Listen port
            </h4>
            {listenPort}
          </div>

          <div className="grow">
            <h4>
              RX traffic
            </h4>
            {formatTraffic(rxBytes)}
          </div>

          <div className="grow">
            <h4>
              TX traffic
            </h4>
            {formatTraffic(txBytes)}
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

        {peers.map((peer) => (
          <Peer key={peer.publicKey} {...peer} />
        ))}
      </div>
    </div>
  );
}
