import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      // Keep emerald/slate/rose available (this is `extend`, not a replacement).
      // Legacy semantic names are aliased to the new palette so ~350 existing
      // `bg-primary-600`, `text-error-500`, ... classes keep working.
      colors: {
        primary: colors.emerald,
        secondary: colors.teal,
        accent: colors.amber,
        success: colors.emerald,
        warning: colors.amber,
        error: colors.rose,
      },
    },
  },
  plugins: [],
};
