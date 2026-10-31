/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f7f9f7",
          100: "#edf3ee",
          200: "#dbe5dc",
          300: "#bdd1bf",
          400: "#8fa892", // Logo leaf color
          500: "#607d64",
          600: "#445e48",
          700: "#2d4431",
          800: "#1b3d2f", // Logo text & dark brand color
          900: "#132b21",
          950: "#0b1a13",
        },
        cream: {
          50: "#fdfcf9",
          100: "#f8f6f0", // Warm cream backdrop from logo image
          200: "#f0ece0",
          300: "#e4dec9",
        }
      }
    },
  },
  plugins: [],
}
