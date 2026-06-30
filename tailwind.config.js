/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A0A0A',
        surface: '#1A1A1A',
        gold: {
          DEFAULT: '#C9A84C',
          light: '#F5D78E',
          dark: '#A08C5B',
          muted: '#8B7340',
        },
        text: {
          primary: '#F5F0E8',
          secondary: '#A08C5B',
          muted: '#6B5E3A',
        },
        border: {
          DEFAULT: '#2A2A2A',
          gold: '#3A3520',
        },
      },
      fontFamily: {
        serif: ['PlayfairDisplay', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      fontSize: {
        hero: ['3rem', {
          lineHeight: '3.5rem',
          letterSpacing: '0.05em',
        }],
        section: ['2rem', {
          lineHeight: '2.5rem',
          letterSpacing: '0.03em',
        }],
      },
    },
  },
  plugins: [],
};