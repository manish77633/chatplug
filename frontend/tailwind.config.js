/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void:    '#ffffff',
        surface: '#f8fafc', // slate-50
        panel:   '#f1f5f9', // slate-100
        border:  '#e2e8f0', // slate-200
        text:    '#0f172a', // slate-900
        muted:   '#475569', // slate-600
        dim:     '#64748b', // slate-500
        acid:    '#2563eb', // blue-600
        violet:  '#4f46e5', // indigo-600
        sky:     '#0ea5e9',
        danger:  '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease forwards',
        'slide-up':     'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down':   'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in':     'scaleIn 0.3s ease forwards',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'float':        'float 3s ease-in-out infinite',
        'blob':         'blob 7s infinite',
        'shimmer':      'shimmer 2s infinite',
        'glow-pulse':   'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:  { from: { opacity: 0, transform: 'scale(0.95)' }, to: { opacity: 1, transform: 'scale(1)' } },
        float:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        blob:     { '0%': { transform: 'translate(0, 0) scale(1)' }, '33%': { transform: 'translate(30px, -50px) scale(1.1)' }, '66%': { transform: 'translate(-20px, 20px) scale(0.9)' }, '100%': { transform: 'translate(0, 0) scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        'glow-pulse': { '0%, 100%': { boxShadow: '0 0 20px rgba(167, 139, 250, 0.5)' }, '50%': { boxShadow: '0 0 30px rgba(167, 139, 250, 0.8)' } },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
