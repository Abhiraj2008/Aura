/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          bg: '#f5f0e6',
          bgDark: '#eae3d5',
          card: '#fffdf9',
          cardAlt: '#faf5ed',
          ink: '#181816',
          inkMuted: '#686661',
          inkSubtle: '#9e9a91',
          border: '#dcd4c3',
          borderDark: '#181816',
          // Risograph / doodle palette
          terracotta: '#e76f51',
          mustard: '#e9c46a',
          sage: '#40916c',
          denim: '#3d5a80',
          blush: '#f4a261',
          highlighter: '#ffe66d',
          tape: 'rgba(233, 196, 106, 0.45)',
          tapeRose: 'rgba(244, 162, 97, 0.45)',
          tapeMint: 'rgba(64, 145, 108, 0.35)',
        },
        chalk: {
          bg: '#161513',
          card: '#201f1c',
          cardAlt: '#272622',
          ink: '#f5f1e8',
          inkMuted: '#9e9a91',
          border: '#36342f',
          accent: '#f4a261'
        }
      },
      boxShadow: {
        'paper-sm': '2px 2px 0px 0px #181816',
        'paper': '3px 3px 0px 0px #181816',
        'paper-lg': '5px 5px 0px 0px #181816',
        'paper-pop': '7px 7px 0px 0px #181816',
        'chalk-sm': '2px 2px 0px 0px #f5f1e8',
        'chalk': '3px 3px 0px 0px #f5f1e8',
        'soft-lift': '0 8px 24px -4px rgba(24, 24, 22, 0.08)',
        'stamp': 'inset 0 0 0 2px #181816',
      },
      fontFamily: {
        doodle: ['Caveat', 'cursive'],
        typewriter: ['Space Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        'reel-spin': 'reelSpin 8s linear infinite',
        'wiggle-slow': 'wiggle 4s ease-in-out infinite',
        'stamp-hover': 'stampHover 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'doodle-float': 'doodleFloat 6s ease-in-out infinite alternate',
      },
      keyframes: {
        reelSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-0.8deg)' },
          '50%': { transform: 'rotate(0.8deg)' },
        },
        doodleFloat: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '100%': { transform: 'translateY(-4px) rotate(1.2deg)' },
        }
      }
    },
  },
  plugins: [],
}
