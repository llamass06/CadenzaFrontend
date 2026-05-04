import React from 'react';
import { IconDocs, IconClose, IconDownload } from '../icons';

export default function DocsModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cadenza-bg/80 backdrop-blur-md" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-cadenza-card border border-cadenza-border rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-cadenza-light/40 hover:text-cadenza-text transition-colors z-10">
                    <IconClose />
                </button>
                
                <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-cadenza-neon/10 border border-cadenza-neon/30 flex items-center justify-center text-cadenza-neon">
                        <span className="scale-125"><IconDocs /></span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-cadenza-text tracking-widest uppercase">Documentación</h3>
                        <p className="text-xs text-cadenza-light/50 font-bold uppercase tracking-wider">Flujo de la Aplicación</p>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    
                    {/* Flujo Visual */}
                    <div className="bg-cadenza-bg/50 p-6 rounded-xl border border-cadenza-border relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cadenza-neon/5 rounded-full blur-2xl"></div>
                        
                        <h4 className="text-sm font-black text-cadenza-text mb-6 flex items-center gap-2 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-cadenza-neon shadow-[0_0_8px_rgba(0,242,255,0.8)]"></span>
                            Cómo funciona
                        </h4>
                        
                        <div className="flex flex-col gap-6 relative">
                            {/* Línea conectora */}
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cadenza-neon via-cadenza-blue to-cadenza-border/30 opacity-50"></div>
                            
                            {/* Paso 1 */}
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-neon/50 flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.15)] relative">
                                    <div className="absolute inset-0 bg-cadenza-neon/10 rounded-xl animate-pulse"></div>
                                    <span className="text-[10px] font-black text-cadenza-neon uppercase relative z-10">Paso</span>
                                    <span className="text-lg font-black text-cadenza-text leading-none relative z-10">1</span>
                                </div>
                                <div className="pt-1.5">
                                    <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Subida de Audio</h5>
                                    <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Sube tus pistas en formato de audio al sistema desde la biblioteca.</p>
                                </div>
                            </div>
                            
                            {/* Paso 2 */}
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-blue/50 flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                    <span className="text-[10px] font-black text-cadenza-blue uppercase">Paso</span>
                                    <span className="text-lg font-black text-cadenza-text leading-none">2</span>
                                </div>
                                <div className="pt-1.5">
                                    <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Procesamiento IA</h5>
                                    <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Nuestro motor Demucs V4 analiza el tempo, extrae el contexto y separa los instrumentos.</p>
                                </div>
                            </div>
                            
                            {/* Paso 3 */}
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-border flex flex-col items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-black text-cadenza-light/50 uppercase">Paso</span>
                                    <span className="text-lg font-black text-cadenza-text leading-none">3</span>
                                </div>
                                <div className="pt-1.5">
                                    <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Estudio Virtual</h5>
                                    <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Interactúa con la obra: visualiza partituras, muta pistas o reproduce el backing track.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón Descargar Manual */}
                    <button className="group relative w-full flex items-center justify-center gap-4 py-4 rounded-xl bg-cadenza-card border border-cadenza-border hover:border-cadenza-neon/50 transition-all overflow-hidden" onClick={(e) => e.preventDefault()}>
                        <div className="absolute inset-0 bg-gradient-to-r from-cadenza-neon/0 via-cadenza-neon/5 to-cadenza-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="w-10 h-10 rounded-lg bg-cadenza-neon/10 border border-cadenza-neon/20 text-cadenza-neon flex items-center justify-center shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                            <span className="scale-125"><IconDownload /></span>
                        </div>
                        <div className="text-left flex-1">
                            <span className="block text-xs font-black text-cadenza-text uppercase tracking-widest mb-0.5">Manual de Usuario</span>
                            <span className="block text-[9px] font-bold text-cadenza-light/40 uppercase tracking-wider">PDF · 2.4 MB · <span className="text-cadenza-neon/70">Próximamente</span></span>
                        </div>
                    </button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-cadenza-border flex justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl bg-cadenza-border/50 text-cadenza-text font-bold text-xs uppercase tracking-widest hover:bg-cadenza-border hover:text-white transition-all">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
}
