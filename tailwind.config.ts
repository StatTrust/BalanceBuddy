import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        field: "#F5F7FA",
        action: "#0F766E",
        work: "#F59E0B",
        steel: "#334155"
      }
    }
  },
  plugins: []
};

export default config;
