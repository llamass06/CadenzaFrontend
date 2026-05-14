import React, { useEffect, useRef } from 'react';

const NUM_BARS = 7;

/**
 * SpectrumVisualizer
 *
 * Visualizador de espectro de audio en tiempo real.
 * Lee los datos del AnalyserNode (Web Audio API) a 60fps mediante
 * requestAnimationFrame y refleja las amplitudes en un grupo de barras verticales.
 *
 * Las barras alternas se colorean entre neón y azul, y las centrales
 * reciben un aumento de opacidad para simular el efecto de "pico" de frecuencia media.
 *
 * @param {React.MutableRefObject} analyserRef  - Nodo analizador del Web Audio API.
 * @param {React.MutableRefObject} dataArrayRef - Uint8Array donde el analizador vuelca los datos FFT.
 */
export default function SpectrumVisualizer({ analyserRef, dataArrayRef }) {
    const barsRef = useRef([]);
    const requestRef = useRef(null);

    useEffect(() => {
        const drawVisualizer = () => {
            if (analyserRef.current && dataArrayRef.current) {
                // Rellena el array con amplitudes de frecuencia del frame actual
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                barsRef.current.forEach((bar, index) => {
                    if (bar) {
                        // Mapea las NUM_BARS barras a lo largo del array (descarta agudos extremos)
                        const dataIndex = Math.floor(index * (dataArrayRef.current.length / 10));
                        const value = dataArrayRef.current[dataIndex] || 0;

                        // Los agudos suelen tener menos amplitud → les damos un boost visual
                        const boost = 1 + index * 0.25;

                        // Altura mínima 8% para que siempre se vea algo. Máxima 100%.
                        const heightPercent = Math.max(8, ((value * boost) / 255) * 100);
                        bar.style.height = `${Math.min(100, heightPercent)}%`;
                    }
                });
            }
            requestRef.current = requestAnimationFrame(drawVisualizer);
        };

        requestRef.current = requestAnimationFrame(drawVisualizer);

        // Limpieza: cancela el bucle al desmontar
        return () => cancelAnimationFrame(requestRef.current);
    }, [analyserRef, dataArrayRef]);

    return (
        <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-sm flex flex-col h-48 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-slate-500 dark:text-cadenza-light mb-6 uppercase tracking-widest text-center border-b border-cadenza-border pb-2">
                Espectro Real
            </h3>
            <div className="flex-1 flex items-end justify-center space-x-2 pb-1">
                {[...Array(NUM_BARS)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => (barsRef.current[i] = el)}
                        className={`w-4 rounded-t-sm transition-all duration-75 ${
                            i % 2 === 0 ? 'bg-cadenza-neon' : 'bg-cadenza-blue'
                        } ${i >= 2 && i <= 4 ? 'opacity-100' : 'opacity-60'}`}
                        style={{ height: '8%' }}
                    />
                ))}
            </div>
        </section>
    );
}
