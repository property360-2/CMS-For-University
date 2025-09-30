/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    safelist: [
        "px-6", "py-3", "bg-blue-600", "bg-blue-700", "text-white",
        "rounded-lg", "font-semibold", "shadow-lg", "shadow-xl", "scale-105",
    ],
    theme: {
        extend: {
            keyframes: {
                'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-in-out',
            },
        },
    },
    plugins: [],
};


