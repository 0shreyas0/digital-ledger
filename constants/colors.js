// // constants/colors.js
// const coffeeTheme = {
//   primary: "#8B593E",
//   background: "#FFF8F3",
//   text: "#4A3428",
//   border: "#E5D3B7",
//   white: "#FFFFFF",
//   textLight: "#9A8478",
//   expense: "#E74C3C",
//   income: "#2ECC71",
//   card: "#FFFFFF",
//   shadow: "#000000",
// };

// const forestTheme = {
//   primary: "#2E7D32",
//   background: "#E8F5E9",
//   text: "#1B5E20",
//   border: "#C8E6C9",
//   white: "#FFFFFF",
//   textLight: "#66BB6A",
//   expense: "#C62828",
//   income: "#388E3C",
//   card: "#FFFFFF",
//   shadow: "#000000",
// };

// const purpleTheme = {
//   primary: "#6A1B9A",
//   background: "#F3E5F5",
//   text: "#4A148C",
//   border: "#D1C4E9",
//   white: "#FFFFFF",
//   textLight: "#BA68C8",
//   expense: "#D32F2F",
//   income: "#388E3C",
//   card: "#FFFFFF",
//   shadow: "#000000",
// };

// const oceanTheme = {
//   primary: "#0277BD",
//   background: "#E1F5FE",
//   text: "#01579B",
//   border: "#B3E5FC",
//   white: "#FFFFFF",
//   textLight: "#4FC3F7",
//   expense: "#EF5350",
//   income: "#26A69A",
//   card: "#FFFFFF",
//   shadow: "#000000",
// };

// export const THEMES = {
//   coffee: coffeeTheme,
//   forest: forestTheme,
//   purple: purpleTheme,
//   ocean: oceanTheme,
// };

// // 👇 change this to switch theme
// export const COLORS = THEMES.coffee;

export const lightTheme = {
    primary: "#2563EB",       /* royal blue */
    secondary: "#06B6D4",     /* cyan */
    background: "#E3F2FD",    /* light blue */
    accent: "#AEEA00",        /* lime green */
    border: "#1E293B",
    danger: "#EF4444",
    dangerBox: "#ff6347",     /* mapped from --color-errorBox */
    dangerBorder: "#EF4444",
};

export const darkTheme = {
    primary: "#60A5FA",       /* soft blue */
    secondary: "#22D3EE",     /* bright cyan */
    background: "#020817",
    accent: "#AEEA00",        /* lime green */
    border: "#1E293B",
    danger: "#7E1E1D",
    dangerBox: "#EF4444",     /* mapped from --color-dangerBox */
    dangerBorder: "#7E1E1D",
};

export const THEMES = {
    light: lightTheme,
    dark: darkTheme,
};

export const COLORS = THEMES.light;