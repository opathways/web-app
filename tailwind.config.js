/** tailwind.config.js */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: "#F7F7F8",   // app background
          100: "#F2F2F3",  // subtle backgrounds
          200: "#E5E7EB",  // borders, dividers
          300: "#D1D5DB",  // disabled elements
          400: "#9CA3AF",  // placeholder text
          500: "#6B7280",  // icons, secondary elements
          600: "#6E6E80",  // secondary text
          700: "#374151",  // darker text
          800: "#333333",  // primary text
          900: "#1F2937"   // darkest text
        },
        primary: {
          DEFAULT: "#19C37D",  // primary accent (teal-green)
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#19C37D",
          600: "#16A34A",
          700: "#15803D"
        },
        danger: {
          DEFAULT: "#EF4146",  // error (red)
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4146",
          600: "#DC2626",
          700: "#B91C1C"
        },
        success: {
          DEFAULT: "#10B981",  // success (green)
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
          700: "#047857"
        },
        warning: {
          DEFAULT: "#F59E0B",  // warning (amber)
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309"
        },
        info: {
          DEFAULT: "#3B82F6",  // info (blue)
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8"
        }
      },
      borderRadius: {
        md: "6px",
        lg: "8px"
      },
      boxShadow: {
        subtle: "0 2px 4px rgba(0,0,0,0.05)",
        card: "0 4px 20px rgba(0,0,0,0.1)"
      },
      fontFamily: {
        sans: ["Inter", "Helvetica Neue", "Segoe UI", "sans-serif"]
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem'    // 88px
      }
    }
  },
  plugins: []
};
