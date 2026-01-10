/** @type {import('tailwindcss').Config} */
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