import { useState, useRef } from 'react';

/**
 * useAudioRecorder
 *
 * Hook personalizado que encapsula toda la lógica de grabación de audio:
 * - Pide permisos de micrófono al navegador.
 * - Conecta el stream del micrófono al AnalyserNode recibido por parámetro
 *   (para animar el visualizador de espectro sin generar eco/feedback).
 * - Gestiona el ciclo de vida del MediaRecorder.
 * - Genera una URL Blob local cuando la grabación termina.
 *
 * @param {{ analyserRef: React.MutableRefObject, initWebAudio: () => Promise<void> }} webAudio
 *   Refs e inicializador del Web Audio API (provenientes de useWebAudio).
 *
 * @returns {{
 *   isRecording: boolean,
 *   recordedUrl: string|null,
 *   setRecordedUrl: Function,
 *   startRecording: () => Promise<void>,
 *   stopRecording: () => void,
 * }}
 */
export function useAudioRecorder({ analyserRef, initWebAudio }) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUrl, setRecordedUrl] = useState(null);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    /**
     * Inicia la captura de audio del micrófono.
     * Conecta el micro al analizador para animar el espectro.
     * NO conecta a destination → evita acople/eco (feedback loop).
     */
    const startRecording = async () => {
        try {
            await initWebAudio();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Solo conecta al analizador, nunca a los altavoces
            const micSource = analyserRef.current
                ? analyserRef.current.context.createMediaStreamSource(stream)
                : null;
            if (micSource && analyserRef.current) {
                micSource.connect(analyserRef.current);
            }

            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            // Acumula los trozos de audio a medida que llegan
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            // Cuando se detiene, construye el Blob y crea la URL local
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
     * Detiene la grabación activa y apaga las pistas del micrófono
     * para que el navegador elimine el indicador rojo de grabación.
     */
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
            setIsRecording(false);
        }
    };

    return {
        isRecording,
        recordedUrl,
        setRecordedUrl,
        startRecording,
        stopRecording,
    };
}
