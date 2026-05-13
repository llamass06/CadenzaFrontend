import { useState, useEffect, useRef } from 'react';

/**
 * @file useMetronome.js
 * @module utils/useMetronome
 *
 * Hook personalizado que implementa un metrónomo de precisión usando la Web Audio API.
 *
 * Arquitectura: Scheduler de lookahead
 * ──────────────────────────────────────
 * Los `setTimeout` de JavaScript no son suficientemente precisos para audio
 * (pueden desviarse decenas de ms). Para evitarlo se usa el patrón "lookahead scheduler":
 *
 *  - `scheduler()` se ejecuta cada 25ms con `setTimeout`.
 *  - En cada ejecución, programa todos los clicks que deberían sonar en los próximos
 *    100ms usando la API de tiempo de alta precisión de Web Audio (`AudioContext.currentTime`).
 *  - De esta forma, aunque `setTimeout` se retrase, los clicks ya están pre-programados
 *    en el hilo de audio y suenan en el momento exacto.
 *
 * Modos de sonido (fallback automático):
 *  - Plan A: Archivo `tick.mp3` en /public. Proporciona un sonido de metrónomo real.
 *  - Plan B: Oscilador sintetizado si el archivo no está disponible. Genera un
 *            click percusivo con un tono que cae rápidamente de 1000Hz a 100Hz en 50ms.
 */

/**
 * useMetronome
 *
 * Hook que gestiona el estado y la lógica de un metrónomo de audio de alta precisión.
 *
 * @param {number} [initialBpm=120] - BPM inicial al montar el componente.
 * @returns {{
 *   bpm: number,
 *   setBpm: Function,
 *   isPlaying: boolean,
 *   toggleMetronome: Function,
 *   startMetronome: Function,
 *   stopMetronome: Function
 * }} API pública del metrónomo para usar en los componentes.
 */
