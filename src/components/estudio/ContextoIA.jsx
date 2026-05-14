import React from 'react';

/**
 * ContextoIA
 *
 * Tarjeta que muestra el contexto musicológico generado por la IA durante
 * el análisis previo de la obra. El texto se presenta en cursiva y entre
 * comillas para distinguirlo visualmente del resto de la interfaz.
 *
 * @param {string} texto - Contexto musicológico generado por la IA.
 */
export default function ContextoIA({ texto }) {
    return (
        <section className="bg-cadenza-card p-8 rounded-2xl border-l-4 border-cadenza-neon shadow-md text-left">
            <h3 className="text-xs font-black text-cadenza-neon mb-3 uppercase italic tracking-tight flex items-center space-x-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M12 2v20M2 12h20m-3.5-6.5 3 3m-3 3.5 3-3M6.5 19.5l-3-3m3-3.5-3 3" />
                </svg>
                <span>Contexto Musicológico</span>
            </h3>
            <p className="text-cadenza-text font-medium leading-relaxed italic text-xs">
                "{texto}"
            </p>
        </section>
    );
}
