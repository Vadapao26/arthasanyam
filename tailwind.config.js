/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tandul: '#FBF8F5',
        geru: {
          DEFAULT: '#9E3B24',
          dark: '#7A2B18',
          light: '#C45338',
          subtle: '#F4EBE6',
        },
        surface: {
          DEFAULT: '#F4EBE6',
          deep: '#EADCD3',
          card: '#FFFDFB',
        },
        earth: {
          DEFAULT: '#241916',
          muted: '#5C4742',
          light: '#8A726B',
        },
        jama: {
          DEFAULT: '#2D6A4F',
          bg: '#E8F5EE',
          border: '#A3D9B8',
        },
        kharch: {
          DEFAULT: '#9E3B24',
          bg: '#FCEEE9',
          border: '#E8B4A6',
        },
        haldi: '#D9822B',
      },
      fontFamily: {
        heading: ['"Yatra One"', '"Rozha One"', '"Nirmala UI"', 'serif'],
        body: ['"Mukta"', '"Hind"', '"Nirmala UI"', 'sans-serif'],
        mono: ['"Space Grotesk"', '"Poppins"', 'monospace'],
      },
    },
  },
  plugins: [],
};
