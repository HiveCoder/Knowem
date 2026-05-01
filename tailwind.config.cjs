module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050816',
          900: '#0b1220',
          800: '#142039',
          700: '#1c2c4f',
        },
        cyan: {
          400: '#3dd9eb',
          500: '#0eb9cf',
        },
        coral: {
          400: '#ff7b72',
          500: '#ff5d52',
        },
        gold: {
          400: '#f8d66d',
          500: '#e6b93d',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(61, 217, 235, 0.18), 0 18px 50px rgba(5, 8, 22, 0.6)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(61, 217, 235, 0.22), transparent 35%), radial-gradient(circle at top right, rgba(248, 214, 109, 0.14), transparent 28%), linear-gradient(180deg, rgba(20, 32, 57, 0.92), rgba(5, 8, 22, 1))',
      },
    },
  },
  plugins: [],
}
