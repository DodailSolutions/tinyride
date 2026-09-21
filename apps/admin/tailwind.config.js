/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
            700: '#334E68',
            800: '#1E3A5F',
            900: '#142B4A', // Official Deep Navy (Brand Guidelines v1.0)
            950: '#0C1A2E',
          },
          orange: {
            50: '#FFF5EB',
            100: '#FEE7D3',
            200: '#FDCBA8',
            300: '#FBAF7D',
            400: '#FA9351',
            500: '#F07832', // Official Warm Orange (Brand Guidelines v1.0)
            600: '#D96522',
            700: '#B84C00',
          },
          mist: '#F3F5F7',
          slate: '#2F3948',
        },
      },
    },
  },
  plugins: [],
};
