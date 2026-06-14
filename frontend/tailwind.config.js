/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#030303",     // Sleek deep dark
        cardBg: "#0C0C0E",         // Rounded cards surface
        cardBorder: "#1B1B1F",     // Dark gray glass border
        primary: "#8B5CF6",        // Purple Accent
        secondary: "#3B82F6",      // Blue Accent
        accentGreen: "#10B981",    // Green sync badge
        textMuted: "#9CA3AF"       // Slate muted text
      }
    },
  },
  plugins: [],
}
