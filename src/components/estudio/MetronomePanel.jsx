import React from 'react';

/**
 * MetronomePanel
 *
 * Panel del metrónomo con controles de BPM.
 * Muestra un badge "IA BPM" cuando el tempo fue detectado automáticamente
 * (es decir, cuando difiere del valor por defecto de 120 BPM).
 *
 * @param {number}   bpm              - Valor actual de BPM.
 * @param {Function} setBpm           - Función para actualizar el BPM.
 * @param {boolean}  isPlaying        - Indica si el metrónomo está activo.
 * @param {Function} onToggle         - Callback para activar/desactivar el metrónomo.
 * @param {number}   bpmDetectado     - BPM detectado por la IA (para mostrar el badge).
 */
export default function MetronomePanel({ bpm, setBpm, isPlaying, onToggle, bpmDetectado }) {
    return (
        <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm text-left">
            {/* Cabecera: título + badge IA + botón play/pause */}
            <div className="flex justify-between items-center mb-6 border-b border-cadenza-border pb-3">
                <div className="flex items-center space-x-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light">
                        Metrónomo
                    </h3>
                    {/* Badge: visible cuando la IA detectó un BPM distinto de 120 */}
                    {bpmDetectado !== 120 && (
                        <span className="text-[7px] font-black bg-cadenza-neon/20 text-cadenza-neon px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            IA BPM
                        </span>
                    )}
                </div>

                {/* Botón Play/Pause del metrónomo */}
                <button
                    onClick={onToggle}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        isPlaying
                            ? 'bg-cadenza-neon text-black shadow-[0_0_10px_rgba(0,242,255,0.4)]'
                            : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-cadenza-light hover:text-white hover:bg-cadenza-border'
                    }`}
                >
                    {isPlaying ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            <rect width="14" height="14" x="5" y="5" rx="2" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5">
                            <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Controles de BPM */}
            <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-6">
                    <button
                        onClick={() => setBpm(prev => Math.max(40, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl"
                    >
                        –
                    </button>

                    <div className="text-center">
                        <div className="text-5xl font-black tracking-tighter leading-none">{bpm}</div>
                        <p className="text-[8px] font-black text-cadenza-light uppercase tracking-widest mt-1">BPM</p>
                    </div>

                    <button
                        onClick={() => setBpm(prev => Math.min(240, prev + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl"
                    >
                        +
                    </button>
                </div>

                <input
                    type="range"
                    min="40"
                    max="240"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full h-1 bg-cadenza-border rounded-lg appearance-none cursor-pointer accent-cadenza-neon"
                />
            </div>
        </section>
    );
}
