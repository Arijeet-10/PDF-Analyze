/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",          // if you use index.html
    "./src/**/*.{js,jsx,ts,tsx}",  // scan all React files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
