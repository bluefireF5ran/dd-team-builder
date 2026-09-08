/**
 * DO NOT DELETE. This looks like a leftover v3 config - the project is on
 * Tailwind 4 and the theme tokens below are duplicated in the @theme block of
 * src/index.css - but `@tailwindcss/postcss` still reads this file, and it is
 * the ONLY thing telling Tailwind where to look for classes.
 *
 * Removing it does not fail the build. It emits a stylesheet with no utilities
 * in it at all - no `flex`, no `grid`, no `hidden` - and the app renders as an
 * unstyled pile with every `hidden` element visible. `npm run build` still
 * says "Compiled successfully"; the only visible signal is the CSS dropping
 * from ~15 kB gzip to ~7 kB. There is a test for this in
 * src/__tests__/tailwindConfig.test.js.
 *
 * Note there is no `screens` key: `xs:` has never been a valid breakpoint here.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'darkest': ['DwarvenAxe', 'Times New Roman', 'serif'],
      },
      colors: {
        'dd-red': {
          DEFAULT: '#8B0000',
          light: '#DC2626',
          dark: '#5C0000',
        },
        'dd-gold': {
          DEFAULT: '#D4AF37',
          dark: '#8B7355',
          light: '#FFD700',
        },
        'dd-parchment': '#F5DEB3',
        'torch': '#FF6B35',
      },
      animation: {
        'torch-flicker': 'torch-flicker 3s ease-in-out infinite',
        'fade-in': 'fade-in-up 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      boxShadow: {
        'torch': '0 0 20px rgba(255, 107, 53, 0.3), 0 0 40px rgba(255, 107, 53, 0.2)',
        'inner-dark': 'inset 0 0 50px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}