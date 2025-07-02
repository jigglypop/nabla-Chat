/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lovebug-primary': '#12c2e9',
        'lovebug-secondary': '#c471ed',
        'lovebug-tertiary': '#f64f59',
      },
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'lovebug-slideup': 'lovebugSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'lovebug-bounce': 'lovebugBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'lovebug-typing': 'lovebugTyping 1.4s infinite',
        'lovebug-message': 'lovebugMessage 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        lovebugSlideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(30px) scale(0.9)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0) scale(1)'
          }
        },
        lovebugBounce: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)'
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.05)'
          },
          '70%': {
            transform: 'scale(0.9)'
          },
          '100%': {
            transform: 'scale(1)'
          }
        },
        lovebugTyping: {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
            opacity: '0.5'
          },
          '30%': {
            transform: 'translateY(-10px)',
            opacity: '1'
          }
        },
        lovebugMessage: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
  prefix: 'lb-',
  important: true,
} 