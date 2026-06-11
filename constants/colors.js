export const THEMES = {
  ice: {
    light: {
      primary: "#5B8CF5",       /* royal blue */
      secondary: "#7789AE",     /* slate blue */
      background: "#E3F2FD",    /* light blue */
      accent: "#AEEA00",        /* lime green */
      border: "#94A3B8",        /* slate-400 equivalent */
      borderSubtle: "#CBD5E1",  /* slate-300 equivalent */
      red: "#EF4444",
      lightRed: "#FFB3A6",
      dangerBorder: "#EF4444",
      green: "#22c55e",
      card: "#FFFFFF",
      surface: "#F1F5F9",       /* slate-100 equivalent */
      textMain: "#0F172A",      /* slate-900 equivalent */
      textMuted: "#64748B",     /* slate-500 equivalent */
      segmentedControl: "#5B8CF5",
    },
    dark: {
      primary: "#18467D",       /* soft blue */
      secondary: "#22D3EE",     /* bright cyan */
      background: "#020817",
      accent: "#AEEA00",
      border: "#334155",        /* slate-700 equivalent */
      borderSubtle: "#1E293B",  /* slate-800 equivalent */
      red: "#7E1E1D",
      lightRed: "#EF4444",
      dangerBorder: "#7E1E1D",
      green: "#22c55e",
      card: "#0F172A",
      surface: "#1E293B",
      textMain: "#F1F5F9",
      textMuted: "#94A3B8",
      segmentedControl: "#18467D",
    }
  },
  coffee: {
    light: {
      primary: "#8B593E",       /* coffee brown */
      secondary: "#9A8478",
      background: "#FFF8F3",    /* warm cream */
      accent: "#AEEA00",
      border: "#C8B6A6",        /* tan border */
      borderSubtle: "#E7DEC8",  /* soft beige border */
      red: "#E74C3C",
      lightRed: "#FFB3A6",
      dangerBorder: "#E74C3C",
      green: "#2ECC71",
      card: "#FFFFFF",
      surface: "#FAF6F0",       /* warm cream input background */
      textMain: "#4A3428",      /* deep brown text */
      textMuted: "#8D7B68",     /* muted warm brown text */
      segmentedControl: "#8B593E",
    },
    dark: {
      primary: "#4A3428",       /* dark coffee */
      secondary: "#8B593E",
      background: "#1A120B",
      accent: "#AEEA00",
      border: "#5C4033",
      borderSubtle: "#4A3428",
      red: "#C62828",
      lightRed: "#E74C3C",
      dangerBorder: "#C62828",
      green: "#2ECC71",
      card: "#2C1E14",
      surface: "#3D2B1F",
      textMain: "#FFF8F3",
      textMuted: "#A9958B",
      segmentedControl: "#4A3428",
    }
  },
  purple: {
    light: {
      primary: "#6A1B9A",       /* royal purple */
      secondary: "#BA68C8",
      background: "#F3E5F5",    /* lavender background */
      accent: "#AEEA00",
      border: "#D1C4E9",        /* lavender border */
      borderSubtle: "#EDE7F6",  /* soft lavender border */
      red: "#D32F2F",
      lightRed: "#FFB3A6",
      dangerBorder: "#D32F2F",
      green: "#388E3C",
      card: "#FFFFFF",
      surface: "#FBF7FD",       /* very light lavender input background */
      textMain: "#3A105C",      /* deep purple text */
      textMuted: "#7E57C2",     /* lavender text */
      segmentedControl: "#6A1B9A",
    },
    dark: {
      primary: "#4A148C",       /* deep purple */
      secondary: "#6A1B9A",
      background: "#1A002C",
      accent: "#AEEA00",
      border: "#5E35B1",
      borderSubtle: "#4A148C",
      red: "#C62828",
      lightRed: "#D32F2F",
      dangerBorder: "#C62828",
      green: "#388E3C",
      card: "#25003F",
      surface: "#37005B",
      textMain: "#F3E5F5",
      textMuted: "#B39DDB",
      segmentedControl: "#4A148C",
    }
  }
};

// Default export structure for backwards compatibility if referenced directly
export const COLORS = THEMES.ice.light;