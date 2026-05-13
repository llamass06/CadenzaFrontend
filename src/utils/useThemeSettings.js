import { useState, useEffect } from 'react';

/**
 * @file useThemeSettings.js
 * @module utils/useThemeSettings
 *
 * Hook centralizado para la gestión de la configuración visual global de Cadenza.
 * Persiste el modo oscuro y el tamaño de fuente en localStorage para que la
 * preferencia del usuario sobreviva a recargas de página.
 *
 * Consumido por: AppLayout y AuthLayout, que lo usan para coordinar el tema
 * con la Sidebar y el contenido principal.
 */

/**
 * useThemeSettings
 *
 * Gestiona tres aspectos del estado de la interfaz:
 *
 *  1. **Modo oscuro (`isDark`)**:
 *     - Persiste en localStorage bajo la clave `cadenza_isDark`.
 *     - Aplica/elimina la clase `dark` en `<html>` para activar las
 *       variantes `dark:` de Tailwind CSS en todo el árbol del DOM.
 *     - Valor por defecto: `true` (Cadenza arranca en modo oscuro).
 *
 *  2. **Tamaño de fuente (`fontSize`)**:
 *     - Persiste en localStorage bajo la clave `cadenza_fontSize`.
 *     - Almacena una clase de Tailwind (ej: `'text-sm'`, `'text-base'`).
 *     - Valor por defecto: `'text-sm'`.
 *
 *  3. **Estado de la Sidebar (`isSidebarOpen`)**:
 *     - Estado de sesión (no persiste entre recargas).
 *     - Se inicializa a `false` (cerrada) en cada carga de página.
 *
 * @returns {{
 *   isDark: boolean,
 *   setIsDark: Function,
 *   fontSize: string,
 *   setFontSize: Function,
 *   isSidebarOpen: boolean,
 *   setIsSidebarOpen: Function
 * }}
 */
export function useThemeSettings() {

    // Inicialización lazy con función: se ejecuta solo una vez al montar.
    // Lee el valor guardado; si no existe, usa `true` (modo oscuro por defecto).
    const [isDark, setIsDark] = useState(() => {
        const guardado = localStorage.getItem('cadenza_isDark');
        return guardado !== null ? JSON.parse(guardado) : true;
    });

    // Inicialización lazy: lee la clase de fuente guardada o usa 'text-sm' como fallback.
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('cadenza_fontSize') || 'text-sm';
    });

    // Estado de sesión (no persistido): controla si la Sidebar está visible o no.
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /**
     * Efecto de modo oscuro.
     * Se ejecuta en cada cambio de `isDark`:
     *  1. Persiste el valor en localStorage para futuras sesiones.
     *  2. Añade/elimina la clase `dark` en `document.documentElement` (<html>),
     *     que es el mecanismo de Tailwind CSS para activar las variantes `dark:`.
     */
    useEffect(() => {
        localStorage.setItem('cadenza_isDark', JSON.stringify(isDark));
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    /**
     * Efecto de tamaño de fuente.
     * Persiste la clase de Tailwind en localStorage cada vez que el usuario la cambia.
     * El componente que consume este hook es responsable de aplicar la clase al DOM.
     */
    useEffect(() => {
        localStorage.setItem('cadenza_fontSize', fontSize);
    }, [fontSize]);

    return {
        isDark, setIsDark,
        fontSize, setFontSize,
        isSidebarOpen, setIsSidebarOpen
    };
}