/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Applaude Blue DNA
        'applaude-blue': '#007BFF',
        'applaude-blue-dark': '#0056B3',
        'applaude-blue-light': '#339DFF',
        'applaude-pink': '#FF2D87',     // Fusion pink (hover/active states)
        'applaude-navy': '#0A1628',     // Deep background
        'applaude-surface': '#0D1F3C',  // Card backgrounds
        'applaude-border': '#1A3A6B',   // Border color
        // Terminal colors
        'terminal-bg': '#0A0E1A',
        'terminal-green': '#00FF85',
        'terminal-red': '#FF4757',
        'terminal-yellow': '#FFD700',
        'terminal-cyan': '#00D4FF',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
        'body': ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-applaude': 'linear-gradient(135deg, #007BFF 0%, #0056B3 50%, #003380 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0A1628 0%, #001440 100%)',
        'gradient-card': 'linear-gradient(145deg, #0D1F3C 0%, #0A1628 100%)',
      },
      animation: {
        'pulse-blue': 'pulse-blue 2s infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'blink': 'blink 1s step-end infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        'pulse-blue': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 123, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 123, 255, 0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}
