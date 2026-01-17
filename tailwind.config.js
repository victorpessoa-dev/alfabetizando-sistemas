/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
    ],
    theme: {
        fontFamily: {
            sans: [
                "system-ui",
                "-apple-system",
                "BlinkMacSystemFont",
                "Segoe UI",
                "Roboto",
                "Helvetica Neue",
                "Arial",
                "sans-serif",
            ],
            mono: ["monospace"],
        },
        extend: {
            colors: {
                primary: "#2563eb",
                secondary: "#b6b6b6",
            },
        },
    },
    plugins: [],
}
