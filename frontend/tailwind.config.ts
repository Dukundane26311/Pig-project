import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0faf2",
          100: "#dcf5e1",
          200: "#baeac4",
          300: "#87d89c",
          400: "#4fbc6a",
          500: "#2d9e4f",
          600: "#1f7e3c",
          700: "#1a6431",
          800: "#174f29",
          900: "#134122",
          950: "#0a2615",
        },
        accent: {
          50:  "#fff1f3",
          100: "#ffe4e8",
          200: "#fecdd5",
          300: "#fda4b0",
          400: "#fb7086",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [typography],
};

export default config;
