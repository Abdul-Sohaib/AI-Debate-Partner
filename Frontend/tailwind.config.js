/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        primary:"#171717",
        secondary:"#111113",
        textcolor:"#F5F5F5",
      },
      fontFamily: {
        main: ["Space Grotesk" , "sans-serif"],
      },
    },
  },
  plugins: [],
  build: {
    target: 'esnext'
  },
}