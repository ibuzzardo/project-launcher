import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#2563EB",
        secondary: "#0F766E",
        muted: "#E2E8F0",
        accent: "#D97706",
        destructive: "#DC2626",
        "chart-1": "#2563EB",
        "chart-2": "#0F766E",
        "chart-3": "#7C3AED",
        "chart-4": "#D97706"
      },
      borderRadius: {
        xl: "12px",
        lg: "10px",
        md: "8px"
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "glass-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.75" }
        },
        "zoom-in-95": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "zoom-out-95": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 300ms ease-out",
        "glass-shimmer": "glass-shimmer 2.5s linear infinite",
        "pulse-soft": "pulse-soft 1.5s ease-in-out infinite",
        "zoom-in-95": "zoom-in-95 200ms ease-out",
        "zoom-out-95": "zoom-out-95 200ms ease-in"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};

export default config;
