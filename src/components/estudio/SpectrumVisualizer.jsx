import React, { useEffect, useRef } from 'react';

/**
 * SpectrumVisualizer
 *
 * Visualizador de espectro de audio en tiempo real — edición premium.
 *
 * Mejoras visuales sobre la versión anterior:
 *  - 20 barras (vs 7) para una resolución espectral mucho mayor.
 *  - Cada barra lleva un gradiente CSS único que va de neón (tope) a azul/púrpura (base).
 *  - Reflejo inferior con inversión + fade para efecto de suelo espejado.
 *  - Glow de fondo que pulsa con la intensidad media del espectro.
 *  - Etiquetas de banda de frecuencia (Sub / Bass / Mid / High) alineadas debajo.
 *  - Línea de base luminosa bajo las barras como guía visual.
 *
 * @param {React.MutableRefObject} analyserRef  - Nodo AnalyserNode del Web Audio API.
 * @param {React.MutableRefObject} dataArrayRef - Uint8Array donde el analizador vuelca los datos FFT.
 */

const NUM_BARS = 20;

/**
 * Genera el color HSL de una barra según su posición normalizada [0-1].
 * Graves → azul violeta | Medios → cian neón | Agudos → turquesa
 */
function barColor(t) {
    // t: 0 = grave (izq), 1 = agudo (der)
    const hue = Math.round(200 + t * 40); // 200 (azul) → 240 (violeta)
    return `hsl(${hue}, 100%, 65%)`;
}

export default function SpectrumVisualizer({ analyserRef, dataArrayRef }) {
    const barsRef    = useRef([]);
    const mirrorRef  = useRef([]);
    const glowRef    = useRef(null);
    const requestRef = useRef(null);

    useEffect(() => {
        const draw = () => {
            if (analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);

                let totalEnergy = 0;

                barsRef.current.forEach((bar, i) => {
                    const mirror = mirrorRef.current[i];
                    if (!bar) return;

                    // Mapea cada barra a una franja del espectro FFT
                    // Usamos 0-50% del array para enfocarnos en la zona audible relevante
                    const dataIndex = Math.floor(i * (dataArrayRef.current.length * 0.5) / NUM_BARS);
                    const raw = dataArrayRef.current[dataIndex] || 0;

                    // Boost progresivo: los agudos tienen menos energía en FFT, los compensamos
                    const t = i / (NUM_BARS - 1);
                    const boost = 1 + t * 0.6;
                    const heightPct = Math.min(100, Math.max(4, ((raw * boost) / 255) * 100));

                    bar.style.height    = `${heightPct}%`;
                    bar.style.opacity   = `${0.5 + (heightPct / 100) * 0.5}`;

                    if (mirror) {
                        mirror.style.height  = `${heightPct * 0.4}%`;
                        mirror.style.opacity = `${(heightPct / 100) * 0.25}`;
                    }

                    totalEnergy += raw;
                });

                // Glow de fondo: intensidad proporcional a la energía media
                if (glowRef.current) {
                    const avgEnergy = totalEnergy / NUM_BARS / 255; // 0-1
                    const glowSize  = Math.round(30 + avgEnergy * 60);
                    glowRef.current.style.opacity = `${0.05 + avgEnergy * 0.25}`;
                    glowRef.current.style.transform = `translateX(-50%) scaleX(${0.7 + avgEnergy * 0.6})`;
                    glowRef.current.style.filter = `blur(${glowSize}px)`;
                }
            }

            requestRef.current = requestAnimationFrame(draw);
        };

        requestRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(requestRef.current);
    }, [analyserRef, dataArrayRef]);

    return (
        <section className="relative bg-cadenza-card border border-cadenza-border rounded-2xl shadow-sm overflow-hidden flex flex-col p-6 h-52">

            {/* ── Título ── */}
            <h3 className="cadenza-title mb-3 text-center">
                Espectro en Tiempo Real
            </h3>

            {/* ── Glow de fondo reactivo ── */}
            <div
                ref={glowRef}
                className="absolute bottom-8 left-1/2 w-3/4 h-16 rounded-full pointer-events-none transition-none"
                style={{
                    background: 'radial-gradient(ellipse, var(--accent-neon) 0%, var(--accent-blue) 60%, transparent 100%)',
                    opacity: 0.05,
                    transform: 'translateX(-50%)',
                    filter: 'blur(30px)',
                }}
            />

            {/* ── Zona de barras + reflejo ── */}
            <div className="flex-1 flex flex-col justify-end gap-0 relative">

                {/* Barras principales */}
                <div className="flex items-end justify-center gap-[3px] h-full">
                    {[...Array(NUM_BARS)].map((_, i) => {
                        const t = i / (NUM_BARS - 1);
                        const color = barColor(t);
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-end" style={{ minWidth: 0 }}>
                                <div
                                    ref={el => (barsRef.current[i] = el)}
                                    style={{
                                        height: '4%',
                                        background: `linear-gradient(to bottom, ${color}, var(--accent-blue))`,
                                        boxShadow: `0 0 6px 1px ${color}55`,
                                        borderRadius: '3px 3px 1px 1px',
                                        transition: 'height 60ms linear, opacity 60ms linear',
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Línea de base luminosa */}
                <div
                    className="w-full mt-0.5 mb-0.5 rounded-full"
                    style={{
                        height: '1px',
                        background: 'linear-gradient(to right, transparent, var(--accent-neon) 30%, var(--accent-blue) 70%, transparent)',
                        opacity: 0.5,
                    }}
                />

                {/* Reflejo espejado */}
                <div
                    className="flex items-start justify-center gap-[3px]"
                    style={{ height: '22%', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }}
                >
                    {[...Array(NUM_BARS)].map((_, i) => {
                        const t = i / (NUM_BARS - 1);
                        const color = barColor(t);
                        return (
                            <div key={i} className="flex-1 flex flex-col justify-start" style={{ minWidth: 0 }}>
                                <div
                                    ref={el => (mirrorRef.current[i] = el)}
                                    style={{
                                        height: '4%',
                                        background: `linear-gradient(to top, ${color}, var(--accent-blue))`,
                                        borderRadius: '1px 1px 3px 3px',
                                        opacity: 0.15,
                                        transition: 'height 60ms linear, opacity 60ms linear',
                                        transform: 'scaleY(-1)',
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Etiquetas de bandas de frecuencia ── */}
            <div className="flex justify-between mt-1 px-1">
                {['Sub', 'Bass', 'Low-Mid', 'Mid', 'High-Mid', 'High'].map((label) => (
                    <span
                        key={label}
                        className="text-[8px] uppercase tracking-widest font-bold"
                        style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </section>
    );
}
