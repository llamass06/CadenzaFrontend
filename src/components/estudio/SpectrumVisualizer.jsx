import React, { useEffect, useRef } from 'react';

const NUM_BARS = 7;

/**
 * SpectrumVisualizer
 *
 * Visualizador de espectro de audio en tiempo real.
 * Lee los datos del AnalyserNode (Web Audio API) a 60fps mediante
 * requestAnimationFrame y refleja las amplitudes en un grupo de barras verticales.
 *
 * Las barras se colorean con un gradiente neón→azul y las centrales
 * reciben un aumento de opacidad para simular el efecto de "pico" de frecuencia media.
 *
 * @param {React.MutableRefObject} analyserRef  - Nodo analizador del Web Audio API.
 * @param {React.MutableRefObject} dataArrayRef - Uint8Array donde el analizador vuelca los datos FFT.
 */
export default function SpectrumVisualizer({ analyserRef, dataArrayRef }) {
    const barsRef   = useRef([]);
    const glowRef   = useRef(null);
    const requestRef = useRef(null);

    useEffect(() => {
        const drawVisualizer = () => {
            if (analyserRef.current && dataArrayRef.current) {
                // Rellena el array con amplitudes de frecuencia del frame actual
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                let totalEnergy = 0;

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

                        totalEnergy += value;
                    }
                });

                // Pulsa el glow con la energía media
                if (glowRef.current) {
                    const avg = totalEnergy / NUM_BARS / 255;
                    glowRef.current.style.opacity = `${0.06 + avg * 0.3}`;
                }
            }
            requestRef.current = requestAnimationFrame(drawVisualizer);
        };

        requestRef.current = requestAnimationFrame(drawVisualizer);

        // Limpieza: cancela el bucle al desmontar
        return () => cancelAnimationFrame(requestRef.current);
    }, [analyserRef, dataArrayRef]);

    return (
        <section className="relative bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-sm flex flex-col h-48 overflow-hidden">

            {/* Glow de fondo reactivo — centrado bajo las barras */}
            <div
                ref={glowRef}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-10 rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse, var(--accent-neon) 0%, var(--accent-blue) 60%, transparent 100%)',
                    filter: 'blur(20px)',
                    opacity: 0.06,
                    transition: 'opacity 80ms linear',
                }}
            />

            {/* Título */}
            <h3 className="cadenza-title mb-4 text-center">
                Espectro Real
            </h3>

            {/* Barras */}
            <div className="flex-1 flex items-end justify-center gap-3 pb-1">
                {[...Array(NUM_BARS)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => (barsRef.current[i] = el)}
                        className={`w-5 rounded-t-md transition-all duration-75 ${
                            i >= 2 && i <= 4 ? 'opacity-100' : 'opacity-70'
                        }`}
                        style={{
                            height: '8%',
                            background: i % 2 === 0
                                ? 'linear-gradient(to bottom, var(--accent-neon), var(--accent-blue))'
                                : 'linear-gradient(to bottom, var(--accent-blue), color-mix(in srgb, var(--accent-neon) 30%, transparent))',
                            boxShadow: i % 2 === 0
                                ? '0 0 8px 1px color-mix(in srgb, var(--accent-neon) 50%, transparent)'
                                : '0 0 8px 1px color-mix(in srgb, var(--accent-blue) 50%, transparent)',
                        }}
                    />
                ))}
            </div>

            {/* Línea base */}
            <div
                className="w-full rounded-full mt-1"
                style={{
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, var(--accent-neon) 40%, var(--accent-blue) 60%, transparent)',
                    opacity: 0.4,
                }}
            />
        </section>
    );
}
