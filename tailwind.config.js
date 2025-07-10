/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",       // Все файлы в /pages/
    "./components/**/*.{js,ts,jsx,tsx}",  // Все файлы в /components/
    "./app/**/*.{js,ts,jsx,tsx}",         // Если используешь папку app/
    "./styles/**/*.{css}"                // Если стили используешь как у тебя
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
