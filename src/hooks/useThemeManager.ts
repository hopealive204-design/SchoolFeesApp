import { useEffect } from 'react';

// Helper to convert hex to HSL string for DaisyUI
const hexToHslString = (hex: string): string => {
    if (!hex || typeof hex !== 'string') {
        console.warn(`Invalid hex color value provided to hexToHslString: ${hex}`);
        return '0 0% 0%'; // Fallback to black for safety
    }
    // Remove hash if present
    hex = hex.replace(/^#/, '');

    // Handle shorthand hex (e.g., "03F")
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn(`Could not parse hex color: #${hex}`);
        return '0 0% 0%'; // Fallback to black
    }
    
    const r_norm = r / 255;
    const g_norm = g / 255;
    const b_norm = b / 255;

    const max = Math.max(r_norm, g_norm, b_norm);
    const min = Math.min(r_norm, g_norm, b_norm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r_norm: h = (g_norm - b_norm) / d + (g_norm < b_norm ? 6 : 0); break;
            case g_norm: h = (b_norm - r_norm) / d + 2; break;
            case b_norm: h = (r_norm - g_norm) / d + 4; break;
        }
        h /= 6;
    }

    const H = Math.round(h * 360);
    const S = Math.round(s * 100);
    const L = Math.round(l * 100);

    return `${H} ${S}% ${L}%`;
};

interface Theme {
    primary: string;
    secondary: string;
    accent: string;
}

const useThemeManager = (theme?: Theme) => {
    useEffect(() => {
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--p', hexToHslString(theme.primary));
            root.style.setProperty('--s', hexToHslString(theme.secondary));
            root.style.setProperty('--a', hexToHslString(theme.accent));
            
            // Set content colors to white for good contrast on colored backgrounds
            root.style.setProperty('--pc', '0 0% 100%'); // primary-content
            root.style.setProperty('--sc', '0 0% 100%'); // secondary-content
            root.style.setProperty('--ac', '0 0% 100%'); // accent-content
        }
    }, [theme]);
};

export default useThemeManager;