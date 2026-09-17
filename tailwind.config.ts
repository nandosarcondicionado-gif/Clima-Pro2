import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effaff",
          100: "#dff5ff",
          200: "#b8ebff",
          300: "#79dcff",
          400: "#32c7ff",
          500: "#08aee8",
          600: "#008bc4",
          700: "#00709f",
          800: "#075e83",
          900: "#0a4f6d"
        }
      }
    },
  },
  plugins: [],
};

export default config;
