/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',
        secondary: '#F1F3F4',
        text: '#202124',
        accent: '#0B57D0',
        success: '#34A853',
        error: '#EA4335',
        warning: '#FBBC05',
        white: '#FFFFFF',
        'soft-gray': '#DADCE0',
        'row-gray': '#F8F9FA',
        'dark-gray': '#2D2E32',
        'soft-white': '#E8EAED',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
