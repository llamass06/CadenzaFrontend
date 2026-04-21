import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';

export default function Estudio() {
    const navigate = useNavigate();
    const location = useLocation();

    const nombreDeLaObra = location.state?.nombreObra || 'Obra desconocida';
    const autorDeLaObra  = location.state?.autorObra  || '';
    const backingUrl     = location.state?.backingUrl  || null;
    const bpmDetectado   = location.state?.bpmDetectado || 120;

    const [bpm, setBpm]           = useState(Math.round(bpmDetectado));
    const [obraInfo, setObraInfo]  = useState('Cargando...');
    const [loadingIA, setLoadingIA] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState(null);

    const backingRef      = useRef(null);
    const recordedRef     = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef  = useRef([]);

    // ==============================================================
    // 🎛️ MOTOR WEB AUDIO API
    // ==============================================================
    const audioCtxRef       = useRef(null);
    const analyserRef       = useRef(null);
    const dataArrayRef      = useRef(null);
    const requestRef        = useRef(null);
    const barsRef           = useRef([]);
    const NUM_BARS          = 7;
    const sourcesConnected  = useRef(new Set());

    const initWebAudio = async () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    };

    const connectAudioElement = (element) => {
        if (!element || !audioCtxRef.current) return;
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

    const handleAudioPlay = async (e) => {
        await initWebAudio();
        connectAudioElement(e.target);
    };

    useEffect(() => {
        const drawVisualizer = () => {
            if (analyserRef.current && dataArrayRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                barsRef.current.forEach((bar, index) => {
                    if (bar) {
                        const dataIndex = Math.floor(index * (dataArrayRef.current.length / 10));
                        const value = dataArrayRef.current[dataIndex] || 0;
                        const boost = 1 + (index * 0.25);
                        const heightPercent = Math.max(8, ((value * boost) / 255) * 100);
                        bar.style.height = `${Math.min(100, heightPercent)}%`;
                    }
                });
            }
            requestRef.current = requestAnimationFrame(drawVisualizer);
        };
        requestRef.current = requestAnimationFrame(drawVisualizer);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // --- LÓGICA GRABACIÓN ---
    const startRecording = async () => {
        try {
            await initWebAudio();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const micSource = audioCtxRef.current.createMediaStreamSource(stream);
            micSource.connect(analyserRef.current);

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
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

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
            setIsRecording(false);
        }
    };

    const handleMasterPlay = async () => {
        await initWebAudio();
        if (backingRef.current) {
            connectAudioElement(backingRef.current);
            backingRef.current.currentTime = 0;
            backingRef.current.play();
        }
        if (recordedRef.current && recordedUrl) {
            connectAudioElement(recordedRef.current);
            recordedRef.current.currentTime = 0;
            recordedRef.current.play();
        }
    };

    // --- CONTEXTO IA ---
    useEffect(() => {
        const fetchIAContext = async () => {
            try {
                setLoadingIA(true);
                const query = autorDeLaObra
                    ? `${nombreDeLaObra} de ${autorDeLaObra}`
                    : nombreDeLaObra;
                const response = await fetch('http://127.0.0.1:8000/api/contexto/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre_obra: query }),
                });
                const data = await response.json();
                setObraInfo(data.contexto);
            } catch (error) {
                setObraInfo('Error de conexión con la IA: ' + error);
            } finally {
                setLoadingIA(false);
            }
        };
        fetchIAContext();
    }, [nombreDeLaObra, autorDeLaObra]);

    return (
        <AppLayout
            contentClass="p-8"
            textAlign="text-left"
            renderHeader={({ isSidebarOpen, setIsSidebarOpen }) => (
                <header className="flex items-center mb-10 border-b border-cadenza-border pb-5 relative">
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
                    <div className="text-left">
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">
                            Estudio <span className="text-cadenza-neon">Virtual</span>
                        </h1>
                        <p className="text-slate-500 dark:text-cadenza-light font-bold mt-0.5 uppercase tracking-[0.2em] text-[8px]">
                            {nombreDeLaObra}{' '}
                            {autorDeLaObra && <span className="text-cadenza-neon">| {autorDeLaObra}</span>}
                        </p>
                    </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">

                    {/* MASTER PLAY */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border-2 border-cadenza-neon shadow-sm flex items-center justify-between relative overflow-hidden group">
                        <div className="text-left relative z-10">
                            <h2 className="text-base font-black uppercase italic">Master Play</h2>
                            <p className="text-[9px] text-slate-500 dark:text-cadenza-light font-bold mt-1 uppercase tracking-widest">
                                Sincronización total
                            </p>
                        </div>
                        <button
                            onClick={handleMasterPlay}
                            disabled={!backingUrl}
                            className="w-12 h-12 bg-cadenza-neon rounded-full text-black flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-20 relative z-10"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                            </svg>
                        </button>
                    </section>

                    {/* PANEL DE MEZCLA */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-md">
                        <h2 className="text-[10px] font-black mb-6 uppercase tracking-widest border-b border-cadenza-border pb-2 text-left text-slate-500 dark:text-cadenza-light">
                            Panel de Mezcla
                        </h2>
                        {backingUrl ? (
                            <div className="space-y-4">
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
                            <div className="py-10 text-center text-[10px] font-black uppercase opacity-20 italic">
                                No hay pistas cargadas
                            </div>
                        )}
                    </section>

                    {/* CONTEXTO IA */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border-l-4 border-cadenza-neon shadow-md text-left">
                        <h3 className="text-xs font-black text-cadenza-neon mb-3 uppercase italic tracking-tight flex items-center space-x-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M12 2v20M2 12h20m-3.5-6.5 3 3m-3 3.5 3-3M6.5 19.5l-3-3m3-3.5-3 3" />
                            </svg>
                            <span>Contexto Musicológico</span>
                        </h3>
                        {loadingIA
                            ? <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
                            : <p className="text-cadenza-text font-medium leading-relaxed italic text-xs">"{obraInfo}"</p>
                        }
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">

                    {/* GRABACIÓN */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border text-center shadow-sm">
                        <h3 className="text-[10px] font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-cadenza-light border-b border-cadenza-border pb-2 text-left">
                            Grabación
                        </h3>
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-full py-3.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-md flex items-center justify-center space-x-2.5 ${
                                isRecording
                                    ? 'bg-red-500 animate-pulse text-white'
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

                    {/* METRÓNOMO */}
                    <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm text-left">
                        <h3 className="text-[10px] font-black mb-4 uppercase tracking-widest text-slate-500 dark:text-cadenza-light flex justify-between items-center border-b border-cadenza-border pb-2">
                            <span>Metrónomo</span>
                            {bpmDetectado !== 120 && (
                                <span className="text-[7px] font-black bg-cadenza-neon/20 text-cadenza-neon px-2 py-0.5 rounded-full">
                                    IA BPM
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center space-x-6">
                                <button
                                    onClick={() => setBpm((prev) => Math.max(40, prev - 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-slate-500 dark:text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl"
                                >–</button>
                                <div className="text-center">
                                    <div className="text-5xl font-black tracking-tighter leading-none">{bpm}</div>
                                    <p className="text-[8px] font-black text-slate-500 dark:text-cadenza-light uppercase tracking-widest mt-1">BPM</p>
                                </div>
                                <button
                                    onClick={() => setBpm((prev) => Math.min(240, prev + 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-cadenza-border text-slate-500 dark:text-cadenza-light hover:border-cadenza-neon hover:text-cadenza-neon transition-all font-light text-xl"
                                >+</button>
                            </div>
                            <input
                                type="range"
                                min="40"
                                max="240"
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value))}
                                className="w-full h-1 bg-cadenza-border rounded-lg appearance-none cursor-pointer accent-cadenza-neon"
                            />
                        </div>
                    </section>

                    {/* ESPECTRO REAL */}
                    <section className="bg-cadenza-card p-8 rounded-2xl border border-cadenza-border shadow-sm flex flex-col h-48 relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-slate-500 dark:text-cadenza-light mb-6 uppercase tracking-widest text-center border-b border-cadenza-border pb-2">
                            Espectro Real
                        </h3>
                        <div className="flex-1 flex items-end justify-center space-x-2 pb-1">
                            {[...Array(NUM_BARS)].map((_, i) => (
                                <div
                                    key={i}
                                    ref={(el) => (barsRef.current[i] = el)}
                                    className={`w-4 rounded-t-sm transition-all duration-75 ${i % 2 === 0 ? 'bg-cadenza-neon' : 'bg-cadenza-blue'} ${i >= 2 && i <= 4 ? 'opacity-100' : 'opacity-60'}`}
                                    style={{ height: '8%' }}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            </div>

        </AppLayout>
    );
}
