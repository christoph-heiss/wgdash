const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  sassOptions: {
    includePaths: [
      path.join(__dirname, 'src/styles'),
    ],
  },
  serverRuntimeConfig: {
    COOKIE_PASSWORD: process.env.COOKIE_PASSWORD ?? 'developmentdevelopmentdevelopment',
    INSECURE_COOKIES: process.env.INSECURE_COOKIES,
  },
};
