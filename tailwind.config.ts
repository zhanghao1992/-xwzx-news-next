import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1989fa',
        'primary-dark': '#1976d2',
        danger: '#ee0a24',
        warning: '#ff976a',
        success: '#07c160',
      },
    },
  },
  plugins: [],
};

export default config;
