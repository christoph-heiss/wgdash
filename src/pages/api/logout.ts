import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from 'lib/withSession';

type Response = { success: boolean } | { error: string };

export default withSessionRoute(
  async (req: NextApiRequest, res: NextApiResponse<Response>) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
      return;
    }

    delete (req.session as any).user;
    await req.session.save();

    res.status(200).json({ success: true });
  },
);
