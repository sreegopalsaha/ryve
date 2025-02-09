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
        primary: {
          light: {
            bg: '#f8fafc',      // Light background
            card: '#ffffff',    // White cards
            text: '#1e293b',    // Darker text
            input: '#f8fafc',   // Light input field
            border: '#e2e8f0',  // Light border
            accent: '#4f46e5',  // Indigo accent
          },
          dark: {
            bg: '#000000',      // Pure black
            card: '#111111',    // Slightly lighter
            text: '#e5e7eb',    // Light gray text
            input: '#1a1a1a',   // Dark input field
            border: '#2a2a2a',  // Subtle border 
            accent: '#6366f1',  // Vibrant indigo accent
          }
        }
      }
    }
  },
  plugins: [],
}
