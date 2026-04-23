/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0c', // Deep cinematic black
                surface: '#121216',    // Slightly elevated dark grey
                primary: '#6366f1',    // Neon indigo for accents
                accent: '#8b5cf6',     // Violet for glowing effects
                textMuted: '#a1a1aa'
            },
            boxShadow: {
                'neon': '0 0 20px rgba(99, 102, 241, 0.5)',
                'neon-accent': '0 0 20px rgba(139, 92, 246, 0.5)',
            }
        },
    },
    plugins: [],
}