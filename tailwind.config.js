/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        claude: {
          terracotta: {
            DEFAULT: '#da7756',
            light: '#e89478',
            dark: '#c15f3c',
            darker: '#a84d2d',
          },
          neutral: {
            50: '#faf9f7',
            100: '#f5f3f0',
            200: '#e5e3de',
            300: '#d4d1cb',
            400: '#a5a29e',
            500: '#78756f',
            600: '#5a5752',
            700: '#3a3835',
            800: '#252422',
            900: '#1a1918',
            950: '#121110',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'lifted': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(218, 119, 86, 0.3)',
        'glow-lg': '0 0 40px rgba(218, 119, 86, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
