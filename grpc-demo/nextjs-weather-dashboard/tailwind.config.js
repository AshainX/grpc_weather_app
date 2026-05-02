/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#e8d9c4',
        paperLight: '#fff8ec',
        ink: '#2a1b12',
        shadowInk: '#6b3a1a',
        accent: {
          DEFAULT: '#d97f2b',   // ochre — fallback
          clear: '#e8a02a',     // amber
          clouds: '#9b9484',    // slate
          rain: '#2f7d8a',      // teal
          snow: '#8fb4c7',      // ice
          mist: '#b89c6f',      // sand
          alert: '#c44525',     // for the streaming pulse dot
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'tw-card-in': {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'tw-shadow-in': {
          '0%':   { boxShadow: '0 0 0 transparent' },
          '100%': { boxShadow: '3px 3px 0 #6b3a1a' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
