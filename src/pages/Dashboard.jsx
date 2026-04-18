import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // ESTADOS
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [fontSize, setFontSize] = useState('text-sm');

  // Aplicar modo oscuro/claro
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('cadenza_token');
    navigate('/login');
  };

  const goToEstudio = () => {
    navigate('/estudio');
  };

  return (
    <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>
      
      {/* ☰ SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-cadenza-card border-r border-cadenza-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-xl`}>
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-cadenza-neon tracking-tighter">CADENZA</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-xl hover:rotate-90 transition-transform">✕</button>
          </div>
          
          <nav className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-cadenza-light uppercase tracking-widest">Usuario</h3>
              <button className="flex items-center space-x-3 w-full p-2 hover:bg-cadenza-blue/10 rounded-lg transition-colors">
                <span className="text-lg">👤</span> <span className="font-semibold text-sm">Mi Perfil</span>
              </button>
            </div>
            
            <div className="pt-4 border-t border-cadenza-border space-y-5">
              <h3 className="text-[10px] font-bold text-cadenza-light uppercase tracking-widest">Personalización</h3>
              
              {/* Modo Claro/Oscuro */}
              <div className="flex items-center justify-between bg-cadenza-bg p-2.5 rounded-lg border border-cadenza-border">
                <span className="text-xs font-bold">Modo Oscuro</span>
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${isDark ? 'bg-cadenza-neon' : 'bg-slate-400'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Tamaño de letra */}
              <div className="space-y-2">
                <span className="text-xs font-bold">Tamaño de Interfaz</span>
                <div className="grid grid-cols-3 gap-2">
                  {['text-xs', 'text-sm', 'text-base'].map(size => (
                    <button 
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`py-1.5 text-[10px] rounded-md border-2 transition-all ${fontSize === size ? 'border-cadenza-neon bg-cadenza-neon/10 text-cadenza-neon font-black' : 'border-cadenza-border text-cadenza-light'}`}
                    >
                      {size.split('-')[1].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* 🎛️ CONTENIDO PRINCIPAL (w-full para ocupar todo el espacio) */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6 w-full">
          
          {/* Cabecera */}
          <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b-2 border-cadenza-border pb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className={`text-2xl p-1.5 hover:bg-cadenza-card rounded-md transition-colors ${isSidebarOpen ? 'opacity-0 scale-0 hidden' : 'opacity-100 scale-100'}`}
              >
                ☰
              </button>
              <div className="text-left">
                <h1 className="text-3xl font-black tracking-tight">Panel <span className="text-cadenza-neon">Principal</span></h1>
                <p className="text-cadenza-light font-semibold mt-1 uppercase tracking-widest text-[11px]">Bienvenido a tu HUB</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-4 md:mt-0 text-[11px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400 transition-colors border-b-2 border-transparent hover:border-red-500 px-2 py-1"
            >
              Cerrar Sesión
            </button>
          </header>

          {/* Tarjetas de Acción del Dashboard (Grid de 12 columnas para distribuir el ancho total) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* 1. Tarjeta de Crear Nuevo (4 columnas) */}
            <div className="lg:col-span-4 bg-cadenza-card border border-cadenza-border rounded-3xl p-8 flex flex-col items-center text-center shadow-md hover:border-cadenza-neon transition-colors group">
              <div className="w-20 h-20 bg-cadenza-neon/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🎹</span>
              </div>
              <h2 className="text-2xl font-black mb-3 text-cadenza-text">Nuevo Proyecto</h2>
              <p className="text-cadenza-light text-sm mb-8 flex-1">Sube una nueva canción, aísla el piano y practica sobre ella en el Estudio Virtual.</p>
              
              <button 
                onClick={goToEstudio}
                className="w-full py-4 bg-cadenza-neon text-white dark:text-cadenza-bg font-black rounded-xl tracking-widest uppercase hover:opacity-90 transition-opacity shadow-md"
              >
                Ir al Estudio
              </button>
            </div>

            {/* 2. Tarjeta de Historial (5 columnas) */}
            <div className="lg:col-span-5 bg-cadenza-card border border-cadenza-border rounded-3xl p-8 flex flex-col shadow-md">
              <h2 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center space-x-2 text-left border-b border-cadenza-border pb-3">
                <span>📚</span> <span>Tus Obras Recientes</span>
              </h2>
              
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-cadenza-border rounded-2xl bg-slate-50 dark:bg-black/20 p-6">
                <span className="text-cadenza-light mb-3 text-4xl opacity-40 hover:opacity-80 transition-opacity">📂</span>
                <p className="text-cadenza-light font-medium text-center text-sm">
                  Todavía no has procesado ninguna pista. <br/> <span className="text-cadenza-neon font-bold mt-1 inline-block">¡Empieza un nuevo proyecto!</span>
                </p>
              </div>
            </div>

            {/* 3. NUEVO: Tarjeta de Progreso/Estadísticas (3 columnas) */}
            <div className="lg:col-span-3 bg-cadenza-card border border-cadenza-border rounded-3xl p-8 flex flex-col shadow-md">
              <h2 className="text-lg font-black mb-6 uppercase tracking-tight flex items-center space-x-2 text-left border-b border-cadenza-border pb-3">
                <span>📈</span> <span>Tu Progreso</span>
              </h2>
              
              <div className="flex-1 flex flex-col justify-end">
                {/* Minigráfico de barras estético */}
                <div className="flex items-end justify-between h-32 border-b border-cadenza-border pb-2 px-1 mb-2">
                  {[35, 60, 45, 85, 50, 100, 70].map((height, i) => (
                    <div 
                      key={i} 
                      className="w-4 bg-cadenza-blue/30 dark:bg-cadenza-blue/40 rounded-t-sm hover:bg-cadenza-neon transition-colors relative group cursor-pointer"
                      style={{ height: `${height}%` }}
                    >
                      {/* Tooltip invisible que aparece al hacer hover (opcional visual) */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-cadenza-text text-cadenza-bg text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {height}m
                      </div>
                    </div>
                  ))}
                </div>
                {/* Días de la semana */}
                <div className="flex justify-between text-[10px] text-cadenza-light font-black uppercase px-1">
                  <span>L</span><span>M</span><span>X</span><span>J</span><span>V</span><span>S</span><span>D</span>
                </div>

                <div className="mt-6 bg-cadenza-neon/10 rounded-xl p-3 text-center border border-cadenza-neon/20">
                  <p className="text-xs font-bold text-cadenza-neon">¡Buena racha!</p>
                  <p className="text-[10px] font-medium text-cadenza-light mt-0.5">Has practicado 4 días seguidos.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}