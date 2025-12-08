/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255,255,255,0.06)',
          medium: 'rgba(255,255,255,0.1)'
        }
      },
      boxShadow: {
        cell: 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.35)'
      }
    },
  },
  plugins: [],
}
