/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 99Food / Bloomberg Terminal palette — see DATA_SOURCES.md "Visual System"
        ink: {
          950: '#0B0D11', // global background
          900: '#0F1115', // panel background
          800: '#1A1D24', // raised panel
          700: '#252932', // border / hairline
          600: '#3A3F4B', // muted border
          500: '#5A6172', // muted text
          400: '#8B92A3', // secondary text
          300: '#B8BFD0', // primary text
          100: '#EAECF2', // headline text
        },
        // 99 brand yellow
        signal: {
          DEFAULT: '#FFD200',
          dim: '#B89700',
          glow: '#FFE45C',
        },
        // Brazil flag green — positive signal
        verde: {
          DEFAULT: '#009C3B',
          dim: '#006B28',
          glow: '#3FCB6B',
        },
        // Warning / negative
        alert: {
          DEFAULT: '#E63946',
          dim: '#9C232C',
          glow: '#FF6B75',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
