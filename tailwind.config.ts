import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#22D3EE",
        secondary: "#6366F1",
        background: "#0B1020",
        foreground: "#E2E8F0",
        muted: "#1F2937",
        accent: "#A78BFA",
        destructive: "#F43F5E"
      },
      fontFamily: {
        sans: ["Sora", "Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      borderRadius: {
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        md: "8px"
      }
    }
  },
  plugins: []
};

export default config;
