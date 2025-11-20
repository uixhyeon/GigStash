/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#296AF1',
        accent: '#3DD9B6',
        warning: '#FFC83D',
        error: '#EF4444',
        'gray-900': '#1E293B',
        'gray-600': '#64748B',
        'gray-200': '#E2E8F0',
        background: '#F8FAFC',
        'dark-bg': '#0F172A',
        'dark-bg-secondary': '#1E293B',
        'dark-bg-tertiary': '#334155'
      }
    }
  },
  plugins: []
}