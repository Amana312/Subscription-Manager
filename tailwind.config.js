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
        odoo: {
          purple: "#714B67",
          teal: "#017E84",
          dark: "#1c2434",
          gray: "#f8f9fa",
        }
      }
    },
  },
  plugins: [],
}
