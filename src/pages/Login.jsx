import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Importaciones de tus utilidades y componentes
import { useThemeSettings } from '../utils/useThemeSettings';
import Sidebar from '../components/Sidebar';

export default function Login() {
  const navigate = useNavigate();
  
  const { isDark, setIsDark, fontSize, setFontSize, isSidebarOpen, setIsSidebarOpen } = useThemeSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      localStorage.setItem('cadenza_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
        showUserMenu={false} 
      />

      <main className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        
        {/* COLUMNA IZQUIERDA */}
        <div className="w-full lg:w-2/3 p-8 md:p-12 flex flex-col relative">
          
          {/* Solo el botón de hamburguesa se queda en la esquina superior izquierda */}
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="absolute top-10 left-10 z-20 w-10 h-10 text-2xl hover:bg-cadenza-card rounded-md transition-colors"
            >
              ☰
            </button>
          )}

          {/* CONTENEDOR CENTRAL: Centra el título + el recuadro */}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            
            {/* TÍTULO: Ahora encima del recuadro */}
            <div className="w-full max-w-2xl mb-8 text-left px-2">
              <h1 className="text-4xl font-black tracking-tighter">
                CADENZA<span className="text-cadenza-neon">.</span>
              </h1>
              <p className="text-cadenza-light text-[10px] font-bold uppercase tracking-[0.4em] mt-1">
                Plataforma de Estudio Musical
              </p>
            </div>

            {/* RECUADRO DE LOGIN */}
            <div className="bg-cadenza-card border border-cadenza-border rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden w-full max-w-2xl">
              
              <div className="absolute top-0 right-0 w-48 h-48 bg-cadenza-neon opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="relative z-10 mb-10 text-left">
                <h2 className="text-2xl font-black text-cadenza-neon uppercase tracking-tight">Acceso de Músicos</h2>
                <p className="text-cadenza-light text-sm font-medium mt-1">Tu espacio personal te espera</p>
              </div>

              {error && (
                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-xs font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-cadenza-light text-[11px] uppercase tracking-widest font-black mb-2 ml-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-cadenza-text focus:outline-none focus:border-cadenza-neon transition-colors"
                    placeholder="pianista@cadenza.com"
                  />
                </div>

                <div>
                  <label className="block text-cadenza-light text-[11px] uppercase tracking-widest font-black mb-2 ml-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-cadenza-text focus:outline-none focus:border-cadenza-neon transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-5 rounded-xl font-black tracking-widest transition-all duration-300 shadow-md ${
                    isLoading 
                      ? 'bg-slate-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-cadenza-neon text-white dark:text-cadenza-bg hover:opacity-90 hover:scale-[1.01]'
                  }`}
                >
                  {isLoading ? 'CONECTANDO...' : 'ENTRAR AL ESTUDIO'}
                </button>
              </form>

              <div className="mt-10 pt-6 border-t border-cadenza-border text-left">
                <p className="text-cadenza-light text-[10px] font-bold uppercase tracking-widest">
                  ¿Problemas? <span className="text-cadenza-neon cursor-pointer hover:underline">Soporte Técnico</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Degradado Azul */}
        <div className="hidden lg:flex w-1/3 min-h-screen bg-gradient-to-br from-cadenza-blue via-cadenza-bg to-cadenza-bg relative items-center justify-center p-12 border-l border-cadenza-border">
          <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
          <div className="relative z-10 text-center space-y-4">
            <span className="text-6xl text-white/90 font-black tracking-tight block">Toca.</span>
            <span className="text-6xl text-white/70 font-black tracking-tight block">Graba.</span>
            <span className="text-6xl text-cadenza-neon font-black tracking-tight block">Mejora.</span>
          </div>
        </div>

      </main>
    </div>
  );
}