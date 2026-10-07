import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#04326d",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          dark: "#001a4b",  // Color 1: Deep Navy Blue
          navy: "#04326d",  // Color 2: Royal Navy Blue
          light: "#b2bed6", // Color 3: Soft Periwinkle / Slate Blue
        },
        primary: {
          DEFAULT: "#04326d",
          dark: "#001a4b",
          light: "#b2bed6",
          soft: "#f2f5fa",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e8edf5",
          foreground: "#001a4b",
        },
        accent: {
          DEFAULT: "#04326d",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f4f9",
          foreground: "#475569",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#001a4b",
        },
        // Scale mapped directly to the 3 brand colors
        sky: {
          50: "#f4f7fb",
          100: "#e4ecf6",
          200: "#b2bed6", // Exact #b2bed6
          300: "#8ca2c4",
          400: "#3d6499",
          500: "#164785",
          600: "#04326d", // Exact #04326d
          700: "#022452",
          800: "#001a4b", // Exact #001a4b
          900: "#001338",
          950: "#000c24",
        },
        // Clinical Premium Design System Tokens
        clinical: {
          bg: "#FFFFFF",
          soft: "#F6F8FA",
          surface: "#FFFFFF",
          border: "#E5EAF0",
          text: "#0F172A",
          muted: "#5B6B7F",
        },
        mint: {
          DEFAULT: "#4FB8A6",
          strong: "#2E9C89",
          soft: "#E8F7F4",
          border: "#C2ECE4",
        },
        accentBlue: {
          DEFAULT: "#5B9BD5",
          soft: "#EEF5FB",
        },
        danger: {
          DEFAULT: "#D64545",
          soft: "#FEE2E2",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-sans)", "'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
        urdu: ["var(--font-urdu)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        clinical: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)",
        "clinical-sm": "0 1px 2px rgba(15,23,42,.04)",
        soft: "0 1px 3px rgba(15, 23, 42, 0.04), 0 8px 20px -4px rgba(15, 23, 42, 0.05)",
        card: "0 1px 3px rgba(15, 23, 42, 0.05), 0 10px 25px -5px rgba(15, 23, 42, 0.05)",
        glow: "0 0 20px -2px rgba(79, 184, 166, 0.35)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(4, 50, 109, 0.7)" },
          "50%": { boxShadow: "0 0 0 14px rgba(178, 190, 214, 0)" },
        },
      },
      animation: {
        pulseGlow: "pulseGlow 2.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
