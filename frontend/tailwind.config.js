/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#1a1b1e',
                    card: '#25262b',
                    border: '#2c2e33'
                },
                primary: {
                    DEFAULT: '#3b82f6',
                    hover: '#2563eb'
                }
            }
        },
    },
    plugins: [],
}
