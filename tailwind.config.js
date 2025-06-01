import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,ts,jsx,tsx}',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-12px)' },
                },
                fadeInUp: {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)',
                    },
                },
            },
            animation: {
                float: 'float 4s ease-in-out infinite',
                fadeInUp: 'fadeInUp 0.8s ease-out forwards',
            },
        },
    },

    plugins: [forms],
};
