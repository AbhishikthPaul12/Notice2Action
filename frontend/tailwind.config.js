/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#080808',
        paper: '#F4F2EC',
        neutral: '#A8A8A0',
        'dark-gray': '#202120',
        accent: '#5B6CFF',
        'accent-dim': '#3D4ABF',
        brand: {
          50: '#f4f6fc',
          100: '#e8ecf7',
          200: '#cbd5ee',
          300: '#9cb1e1',
          400: '#6786d1',
          500: '#425fc0',
          600: '#3247a3',
          700: '#293784',
          800: '#252f6d',
          900: '#222b5c',
          950: '#121633',
        },
      },
    },
  },
  plugins: [],
}
