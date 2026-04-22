import { useState, useEffect, useRef } from 'react';

export function useMetronome(initialBpm = 120) {
    const [bpm, setBpm] = useState(initialBpm);
    const [isPlaying, setIsPlaying] = useState(false); // Estado visual para la UI
    
    // Estado interno duro para evitar bugs de desincronización en React
    const isPlayingRef = useRef(false);

    const audioCtxRef = useRef(null);
    const nextNoteTimeRef = useRef(0);
    const currentBeatRef = useRef(0);
    const timerIDRef = useRef(null);
    const clickBufferRef = useRef(null);

    const bpmRef = useRef(bpm);
    useEffect(() => {
        bpmRef.current = bpm;
    }, [bpm]);

    const loadClickAudio = async () => {
        if (!audioCtxRef.current) return;
        try {
            const response = await fetch('/tick.mp3'); 
            if (!response.ok) throw new Error("Archivo no encontrado");
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            clickBufferRef.current = audioBuffer;
        } catch (error) {
            console.error("Ha ocurrido un error inesperado:", error)
        }
    };

    function playClick(time, beat) {
        if (!audioCtxRef.current) return;
        
        // PLAN A: Si subiste el archivo de audio (tick.mp3)
        if (clickBufferRef.current) {
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = clickBufferRef.current;
            
            const gain = audioCtxRef.current.createGain();
            source.connect(gain);
            gain.connect(audioCtxRef.current.destination);

            // AHORA: Todos los golpes suenan a su velocidad (tono) original
            source.playbackRate.value = 1; 
            
            source.start(time);
        } 
        // PLAN B: Sonido percusivo neutro sintetizado
        else {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            
            osc.type = 'sine'; 
            
            // AHORA: Todos los golpes empiezan exactamente en la misma frecuencia (1000Hz)
            osc.frequency.setValueAtTime(1000, time);
            osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);
            
            gain.gain.setValueAtTime(1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            
            osc.start(time);
            osc.stop(time + 0.05);
        }
    }

    function scheduler() {
        if (!audioCtxRef.current) return;
        while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
            playClick(nextNoteTimeRef.current, currentBeatRef.current);
            nextNoteTimeRef.current += 60.0 / bpmRef.current;
            currentBeatRef.current++;
        }
        timerIDRef.current = setTimeout(scheduler, 25);
    }

    // --- NUEVAS FUNCIONES DE CONTROL EXPLÍCITO ---

    const startMetronome = async () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            await loadClickAudio(); 
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        // Si ya está sonando, abortamos para no crear múltiples ritmos a la vez
        if (isPlayingRef.current) return;

        isPlayingRef.current = true;
        setIsPlaying(true);
        
        currentBeatRef.current = 0;
        // Ajustamos a 0.01s para que arranque casi al instante junto con el audio
        nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.01;
        scheduler();
    };

    const stopMetronome = () => {
        if (!isPlayingRef.current) return;
        
        isPlayingRef.current = false;
        setIsPlaying(false);
        clearTimeout(timerIDRef.current);
    };

    const toggleMetronome = async () => {
        if (isPlayingRef.current) {
            stopMetronome();
        } else {
            await startMetronome();
        }
    };

    useEffect(() => {
        return () => {
            if (timerIDRef.current) clearTimeout(timerIDRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, []);

    // Exportamos las nuevas funciones
    return { bpm, setBpm, isPlaying, toggleMetronome, startMetronome, stopMetronome };
}