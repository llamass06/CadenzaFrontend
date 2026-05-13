import React from 'react';
import { useThemeSettings } from '../utils/useThemeSettings';
import Sidebar from '../components/Sidebar';

/**
 * AppLayout
 *
 * Layout compartido para todas las páginas autenticadas (Dashboard, Estudio, etc.).
 * Se encarga de:
 *  - Montar la Sidebar con su estado de apertura y las preferencias de tema.
 *  - Desplazar el contenido principal (`main`) según si la Sidebar está abierta o cerrada.
 *  - Exponer el estado de la Sidebar a la cabecera de cada página mediante un render prop,
 *    permitiendo que cada página coloque su propio botón hamburguesa.
 *
 * @param {Function} [renderHeader]       - Render prop: ({ isSidebarOpen, setIsSidebarOpen }) => JSX.
 *                                          Recibe el estado de la Sidebar para poder controlarla
 *                                          desde el botón hamburguesa de la cabecera de cada página.
 * @param {React.ReactNode} children      - Contenido principal de la página.
 * @param {string} [contentClass='p-12']  - Clases Tailwind adicionales para el div de contenido
 *                                          (padding, max-width, etc.).
 * @param {string} [textAlign='text-left']- Clase de alineación de texto para el contenido.
 */
export default function AppLayout({
    renderHeader,
    children,
    contentClass = 'p-12',
    textAlign = 'text-left',
}) {
    /*
     * useThemeSettings centraliza en un único hook:
     *  - isDark / setIsDark         → modo oscuro/claro (persiste en localStorage)
     *  - fontSize / setFontSize     → escala de fuente global
     *  - isSidebarOpen / setIsSidebarOpen → estado de apertura de la Sidebar
     */
    const {
        isDark, setIsDark,
        fontSize, setFontSize,
        isSidebarOpen, setIsSidebarOpen,
    } = useThemeSettings();

    return (
        /*
         * Contenedor raíz del layout.
         * - min-h-screen garantiza que ocupe toda la ventana aunque el contenido sea corto.
         * - flex habilita la disposición horizontal Sidebar | main.
         * - fontSize aplica la escala de fuente elegida por el usuario.
         * - overflow-x-hidden evita el scroll horizontal durante la animación de la Sidebar.
         */
        <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>

            {/*
             * Sidebar — recibe todas las preferencias del usuario para poder
             * renderizar los controles de tema (dark mode, tamaño de fuente) y
             * el menú de usuario dentro de ella.
             * showUserMenu={true} activa la sección de perfil en la parte inferior.
             */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isDark={isDark}
                setIsDark={setIsDark}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showUserMenu={true}
            />

            {/*
             * Área de contenido principal.
             * - ml-64 cuando la Sidebar está abierta (desplaza el contenido para no solaparse).
             * - ml-0  cuando está cerrada (ocupa todo el ancho disponible).
             * La transición suaviza el desplazamiento al abrir/cerrar la Sidebar.
             */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <div className={`${contentClass} w-full ${textAlign}`}>
                    {/*
                     * renderHeader es un render prop opcional.
                     * Se llama con el estado actual de la Sidebar para que la cabecera
                     * de cada página pueda renderizar un botón hamburguesa que la controle.
                     * El operador ?. evita errores si la prop no se proporciona.
                     */}
                    {renderHeader?.({ isSidebarOpen, setIsSidebarOpen })}

                    {/* Contenido específico de cada página (Dashboard, Estudio, etc.) */}
                    {children}
                </div>
            </main>
        </div>
    );
}
