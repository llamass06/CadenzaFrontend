import React from 'react';

export default function StorageStatus({ obrasCount, maxObras = 6 }) {
    const limiteAlcanzado = obrasCount >= maxObras;
    const porcentajeUso = Math.min((obrasCount / maxObras) * 100, 100);
    const espacioEstimado = (obrasCount * 15.5).toFixed(1);

    return (
        <div className="cadenza-panel relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light flex items-center">
                    <svg className="w-3 h-3 mr-1.5 text-cadenza-neon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    Almacenamiento Cloud
                </h3>
                <span className={`${limiteAlcanzado ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-cadenza-neon/10 text-cadenza-neon border-cadenza-neon/20'} border px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-colors`}>
                    Plan Free
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className={`text-2xl font-black leading-none ${limiteAlcanzado ? 'text-red-500' : 'text-cadenza-text'}`}>
                            {obrasCount} <span className="text-xs text-slate-500 dark:text-cadenza-light font-bold">/ {maxObras} Obras</span>
                        </span>
                        <span className={`text-[10px] font-bold tracking-widest ${limiteAlcanzado ? 'text-red-500 animate-pulse' : 'text-cadenza-neon'}`}>
                            {Math.round(porcentajeUso)}%
                        </span>
                    </div>
                    {/* Barra de progreso de almacenamiento */}
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${limiteAlcanzado ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-cadenza-neon'}`}
                            style={{ width: `${porcentajeUso}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-cadenza-border">
                        <p className="text-[7px] text-slate-500 dark:text-cadenza-light font-black uppercase tracking-widest mb-1">Espacio Usado</p>
                        <p className="text-[11px] text-cadenza-text font-bold">~ {espacioEstimado} MB</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-cadenza-border">
                        <p className="text-[7px] text-slate-500 dark:text-cadenza-light font-black uppercase tracking-widest mb-1">Ancho de Banda</p>
                        <p className="text-[11px] text-cadenza-text font-bold text-green-500">Ilimitado</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
