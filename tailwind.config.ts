import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D32F2F',   // Vibrant Red for main UI elements
        secondary: '#FFA726', // Warm Orange for secondary buttons and accents
        accent: '#FFC107',    // Bright Yellow for highlights
        neutral: '#F5F5F5',   // Light Gray for backgrounds
        dark: '#424242',      // Dark Charcoal for text and contrast elements
        background: '#2D2D2D' // Dark background for the main app wrapper
      },
      fontFamily: {
        heading: ['Abril Fatface', 'cursive'], // Use Abril Fatface for headings
        body: ['Lato', 'sans-serif'], // Use Lato for paragraphs and body text
      },
    },
  },
  plugins: [],
};

export default config;
