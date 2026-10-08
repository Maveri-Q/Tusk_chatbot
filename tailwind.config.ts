import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elev": "var(--bg-elev)",
        "bg-elev-2": "var(--bg-elev-2)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        emerald: {
          soft: "var(--emerald-soft)",
          light: "var(--mint-light)",
          deep: "var(--emerald-deep)",
          pale: "var(--mint-pale)",
        },
        flare: {
          DEFAULT: "var(--flare)",
          foreground: "var(--on-flare)",
        },
        lime: {
          DEFAULT: "var(--lime)",
          foreground: "var(--on-lime)",
        },
        warn: "var(--warn)",
        danger: "var(--danger)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(23, 25, 28, 0.04)",
        tactile: "0 20px 48px -12px rgba(23, 25, 28, 0.07), 0 2px 6px -1px rgba(23, 25, 28, 0.04)",
        "tactile-hover": "0 28px 60px -16px rgba(23, 25, 28, 0.10), 0 4px 12px -2px rgba(23, 25, 28, 0.06)",
        subtle: "0 1px 3px 0 rgba(23, 25, 28, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
