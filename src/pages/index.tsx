import { useEffect, useState } from 'react';
import BaseLayout from 'components/base-layout';
import Interface from 'components/interface';
import { withSessionSsr } from 'lib/withSession';
import { apiGet } from 'lib/utils';
import type { WireguardInterface } from 'lib/wireguard';

interface IndexProps {
  user: string;
}

export default function Index({ user }: IndexProps) {
  const [interfaces, setInterfaces] = useState<WireguardInterface[]>([]);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchData = async () => {
    const res = await apiGet('/api/interfaces');

    if (!res || typeof res.error === 'string') {
      // eslint-disable-next-line no-console
      console.log(res);
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
        <Interface key={wgif.index} {...wgif} />
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
