/** @type {import('tailwindcss').Config} */

export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1235px',
      'xxl': '1440px',
      '2xl': '1536px',
    },
    extend: {
      // Colors (from SCSS variables)
      colors: {
        // Primary Colors (Brand)
        primary: 'var(--primary, #3482FF)',
        'primary-light': 'var(--primary-light, #6FAEFF)',
        // Accent Color (Point)
        accent: 'var(--accent, #296AF1)',
        // Status Colors
        warning: 'var(--warning, #FFC83D)',
        error: 'var(--error, #EF4444)',
        // Grayscale
        'gray-900': 'var(--gray-900, #1E293B)',
        'gray-600': 'var(--gray-600, #64748B)',
        'gray-200': 'var(--gray-200, #E2E8F0)',
        // Background
        background: 'var(--background, #F8FAFC)',
        // Dark Mode
        'dark-bg': 'var(--dark-bg, #0F172A)',
        'dark-bg-secondary': 'var(--dark-bg-secondary, #1E293B)',
        'dark-bg-tertiary': 'var(--dark-bg-tertiary, #334155)',
        'dark-text-primary': 'var(--dark-text-primary, #F1F5F9)',
        'dark-text-secondary': 'var(--dark-text-secondary, #CBD5E1)',
        'dark-text-tertiary': 'var(--dark-text-tertiary, #94A3B8)',
        'dark-border': 'var(--dark-border, #334155)',
        'dark-border-light': 'var(--dark-border-light, #475569)',
        // Table Header Colors
        'table-header-bg': 'var(--table-header-bg, #1E293B)',
        'table-header-text': 'var(--table-header-text, #C4CFE1)',
        'table-header-bg-dark': 'var(--table-header-bg-dark, #C4CFE1)',
        'table-header-text-dark': 'var(--table-header-text-dark, #334155)'
      },
      // Font Families
      fontFamily: {
        primary: ['Noto Sans KR', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['Noto Sans KR', 'Pretendard', 'sans-serif'],
        monospace: ['Courier New', 'Courier', 'monospace']
      },
      // Font Sizes
      fontSize: {
        xs: '0.75rem',   // 12px
        sm: '0.875rem',  // 14px
        base: '1rem',    // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
        '2xl': '1.5rem', // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem' // 36px
      },
      // Font Weights
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      },
      // Line Heights
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75'
      },
      // Spacing
      spacing: {
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
        24: '6rem'      // 96px
      },
      // Border Radius
      borderRadius: {
        sm: '0.25rem',   // 4px
        base: '0.5rem',  // 8px
        md: '0.75rem',   // 12px
        lg: '1rem',      // 16px
        xl: '1.5rem',    // 24px
        full: '9999px'   // Full rounded
      },
      // Shadows
      boxShadow: {
        sm: '0 4px 12px rgba(0, 0, 0, 0.08)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      // Transitions
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms'
      },
      transitionTimingFunction: {
        base: 'ease-in-out'
      },
      // Z-Index
      zIndex: {
        dropdown: '1000',
        sticky: '1020',
        fixed: '1030',
        'modal-backdrop': '1040',
        modal: '1050',
        popover: '1060',
        tooltip: '1070'
      }
    }
  },
  plugins: []
}