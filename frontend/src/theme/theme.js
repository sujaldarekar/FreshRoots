// Centralized Theme System for FreshRoots
// All components should import styles/tokens from this file.

const theme = {
  colors: {
    primary: '#2E7D32',
    primaryLight: '#388E3C',
    primaryDark: '#1B5E20',
    secondary: '#81C784',
    secondaryLight: '#A5D6A7',
    secondaryDark: '#66BB6A',
    accent: '#FF9800',
    accentLight: '#FFB74D',
    accentDark: '#F57C00',
    background: '#F5F7F6',
    surface: '#FFFFFF',
    text: '#1A2E1A',
    textLight: '#4A6741',
    textMuted: '#7A9B77',
    border: '#D4E6D3',
    borderLight: '#E8F5E9',
    error: '#D32F2F',
    success: '#2E7D32',
    warning: '#F57C00',
    info: '#1976D2',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px',
  },

  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    '2xl': '28px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.10)',
    xl: '0 16px 40px rgba(0,0,0,0.12)',
    card: '0 2px 8px rgba(46, 125, 50, 0.08)',
    cardHover: '0 8px 28px rgba(46, 125, 50, 0.18)',
    green: '0 4px 14px rgba(46, 125, 50, 0.28)',
    accent: '0 4px 14px rgba(255, 152, 0, 0.32)',
  },

  typography: {
    fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    sizes: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.25s ease',
    slow: 'all 0.4s ease',
  },

  components: {
    button: {
      primary: `bg-primary hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl
        shadow-green hover:shadow-lg transition-all duration-200 active:scale-95`,
      secondary: `border-2 border-primary text-primary hover:bg-primary hover:text-white
        font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 active:scale-95`,
      accent: `bg-accent hover:bg-accent-dark text-white font-semibold px-5 py-2.5 rounded-xl
        shadow-accent hover:shadow-lg transition-all duration-200 active:scale-95`,
      ghost: `text-primary hover:bg-primary-50 font-medium px-5 py-2.5 rounded-xl
        transition-all duration-200`,
      danger: `bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl
        transition-all duration-200 active:scale-95`,
    },
    card: `bg-white rounded-2xl shadow-card border border-primary-50 p-5`,
    input: `w-full bg-white border-[1.5px] border-gray-200 rounded-xl px-4 py-2.5 text-sm
      text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary
      focus:ring-2 focus:ring-primary/10 transition-all duration-200`,
    label: `block text-sm font-medium text-gray-700 mb-1.5`,
    badge: {
      fresh: `bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full`,
      good: `bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full`,
      average: `bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5 rounded-full`,
    },
  },

  animation: {
    cardHover: {
      initial: { scale: 1, boxShadow: '0 2px 8px rgba(46, 125, 50, 0.08)' },
      hover: { scale: 1.02, boxShadow: '0 8px 28px rgba(46, 125, 50, 0.18)' },
    },
    fadeUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    stagger: {
      visible: { transition: { staggerChildren: 0.1 } },
    },
  },
};

export default theme;
