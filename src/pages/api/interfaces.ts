import type { NextApiRequest, NextApiResponse } from 'next';
import { getWireguardInterfaces, WireguardInterface } from 'lib/wireguard';
import { withSessionRoute } from 'lib/withSession';

type Response = WireguardInterface[] | { error: string };

export default withSessionRoute(
  async (req: NextApiRequest, res: NextApiResponse<Response>): Promise<Response | void> => {
    if (!(req.session as any).user) {
      res.status(401).end();
      return Promise.resolve();
    }

    return getWireguardInterfaces()
      .then((ifs) => res.status(200).json(ifs))
      .catch((err) => res.status(500).json({ error: err.toString() }));
  },
);
