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
          50:  "#F7F7F8",  // app background
          100: "#F2F2F3",  // subtle backgrounds
          200: "#E5E7EB",  // borders, dividers
          300: "#D1D5DB",  // disabled elements
          400: "#9CA3AF",  // placeholder text
          500: "#6B7280",  // secondary text
          600: "#6E6E80",  // secondary text (design system)
          700: "#374151",  // body text
          800: "#333333",  // primary text (design system)
          900: "#1F2937"   // headings
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
          DEFAULT: "#EF4146",  // error states
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4146",
          600: "#DC2626"
        },
        success: {
          DEFAULT: "#10B981",  // success states
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669"
        },
        warning: {
          DEFAULT: "#F59E0B",  // warning states
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706"
        },
        info: {
          DEFAULT: "#3B82F6",  // info states
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          600: "#2563EB"
        }
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px"
      },
      boxShadow: {
        subtle: "0 2px 4px rgba(0,0,0,0.05)",
        card: "0 4px 6px rgba(0,0,0,0.07)",
        modal: "0 10px 25px rgba(0,0,0,0.15)"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }]
      },
      spacing: {
        18: "4.5rem",
        88: "22rem"
      }
    }
  },
  plugins: []
};
