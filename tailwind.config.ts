import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF9F6",
        ink: "#16150F",
        muted: "#6B6862",
        rule: "#E4E1D8",
        accent: "#7A2E1E",
        card: "#FFFFFF",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        reading: "68ch",
      },
    },
  },
  plugins: [],
};

export default config;
