import React from 'react';

/**
 * LibraryPanel
 *
 * Panel del Dashboard que muestra la biblioteca de obras recientes del usuario.
 * Aplica estilos visuales de advertencia (amarillo/rojo) según el estado de
 * almacenamiento, manteniendo consistencia con el resto del Dashboard.
 *
 * @param {Object[]} obrasRecientes   - Lista de obras cargadas desde el backend.
 * @param {boolean}  cargandoObras   - Indica si las obras se están cargando (muestra skeleton).
 * @param {Function} onOpenObra      - Callback que se dispara al hacer clic en una obra.
 * @param {Function} onDeleteObra    - Callback que se dispara al pulsar el botón de eliminar.
 * @param {boolean}  limiteAlcanzado - True cuando el almacenamiento está al máximo (estilo rojo).
 * @param {boolean}  casiLleno       - True cuando el almacenamiento está casi lleno (estilo ámbar).
 */
export default function LibraryPanel({ obrasRecientes, cargandoObras, onOpenObra, onDeleteObra, limiteAlcanzado, casiLleno }) {
    return (
        /*
         * Contenedor principal del panel.
         * Aplica un borde y sombra coloreados según el estado de almacenamiento:
         *   - limiteAlcanzado → rojo  (storage 100 %)
         *   - casiLleno       → ámbar (storage cerca del límite)
         *   - normal          → sin clase extra
         */
        <div className={`cadenza-panel relative overflow-hidden transition-all duration-500 ${limiteAlcanzado ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : casiLleno ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}`}>

            {/* Título del panel — cambia de color según el estado de advertencia */}
            <h2 className={`cadenza-title transition-colors ${limiteAlcanzado ? 'text-red-500' : casiLleno ? 'text-amber-500' : ''}`}>Biblioteca Reciente</h2>

            {/* Área de scroll con altura máxima para la lista de obras */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cargandoObras ? (
                    /* Skeleton de carga mientras se obtienen las obras del backend */
                    <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                ) : obrasRecientes.length === 0 ? (
                    /* Mensaje vacío cuando el usuario no tiene obras guardadas */
                    <p className="text-[10px] text-cadenza-light italic text-center py-4">No tienes obras en tu biblioteca aún.</p>
                ) : (
                    /* Iteramos sobre las obras y renderizamos una tarjeta por cada una */
                    obrasRecientes.map((obra) => (
                        <div
                            key={obra.id}
                            onClick={() => onOpenObra(obra)}
                            className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-cadenza-border flex items-center justify-between cursor-pointer hover:border-cadenza-neon transition-all group"
                        >
                            {/* Sección izquierda: icono de reproducción + metadatos de la obra */}
                            <div className="flex items-center space-x-4 flex-1 min-w-0">

                                {/* Icono de play circular */}
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-cadenza-blue/10 flex items-center justify-center text-cadenza-blue">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
                                    </svg>
                                </div>

                                {/* Metadatos: título, artista y BPM */}
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-black text-[12px] uppercase truncate group-hover:text-cadenza-neon transition-colors leading-tight">{obra.title}</p>
                                    <p className="text-[10px] text-cadenza-light font-bold uppercase truncate opacity-80">{obra.artist || 'Autor desconocido'}</p>
                                    <p className="text-[8px] text-cadenza-light/60 font-black mt-0.5 uppercase italic tracking-widest">{obra.bpm} BPM</p>
                                </div>
                            </div>

                            {/* Sección derecha: botón de eliminar + flecha de navegación */}
                            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">

                                {/*
                                 * Botón de eliminar — visible solo al hacer hover sobre la tarjeta (group-hover).
                                 * stopPropagation evita que el click propague al handler de apertura de la obra.
                                 */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteObra(e, obra.id); }}
                                    className="p-2 text-cadenza-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                {/* Flecha chevron → indica que la tarjeta es navegable */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cadenza-light group-hover:text-cadenza-neon transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
