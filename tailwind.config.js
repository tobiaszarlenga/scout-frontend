/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: 'var(--color-sidebar)',
        bg: 'var(--color-bg)',
        card: 'var(--color-card)',
        accent: 'var(--color-accent)',
        accent2: 'var(--color-accent2)',
        apptext: 'var(--color-text)',
        appborder: 'var(--color-border)'
      }
    }
  },
  plugins: [],
};
