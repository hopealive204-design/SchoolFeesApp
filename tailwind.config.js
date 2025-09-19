/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#2563EB",
          "primary-content": "#FFFFFF",
          "secondary": "#1E293B",
          "accent": "#F59E0B",
          "base-100": "#FFFFFF",
          "base-200": "#F1F5F9",
          "base-300": "#E2E8F0",
          "error": "#DC2626",
          "--rounded-box": "0.75rem",
          "--rounded-btn": "0.5rem",
        },
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          "primary": "#60A5FA",
          "secondary": "#94A3B8",
          "accent": "#FBBF24",
          "base-100": "#1E293B",
          "base-200": "#0F172A",
          "base-300": "#334155",
           "--rounded-box": "0.75rem",
           "--rounded-btn": "0.5rem",
        },
      }
    ],
  },
}
