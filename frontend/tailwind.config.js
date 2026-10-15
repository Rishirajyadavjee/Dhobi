/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        atelier: {
          950: '#070D18',
          900: '#0C1628',
          850: '#111F38',
          800: '#172847',
          700: '#233A62',
          600: '#324F82',
        },
        linen: {
          50: '#FAF9F5',
          100: '#F5F3EC',
          200: '#EDE9DE',
          300: '#DED8C6',
          400: '#C5BCA5',
          500: '#A4987E',
        },
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(15, 23, 42, 0.05), 0 1px 3px 0 rgba(15, 23, 42, 0.03)',
        'card': '0 12px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03)',
        'floating': '0 24px 48px -12px rgba(15, 23, 42, 0.14), 0 12px 24px -6px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
