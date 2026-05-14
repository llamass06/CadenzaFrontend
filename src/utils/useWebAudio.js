import { useRef } from 'react';

/**
 * useWebAudio
 *
 * Hook personalizado que encapsula toda la lógica del Web Audio API:
 * - Inicialización del AudioContext y AnalyserNode (bajo demanda, tras interacción del usuario).
 * - Conexión de elementos HTML5 <audio> a la red de análisis.
 * - Handler genérico `onPlay` para reproductores individuales.
 *
 * Expone también las refs del analizador y del array de datos para que
 * componentes como SpectrumVisualizer puedan leerlos directamente.
 *
 * @returns {{
 *   analyserRef: React.MutableRefObject,
 *   dataArrayRef: React.MutableRefObject,
 *   initWebAudio: () => Promise<void>,
 *   connectAudioElement: (element: HTMLMediaElement) => void,
 *   handleAudioPlay: (e: Event) => Promise<void>,
 * }}
 */
export function useWebAudio() {
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourcesConnected = useRef(new Set());

    /**
     * Inicializa el AudioContext y el AnalyserNode.
     * Los navegadores bloquean el AudioContext hasta que hay interacción del usuario,
     * por lo que esta función se llama justo antes de reproducir o grabar.
     */
    const initWebAudio = async () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();

            // fftSize 256 → 128 "bins" de frecuencia (suficiente para 7 barras)
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        }
        // Si el contexto estaba suspendido (política del navegador), lo reanudamos
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }
    };

    /**
     * Conecta un elemento HTML5 <audio> a la red de Web Audio.
     * Ruta: <audio> → AnalyserNode → Altavoces (destination)
     * Evita reconectar un nodo que ya está enrutado.
     *
     * @param {HTMLMediaElement} element - Referencia al nodo de audio.
     */
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

    /**
     * Handler común para el evento onPlay de cualquier reproductor.
     * Garantiza que el Web Audio API está activo y el elemento conectado.
     *
     * @param {Event} e - Evento nativo del elemento <audio>.
     */
    const handleAudioPlay = async (e) => {
        await initWebAudio();
        connectAudioElement(e.target);
    };

    return {
        analyserRef,
        dataArrayRef,
        initWebAudio,
        connectAudioElement,
        handleAudioPlay,
    };
}
