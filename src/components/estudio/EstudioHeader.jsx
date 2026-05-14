import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * EstudioHeader
 *
 * Cabecera de la página Estudio Virtual. Muestra el título de la vista,
 * los metadatos de la obra activa y un botón para volver a la pantalla anterior.
 * También incluye el botón hamburguesa inline para abrir la Sidebar cuando está cerrada.
 *
 * @param {string}   nombreObra      - Nombre de la obra musical.
 * @param {string}   autorObra       - Autor de la obra (opcional).
 * @param {boolean}  isSidebarOpen   - Estado de visibilidad de la Sidebar.
 * @param {Function} setIsSidebarOpen - Función para abrir/cerrar la Sidebar.
 */
export default function EstudioHeader({ nombreObra, autorObra, isSidebarOpen, setIsSidebarOpen }) {
    const navigate = useNavigate();

    return (
        <header className="flex items-center mb-10 border-b border-cadenza-border pb-5 relative">
            {/* Botón hamburguesa inline (solo visible si la Sidebar está cerrada) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="flex items-center justify-center w-8 h-8 hover:bg-cadenza-card rounded-md transition-colors mr-4 text-slate-500 dark:text-cadenza-light"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </button>
            )}

            {/* Título y metadatos de la obra */}
            <div className="text-left">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase">
                    Estudio <span className="text-cadenza-neon">Virtual</span>
                </h1>
                <p className="text-slate-500 dark:text-cadenza-light font-bold mt-0.5 uppercase tracking-[0.2em] text-xs">
                    {nombreObra}{' '}
                    {autorObra && <span className="text-cadenza-neon">| {autorObra}</span>}
                </p>
            </div>

            {/* Botón Volver */}
            <button
                onClick={() => navigate(-1)}
                className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light hover:text-cadenza-neon transition-colors flex items-center space-x-1.5"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                    <path d="M19 12H5m7 7-7-7 7-7" />
                </svg>
                <span>Volver</span>
            </button>
        </header>
    );
}
