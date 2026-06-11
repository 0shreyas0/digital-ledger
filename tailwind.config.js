/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
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
                borderSubtle: "var(--color-borderSubtle)",
                accent: "var(--color-accent)",
                danger: "var(--color-danger)",
                dangerBox: "var(--color-dangerBox)",
                dangerBorder: "var(--color-dangerBorder)",
                card: "var(--color-card)",
                surface: "var(--color-surface)",
                textMain: "var(--color-textMain)",
                textMuted: "var(--color-textMuted)",
                segmentedControl: "var(--color-segmentedControl)",
            },
            borderRadius: {
                card: "16px",
                input: "16px",
                button: "9999px",
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
