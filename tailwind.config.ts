import type { Config } from "tailwindcss";

const config: Config = {
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C",
        card: "#111113",
        border: "#1A1A1D",
        zinc: {
          400: "#A1A1AA",
          800: "#1A1A1D",
          900: "#111113",
        }
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1rem",
        "xl": "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
