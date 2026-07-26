/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lilac: '#D8C7F2',
        lilacText: '#6B4FA0',
        leaf: '#C8F0D4',
        leafText: '#3E8C5A',
        sky: '#BEE3FB',
        skyText: '#3E7CA6',
        blossom: '#FFC9DE',
        blossomText: '#B5507A',
        cream: '#FFFBF3',
        border: '#EAD9F5',
        textDark: '#5C4A5C',
        textMuted: '#A98FAE'
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif']
      },
      borderRadius: {
        wobble: '30px 40px 28px 42px / 40px 28px 42px 30px'
      }
    }
  },
  plugins: []
}
