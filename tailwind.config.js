/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbf5',
          100: '#fef4e6',
          200: '#fce5c8',
          300: '#f9cf9d',
          400: '#f4aa62',
          500: '#ef8833',
          600: '#e06b1a',
          700: '#ba5014',
          800: '#944018',
          900: '#773617',
          950: '#40190a',
        },
        ink: {
          DEFAULT: '#15181e',
          soft: '#454e5a',
          muted: '#7b8492',
          light: '#a1a8b3',
        },
        surface: {
          DEFAULT: '#ffffff',
          dim: '#faf9f8',
          subtle: '#f3f5f8',
        },
        status: {
          good: '#1a7a5c',
          goodBg: '#e9f5f0',
          goodBorder: '#bfe3d4',
          warn: '#b4550b',
          warnBg: '#fdf1e7',
          warnBorder: '#f3d3b3',
          bad: '#b23a24',
          badBg: '#fbebe7',
          badBorder: '#f0c3b6',
        }
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px (Upscaled from 12px)
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }], // 15px (Upscaled from 14px)
        'base': ['1.0625rem', { lineHeight: '1.625rem' }], // 17px (Upscaled from 16px)
      },
      boxShadow: {
        elevation: '0 1px 2px rgba(21, 24, 30, 0.03), 0 8px 24px rgba(21, 24, 30, 0.06)',
        card: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)',
        modal: '0 20px 50px rgba(15, 20, 30, 0.25)',
      }
    },
  },
  plugins: [],
};
