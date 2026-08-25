import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["Work Sans", "system-ui", "sans-serif"],
        serif: ["Libre Baskerville", "Georgia", "serif"],
        mono: ["Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        xs: ["13px", { lineHeight: "19px", letterSpacing: "0.2px" }],
        sm: ["14px", { lineHeight: "22px", letterSpacing: "0.1px" }],
        base: ["15px", { lineHeight: "24px", letterSpacing: "0" }],
        lg: ["17px", { lineHeight: "28px", letterSpacing: "0" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "0" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "0" }],
        "3xl": ["30px", { lineHeight: "38px", letterSpacing: "0" }],
        "4xl": ["36px", { lineHeight: "44px", letterSpacing: "0" }],
      },
      colors: {
        border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))",
        background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        navy: { DEFAULT: "hsl(var(--navy))", deep: "hsl(var(--navy-deep))" },
        gold: { DEFAULT: "hsl(var(--gold-aged))", antique: "hsl(var(--gold-antique))" },
        champagne: "hsl(var(--champagne))", ivory: "hsl(var(--ivory))", charcoal: "hsl(var(--charcoal))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      transitionDuration: { 250: "250ms", 350: "350ms", 400: "400ms" },
    },
  },
  plugins: [tailwindcssAnimate],
  safelist: [{ pattern: /duration-\d+/, variants: [] }],
} satisfies Config;
