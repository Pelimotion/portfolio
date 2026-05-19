/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui base tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Pelimotion OS — superfícies
        surface: {
          0: "var(--surface-0)",
          1: "var(--surface-1)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
          overlay: "var(--surface-overlay)",
        },

        // Pelimotion OS — bordas semânticas
        "border-subtle":  "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong":  "var(--border-strong)",

        // Pelimotion OS — status de produção
        status: {
          backlog: "var(--status-backlog)",
          "ai-gen": "var(--status-ai-gen)",
          selects: "var(--status-selects)",
          motion:  "var(--status-motion)",
          revisao: "var(--status-revisao)",
          entregue: "var(--status-entregue)",
        },
      },

      borderColor: {
        subtle:  "var(--border-subtle)",
        default: "var(--border-default)",
        strong:  "var(--border-strong)",
      },

      // Pelimotion typographic scale — 2 pesos: font-medium (500) | font-semibold (600)
      // text-eyebrow: sempre acompanhar com uppercase tracking-wider (único uso permitido)
      fontSize: {
        display: ["2.25rem",   { lineHeight: "1.1",  fontWeight: "600" }],
        h1:      ["1.875rem",  { lineHeight: "1.2",  fontWeight: "600" }],
        h2:      ["1.5rem",    { lineHeight: "1.25", fontWeight: "600" }],
        h3:      ["1.25rem",   { lineHeight: "1.3",  fontWeight: "500" }],
        body:    ["0.9375rem", { lineHeight: "1.6" }],
        small:   ["0.875rem",  { lineHeight: "1.5" }],
        caption: ["0.75rem",   { lineHeight: "1.5" }],
        eyebrow: ["0.6875rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.08em" }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
