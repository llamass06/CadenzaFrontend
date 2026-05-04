import React from 'react';

export default function LibraryPanel({ obrasRecientes, cargandoObras, onOpenObra, onDeleteObra }) {
    return (
        <div className="cadenza-panel">
            <h2 className="cadenza-title">Biblioteca Reciente</h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cargandoObras ? (
                    <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
                ) : obrasRecientes.length === 0 ? (
                    <p className="text-[10px] text-cadenza-light italic text-center py-4">No tienes obras en tu biblioteca aún.</p>
                ) : (
                    obrasRecientes.map((obra) => (
                        <div key={obra.id} onClick={() => onOpenObra(obra)} className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-cadenza-border flex items-center justify-between cursor-pointer hover:border-cadenza-neon transition-all group">
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-cadenza-blue/10 flex items-center justify-center text-cadenza-blue">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-black text-[12px] uppercase truncate group-hover:text-cadenza-neon transition-colors leading-tight">{obra.title}</p>
                                    <p className="text-[10px] text-cadenza-light font-bold uppercase truncate opacity-80">{obra.artist || 'Autor desconocido'}</p>
                                    <p className="text-[8px] text-cadenza-light/60 font-black mt-0.5 uppercase italic tracking-widest">{obra.bpm} BPM</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); onDeleteObra(e, obra.id); }} className="p-2 text-cadenza-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cadenza-light group-hover:text-cadenza-neon transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
