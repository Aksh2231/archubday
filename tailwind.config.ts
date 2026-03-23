import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blush: "#ffe7ef",
        peach: "#ffe9d6",
        cream: "#fff8ef",
        mint: "#dff7ea",
        rose: "#ff7e9d",
        cocoa: "#5d4358",
      },
      boxShadow: {
        card: "0 24px 60px rgba(255, 126, 157, 0.16)",
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', '"Trebuchet MS"', "sans-serif"],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        fadeUp: "fadeUp 700ms ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
