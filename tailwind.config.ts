import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      dropShadow: {
        md: ["0 4px 3px rgb(0 0 0 / 0.3)", "0 2px 2px rgb(0 0 0 / 0.3)"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  darkMode: "class",
};
export default config;
