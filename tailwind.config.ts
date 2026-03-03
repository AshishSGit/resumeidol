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
        space: {
          950: "#04060D",
          900: "#07090F",
          800: "#0B0E1A",
          700: "#0F1420",
          600: "#141B2D",
          500: "#1E2A3A",
        },
        gold: {
          300: "#E8D5A3",
          400: "#DEC27A",
          500: "#C9A84C",
          600: "#B8952F",
          700: "#9A7A1F",
        },
        slate: {
          850: "#0F172A",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gold-shimmer":
          "linear-gradient(90deg, transparent 0%, #C9A84C22 50%, transparent 100%)",
        "hero-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -10%, #1a0f3a 0%, #07090F 60%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        shimmer: "shimmer 2.5s infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        borderGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201,168,76,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(201,168,76,0.25)" },
        },
      },
      boxShadow: {
        gold: "0 0 30px rgba(201,168,76,0.15)",
        "gold-lg": "0 0 60px rgba(201,168,76,0.2)",
        "card": "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
