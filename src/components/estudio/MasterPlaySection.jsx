import React from 'react';

/**
 * MasterPlaySection
 *
 * Sección de control maestro ("Sincronización total").
 * Reproduce simultáneamente el backing track, la grabación del usuario
 * y el metrónomo cuando el usuario pulsa el botón circular.
 *
 * @param {boolean}  isMasterPlaying - Indica si la reproducción maestra está activa.
 * @param {boolean}  disabled        - Deshabilita el botón si no hay backing track cargado.
 * @param {Function} onToggle        - Callback para alternar el estado de reproducción.
 */
export default function MasterPlaySection({ isMasterPlaying, disabled, onToggle }) {
    return (
        <section className="bg-cadenza-card p-8 rounded-2xl border-2 border-cadenza-neon shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="text-left relative z-10">
                <h2 className="text-base font-black uppercase italic">Master Play</h2>
                <p className="text-[9px] text-slate-500 dark:text-cadenza-light font-bold mt-1 uppercase tracking-widest">
                    Sincronización total
                </p>
            </div>

            {/* Botón circular principal */}
            <button
                onClick={onToggle}
                disabled={disabled}
                className="w-12 h-12 bg-cadenza-neon rounded-full text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-20 relative z-10"
            >
                {isMasterPlaying ? (
                    /* Icono Pause */
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                ) : (
                    /* Icono Play */
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                    </svg>
                )}
            </button>
        </section>
    );
}