export function useMetronome(initialBpm = 120) {
    const [bpm, setBpm] = useState(initialBpm);

    // `isPlaying` (estado React) → controla la UI (botón activo/inactivo, estilos, etc.)
    const [isPlaying, setIsPlaying] = useState(false);

    // `isPlayingRef` (ref) → fuente de verdad para el scheduler.
    // Usamos una ref en vez del estado porque el scheduler (setTimeout) captura el
    // valor de `isPlaying` en el momento de su creación (stale closure). La ref
    // siempre apunta al valor actual sin necesidad de recrear el closure.
    const isPlayingRef = useRef(false);

    // ─── REFS DEL MOTOR DE AUDIO ────────────────────────────────────────────
    const audioCtxRef = useRef(null);       // Instancia del AudioContext (creada bajo demanda)
    const nextNoteTimeRef = useRef(0);      // Momento exacto (segundos) del próximo click
    const currentBeatRef = useRef(0);       // Contador de beats (reservado para acentuación futura en el 1)
    const timerIDRef = useRef(null);        // ID del setTimeout del scheduler (para cancelarlo con stopMetronome)
    const clickBufferRef = useRef(null);    // Buffer decodificado de tick.mp3 (Plan A)

    // Sincronizamos bpm en una ref para que el scheduler siempre lea el BPM actual
    // sin necesidad de recrearlo cuando el usuario mueve el slider de BPM.
    const bpmRef = useRef(bpm);
    useEffect(() => {
        bpmRef.current = bpm;
    }, [bpm]);

    /**
     * loadClickAudio
     *
     * Carga y decodifica `tick.mp3` desde /public en un AudioBuffer.
     * Una vez decodificado, queda cacheado en `clickBufferRef` para toda la sesión.
     * Si el archivo no existe o hay un error de red, falla silenciosamente y
     * el Plan B (oscilador sintetizado) se activará automáticamente.
     */
    const loadClickAudio = async () => {
        if (!audioCtxRef.current) return;
        try {
            const response = await fetch('/tick.mp3');
            if (!response.ok) throw new Error("Archivo no encontrado");
            // Convertimos la respuesta HTTP a ArrayBuffer y lo decodificamos con Web Audio
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            clickBufferRef.current = audioBuffer; // Cacheamos para no volver a cargarlo
        } catch (error) {
            // Si el archivo no existe, el Plan B (oscilador) se activará automáticamente
            console.error("Ha ocurrido un error inesperado:", error);
        }
    };

    /**
     * playClick
     *
     * Programa un click de metrónomo para que suene en un momento exacto del tiempo de audio.
     * Usa scheduling ahead-of-time: `time` es un valor FUTURO de `AudioContext.currentTime`,
     * lo que garantiza que el sonido se reproduce en el instante preciso independientemente
     * de los retrasos del event loop de JavaScript.
     *
     * Plan A (audio file): Reproduce el AudioBuffer del tick.mp3 a tono neutro (playbackRate=1).
     * Plan B (síntesis):   Genera un tono percusivo con un oscilador sinusoidal que cae
     *                      de 1000Hz a 100Hz en 50ms, con gain que se desvanece en paralelo.
     *
     * @param {number} time - Tiempo exacto (segundos) en AudioContext en que debe sonar el click.
     * @param {number} beat - Número de beat actual (reservado para futura acentuación en el tiempo 1).
     */
    function playClick(time, beat) {
        if (!audioCtxRef.current) return;

        // Plan A: Archivo de audio real (tick.mp3)
        if (clickBufferRef.current) {
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = clickBufferRef.current;

            const gain = audioCtxRef.current.createGain();
            source.connect(gain);
            gain.connect(audioCtxRef.current.destination);

            // playbackRate=1 → tono original del archivo sin transposición
            source.playbackRate.value = 1;
            source.start(time); // Scheduling exacto en el hilo de audio de alta precisión
        }
        // Plan B: Oscilador sintetizado (fallback si tick.mp3 no está disponible)
        else {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();

            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);

            osc.type = 'sine';

            // Caída exponencial de frecuencia 1000Hz→100Hz en 50ms: crea efecto percusivo
            osc.frequency.setValueAtTime(1000, time);
            osc.frequency.exponentialRampToValueAtTime(100, time + 0.05);

            // Fade out del volumen en los mismos 50ms para evitar clics digitales al cortar
            gain.gain.setValueAtTime(1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            osc.start(time);
            osc.stop(time + 0.05); // El nodo se libera automáticamente al terminar
        }
    }

    /**
     * scheduler
     *
     * Núcleo del metrónomo: bucle de lookahead que pre-programa los clicks.
     *
     * Se ejecuta cada 25ms (vía setTimeout). En cada iteración programa todos los
     * clicks que deban sonar en los próximos 100ms (ventana de lookahead).
     * Esto garantiza precisión de audio independientemente de los retrasos del event loop.
     *
     * Fórmula del intervalo entre beats: `60 / BPM` segundos.
     * Ejemplo: 120 BPM → 0.5s por beat.
     */
    function scheduler() {
        if (!audioCtxRef.current) return;

        // Mientras el próximo click esté dentro de la ventana de lookahead de 100ms, lo programamos
        while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + 0.1) {
            playClick(nextNoteTimeRef.current, currentBeatRef.current);
            // Avanzamos al siguiente beat: 60s / BPM = duración de un beat en segundos
            nextNoteTimeRef.current += 60.0 / bpmRef.current;
            currentBeatRef.current++;
        }
        // Re-programamos el scheduler para dentro de 25ms (frecuencia del bucle)
        timerIDRef.current = setTimeout(scheduler, 25);
    }

    /**
     * startMetronome
     *
     * Inicia el metrónomo desde el beat 0.
     * Crea el AudioContext si no existe aún (debe hacerse tras interacción del usuario
     * por las políticas de autoplay de los navegadores modernos).
     * Si el metrónomo ya está sonando, retorna sin hacer nada para evitar schedules duplicados.
     */
    const startMetronome = async () => {
        // Creación lazy del AudioContext y carga del audio (solo ocurre la primera vez)
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            await loadClickAudio();
        }
        // El contexto puede estar suspendido si el usuario aún no ha interactuado con la página
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        // Evitamos iniciar un segundo scheduler si ya hay uno activo
        if (isPlayingRef.current) return;

        isPlayingRef.current = true;
        setIsPlaying(true); // Actualiza la UI

        currentBeatRef.current = 0;
        // Pequeño offset de 10ms para que el primer click suene casi al instante
        nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.01;
        scheduler(); // Arrancamos el bucle de lookahead
    };

    /**
     * stopMetronome
     *
     * Detiene el metrónomo cancelando el setTimeout del scheduler.
     * Los clicks que ya fueron pre-programados en el hilo de audio pueden sonar
     * hasta 100ms más (ventana de lookahead), lo cual es imperceptible para el usuario.
     */
    const stopMetronome = () => {
        if (!isPlayingRef.current) return;

        isPlayingRef.current = false;
        setIsPlaying(false); // Actualiza la UI
        clearTimeout(timerIDRef.current); // Cancela el próximo tick del scheduler
    };

    /**
     * toggleMetronome
     *
     * Alterna entre iniciar y detener el metrónomo.
     * Usado por el botón Play/Pause del panel del Estudio Virtual.
     */
    const toggleMetronome = async () => {
        if (isPlayingRef.current) {
            stopMetronome();
        } else {
            await startMetronome();
        }
    };

    // Limpieza al desmontar el componente que use el hook.
    // Cancelamos el scheduler y cerramos el AudioContext para liberar recursos del sistema
    // de audio y evitar fugas de memoria.
    useEffect(() => {
        return () => {
            if (timerIDRef.current) clearTimeout(timerIDRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close(); // Libera el hilo de audio del navegador
            }
        };
    }, []);

    // API pública del hook
    return { bpm, setBpm, isPlaying, toggleMetronome, startMetronome, stopMetronome };
}