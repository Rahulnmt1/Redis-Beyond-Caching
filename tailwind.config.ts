import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Redis brand palette
        bg: "#163341", // Dusk
        surface: "#1C3E4B",
        surface2: "#244A58",
        surface3: "#2C5563",
        line: "rgba(255,255,255,0.10)",
        line2: "rgba(255,255,255,0.17)",
        fg: "#FFFFFF", // White
        muted: "#B9C2C6", // Dusk 30%
        faint: "#8598A0",
        dusk: "#163341",
        dusk30: "#B9C2C6",
        midnight: "#091A23",
        yellow: "#DCFF1E",
        sky: "#80DBFF",
        purple: "#C795E3",
        redis: {
          DEFAULT: "#FF4438", // Hyper
          deep: "#E23A2E",
          soft: "#FF877E",
          ink: "#5B1410",
          glow: "rgba(255,68,56,0.35)",
        },
        ok: "#DCFF1E",
        info: "#80DBFF",
        warn: "#FF4438",
        code: "#091A23",
      },
      fontFamily: {
        display: [
          "Space Grotesk",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "24px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,68,56,0.40), 0 18px 50px -16px rgba(255,68,56,0.42)",
        card: "0 18px 40px -28px rgba(0,0,0,0.75)",
        lift: "0 28px 70px -24px rgba(0,0,0,0.85)",
        soft: "0 10px 30px -18px rgba(0,0,0,0.65)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.72)", opacity: "0.5" },
          "100%": { transform: "scale(1.75)", opacity: "0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        dash: {
          to: { strokeDashoffset: "-1000" },
        },
        "flow-dash": {
          to: { strokeDashoffset: "-160" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-soft": "pulse-soft 3.6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 3.2s ease-out infinite",
        float: "float 7s ease-in-out infinite",
        dash: "dash 30s linear infinite",
        "flow-dash": "flow-dash 2.6s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
