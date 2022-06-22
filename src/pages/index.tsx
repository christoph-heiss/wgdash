import { useEffect, useState } from 'react';
import BaseLayout from 'components/base-layout';
import { withSessionSsr } from 'lib/withSession';
import { apiGet } from 'lib/utils';
import type { WireguardInterface } from 'lib/wireguard';
import { Temporal } from '@js-temporal/polyfill';

function formatTraffic(b: number): string {
  if (b < 1024 * 1024) {
    return `${(b / 1024).toFixed(2)} KiB`;
  }

  if (b < 1024 * 1024 * 1024) {
    return `${(b / 1024 / 1024).toFixed(2)} MiB`;
  }

  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GiB`;
}

function formatTimeDelta(date: string): string {
  let result = '';

  try {
    const from = Temporal.Instant.from(date).toZonedDateTimeISO(Temporal.Now.timeZone());
    const delta = Temporal.Now.zonedDateTimeISO().since(from, {
      largestUnit: 'day',
      smallestUnit: 'second',
    });

    if (delta.days > 0) {
      result += `${delta.days}d `;
    }

    if (delta.hours > 0) {
      result += `${delta.hours}h `;
    }

    if (delta.minutes > 0) {
      result += `${delta.minutes}min `;
    }

    if (delta.seconds > 0) {
      result += `${delta.seconds}s `;
    }

    // return delta.toLocaleString('en-US', {
    //   hours: 'narrow',
    //   minutes: 'narrow',
    //   seconds: 'narrow',
    // });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return result;
}

function formatKeepAlive(keepAlive: number): string {
  return keepAlive !== 0 ? `${keepAlive}s` : 'disabled';
}

interface IndexProps {
  user: string;
}

export default function Index({ user }: IndexProps) {
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchData = async () => {
    const res = await apiGet('/api/interfaces');

    if (typeof res.error === 'string') {
      setFetchFailed(true);
    } else {
      setFetchFailed(false);
      setInterfaces(res);
    }
  };

  useEffect(() => {
    fetchData();

    const handle = setInterval(fetchData, 2000);
    return () => clearInterval(handle);
  }, []);

  return (
    <BaseLayout userName={user}>
      {fetchFailed && (
        <>
          <div className="card ~critical @high">
            <strong>
              Error:
            </strong>
            {' '}
            Failed to fetch WireGuard info. Retrying in 2 seconds ...
          </div>
          <hr className="sep" />
        </>
      )}
      {interfaces.map((wgif) => (
        <div className="md:flex" key={wgif.index}>
          <aside className="w-2/12 content">
            <h2 style={{ marginBottom: -5 }}>
              {wgif.name}
            </h2>
            {wgif.up
              ? <div className="chip ~positive">Up</div>
              : <div className="chip ~critical">Down</div>}
          </aside>
          <div className="md:w-10/12 content">
            <div className="flex">
              <div className="grow">
                <h4>
                  Listen port
                </h4>
                {wgif.listenPort}
              </div>

              <div className="grow">
                <h4>
                  RX traffic
                </h4>
                {formatTraffic(wgif.rxBytes)}
              </div>

              <div className="grow">
                <h4>
                  TX traffic
                </h4>
                {formatTraffic(wgif.txBytes)}
              </div>
            </div>

            <div>
              <h4>
                Public key
              </h4>
              <code>
                {wgif.publicKey}
              </code>
            </div>

            {wgif.peers.map((peer) => (
              <div key={peer.publicKey} className="card">
                <span className="chip ~neutral mr-2">
                  Peer
                </span>
                {!peer.endpoint && (
                  <span className="chip ~critical">
                    Down
                  </span>
                )}
                {peer.hasPresharedKey
                  ? (
                    <span className="chip ~positive">
                      Has preshared key
                    </span>
                  ) : (
                    <span className="chip ~critical">
                      No preshared key
                    </span>
                  )}
                <hr className="sep h-2" />

                <div className="flex mb-4">
                  <div className="basis-1/4">
                    <h4>
                      Endpoint
                    </h4>
                    {peer.endpoint}
                  </div>

                  <div className="basis-1/2">
                    <h4>
                      RX traffic
                    </h4>
                    {formatTraffic(peer.rxBytes)}
                  </div>

                  <div className="basis-1/4">
                    <h4>
                      TX traffic
                    </h4>
                    {formatTraffic(peer.txBytes)}
                  </div>
                </div>

                <div className="flex mb-4">
                  <div className="basis-1/4">
                    <h4>
                      Keep alive
                    </h4>
                    {formatKeepAlive(peer.keepAlive)}
                  </div>

                  <div className="basis-1/2">
                    <h4>
                      Last handshake
                    </h4>
                    {formatTimeDelta(peer.lastHandshake)}
                    {' '}
                    ago
                  </div>

                  <div className="basis-1/4">
                    <h4>
                      Allowed IPs
                    </h4>
                    {peer.allowedIps.map((ip) => (
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
                    {peer.publicKey}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </BaseLayout>
  );
}

export const getServerSideProps = withSessionSsr(
  async ({ req }) => {
    const { user } = req.session as any;

    if (user === undefined) {
      return {
        redirect: {
          permanent: false,
          destination: '/login',
        },
        props: {},
      };
    }

    return {
      props: {
        user,
      },
    };
  },
);
