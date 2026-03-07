/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "Segoe UI", "sans-serif"],
        body: ["Manrope", "Segoe UI", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          300: "#93c5fd",
          500: "#3b82f6",
          700: "#1d4ed8"
        },
        violetBrand: {
          300: "#a78bfa",
          500: "#8b5cf6",
          700: "#6d28d9"
        }
      },
      boxShadow: {
        glass: "0 20px 45px rgba(8, 17, 59, 0.35)"
      },
      backgroundImage: {
        "portal-gradient":
          "radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.3), transparent 45%), radial-gradient(circle at 80% 0%, rgba(59, 130, 246, 0.35), transparent 40%), linear-gradient(130deg, #0b1020, #111a37 40%, #141f4f 100%)"
      }
    }
  },
  plugins: []
};
