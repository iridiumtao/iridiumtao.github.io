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
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#E8E4DE', // 日系木質色
            DEFAULT: '#9D8F80',
            dark: '#4A4036'
          },
          background: {
            light: '#FFFFFF',
            dark: '#1A1A1A'
          },
          accent: {
            light: '#D4C5B9',
            dark: '#6B5B4E'
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
    }
  },
  plugins: [],
};
