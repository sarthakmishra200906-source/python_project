/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode (toggle `dark` class on <html>)
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      animation: {
        'slide-in':    'slideIn 0.5s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow':  'pulse 3s infinite',
        'spin-slow':   'spin 8s linear infinite',
        'ping-slow':   'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'float':       'float 3s ease-in-out infinite',
        'count-up':    'countUp 1s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
