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
          50:  "#F7F7F8",
          100: "#F0F0F1",
          200: "#E5E5E5",
          300: "#D0D0D0",
          400: "#A0A0A0",
          500: "#7A7A7A",
          600: "#5C5C5C",
          700: "#3F3F3F",
          800: "#2A2A2A",
          900: "#1A1A1A"
        },
        primary: { DEFAULT: "#10A37F" }
      },
      borderRadius: {
        md: "6px",
        lg: "8px"
      },
      boxShadow: {
        subtle: "0 2px 4px rgba(0,0,0,0.05)"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
