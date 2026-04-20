import { useState, useEffect } from 'react';

export function useThemeSettings() {
    // Leemos de localStorage o usamos valores por defecto
    const [isDark, setIsDark] = useState(() => {
        const guardado = localStorage.getItem('cadenza_isDark');
        return guardado !== null ? JSON.parse(guardado) : true;
    });
    
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('cadenza_fontSize') || 'text-sm';
    });
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Guardar y aplicar Modo Oscuro
    useEffect(() => {
        localStorage.setItem('cadenza_isDark', JSON.stringify(isDark));
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Guardar Tamaño de Fuente
    useEffect(() => {
        localStorage.setItem('cadenza_fontSize', fontSize);
    }, [fontSize]);

    return { 
        isDark, setIsDark, 
        fontSize, setFontSize, 
        isSidebarOpen, setIsSidebarOpen 
    };
}