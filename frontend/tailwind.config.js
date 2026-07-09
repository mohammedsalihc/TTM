/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind only generates CSS for classes it finds in these files, so every
  // path containing JSX/TSX with className usage must be listed here.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

