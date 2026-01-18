/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./assets/styles/**/*.{js,jsx,ts,tsx}",
        "./constants/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: "class",
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                secondary: "var(--color-secondary)",
                background: "var(--color-background)",
                border: "var(--color-border)",
                accent: "var(--color-accent)",
                danger: "var(--color-danger)",
                dangerBox: "var(--color-dangerBox)",
                dangerBorder: "var(--color-dangeBorder)",
                card: "var(--color-card)",
            },
            fontFamily: {
                sansReg: ["GoogleSans-Regular"],
                sansMed: ["GoogleSans-Medium"],
                sansBold: ["GoogleSans-Bold"],
            },
        },
    },
    plugins: [],
};
