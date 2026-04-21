import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jsmediatags from 'jsmediatags';
import AppLayout from '../components/AppLayout';

export default function Dashboard() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [nombreParaIA, setNombreParaIA] = useState('');
  const [autorParaIA, setAutorParaIA] = useState('');

  const [obrasRecientes, setObrasRecientes] = useState([]);
  const [cargandoObras, setCargandoObras] = useState(true);

  useEffect(() => {
    const fetchMisObras = async () => {
      const token = localStorage.getItem('cadenza_token');
      if (!token) return;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/v1/mis-obras', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setObrasRecientes(data);
        }
      } catch (error) {
        console.error('Error al cargar las obras:', error);
      } finally {
        setCargandoObras(false);
      }
    };
    fetchMisObras();
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

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) return 95; 
        return prev + Math.max(0.5, (95 - prev) * 0.05);
      });
    }, 500);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', nombreParaIA);
    formData.append('artist', autorParaIA || '');

    const token = localStorage.getItem('cadenza_token');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/separar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'Error en el servidor');
      }

      const data = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        navigate('/estudio', {
          state: {
            nombreObra: nombreParaIA,
            autorObra: autorParaIA,
            backingUrl: data.backing_url,
            bpmDetectado: data.bpm,
          },
        });
      }, 500);

    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setErrorArchivo(`❌ Error: ${error.message}`);
      setIsUploading(false);
    }
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation();
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar esta obra de tu biblioteca?');
    if (confirmar) {
      try {
        const token = localStorage.getItem('cadenza_token');
        const response = await fetch(`http://127.0.0.1:8000/api/v1/obras/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setObrasRecientes(obrasRecientes.filter((o) => o.id !== id));
        }
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
      },
    });
  };

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
          <button onClick={() => navigate(-1)} className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light hover:text-cadenza-neon transition-colors">← Volver</button>
        </header>
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Panel de Subida */}
        <div className="lg:col-span-8 bg-cadenza-card border border-cadenza-border rounded-3xl p-10 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[500px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cadenza-neon opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10 space-y-8">
            <div className="text-left">
              <h2 className="text-2xl font-black tracking-tight uppercase italic">Nueva Obra</h2>
              <p className="text-slate-500 dark:text-cadenza-light text-sm font-medium">Sube audio para aislar el acompañamiento</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* ZONA IZQUIERDA: Dropzone */}
              <div className="flex flex-col">
                <label className={`flex flex-col items-center justify-center min-h-[280px] border-2 border-dashed rounded-2xl cursor-pointer transition-all relative overflow-hidden group ${isUploading ? 'opacity-50 cursor-not-allowed border-cadenza-border bg-slate-50 dark:bg-black/10' : 'border-cadenza-border bg-slate-50 dark:bg-black/20 hover:border-cadenza-neon hover:bg-cadenza-neon/5'}`}>
                  {selectedFile ? (
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
                  <input type="file" className="hidden" accept=".mp3,.wav,.flac,.m4a" onChange={handleFileSelect} disabled={isUploading} />
                </label>
                {selectedFile && !isUploading && (
                  <button onClick={clearSelection} className="mt-4 text-[10px] text-red-500/70 hover:text-red-500 uppercase font-black tracking-widest transition-colors flex items-center justify-center space-x-2"><span>✕ Quitar archivo</span></button>
                )}
              </div>

              {/* ZONA DERECHA: Inputs y Bloque Informativo */}
              <div className="flex flex-col h-full space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light ml-1">Título de la Obra</label>
                    <input type="text" value={nombreParaIA} onChange={(e) => setNombreParaIA(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-cadenza-text focus:border-cadenza-neon outline-none transition-colors" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light ml-1">Autor / Compositor</label>
                    <input type="text" value={autorParaIA} onChange={(e) => setAutorParaIA(e.target.value)} disabled={isUploading} className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-4 text-sm text-gray-900 dark:text-cadenza-text focus:border-cadenza-neon outline-none transition-colors" />
                  </div>
                </div>

                {/* BLOQUE DE REQUISITOS (Rellena el espacio superior del Info Box) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border border-cadenza-border rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col items-start">
                    <span className="text-[8px] font-black uppercase text-cadenza-light opacity-60 mb-1">Calidad</span>
                    <span className="text-[10px] font-bold text-cadenza-text uppercase tracking-tight">Lossless / HQ</span>
                  </div>
                  <div className="p-3 border border-cadenza-border rounded-xl bg-slate-50 dark:bg-white/5 flex flex-col items-start">
                    <span className="text-[8px] font-black uppercase text-cadenza-light opacity-60 mb-1">Formato</span>
                    <span className="text-[10px] font-bold text-cadenza-text uppercase tracking-tight">MP3 / WAV</span>
                  </div>
                </div>

                {/* RECUADRO INFORMATIVO (Más grande y estilizado) */}
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
                <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-cadenza-neon">
                  <span className="flex items-center space-x-3">
                    <svg className="animate-spin h-4 w-4 text-cadenza-neon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Aislando Instrumentos...
                  </span>
                  <span className="bg-cadenza-neon/10 px-2 py-0.5 rounded">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-cadenza-neon rounded-full transition-all duration-500 ease-out relative" style={{ width: `${uploadProgress}%` }}>
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={handleUpload} disabled={!selectedFile} className="w-full py-6 bg-cadenza-neon text-white dark:text-cadenza-bg rounded-xl font-black tracking-[0.2em] uppercase shadow-[0_0_25px_rgba(0,242,255,0.2)] hover:shadow-[0_0_35px_rgba(0,242,255,0.4)] hover:scale-[1.01] transition-all disabled:opacity-20 disabled:shadow-none">SEPARAR PISTAS</button>
            )}
          </div>
        </div>

        {/* Columna Derecha: Biblioteca (Sin cambios) */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-cadenza-card border border-cadenza-border rounded-3xl p-8 shadow-md">
            <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] border-b border-cadenza-border pb-3 text-slate-500 dark:text-cadenza-light text-left">Biblioteca Reciente</h2>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
              {cargandoObras ? <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" /> : 
                obrasRecientes.map((obra) => (
                  <div key={obra.id} onClick={() => abrirEstudioDesdeHistorial(obra)} className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-cadenza-border flex items-center justify-between cursor-pointer hover:border-cadenza-neon transition-all group">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-8 h-8 flex-shrink-0 rounded-full bg-cadenza-blue/10 flex items-center justify-center text-cadenza-blue">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-black text-[12px] uppercase truncate group-hover:text-cadenza-neon transition-colors leading-tight">{obra.title}</p>
                        <p className="text-[10px] text-cadenza-light font-bold uppercase truncate opacity-80">{obra.artist || 'Autor desconocido'}</p>
                        <p className="text-[8px] text-cadenza-light/60 font-black mt-0.5 uppercase italic tracking-widest">{obra.bpm} BPM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <button onClick={(e) => eliminarObra(e, obra.id)} className="p-2 text-cadenza-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cadenza-light group-hover:text-cadenza-neon transition-colors" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-cadenza-card border border-cadenza-border rounded-3xl p-8 shadow-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-cadenza-light text-left mb-8">Actividad Semanal</h3>
            <div className="flex items-end justify-between h-32 border-b border-cadenza-border pb-2 px-1 mb-4">
              {[35, 60, 45, 85, 50, 100, 70].map((height, i) => (
                <div key={i} className="w-4 bg-cadenza-blue/20 dark:bg-cadenza-blue/30 rounded-t-sm hover:bg-cadenza-neon transition-colors relative group cursor-pointer" style={{ height: `${height}%` }}>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-cadenza-text text-cadenza-bg text-[9px] font-bold py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{height}m</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-cadenza-light font-black px-1 uppercase italic">
              <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}