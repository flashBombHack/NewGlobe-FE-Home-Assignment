/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0B0F19',
        glassWhite: 'rgba(255, 255, 255, 0.04)',
        semiGlassWhite: 'rgba(255, 255, 255, 0.010)',
        glowBlue: '#1f3b73',
        neonBlue: '#00C6FF'
      },
      backgroundImage: {
        radial: 'radial-gradient(ellipse at top,rgba(48, 27, 84, 0.64), #0B0F19)'
      },
      boxShadow: {
        glow: '0 0 15px rgba(0, 198, 255, 0.2)'
      },
      backdropBlur: {
        glass: '14px'
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'Inter', 'sans-serif']
      }
    }
  },
  plugins: []
};
