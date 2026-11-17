/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#100d0a',
        foreground: '#fffdf8',
        card: '#342a23',
        primary: {
          DEFAULT: '#d9a588',
          foreground: '#23180f',
        },
        accent: '#ab826b',
        popover: '#30261f',
        muted: {
          DEFAULT: '#3c3027',
          foreground: '#d6c8bc',
        },
        border: 'rgba(255, 255, 255, 0.208)',
        ring: '#f1c9a6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
      transitionTimingFunction: {
        'serra': 'cubic-bezier(.22, 1, .36, 1)',
      }
    },
  },
  plugins: [],
}
