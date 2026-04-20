import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jsmediatags from 'jsmediatags';

// Importaciones de componentes y utilidades
import Sidebar from '../components/Sidebar';
import { useThemeSettings } from '../utils/useThemeSettings';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Hook de configuración visual persistente
  const { isDark, setIsDark, fontSize, setFontSize, isSidebarOpen, setIsSidebarOpen } = useThemeSettings();

  // Estados de subida y metadatos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState("");
  const [nombreParaIA, setNombreParaIA] = useState("");
  const [autorParaIA, setAutorParaIA] = useState("");
  
  // Estado de la biblioteca
  const [obrasRecientes, setObrasRecientes] = useState([]);
  const [cargandoObras, setCargandoObras] = useState(true);

  // Cargar historial al montar el componente
  useEffect(() => {
    const fetchMisObras = async () => {
      const token = localStorage.getItem('cadenza_token');
      if (!token) return;
      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/mis-obras", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setObrasRecientes(data);
        }
      } catch (error) {
        console.error("Error al cargar las obras:", error);
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
      setErrorArchivo("");
      jsmediatags.read(file, {
        onSuccess: function(tag) {
          setNombreParaIA(tag.tags.title || file.name.replace(/\.[^/.]+$/, ""));
          setAutorParaIA(tag.tags.artist || "");
        },
        onError: function() {
          setNombreParaIA(file.name.replace(/\.[^/.]+$/, ""));
        }
      });
    }
  };

  const handleUpload = async () => {
    // 1. Validación previa en el front
    if (!selectedFile || !nombreParaIA.trim()) {
      setErrorArchivo("El título de la obra es obligatorio.");
      return;
    }

    setIsUploading(true);
    setErrorArchivo("");

    // 2. Construcción del FormData (Crucial para evitar el 422)
    const formData = new FormData();
    formData.append("file", selectedFile);       // Debe coincidir con 'file' en FastAPI
    formData.append("title", nombreParaIA);      // Debe coincidir con 'title' en FastAPI
    formData.append("artist", autorParaIA || ""); // Enviar string vacío si no hay autor

    const token = localStorage.getItem('cadenza_token');

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/separar", {
        method: "POST",
        headers: { 
          // MUY IMPORTANTE: NO pongas 'Content-Type': 'multipart/form-data' aquí.
          // El navegador lo pone automáticamente con el "boundary" correcto.
          "Authorization": `Bearer ${token}` 
        },
        body: formData,
      });

      if (!response.ok) {
        // Esto te ayudará a ver el error exacto en la consola si vuelve a fallar
        const errorDetail = await response.json();
        console.error("Detalle del error 422:", errorDetail);
        throw new Error(errorDetail.detail || "Error en el servidor");
      }

      const data = await response.json();
      
      // Navegamos al estudio con los datos recibidos
      navigate('/estudio', { 
        state: { 
          nombreObra: nombreParaIA,
          autorObra: autorParaIA,
          backingUrl: data.backing_url,
          bpmDetectado: data.bpm
        } 
      });

    } catch (error) {
      setErrorArchivo(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const eliminarObra = async (e, id) => {
    e.stopPropagation(); // Evita navegar al estudio
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta obra de tu biblioteca?");
    if (confirmar) {
      try {
        const token = localStorage.getItem('cadenza_token');
        const response = await fetch(`http://127.0.0.1:8000/api/v1/obras/${id}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          setObrasRecientes(obrasRecientes.filter(o => o.id !== id));
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const abrirEstudioDesdeHistorial = (obra) => {
    navigate('/estudio', { 
      state: { 
        nombreObra: obra.title,
        backingUrl: obra.backing_url,
        bpmDetectado: obra.bpm
      } 
    });
  };

  return (
    <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isDark={isDark} 
        setIsDark={setIsDark} 
        fontSize={fontSize} 
        setFontSize={setFontSize} 
        showUserMenu={true} 
      />

      {/* Main expandido a la izquierda */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-12 w-full text-left">
          
          {/* Cabecera horizontal a la izquierda */}
          <header className="flex items-center mb-12 border-b border-cadenza-border pb-6 relative">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="flex items-center justify-center w-10 h-10 text-2xl hover:bg-cadenza-card rounded-md transition-colors mr-4"
              >
                ☰
              </button>
            )}
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tighter italic">MI <span className="text-cadenza-neon">DASHBOARD</span></h1>
              <p className="text-cadenza-light font-bold mt-1 uppercase tracking-[0.3em] text-[10px]">Tu centro de control musical</p>
            </div>
            <button onClick={() => navigate(-1)} className="ml-auto text-[10px] font-black uppercase tracking-widest text-cadenza-light hover:text-cadenza-neon transition-colors">
                ← Volver
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Panel de Subida (Ocupa 8 columnas para ser más ancho) */}
            <div className="lg:col-span-8 bg-cadenza-card border border-cadenza-border rounded-3xl p-10 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[450px]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cadenza-neon opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10 space-y-8">
                <div className="text-left">
                  <h2 className="text-2xl font-black tracking-tight uppercase italic">Nueva Obra</h2>
                  <p className="text-cadenza-light text-sm font-medium">Sube audio para aislar el acompañamiento</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-cadenza-border border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-black/20 hover:border-cadenza-neon transition-all">
                    <span className="text-4xl mb-3">📁</span>
                    <p className="text-[10px] text-cadenza-light font-black uppercase tracking-widest text-center px-4 leading-relaxed">
                      {selectedFile ? selectedFile.name : "Seleccionar archivo de audio"}
                    </p>
                    <input type="file" className="hidden" accept="audio/*" onChange={handleFileSelect} />
                  </label>

                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-cadenza-light ml-1">Título</label>
                      <input type="text" value={nombreParaIA} onChange={(e) => setNombreParaIA(e.target.value)} className="w-full bg-cadenza-bg border-2 border-cadenza-border rounded-xl px-4 py-3 text-sm focus:border-cadenza-neon outline-none transition-colors" />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-cadenza-light ml-1">Compositor</label>
                      <input type="text" value={autorParaIA} onChange={(e) => setAutorParaIA(e.target.value)} className="w-full bg-cadenza-bg border-2 border-cadenza-border rounded-xl px-4 py-3 text-sm focus:border-cadenza-neon outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                {errorArchivo && <p className="text-xs font-bold text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/50">{errorArchivo}</p>}

                <button 
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="w-full py-5 bg-cadenza-neon text-white dark:text-cadenza-bg rounded-xl font-black tracking-widest uppercase shadow-md hover:scale-[1.01] transition-all disabled:opacity-20"
                >
                  {isUploading ? "PROCESANDO..." : "SEPARAR PISTAS"}
                </button>
              </div>
            </div>

            {/* Columna Derecha: Biblioteca y Actividad */}
            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-cadenza-card border border-cadenza-border rounded-3xl p-8 shadow-md">
                <h2 className="text-xs font-black mb-6 uppercase tracking-[0.2em] border-b border-cadenza-border pb-3 text-cadenza-light text-left">Biblioteca Reciente</h2>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {cargandoObras ? (
                    <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
                  ) : obrasRecientes.map(obra => (
                    <div 
                      key={obra.id} 
                      onClick={() => abrirEstudioDesdeHistorial(obra)} 
                      className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-cadenza-border flex items-center justify-between cursor-pointer hover:border-cadenza-neon transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-cadenza-blue/10 flex items-center justify-center text-cadenza-blue">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
                        </div>
                        <div className="text-left">
                          <p className="font-black text-[11px] uppercase truncate w-32 group-hover:text-cadenza-neon transition-colors">{obra.title}</p>
                          <p className="text-[9px] text-cadenza-light font-bold mt-1 uppercase italic">{obra.bpm} BPM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => eliminarObra(e, obra.id)}
                          className="p-2 text-cadenza-light hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cadenza-light group-hover:text-cadenza-neon transition-colors" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-cadenza-card border border-cadenza-border rounded-3xl p-8 shadow-md">
                <h3 className="text-xs font-black uppercase tracking-widest text-cadenza-light text-left mb-8">Actividad Semanal</h3>
                <div className="flex items-end justify-between h-32 border-b border-cadenza-border pb-2 px-1 mb-4">
                  {[35, 60, 45, 85, 50, 100, 70].map((height, i) => (
                    <div key={i} className="w-4 bg-cadenza-blue/20 dark:bg-cadenza-blue/30 rounded-t-sm hover:bg-cadenza-neon transition-colors relative group cursor-pointer" style={{ height: `${height}%` }}>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-cadenza-text text-cadenza-bg text-[9px] font-bold py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{height}m</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-cadenza-light font-black px-1 uppercase italic">
                  <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}