/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Japanese Natural Palette
        'japanese-paper': {
          'warm': '#faf9f7',
          'natural': '#f5f4f2',
          'stone': '#f0ede7',
        },
        'japanese-ink': {
          'sumi': '#2d2d2d',
          'charcoal': '#1a1a1a',
          'light': '#e8e4de',
        },
        'japanese-earth': {
          'bamboo': '#7d8471',
          'tea': '#8b7355',
          'stone': '#8b8680',
          'sage': '#9ca986',
          'beige': '#a0926b',
        },
        'japanese-neutral': {
          'warm-gray': '#a19b94',
          'cool-gray': '#6b6b6b',
        },
        // Semantic Colors
        'okoa-bg': {
          'primary': '#faf9f7',
          'secondary': '#f5f4f2',
          'tertiary': '#f0ede7',
        },
        'okoa-fg': {
          'primary': '#2d2d2d',
          'secondary': '#6b6b6b',
          'muted': '#a19b94',
        },
        'okoa-interactive': {
          'primary': '#7d8471',
          'secondary': '#8b7355',
          'tertiary': '#8b8680',
          'muted': '#a19b94',
        },
        'okoa-terminal': {
          'bg': '#f0ede7',
          'fg': '#2d2d2d',
          'accent': '#7d8471',
        },
      },
      fontFamily: {
        'mono': ['Consolas', 'Liberation Mono', 'Menlo', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Desktop sizes
        'xs': ['11px', { lineHeight: '1.0' }],
        'sm': ['12px', { lineHeight: '1.25' }],
        'base': ['13px', { lineHeight: '1.25' }],
        'lg': ['14px', { lineHeight: '1.25' }],
        'xl': ['16px', { lineHeight: '1.25' }],
        '2xl': ['18px', { lineHeight: '1.25' }],
        // Mobile sizes
        'mobile-xs': ['10px', { lineHeight: '1.1' }],
        'mobile-sm': ['11px', { lineHeight: '1.4' }],
        'mobile-base': ['12px', { lineHeight: '1.4' }],
        'mobile-lg': ['13px', { lineHeight: '1.4' }],
        'mobile-xl': ['14px', { lineHeight: '1.4' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        'none': '0',
        'sharp': '0',
      },
      borderWidth: {
        'thin': '1px',
        'medium': '2px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(45, 45, 45, 0.05)',
        'moderate': '0 2px 6px rgba(45, 45, 45, 0.08), 0 1px 3px rgba(45, 45, 45, 0.12)',
        'elevated': '0 4px 12px rgba(45, 45, 45, 0.1), 0 2px 6px rgba(45, 45, 45, 0.15)',
      },
      letterSpacing: {
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
      },
      lineHeight: {
        'tight': '1.0',
        'snug': '1.1',
        'normal': '1.25',
        'relaxed': '1.4',
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      screens: {
        'mobile': '640px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1280px',
      },
    },
  },
  plugins: [],
}