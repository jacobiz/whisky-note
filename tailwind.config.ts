import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ダークテーマベース
        surface: {
          DEFAULT: '#0a0a0f',
          elevated: '#12121a',
          overlay: '#1a1a26',
        },
        // 金色アクセント
        gold: {
          DEFAULT: '#B8860B',
          light: '#D4A017',
          muted: '#8B6914',
        },
        // テキスト
        ink: {
          primary: '#F0E6C8',
          secondary: '#A89878',
          muted: '#665544',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(184, 134, 11, 0.4)',
        'gold-lg': '0 4px 24px rgba(184, 134, 11, 0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config
