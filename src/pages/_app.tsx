import { AppProps } from 'next/app';
import Head from 'next/head';
import 'styles/globals.scss';

export default function WgDash({ Component, pageProps }: AppProps) {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log(process.env.NEXT_PUBLIC_GIT_COMMIT_SHA);
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
