import { NextApiRequest, NextApiResponse } from 'next';
import blake2b from 'blake2b';
import { User } from 'lib/database';
import { withSessionRoute } from 'lib/withSession';

type Response = { success: boolean } | { error: string };

async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await User.query().findById(username);
  if (!user) {
    return null;
  }

  const [alg, keylen, salt, passwordHash] = user.password.split(':');

  if (alg !== 'blake2b' || Number.isNaN(parseInt(keylen, 10))) {
    throw new Error(`login: Unknown hash algorithm ${alg} with keylen ${keylen}`);
  }

  const saltBuffer = Buffer.from(salt, 'hex');
  const personal = Buffer.alloc(blake2b.PERSONALBYTES);
  personal.write(username);

  const hash = blake2b(parseInt(keylen, 10), null, saltBuffer, personal)
    .update(Buffer.from(password))
    .digest('hex');

  if (hash === passwordHash) {
    return user;
  }

  return null;
}

export default withSessionRoute(
  async (req: NextApiRequest, res: NextApiResponse<Response>) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
      return;
    }

    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username or password missing' });
      return;
    }

    const user = await authenticateUser(username, password);
    if (user === null) {
      res.status(404).json({ error: 'Username or password wrong' });
      return;
    }

    (req.session as any).user = user.id;
    await req.session.save();

    res.status(200).json({ success: true });
  },
);
