/** @type {import('tailwindcss').Config} */
// Configuração do TailwindCSS com paleta de cores de tema escuro automotivo (Estilo Stark HUD)
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stark: {
          bg: "#070B14",
          panel: "#0E1628",
          cyan: "#00F0FF",
          blue: "#0066FF",
          amber: "#FFB800",
          emerald: "#00E676",
        },
      },
    },
  },
  plugins: [],
};
