/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:          '#0E0C0A',
        carbon:       '#1A1714',
        surface:      '#231F1B',
        ember:        '#E8450A',
        'ember-light':'#FF6B35',
        sand:         '#F5EFE6',
        'sand-dim':   '#D9CEBC',
        chrome:       '#C8C4BC',
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        ui:      ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'ember':  '0 0 0 2px rgba(232,69,10,0.2)',
        'card':   '0 2px 16px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
