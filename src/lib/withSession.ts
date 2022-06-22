import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from 'next';
import getConfig from 'next/config';
import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';

const { serverRuntimeConfig } = getConfig();

const secureCookies = serverRuntimeConfig.INSECURE_COOKIES !== undefined
  ? !serverRuntimeConfig.INSECURE_COOKIES
  : process.env.NODE_ENV === 'production';

const sessionOptions = {
  cookieName: 'user',
  password: serverRuntimeConfig.COOKIE_PASSWORD,
  cookieOptions: {
    secure: secureCookies,
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}
