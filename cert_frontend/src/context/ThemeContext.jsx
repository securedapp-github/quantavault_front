import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initial theme from localStorage or 'system'
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme_preference');
        return savedTheme || 'system';
    });

    // We keep track of the system theme separately to trigger updates
    const [systemTheme, setSystemTheme] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    );

    // Update localStorage when theme name changes
    useEffect(() => {
        localStorage.setItem('theme_preference', theme);
    }, [theme]);

    // Handle system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Resolve the current active theme
    const resolvedTheme = theme === 'system' ? systemTheme : theme;
    const isDark = resolvedTheme === 'dark';

    // Apply to DOM whenever resolved theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('data-theme', resolvedTheme);
    }, [resolvedTheme]);

    const value = {
        theme, // 'light', 'dark', or 'system'
        setTheme,
        isDark, // Reactive to both manual toggle and system changes
        resolvedTheme // Useful for components needing to know the actual applied theme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
