const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      mob: "375px",
      tablet: "768px",
      laptop: "1024px",
      desktop: "1280px",
      laptopl: "1440px",
    },
    extend: {
      colors: {
        // background, untested
        bg: {
          primary: {
            light: colors.white,
            dark: colors.stone[900],
          },
          secondary: {
            light: colors.stone[100],
            dark: colors.stone[800],
          },
          accent: {
            light: colors.stone[200],
            dark: colors.stone[700],
          },
        },
        // text
        text: {
          primary: {
            light: colors.stone[900], // Title, main text
            dark: colors.stone[100],
          },
          secondary: {
            light: colors.stone[700], // bullet points, description
            dark: colors.stone[300],
          },
          tertiary: {
            light: colors.stone[500], // location, date
            dark: colors.stone[400],
          },
        },
        // border
        border: {
          primary: {
            light: colors.stone[200],
            dark: colors.stone[700],
          },
          secondary: {
            light: colors.stone[300],
            dark: colors.stone[600],
          },
        },
        // button, untested
        button: {
          primary: {
            light: colors.stone[800],
            dark: colors.stone[200],
            hover: {
              light: colors.stone[900],
              dark: colors.stone[100],
            },
          },
          secondary: {
            light: colors.stone[200],
            dark: colors.stone[700],
            hover: {
              light: colors.stone[300],
              dark: colors.stone[600],
            },
          },
        },
        gradient: {
          light: {
            from: '#E8E4DE',
            to: '#D4C5B9'
          },
          dark: {
            from: '#6B5B4E',
            to: '#4A4036'
          }
        }
      }
    }
  },
  plugins: [],
};