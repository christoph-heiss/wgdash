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
};
