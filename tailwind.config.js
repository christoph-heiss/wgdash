const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/{components,pages}/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        neutral: colors.slate,
        positive: colors.green,
        urge: colors.violet,
        warning: colors.yellow,
        info: colors.blue,
        critical: colors.red,
      },
      minWidth: {
        '1/2': '50%',
      },
    },
  },
  plugins: [
    require('a17t'),
  ],
};
