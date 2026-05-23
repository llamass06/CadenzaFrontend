import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jsmediatags from 'jsmediatags';
import AppLayout from '../components/AppLayout';
import { fetchMisObras, separarPistas, eliminarObraApi, fetchEstadoCola } from '../services/api';
import StorageStatus from '../components/dashboard/StorageStatus';
import LibraryPanel from '../components/dashboard/LibraryPanel';

export default function Dashboard() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [servidoresSaturados, setServidoresSaturados] = useState(false);
  const [nombreParaIA, setNombreParaIA] = useState('');
  const [autorParaIA, setAutorParaIA] = useState('');

  const [obrasRecientes, setObrasRecientes] = useState([]);
  const [cargandoObras, setCargandoObras] = useState(true);

  const peticionRealizada = useRef(false);

  useEffect(() => {

    // Si ya se hizo la petición, no volver a hacerla
    if (peticionRealizada.current) return;

    // Marcar como realizada inmediatamente
    peticionRealizada.current = true;

    const loadObras = async () => {
      try {
        const data = await fetchMisObras();
        setObrasRecientes(data);
      } catch (error) {
        if (error.message === "UNAUTHORIZED") {
          localStorage.removeItem('cadenza_token');
          navigate('/login');
        } else {
          console.error('Error al cargar las obras:', error);
        }
      } finally {
        setCargandoObras(false);
      }
    };

    loadObras();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorArchivo('');
      jsmediatags.read(file, {
        onSuccess: (tag) => {
          setNombreParaIA(tag.tags.title || file.name.replace(/\.[^/.]+$/, ''));
          setAutorParaIA(tag.tags.artist || '');
        },
        onError: () => {
          setNombreParaIA(file.name.replace(/\.[^/.]+$/, ''));
        },
      });
    }
  };

  const clearSelection = (e) => {
    e.preventDefault();
    setSelectedFile(null);
    setNombreParaIA('');
    setAutorParaIA('');
    setErrorArchivo('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !nombreParaIA.trim()) {
      setErrorArchivo('El título de la obra es obligatorio.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setServidoresSaturados(false);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) return 95;
        return prev + Math.max(0.3, (95 - prev) * 0.03);
      });
    }, 1000);

    // Polling: consulta el estado de la cola cada 4 segundos para detectar saturación
    const pollingInterval = setInterval(async () => {
      try {
        const estado = await fetchEstadoCola();
        setServidoresSaturados(estado.saturado);
      } catch {
        // Si falla el polling, simplemente no se muestra el aviso; no es crítico
      }
    }, 4000);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', nombreParaIA);
    formData.append('artist', autorParaIA || '');

    try {
      const data = await separarPistas(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        navigate('/estudio', {
          state: {
            nombreObra: nombreParaIA,
            autorObra: autorParaIA,
            backingUrl: data.backing_url,
            bpmDetectado: data.bpm,
            contextoIA: data.contexto
          },
        });
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setErrorArchivo(`❌ Error: ${error.message}`);
      setIsUploading(false);
    } finally {
      // Limpiamos siempre el polling al terminar (tanto por éxito como por error)
      clearInterval(pollingInterval);
      setServidoresSaturados(false);
    }
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation();
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta obra de tu biblioteca?');
    if (confirmar) {
      try {
        await eliminarObraApi(id);
        setObrasRecientes(obrasRecientes.filter((o) => o.id !== id));
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const abrirEstudioDesdeHistorial = (obra) => {
    navigate('/estudio', {
      state: {
        nombreObra: obra.title,
        autorObra: obra.artist,
        backingUrl: obra.backing_url,
        bpmDetectado: obra.bpm,
        contextoIA: obra.contexto
      },
    });
  };

  // --- DATOS DINÁMICOS DEL ARCHIVO ---
  const formatoAudio = selectedFile
    ? selectedFile.name.split('.').pop().toUpperCase()
    : 'MP3 / WAV';

  let calidadAudio = 'Lossless / HQ';
  if (selectedFile) {
    const pesoMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
    const formatosLossless = ['WAV', 'FLAC', 'AIFF'];
    // Si es WAV/FLAC decimos que es Lossless, si no, Comprimido
    const tipo = formatosLossless.includes(formatoAudio) ? 'Lossless' : 'Audio';
    calidadAudio = `${tipo} (${pesoMB} MB)`;
  }

  const colorTextoInfo = selectedFile ? 'text-cadenza-neon' : 'text-cadenza-text';

  // --- RESTRICCIÓN DE USUARIO NORMAL ---
  const MAX_OBRAS = 3; // Límite real bajado a 3 obras
  const totalObras = obrasRecientes.length;
  const limiteAlcanzado = totalObras >= MAX_OBRAS;
  const casiLleno = totalObras === MAX_OBRAS - 1;
  // const porcentajeUso = Math.min((totalObras / MAX_OBRAS) * 100, 100);
  // const espacioEstimado = (totalObras * 15.5).toFixed(1); 

  return (
    <AppLayout
      renderHeader={({ isSidebarOpen, setIsSidebarOpen }) => (
        <header className="flex items-center mb-12 border-b border-cadenza-border pb-6 relative">
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 text-2xl hover:bg-cadenza-card rounded-md transition-colors mr-4">☰</button>
          )}
          <div className="text-left">
            <h1 className="text-3xl font-black tracking-tighter italic">MI <span className="text-cadenza-neon">DASHBOARD</span></h1>
            <p className="text-slate-500 dark:text-cadenza-light font-bold mt-1 uppercase tracking-[0.3em] text-[10px]">Tu centro de control musical</p>
          </div>
        </header>
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Panel de Subida */}
        <div className={`lg:col-span-8 cadenza-panel !pt-4 relative overflow-hidden flex flex-col justify-center min-h-[500px] transition-all duration-500 ${limiteAlcanzado ? 'border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : casiLleno ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : ''}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cadenza-neon opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10 space-y-8">
            <div className="text-left flex justify-between items-center">
              <div>
                <h2 className={`text-2xl font-black tracking-tight uppercase italic transition-colors ${limiteAlcanzado ? 'text-red-500' : casiLleno ? 'text-amber-500' : ''}`}>Nueva Obra</h2>
                <p className="text-slate-500 dark:text-cadenza-light text-sm font-medium">Sube audio para aislar el acompañamiento</p>
              </div>
              {limiteAlcanzado ? (
                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Límite de plan alcanzado
                </span>
              ) : casiLleno ? (
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Casi lleno
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* ZONA IZQUIERDA: Dropzone */}
              <div className="flex flex-col">
                <label className={`flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed rounded-2xl transition-all duration-300 relative overflow-hidden group ${isUploading ? 'opacity-50 cursor-not-allowed border-cadenza-border bg-slate-50 dark:bg-black/10' : limiteAlcanzado ? 'opacity-70 cursor-not-allowed border-red-500/50 bg-red-50 dark:bg-red-500/5' : casiLleno ? 'cursor-pointer border-cadenza-warning/50 bg-cadenza-warning-bg hover:border-cadenza-warning hover:bg-cadenza-warning-bg/80' : 'cursor-pointer border-cadenza-border bg-slate-50 dark:bg-black/20 hover:border-cadenza-neon hover:bg-cadenza-neon/5'}`}>
                  {limiteAlcanzado ? (
                    <div className="flex flex-col items-center text-center space-y-4 p-6">
                      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-red-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-red-500 mb-1 uppercase tracking-widest">Almacenamiento Lleno</p>
                        <span className="text-[10px] text-slate-500 dark:text-cadenza-light font-bold">Elimina una obra para subir otra</span>
                      </div>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center text-center space-y-4 p-6">
                      <div className="w-16 h-16 bg-cadenza-neon/10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.1)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-cadenza-neon"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-cadenza-text truncate max-w-[220px] mb-1">{selectedFile.name}</p>
                        <span className="text-[10px] bg-cadenza-neon/20 text-cadenza-neon px-3 py-1 rounded-full uppercase tracking-widest font-black border border-cadenza-neon/30 animate-pulse">Archivo Listo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-4 p-6">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 text-slate-400 dark:text-cadenza-light group-hover:text-cadenza-neon transition-colors"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                      <div>
                        <p className="text-[11px] text-slate-500 dark:text-cadenza-light font-black uppercase tracking-[0.2em]">Seleccionar Audio</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">Arrestre aquí su archivo</p>
                      </div>
                    </div>
                  )}
                  <input type="file" className="hidden" accept=".mp3,.wav,.flac,.m4a" onChange={handleFileSelect} disabled={isUploading || limiteAlcanzado} />
                </label>
                {selectedFile && !isUploading && !limiteAlcanzado && (
                  <button onClick={clearSelection} className="mt-4 text-[10px] text-red-500/70 hover:text-red-500 uppercase font-black tracking-widest transition-colors flex items-center justify-center space-x-2"><span>✕ Quitar archivo</span></button>
                )}
              </div>

              {/* ZONA DERECHA: Inputs y Bloque Informativo */}
              <div className="flex flex-col h-full space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light ml-1">Título de la Obra</label>
                    <input type="text" value={nombreParaIA} onChange={(e) => setNombreParaIA(e.target.value)} disabled={isUploading || limiteAlcanzado} className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-cadenza-text focus:border-cadenza-neon outline-none transition-colors disabled:opacity-50" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light ml-1">Autor / Compositor</label>
                    <input type="text" value={autorParaIA} onChange={(e) => setAutorParaIA(e.target.value)} disabled={isUploading || limiteAlcanzado} className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-cadenza-text focus:border-cadenza-neon outline-none transition-colors disabled:opacity-50" />
                  </div>
                </div>

                {/* BLOQUE DE REQUISITOS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 border rounded-xl flex flex-col items-start transition-all duration-300 ${selectedFile ? 'bg-cadenza-neon/5 border-cadenza-neon/30' : 'bg-slate-50 dark:bg-white/5 border-cadenza-border'}`}>
                    <span className="text-[8px] font-black uppercase text-cadenza-light opacity-60 mb-1">
                      {selectedFile ? 'Calidad / Peso' : 'Calidad Recomendada'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${colorTextoInfo}`}>
                      {calidadAudio}
                    </span>
                  </div>
                  <div className={`p-3 border rounded-xl flex flex-col items-start transition-all duration-300 ${selectedFile ? 'bg-cadenza-neon/5 border-cadenza-neon/30' : 'bg-slate-50 dark:bg-white/5 border-cadenza-border'}`}>
                    <span className="text-[8px] font-black uppercase text-cadenza-light opacity-60 mb-1">
                      {selectedFile ? 'Formato Detectado' : 'Formatos Soportados'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${colorTextoInfo}`}>
                      {formatoAudio}
                    </span>
                  </div>
                </div>

                {/* RECUADRO INFORMATIVO */}
                <div className="p-6 bg-gradient-to-br from-cadenza-blue/10 to-transparent border border-cadenza-blue/20 rounded-2xl flex flex-col items-start text-left relative overflow-hidden">
                  <div className="absolute top-2 right-4 opacity-10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-cadenza-blue"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-cadenza-blue mb-2 flex items-center">
                    <span className="w-2 h-2 bg-cadenza-blue rounded-full mr-2 animate-pulse"></span>
                    Procesamiento Inteligente
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-cadenza-light leading-relaxed font-medium">
                    Nuestro motor de <strong className="text-cadenza-text">IA Demucs</strong> analizará la pista para separar el piano del resto de instrumentos. Además, se calculará el <strong className="text-cadenza-text">tempo (BPM)</strong> exacto para sincronizar el metrónomo automáticamente.
                  </p>
                </div>
              </div>

            </div>

            {errorArchivo && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/50">{errorArchivo}</p>}

            {/* BARRA DE CARGA / BOTÓN */}
            {isUploading ? (
              <div className="w-full bg-slate-50 dark:bg-black/30 border border-cadenza-border rounded-xl p-6 space-y-4">

                {/* AVISO DE SATURACIÓN: se muestra cuando hay más usuarios esperando en cola */}
                {servidoresSaturados && (
                  <div className="flex items-start p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-pulse">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                    </svg>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-red-400 mb-1">Servidores saturados</p>
                      <p className="text-[10px] text-red-300/80 font-medium leading-relaxed">
                        Tu solicitud ha sido recibida y será atendida en breves. Por favor, mantén la ventana abierta.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center p-3 mb-2 bg-cadenza-warning-bg border border-cadenza-warning/30 rounded-lg animate-pulse">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-cadenza-warning mr-2 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-[10px] font-black text-cadenza-warning-text uppercase tracking-widest text-center">
                    Por favor, no salgas de esta pantalla mientras separamos tu canción
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-cadenza-neon">
                  <span className="flex items-center space-x-3">
                    <svg className="animate-spin h-4 w-4 text-cadenza-neon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Aislando Instrumentos...
                  </span>
                  <span className="bg-cadenza-progress-bg px-2 py-0.5 rounded text-cadenza-neon">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cadenza-neon rounded-full transition-all duration-500 ease-out relative" style={{ width: `${uploadProgress}%` }}>
                    <div className="absolute inset-0 bg-white/30 dark:bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : limiteAlcanzado ? (
              <button disabled className="w-full py-6 bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl font-black tracking-[0.2em] uppercase cursor-not-allowed transition-colors">
                LÍMITE ALCANZADO ({MAX_OBRAS}/{MAX_OBRAS})
              </button>
            ) : casiLleno ? (
              <button onClick={handleUpload} disabled={!selectedFile} className="w-full py-6 rounded-xl font-black tracking-[0.2em] uppercase transition-all duration-300 border bg-amber-500/10 text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-black hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">SEPARAR ÚLTIMA PISTA</button>
            ) : (
              <button onClick={handleUpload} disabled={!selectedFile} className="cadenza-btn-neon">SEPARAR PISTAS</button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Biblioteca */}
        <div className="lg:col-span-4 space-y-8">
          <LibraryPanel
            obrasRecientes={obrasRecientes}
            cargandoObras={cargandoObras}
            onOpenObra={abrirEstudioDesdeHistorial}
            onDeleteObra={eliminarObra}
            limiteAlcanzado={limiteAlcanzado}
            casiLleno={casiLleno}
          />

          <StorageStatus obrasCount={totalObras} maxObras={MAX_OBRAS} />
        </div>
      </div>
    </AppLayout>
  );
}