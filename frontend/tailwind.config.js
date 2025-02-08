/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0077ff',         // Primary color (blue)
        secondary: '#8a2be2',       // Secondary color (purple)
        accent: '#008080',          // Accent color (teal)
        error: '#f44336',           // Error color (red)
        success: '#98ff98',         // Success color (mint green)
      },

    },
  },
  plugins: [],
}