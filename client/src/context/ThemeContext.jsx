import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    };

    const theme = {
        isDark,
        toggleTheme,
        colors: isDark ? {
            // Dark mode
            bg: '#0f172a',
            bgSecondary: '#1e293b',
            card: '#1e293b',
            cardHover: '#334155',
            text: '#f1f5f9',
            textSecondary: '#94a3b8',
            border: '#334155',
            primary: '#6366f1',
            primaryHover: '#4f46e5',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            shadow: 'rgba(0, 0, 0, 0.3)'
        } : {
            // Light mode
            bg: '#f8fafc',
            bgSecondary: '#ffffff',
            card: '#ffffff',
            cardHover: '#f1f5f9',
            text: '#0f172a',
            textSecondary: '#64748b',
            border: '#e2e8f0',
            primary: '#6366f1',
            primaryHover: '#4f46e5',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            shadow: 'rgba(0, 0, 0, 0.1)'
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};
