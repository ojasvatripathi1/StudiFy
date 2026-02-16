'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserData, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ShopItem, UserData } from '@/lib/types';
import { getShopItems } from '@/lib/shopFirebase';

interface ThemeContextType {
    activeTheme: ShopItem | null;
    refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [activeTheme, setActiveTheme] = useState<ShopItem | null>(null);

    useEffect(() => {
        if (!user) {
            setActiveTheme(null);
            resetTheme();
            return;
        }

        // Listen for user data changes (including activeCustomizations)
        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, async (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data() as UserData;
                const themeId = data.activeCustomizations?.theme;

                if (themeId) {
                    const items = await getShopItems();
                    const themeItem = items.find(i => i.id === themeId);
                    if (themeItem) {
                        setActiveTheme(themeItem);
                        applyTheme(themeItem);
                    } else {
                        setActiveTheme(null);
                        resetTheme();
                    }
                } else {
                    setActiveTheme(null);
                    resetTheme();
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    const applyTheme = (theme: ShopItem) => {
        if (!theme.metadata?.themeColors) return;

        const colors = theme.metadata.themeColors;
        const root = document.documentElement;

        // Note: Simple conversion for now. In a real app we'd need HSL conversion if using shadcn
        // Since StudiFy uses Tailwind with CSS variables in Poppins/Standard format:
        if (colors.primary) {
            // We need to convert hex/rgb to HSL string format that Globals.css expects: "H S% L%"
            // For now, let's just override the direct variables if possible or use !important
            // Better approach: set the variables directly if they are standard CSS
            root.style.setProperty('--primary', hexToHSL(colors.primary));
            if (colors.secondary) {
                root.style.setProperty('--secondary', hexToHSL(colors.secondary));
            }
        }
    };

    const resetTheme = () => {
        const root = document.documentElement;
        root.style.removeProperty('--primary');
        root.style.removeProperty('--secondary');
    };

    const refreshTheme = async () => {
        if (!user) return;
        const userData = await getUserData(user.uid);
        const themeId = userData?.activeCustomizations?.theme;
        if (themeId) {
            const items = await getShopItems();
            const themeItem = items.find(i => i.id === themeId);
            if (themeItem) {
                setActiveTheme(themeItem);
                applyTheme(themeItem);
            }
        } else {
            setActiveTheme(null);
            resetTheme();
        }
    };

    return (
        <ThemeContext.Provider value={{ activeTheme, refreshTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Helper to convert hex to HSL format used by shadcn/globals.css
function hexToHSL(hex: string): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    }

    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
