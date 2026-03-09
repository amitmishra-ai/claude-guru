import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Material Design 3 surface tokens */
        surface: {
          DEFAULT: "hsl(var(--md-surface))",
          dim: "hsl(var(--md-surface-dim))",
          bright: "hsl(var(--md-surface-bright))",
          container: "hsl(var(--md-surface-container))",
        },
        "on-surface": {
          DEFAULT: "hsl(var(--md-on-surface))",
          variant: "hsl(var(--md-on-surface-variant))",
        },
        outline: {
          DEFAULT: "hsl(var(--md-outline))",
          variant: "hsl(var(--md-outline-variant))",
        },
        primary: {
          DEFAULT: "hsl(var(--md-primary))",
          foreground: "hsl(var(--md-on-primary))",
        },
        error: {
          DEFAULT: "hsl(var(--md-error))",
          foreground: "hsl(var(--md-on-error))",
        },
        "secondary-container": "hsl(var(--md-secondary-container))",
        "on-secondary-container": "hsl(var(--md-on-secondary-container))",

        /* GL semantic status tokens */
        "status-confirmed": {
          bg: "var(--gl-status-confirmed-bg)",
          text: "var(--gl-status-confirmed-text)",
          border: "var(--gl-status-confirmed-border)",
        },
        "status-scheduled": {
          bg: "var(--gl-status-scheduled-bg)",
          text: "var(--gl-status-scheduled-text)",
          border: "var(--gl-status-scheduled-border)",
        },
        "status-pending": {
          bg: "var(--gl-status-pending-bg)",
          text: "var(--gl-status-pending-text)",
          border: "var(--gl-status-pending-border)",
        },
        "status-declined": {
          bg: "var(--gl-status-declined-bg)",
          text: "var(--gl-status-declined-text)",
          border: "var(--gl-status-declined-border)",
        },

        /* UI accent tokens */
        badge: {
          DEFAULT: "var(--gl-badge-bg)",
          text: "var(--gl-badge-text)",
        },
        unread: {
          bg: "var(--gl-unread-bg)",
          border: "var(--gl-unread-border)",
        },
        star: "var(--gl-star-color)",
        "warning-icon": "var(--gl-warning-icon)",
      },

      borderRadius: {
        button: "8px",
        card: "12px",
        dialog: "16px",
        nav: "10px",
        popover: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
