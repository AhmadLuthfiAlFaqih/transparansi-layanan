export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#0F2A3D', paper: '#F5F7F4', teal: { DEFAULT: '#0E8F7E', dark: '#0A6E61' }, amber: { DEFAULT: '#C98A00' }, rust: '#B5412B' },
      fontFamily: { display: ['"Bricolage Grotesque"', 'sans-serif'], sans: ['"Public Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
