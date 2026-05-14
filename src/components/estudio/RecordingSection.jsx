import React from 'react';

/**
 * RecordingSection
 *
 * Sección de grabación del usuario. Muestra un único botón que alterna
 * entre "Grabar" (inicia la captura de micrófono) y "Detener" (finaliza
 * la grabación y genera el Blob de audio).
 *
 * @param {boolean}  isRecording    - Indica si hay una grabación en curso.
 * @param {Function} onToggle       - Callback para iniciar o detener la grabación.
 */
export default function RecordingSection({ isRecording, onToggle }) {
    return (
        <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border text-center shadow-sm">
            <h3 className="text-[10px] font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-cadenza-light border-b border-cadenza-border pb-2 text-left">
                Grabación
            </h3>
            <button
                onClick={onToggle}
                className={`w-full py-3.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-md flex items-center justify-center space-x-2.5 ${
                    isRecording
                        ? 'bg-red-500 animate-pulse text-white'
                        : 'bg-cadenza-blue text-white'
                }`}
            >
                {isRecording ? (
                    <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <rect width="14" height="14" x="5" y="5" rx="2" />
                        </svg>
                        <span>Detener</span>
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <circle cx="12" cy="12" r="6" />
                        </svg>
                        <span>Grabar</span>
                    </>
                )}
            </button>
        </section>
    );
}
