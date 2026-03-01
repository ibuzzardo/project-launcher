import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    screens: {
      xs: "320px",
      md: "768px",
      xl: "1280px"
    },
    extend: {
      colors: {
        primary: "#0369A1",
        secondary: "#0F766E",
        background: "#F8FAFC",
        foreground: "#0F172A",
        muted: "#E2E8F0",
        accent: "#F59E0B",
        destructive: "#DC2626",
        "chart-1": "#0284C7",
        "chart-2": "#0D9488",
        "chart-3": "#2563EB",
        "chart-4": "#EA580C"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "10px",
        xl: "12px",
        "2xl": "16px"
      },
      backdropBlur: {
        glass: "20px",
        panel: "14px"
      },
      boxShadow: {
        glass: "0 12px 40px rgba(2,6,23,0.45)",
        dialog: "0 20px 60px rgba(2,6,23,0.65)"
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" }
        },
        "log-pop": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        "gradient-shift": "gradient-shift 10s ease infinite",
        "float-y": "float-y 3s ease-in-out infinite",
        "log-pop": "log-pop 180ms ease-out"
      }
    }
  },
  plugins: []
};

export default config;
