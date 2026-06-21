
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dp: {
          background: '#0A0A0A',
          surface: '#121212',
          surfaceLight: '#1A1A1A',
          border: '#1C1C1C',
          text: '#FFFFFF',
          textMuted: '#A0A0A0',
          primary: '#2666FF',
          success: '#00E0A3',
          warning: '#FFC31A',
          danger: '#FF4D4F',
        },
        plus: {
          blue: '#2666FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
