import React from 'react';

/**
 * MixerPanel
 *
 * Panel de mezcla con las dos pistas de audio disponibles:
 *  1. Acompañamiento (backing track generado por IA).
 *  2. Mi Interpretación (grabación del usuario vía micrófono).
 *
 * Cuando no hay backing track disponible muestra un estado vacío.
 *
 * @param {boolean}                          hasBackingUrl   - Indica si se cargó una URL de backing track.
 * @param {string|null}                      backingBlobUrl  - URL Blob local del backing track.
 * @param {boolean}                          isLoadingAudio  - Indica si el backing track está descargándose.
 * @param {string|null}                      recordedUrl     - URL Blob de la grabación del usuario.
 * @param {React.MutableRefObject}           backingRef      - Ref al elemento <audio> del backing track.
 * @param {React.MutableRefObject}           recordedRef     - Ref al elemento <audio> de la grabación.
 * @param {(e: Event) => Promise<void>}      onAudioPlay     - Handler onPlay para conectar al Web Audio API.
 * @param {() => void}                       onDeleteRecording - Borra la grabación actual.
 */
export default function MixerPanel({
    hasBackingUrl,
    backingBlobUrl,
    isLoadingAudio,
    recordedUrl,
    backingRef,
    recordedRef,
    onAudioPlay,
    onDeleteRecording,
}) {
    return (
        <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-md">
            <h2 className="text-[10px] font-black mb-6 uppercase tracking-widest border-b border-cadenza-border pb-2 text-left text-slate-500 dark:text-cadenza-light">
                Panel de Mezcla
            </h2>

            {hasBackingUrl ? (
                <div className="space-y-4">
                    {/* Pista 1: Acompañamiento (Backing Track) */}
                    <div className="bg-slate-50 dark:bg-black/10 p-5 rounded-xl border border-cadenza-border relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cadenza-blue" />
                        <p className="text-[9px] font-black text-slate-500 dark:text-cadenza-light uppercase tracking-widest mb-3 flex items-center space-x-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cadenza-blue">
                                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                            </svg>
                            <span>Acompañamiento {isLoadingAudio ? '(Cargando...)' : ''}</span>
                        </p>
                        <audio
                            ref={backingRef}
                            controls
                            crossOrigin="anonymous"
                            className="w-full h-8 outline-none"
                            src={backingBlobUrl || ''}
                            onPlay={onAudioPlay}
                        />
                    </div>

                    {/* Pista 2: Grabación del Usuario */}
                    <div className="bg-slate-50 dark:bg-black/10 p-5 rounded-xl border border-cadenza-border relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-cadenza-neon" />
                        <p className="text-[9px] font-black text-slate-500 dark:text-cadenza-light uppercase tracking-widest mb-3 flex items-center space-x-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cadenza-neon">
                                <path d="M2 10v4m4-6v8M10 6v12M14 6v12M18 8v8M22 10v4" />
                            </svg>
                            <span>Mi Interpretación</span>
                        </p>

                        {recordedUrl ? (
                            <div className="flex items-center space-x-3">
                                <audio
                                    ref={recordedRef}
                                    controls
                                    className="flex-1 h-8 outline-none"
                                    src={recordedUrl}
                                    onPlay={onAudioPlay}
                                />
                                {/* Botón para borrar la grabación actual */}
                                <button
                                    onClick={onDeleteRecording}
                                    className="w-8 h-8 text-slate-400 dark:text-cadenza-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all flex items-center justify-center"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                        <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="h-8 border border-dashed border-cadenza-border rounded flex items-center justify-center text-[9px] font-black opacity-30 uppercase tracking-widest bg-cadenza-bg/50">
                                Sin grabación
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Estado vacío si no se pasó una URL de backing track */
                <div className="py-10 text-center text-[10px] font-black uppercase opacity-20 italic">
                    No hay pistas cargadas
                </div>
            )}
        </section>
    );
}
