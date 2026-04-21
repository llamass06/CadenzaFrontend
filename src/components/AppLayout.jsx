import React from 'react';
import { useThemeSettings } from '../utils/useThemeSettings';
import Sidebar from '../components/Sidebar';

/**
 * Layout compartido para páginas autenticadas (Dashboard, Estudio, etc.)
 *
 * Props:
 *  - renderHeader: ({ isSidebarOpen, setIsSidebarOpen }) => JSX
 *      Render prop que recibe el estado del sidebar para poder poner
 *      el botón hamburguesa dentro de la cabecera de cada página.
 *  - children:      Contenido principal de la página.
 *  - contentClass:  Clases extra para el div de contenido (por defecto "p-12").
 *  - textAlign:     Clase de alineación de texto (por defecto "text-left").
 */
export default function AppLayout({
    renderHeader,
    children,
    contentClass = 'p-12',
    textAlign = 'text-left',
}) {
    const {
        isDark, setIsDark,
        fontSize, setFontSize,
        isSidebarOpen, setIsSidebarOpen,
    } = useThemeSettings();

    return (
        <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>

            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isDark={isDark}
                setIsDark={setIsDark}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showUserMenu={true}
            />

            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <div className={`${contentClass} w-full ${textAlign}`}>
                    {renderHeader?.({ isSidebarOpen, setIsSidebarOpen })}
                    {children}
                </div>
            </main>
        </div>
    );
}
