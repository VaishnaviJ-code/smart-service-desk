/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // 👈 ADD THIS - only enables dark when <html class="dark">
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#e6f7f7",
          100: "#c0ebeb",
          200: "#99dede",
          300: "#66cccc",
          400: "#33b8b8",
          500: "#0fa5a5",
          600: "#0d8484", // main
          700: "#0b6a6a", // hover
        },
      },
    },
  },
  plugins: [],
};
