/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f7fa",
          100: "#e8ecf2",
          200: "#d1d9e5",
          300: "#a8b5c8",
          400: "#7a8aa3",
          500: "#5c6b82",
          600: "#4a5669",
          700: "#3d4756",
          800: "#2a3140",
          900: "#1a1f2e",
          925: "#121722",
          950: "#0b0e14",
        },
        mist: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        accent: {
          DEFAULT: "#38bdf8",
          dim: "#0ea5e9",
          glow: "#7dd3fc",
        },
        good: "#34d399",
        bad: "#f87171",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        "glass-sm": "0 4px 24px rgba(0, 0, 0, 0.25)",
        panel: "0 0 0 1px rgba(148, 163, 184, 0.08), 0 12px 40px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.12), transparent)",
      },
      animation: {
        caret: "caret-blink 1s steps(1) infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
      keyframes: {
        "caret-blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
