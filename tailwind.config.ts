import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-body)", "sans-serif"],
        display: ["var(--font-heading)", "var(--font-body)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Madhubani pigments
        ink: "var(--ink)",
        line: "var(--line)",
        sindoor: "var(--sindoor)",
        haldi: "var(--haldi)",
        neel: "var(--neel)",
        pan: "var(--pan)",
        gulabi: "var(--gulabi)",
      },
      boxShadow: {
        "hard-sm": "var(--hard-sm)",
        hard: "var(--hard)",
        "hard-lg": "var(--hard-lg)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(90deg, #D63A24, #D63A24)",
        "gradient-hero": "linear-gradient(90deg, #2D3FCF, #2D3FCF)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
