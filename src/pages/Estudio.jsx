import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useMetronome } from '../utils/useMetronome';

/**
 * Estudio
 *
 * Página principal del "Estudio Virtual". Proporciona herramientas interactivas
 * para que el usuario practique sobre sus obras:
 *  - Reproducción del backing track generado por IA.
 *  - Grabación de la interpretación del usuario vía micrófono.
 *  - Metrónomo sincronizado (inicializado con el BPM detectado por la IA).
 *  - Visualizador de espectro de audio en tiempo real.
 *  - Botón "Master Play" para reproducir simultáneamente el backing track,
 *    la grabación del usuario y el metrónomo.
 */
export default function Estudio() {
    const navigate = useNavigate();
    const location = useLocation();

    // ─── EXTRACCIÓN DE METADATOS (desde location.state) ─────────────
    // Los datos de la obra se pasan a través del enrutador desde el Dashboard
    // para evitar hacer una petición extra a la API.
    const nombreDeLaObra = location.state?.nombreObra || 'Obra desconocida';
    const autorDeLaObra = location.state?.autorObra || '';
    const backingUrl = location.state?.backingUrl || null;
    const bpmDetectado = location.state?.bpmDetectado || 120;
    
    // Contexto musicológico generado por la IA durante el análisis previo.
    const contextoIA = location.state?.contextoIA || 'No hay información histórica disponible para esta obra.';

    // Hook personalizado del metrónomo. Lo inicializamos con el BPM de la obra.
    const { bpm, setBpm, isPlaying: isMetronomePlaying, toggleMetronome, startMetronome, stopMetronome } = useMetronome(Math.round(bpmDetectado));
    
    // ─── ESTADOS GLOBALES DE LA VISTA ─────────────────────────────────
    const [isRecording, setIsRecording] = useState(false);        // Estado del micrófono
    const [recordedUrl, setRecordedUrl] = useState(null);         // URL Blob de la grabación actual
    const [isMasterPlaying, setIsMasterPlaying] = useState(false); // Estado del botón Master Play

    // ─── REFERENCIAS (DOM y APIs) ─────────────────────────────────────
    const backingRef = useRef(null);         // <audio> del backing track
    const recordedRef = useRef(null);        // <audio> de la grabación del usuario
    const mediaRecorderRef = useRef(null);   // Instancia de MediaRecorder para capturar audio
    const audioChunksRef = useRef([]);       // Array temporal para guardar trozos de grabación

    // ==============================================================
    // 🎛️ MOTOR WEB AUDIO API (Visualizador y Enrutamiento)
    // ==============================================================
    const audioCtxRef = useRef(null);        // Contexto principal de audio (creado bajo demanda)
    const analyserRef = useRef(null);        // Nodo analizador para sacar las frecuencias (FFT)
    const dataArrayRef = useRef(null);       // Array tipado donde el analizador vuelca los datos
    const requestRef = useRef(null);         // Referencia al requestAnimationFrame (para poder cancelarlo)
    const barsRef = useRef([]);              // Referencias a los divs de las barras del visualizador
    const NUM_BARS = 7;                      // Cantidad de barras a dibujar
    const sourcesConnected = useRef(new Set()); // Evita conectar la misma fuente de audio dos veces

    /**
     * Inicializa el AudioContext y el AnalyserNode.
     * Los navegadores bloquean el AudioContext hasta que hay interacción del usuario,
     * por lo que esta función se llama justo antes de reproducir o grabar.
     */
    const initWebAudio = async () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            
            // Creamos el analizador. fftSize 256 nos da 128 "bins" de frecuencia (suficiente para 7 barras)
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        // Si el contexto estaba suspendido (por políticas del navegador), lo reanudamos
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    };

    /**
     * Conecta un elemento HTML5 <audio> a la red de Web Audio.
     * Ruta: <audio> --> AnalyserNode --> Altavoces (destination)
     * @param {HTMLMediaElement} element - Referencia al nodo de audio.
     */
    const connectAudioElement = (element) => {
        if (!element || !audioCtxRef.current) return;
        
        // Evitamos reconectar un nodo que ya está enrutado, porque lanzaría error
        if (sourcesConnected.current.has(element)) return;
        
        try {
            const source = audioCtxRef.current.createMediaElementSource(element);
            source.connect(analyserRef.current);
            source.connect(audioCtxRef.current.destination);
            sourcesConnected.current.add(element);
        } catch (err) {
            console.error('Error conectando nodo de audio:', err);
        }
    };

    /**
     * Handler común para cuando se le da Play a cualquier reproductor individual (backing o grabación).
     * Asegura que el Web Audio API está listo y el reproductor conectado al analizador.
     */
    const handleAudioPlay = async (e) => {
        await initWebAudio();
        connectAudioElement(e.target);
    };

    // Bucle de animación (60fps) para dibujar el visualizador de espectro
    useEffect(() => {
        const drawVisualizer = () => {
            if (analyserRef.current && dataArrayRef.current) {
                // Rellena el array con los datos de amplitud de las frecuencias en este frame
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                
                barsRef.current.forEach((bar, index) => {
                    if (bar) {
                        // Mapeamos nuestras 7 barras a lo largo del array de frecuencias (descartando los agudos extremos)
                        const dataIndex = Math.floor(index * (dataArrayRef.current.length / 10));
                        const value = dataArrayRef.current[dataIndex] || 0;
                        
                        // Los agudos suelen tener menos amplitud, les damos un boost visual
                        const boost = 1 + (index * 0.25);
                        
                        // Altura mínima 8% para que siempre se vea algo. Altura máxima 100%.
                        const heightPercent = Math.max(8, ((value * boost) / 255) * 100);
                        bar.style.height = `${Math.min(100, heightPercent)}%`;
                    }
                });
            }
            // Pide al navegador el siguiente frame
            requestRef.current = requestAnimationFrame(drawVisualizer);
        };
        // Inicia el bucle
        requestRef.current = requestAnimationFrame(drawVisualizer);
        
        // Limpieza: cancela el bucle al desmontar el componente
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // --- LÓGICA GRABACIÓN ---
    
    /**
     * Inicia la captura de audio del micrófono.
     */
    const startRecording = async () => {
        try {
            await initWebAudio();
            
            // Pide permisos y obtiene el stream del micrófono
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Conecta el micro al analizador para que mueva las barras al hablar/tocar
            // IMPORTANTE: NO lo conectamos a destination para no crear acople/eco (feedback loop)
            const micSource = audioCtxRef.current.createMediaStreamSource(stream);
            micSource.connect(analyserRef.current);

            // Prepara el grabador
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            // Va guardando los trozos de audio a medida que llegan
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            
            // Cuando se detiene, junta los trozos en un archivo temporal (Blob) y crea una URL local
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedUrl(URL.createObjectURL(blob));
            };
            
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            alert('Error al acceder al micrófono: ' + error);
        }
    };

    /**
     * Detiene la grabación activa y apaga la luz roja del micro.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // Apaga las pistas del micrófono para que el navegador quite el icono rojo de grabación
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
            setIsRecording(false);
        }
    };

    /**
     * Control maestro ("Sincronización total").
     * Alterna la reproducción simultánea de:
     * 1. Backing track
     * 2. Grabación del usuario (si la hay)
     * 3. Metrónomo
     */
    const handleMasterPlay = async () => {
        await initWebAudio();
        
        if (isMasterPlaying) {
            // Detener todo
            if (backingRef.current) backingRef.current.pause();
            if (recordedRef.current && recordedUrl) recordedRef.current.pause();
            stopMetronome();
            setIsMasterPlaying(false);
        } else {
            // Reiniciar y reproducir todo desde cero (sincronizado)
            if (backingRef.current) {
                backingRef.current.currentTime = 0; // REINICIO
                connectAudioElement(backingRef.current);
                backingRef.current.play();
            }
            if (recordedRef.current && recordedUrl) {
                recordedRef.current.currentTime = 0; // REINICIO
                connectAudioElement(recordedRef.current);
                recordedRef.current.play();
            }
            // Reinicia el tick del metrónomo
            stopMetronome();
            startMetronome();
            setIsMasterPlaying(true);
        }
    };

    return (
        /*
         * AppLayout proporciona la estructura general (Sidebar + área principal).
         * renderHeader permite inyectar la cabecera específica del Estudio,
         * que incluye el botón de volver y el título de la obra.
         */
        <AppLayout
            contentClass="p-8"
            textAlign="text-left"
            renderHeader={({ isSidebarOpen, setIsSidebarOpen }) => (
                <header className="flex items-center mb-10 border-b border-cadenza-border pb-5 relative">
                    {/* Botón hamburguesa inline (solo visible si la Sidebar está cerrada) */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center justify-center w-8 h-8 hover:bg-cadenza-card rounded-md transition-colors mr-4 text-slate-500 dark:text-cadenza-light"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <path d="M3 12h18M3 6h18M3 18h18" />
                            </svg>
                        </button>
                    )}
                    
                    {/* Título y metadatos de la obra */}
                    <div className="text-left">
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">
                            Estudio <span className="text-cadenza-neon">Virtual</span>
                        </h1>
                        <p className="text-slate-500 dark:text-cadenza-light font-bold mt-0.5 uppercase tracking-[0.2em] text-xs">
                            {nombreDeLaObra}{' '}
                            {autorDeLaObra && <span className="text-cadenza-neon">| {autorDeLaObra}</span>}
                        </p>
                    </div>
                    
                    {/* Botón Volver (navega al historial anterior) */}
                    <button
                        onClick={() => navigate(-1)}
                        className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light hover:text-cadenza-neon transition-colors flex items-center space-x-1.5"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                            <path d="M19 12H5m7 7-7-7 7-7" />
                        </svg>
                        <span>Volver</span>
                    </button>
                </header>
            )}
        >
            {/* 
              * Layout principal tipo Grid:
              * En pantallas grandes (lg), 8 columnas para la parte izquierda (reproductores)
              * y 4 columnas para la derecha (herramientas).
              */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ── COLUMNA IZQUIERDA (Pistas y Contexto) ── */}
                <div className="lg:col-span-8 space-y-8">

                    {/* SECCIÓN: MASTER PLAY */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border-2 border-cadenza-neon shadow-sm flex items-center justify-between relative overflow-hidden group">
                        <div className="text-left relative z-10">
                            <h2 className="text-base font-black uppercase italic">Master Play</h2>
                            <p className="text-[9px] text-slate-500 dark:text-cadenza-light font-bold mt-1 uppercase tracking-widest">
                                Sincronización total
                            </p>
                        </div>
                        {/* Botón circular principal. Deshabilitado si no hay backing track */}
                        <button
                            onClick={handleMasterPlay}
                            disabled={!backingUrl}
                            className="w-12 h-12 bg-cadenza-neon rounded-full text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-20 relative z-10"
                        >
                            {isMasterPlaying ? (
                                /* Icono Pause */
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <rect x="6" y="5" width="4" height="14" rx="1" />
                                    <rect x="14" y="5" width="4" height="14" rx="1" />
                                </svg>
                            ) : (
                                /* Icono Play */
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                                </svg>
                            )}
                        </button>
                    </section>

                    {/* SECCIÓN: PANEL DE MEZCLA */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-md">
                        <h2 className="text-[10px] font-black mb-6 uppercase tracking-widest border-b border-cadenza-border pb-2 text-left text-slate-500 dark:text-cadenza-light">
                            Panel de Mezcla
                        </h2>
                        {backingUrl ? (
                            <div className="space-y-4">
                                
                                {/* Pista 1: Acompañamiento (Backing Track) */}
                                <div className="bg-slate-50 dark:bg-black/10 p-5 rounded-xl border border-cadenza-border relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cadenza-blue" />
                                    <p className="text-[9px] font-black text-slate-500 dark:text-cadenza-light uppercase tracking-widest mb-3 flex items-center space-x-2">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-cadenza-blue">
                                            <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                                        </svg>
                                        <span>Acompañamiento</span>
                                    </p>
                                    <audio ref={backingRef} controls crossOrigin="anonymous" className="w-full h-8 outline-none" src={backingUrl} onPlay={handleAudioPlay} />
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
                                            <audio ref={recordedRef} controls className="flex-1 h-8 outline-none" src={recordedUrl} onPlay={handleAudioPlay} />
                                            {/* Botón para borrar la grabación actual */}
                                            <button
                                                onClick={() => setRecordedUrl(null)}
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

                    {/* SECCIÓN: CONTEXTO IA (Limpiado y estático) */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border-l-4 border-cadenza-neon shadow-md text-left">
                        <h3 className="text-xs font-black text-cadenza-neon mb-3 uppercase italic tracking-tight flex items-center space-x-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M12 2v20M2 12h20m-3.5-6.5 3 3m-3 3.5 3-3M6.5 19.5l-3-3m3-3.5-3 3" />
                            </svg>
                            <span>Contexto Musicológico</span>
                        </h3>
                        <p className="text-cadenza-text font-medium leading-relaxed italic text-xs">
                            "{contextoIA}"
                        </p>
                    </section>
                </div>

                {/* ── COLUMNA DERECHA (Herramientas: Grabar, Metrónomo, Espectro) ── */}
                <div className="lg:col-span-4 space-y-8">

                    {/* SECCIÓN: GRABACIÓN */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border text-center shadow-sm">
                        <h3 className="text-[10px] font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-cadenza-light border-b border-cadenza-border pb-2 text-left">
                            Grabación
                        </h3>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-full py-3.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-md flex items-center justify-center space-x-2.5 ${
                                isRecording
                                    ? 'bg-red-500 animate-pulse text-white' // Animación de pulso mientras graba
                                    : 'bg-cadenza-blue text-white'
                            }`}
                        >
                            {isRecording ? (
                                <>
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><rect width="14" height="14" x="5" y="5" rx="2" /></svg>
                                    <span>Detener</span>
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="6" /></svg>
                                    <span>Grabar</span>
                                </>
                            )}
                        </button>
                    </section>

                    {/* SECCIÓN: METRÓNOMO */}
                    <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm text-left">
                        <div className="flex justify-between items-center mb-6 border-b border-cadenza-border pb-3">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light">
                                    Metrónomo
                                </h3>
                                {/* Si la IA detectó un BPM distinto de 120, mostramos un badge indicándolo */}
                                {bpmDetectado !== 120 && <span className="text-[7px] font-black bg-cadenza-neon/20 text-cadenza-neon px-2 py-0.5 rounded-full uppercase tracking-tighter">IA BPM</span>}
                            </div>

                            {/* Botón Play/Pause del metrónomo */}
                            <button
                                onClick={toggleMetronome}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isMetronomePlaying ? 'bg-cadenza-neon text-black shadow-[0_0_10px_rgba(0,242,255,0.4)]' : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-cadenza-light hover:text-white hover:bg-cadenza-border'}`}
                            >
                                {isMetronomePlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><rect width="14" height="14" x="5" y="5" rx="2" /></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
                                )}
                            </button>
                        </div>

                        {/* Controles de BPM */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-6">
                                <button onClick={() => setBpm(prev => Math.max(40, prev - 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl">–</button>
                                <div className="text-center">
                                    <div className="text-5xl font-black tracking-tighter leading-none">{bpm}</div>
                                    <p className="text-[8px] font-black text-cadenza-light uppercase tracking-widest mt-1">BPM</p>
                                </div>
                                <button onClick={() => setBpm(prev => Math.min(240, prev + 1))} className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl">+</button>
                            </div>
                            <input type="range" min="40" max="240" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-full h-1 bg-cadenza-border rounded-lg appearance-none cursor-pointer accent-cadenza-neon" />
                        </div>
                    </section>

                    {/* SECCIÓN: ESPECTRO REAL */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-sm flex flex-col h-48 relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-slate-500 dark:text-cadenza-light mb-6 uppercase tracking-widest text-center border-b border-cadenza-border pb-2">
                            Espectro Real
                        </h3>
                        <div className="flex-1 flex items-end justify-center space-x-2 pb-1">
                            {/* Dibuja las NUM_BARS barras. Alterna colores entre neón y azul. */}
                            {[...Array(NUM_BARS)].map((_, i) => (
                                <div
                                    key={i}
                                    ref={(el) => (barsRef.current[i] = el)}
                                    className={`w-4 rounded-t-sm transition-all duration-75 ${i % 2 === 0 ? 'bg-cadenza-neon' : 'bg-cadenza-blue'} ${i >= 2 && i <= 4 ? 'opacity-100' : 'opacity-60'}`}
                                    style={{ height: '8%' }} // Altura inicial
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

        </AppLayout>
    );
}