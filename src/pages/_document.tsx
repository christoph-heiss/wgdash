import Document, {
  Html, Head, Main, NextScript,
} from 'next/document';

export default class WgDashDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
          <meta name="author" content="Christoph Heiss" />
          <meta name="apple-mobile-web-app-title" content="wgdash" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        </Head>
        <body className="max-w-full overflow-x-hidden bg-inf">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
