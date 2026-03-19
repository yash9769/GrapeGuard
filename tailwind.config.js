/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        grape: {
          50:'#f5f0ff',100:'#ede0ff',200:'#d4b8ff',300:'#b57bff',
          400:'#9747ff',500:'#7c1fff',600:'#6500e0',700:'#5200b8',
          800:'#400090',900:'#2e0068',
        },
        leaf: { 50:'#f0fdf4',100:'#dcfce7',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d' },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'cursive'],
        body: ['"Noto Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
