/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#2563eb",   // azul principal
                secondary: "#b6b6b6", // cinza escuro
            },
        },
    },
    plugins: [],
}

