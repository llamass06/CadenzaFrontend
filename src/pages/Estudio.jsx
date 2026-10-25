import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useMetronome } from '../utils/useMetronome';
import { useWebAudio } from '../utils/useWebAudio';
import { useAudioRecorder } from '../utils/useAudioRecorder';

import EstudioHeader from '../components/estudio/EstudioHeader';
import MasterPlaySection from '../components/estudio/MasterPlaySection';
import MixerPanel from '../components/estudio/MixerPanel';
import RecordingSection from '../components/estudio/RecordingSection';
import MetronomePanel from '../components/estudio/MetronomePanel';
import SpectrumVisualizer from '../components/estudio/SpectrumVisualizer';
import ContextoIA from '../components/estudio/ContextoIA';

/**
 * Estudio
 *
 * Página principal del "Estudio Virtual". Orquesta los hooks y componentes
 * especializados para proporcionar al usuario un entorno de práctica completo:
 *  - Reproducción del backing track generado por IA.
 *  - Grabación de la interpretación del usuario vía micrófono.
 *  - Metrónomo sincronizado (inicializado con el BPM detectado por la IA).
 *  - Visualizador de espectro de audio en tiempo real.
 *  - Botón "Master Play" para reproducción simultánea y sincronizada.
 */
export default function Estudio() {
    const location = useLocation();

    // ─── METADATOS DE LA OBRA (pasados desde el Dashboard vía router) ────
    const nombreDeLaObra = location.state?.nombreObra || 'Obra desconocida';
    const autorDeLaObra  = location.state?.autorObra  || '';
    const rawBackingUrl  = location.state?.backingUrl  || null;
    const bpmDetectado   = location.state?.bpmDetectado || 120;
    const contextoIA     = location.state?.contextoIA  || 'No hay información histórica disponible para esta obra.';

    // ─── DESCARGA DEL BACKING TRACK → Blob URL local ────────────────────
    const [backingBlobUrl, setBackingBlobUrl] = useState(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(!!rawBackingUrl);
    const [prevBackingUrl, setPrevBackingUrl] = useState(rawBackingUrl);

    if (rawBackingUrl !== prevBackingUrl) {
        setPrevBackingUrl(rawBackingUrl);
        setIsLoadingAudio(!!rawBackingUrl);
    }

    useEffect(() => {
        if (!rawBackingUrl) return;
        let objectUrl = null;
        let isCancelled = false;

        const headers = rawBackingUrl.includes('ngrok') ? { 'ngrok-skip-browser-warning': '69420' } : {};

        fetch(rawBackingUrl, { headers })
            .then(res => {
                if (!res.ok) throw new Error('Error en descarga');
                return res.blob();
            })
            .then(blob => {
                if (isCancelled) return;
                objectUrl = URL.createObjectURL(blob);
                setBackingBlobUrl(objectUrl);
                setIsLoadingAudio(false);
            })
            .catch(err => {
                if (isCancelled) return;
                console.error('Error al descargar la pista de acompañamiento:', err);
                setIsLoadingAudio(false);
            });

        return () => {
            isCancelled = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [rawBackingUrl]);

    // ─── HOOKS ESPECIALIZADOS ────────────────────────────────────────────
    const { bpm, setBpm, isPlaying: isMetronomePlaying, toggleMetronome, startMetronome, stopMetronome } =
        useMetronome(Math.round(bpmDetectado));

    const { analyserRef, dataArrayRef, initWebAudio, connectAudioElement, handleAudioPlay } = useWebAudio();

    const { isRecording, recordedUrl, setRecordedUrl, startRecording, stopRecording } =
        useAudioRecorder({ analyserRef, initWebAudio });

    // ─── REFS DE LOS ELEMENTOS <audio> ──────────────────────────────────
    const backingRef  = useRef(null);
    const recordedRef = useRef(null);

    // ─── MASTER PLAY ─────────────────────────────────────────────────────
    const [isMasterPlaying, setIsMasterPlaying] = useState(false);

    const handleMasterPlay = async () => {
        await initWebAudio();

        if (isMasterPlaying) {
            if (backingRef.current) backingRef.current.pause();
            if (recordedRef.current && recordedUrl) recordedRef.current.pause();
            stopMetronome();
            setIsMasterPlaying(false);
        } else {
            if (backingRef.current) {
                backingRef.current.currentTime = 0;
                connectAudioElement(backingRef.current);
                backingRef.current.play();
            }
            if (recordedRef.current && recordedUrl) {
                recordedRef.current.currentTime = 0;
                connectAudioElement(recordedRef.current);
                recordedRef.current.play();
            }
            stopMetronome();
            startMetronome();
            setIsMasterPlaying(true);
        }
    };

    return (
        <AppLayout
            contentClass="p-8"
            textAlign="text-left"
            renderHeader={({ isSidebarOpen, setIsSidebarOpen }) => (
                <EstudioHeader
                    nombreObra={nombreDeLaObra}
                    autorObra={autorDeLaObra}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
            )}
        >
            {/* Grid principal: 8 cols izquierda + 4 cols derecha */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ── COLUMNA IZQUIERDA ── */}
                <div className="lg:col-span-8 space-y-8">
                    <MasterPlaySection
                        isMasterPlaying={isMasterPlaying}
                        disabled={!backingBlobUrl}
                        onToggle={handleMasterPlay}
                    />
                    <MixerPanel
                        hasBackingUrl={!!rawBackingUrl}
                        backingBlobUrl={backingBlobUrl}
                        isLoadingAudio={isLoadingAudio}
                        recordedUrl={recordedUrl}
                        backingRef={backingRef}
                        recordedRef={recordedRef}
                        onAudioPlay={handleAudioPlay}
                        onDeleteRecording={() => setRecordedUrl(null)}
                    />
                    <ContextoIA texto={contextoIA} />
                </div>

                {/* ── COLUMNA DERECHA ── */}
                <div className="lg:col-span-4 space-y-8">
                    <RecordingSection
                        isRecording={isRecording}
                        onToggle={isRecording ? stopRecording : startRecording}
                    />
                    <MetronomePanel
                        bpm={bpm}
                        setBpm={setBpm}
                        isPlaying={isMetronomePlaying}
                        onToggle={toggleMetronome}
                        bpmDetectado={bpmDetectado}
                    />
                    <SpectrumVisualizer
                        analyserRef={analyserRef}
                        dataArrayRef={dataArrayRef}
                    />
                </div>
            </div>
        </AppLayout>
    );
}