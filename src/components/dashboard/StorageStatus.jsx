import React from 'react';

export default function StorageStatus({ obrasCount, maxObras = 6 }) {
    const limiteAlcanzado = obrasCount >= maxObras;
    const casiLleno = obrasCount === maxObras - 1;
    const porcentajeUso = Math.min((obrasCount / maxObras) * 100, 100);
    const espacioEstimado = (obrasCount * 15.5).toFixed(1);

    const getStatusColor = () => {
        if (limiteAlcanzado) return 'text-red-500';
        if (casiLleno) return 'text-amber-500';
        return 'text-cadenza-text';
    };

    const getBgColor = () => {
        if (limiteAlcanzado) return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
        if (casiLleno) return 'bg-amber-500 shadow-[0_0_10px_#f59e0b]';
        return 'bg-cadenza-neon';
    };

    const getTagClass = () => {
        if (limiteAlcanzado) return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (casiLleno) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        return 'bg-cadenza-neon/10 text-cadenza-neon border-cadenza-neon/20';
    };

    return (
        <div className={`cadenza-panel relative overflow-hidden transition-all duration-500 ${limiteAlcanzado ? 'border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : casiLleno ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : ''}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center transition-colors ${limiteAlcanzado ? 'text-red-500/90' : casiLleno ? 'text-amber-600 dark:text-amber-500/90' : 'text-slate-500 dark:text-cadenza-light'}`}>
                    <svg className={`w-3 h-3 mr-1.5 transition-colors ${limiteAlcanzado ? 'text-red-500' : casiLleno ? 'text-amber-500' : 'text-cadenza-neon'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    Almacenamiento Cloud
                </h3>
                <span className={`${getTagClass()} border px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-colors`}>
                    Plan Free
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className={`text-2xl font-black leading-none transition-colors ${getStatusColor()}`}>
                            {obrasCount} <span className="text-xs opacity-70 font-bold">/ {maxObras} Obras</span>
                        </span>
                        <span className={`text-[10px] font-bold tracking-widest transition-colors ${getStatusColor()} ${limiteAlcanzado || casiLleno ? 'animate-pulse' : ''}`}>
                            {Math.round(porcentajeUso)}%
                        </span>
                    </div>
                    {/* Barra de progreso de almacenamiento */}
                    <div className={`h-2.5 w-full rounded-full overflow-hidden transition-colors ${limiteAlcanzado ? 'bg-red-500/20' : casiLleno ? 'bg-amber-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${getBgColor()}`}
                            style={{ width: `${porcentajeUso}%` }}
                        ></div>
                    </div>
                    {casiLleno && !limiteAlcanzado && (
                        <p className="text-[9px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-widest mt-2 text-right animate-pulse">
                            ¡Solo queda espacio para 1 obra más!
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-left pt-2">
                    <div className={`p-3 rounded-xl border transition-colors ${limiteAlcanzado ? 'bg-red-50 dark:bg-red-500/5 border-red-500/30' : casiLleno ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 border-cadenza-border'}`}>
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 transition-colors ${limiteAlcanzado ? 'text-red-500/70' : casiLleno ? 'text-amber-600/70 dark:text-amber-500/70' : 'text-slate-500 dark:text-cadenza-light'}`}>Espacio Usado</p>
                        <p className={`text-xs font-bold transition-colors ${limiteAlcanzado ? 'text-red-600 dark:text-red-400' : casiLleno ? 'text-amber-700 dark:text-amber-400' : 'text-cadenza-text'}`}>~ {espacioEstimado} MB</p>
                    </div>
                    <div className={`p-3 rounded-xl border transition-colors ${limiteAlcanzado ? 'bg-red-50 dark:bg-red-500/5 border-red-500/30' : casiLleno ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-500/30' : 'bg-slate-50 dark:bg-white/5 border-cadenza-border'}`}>
                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 transition-colors ${limiteAlcanzado ? 'text-red-500/70' : casiLleno ? 'text-amber-600/70 dark:text-amber-500/70' : 'text-slate-500 dark:text-cadenza-light'}`}>Obras Restantes</p>
                        <p className={`text-xs font-bold transition-colors ${limiteAlcanzado ? 'text-red-500' : casiLleno ? 'text-amber-600 dark:text-amber-500' : 'text-cadenza-text'}`}>{maxObras - obrasCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
