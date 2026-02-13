/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#0f172a',
                    light: '#f8fafc',
                    accent: '#3b82f6',
                    danger: '#ef4444',
                    success: '#22c55e'
                }
            }
        },
    },
    plugins: [],
}
