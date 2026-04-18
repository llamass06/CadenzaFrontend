import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export default function Login() {
  const navigate = useNavigate();

  // Estados del Formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de Interfaz
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [fontSize, setFontSize] = useState('text-sm');

  // Aplicar modo oscuro/claro
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

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
      
      {/* ☰ SIDEBAR (Solo Personalización para Login) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-cadenza-card border-r border-cadenza-border transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-xl`}>
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-cadenza-neon tracking-tighter">CADENZA</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-xl hover:rotate-90 transition-transform text-cadenza-text">✕</button>
          </div>
          
          <nav className="space-y-6">
            <div className="pt-4 border-t border-cadenza-border space-y-5">
              <h3 className="text-[10px] font-bold text-cadenza-light uppercase tracking-widest">Ajustes de Interfaz</h3>
              
              {/* Modo Claro/Oscuro */}
              <div className="flex items-center justify-between bg-cadenza-bg p-2.5 rounded-lg border border-cadenza-border">
                <span className="text-xs font-bold text-cadenza-text">Modo Oscuro</span>
                <button 
                  onClick={() => setIsDark(!isDark)}
                  className={`w-10 h-5 rounded-full p-1 transition-colors ${isDark ? 'bg-cadenza-neon' : 'bg-slate-400'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </button>
              </div>

              {/* Tamaño de letra */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-cadenza-text">Tamaño de Interfaz</span>
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

      {/* 🎛️ CONTENIDO PRINCIPAL LOGIN */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        
        {/* Botón de menú superior izquierdo */}
        <div className="p-6">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`text-2xl p-1.5 hover:bg-cadenza-card rounded-md transition-colors ${isSidebarOpen ? 'opacity-0 scale-0 hidden' : 'opacity-100 scale-100'}`}
          >
            ☰
          </button>
        </div>

        {/* Formulario Centrado */}
        <div className="flex-1 flex items-center justify-center p-6 -mt-20">
          <div className="bg-cadenza-card p-10 rounded-3xl border border-cadenza-border w-full max-w-md shadow-2xl transition-colors">
            
            <div className="text-center mb-10">
              <h1 className="text-4xl font-black text-cadenza-text mb-2 tracking-tight">
                Iniciar <span className="text-cadenza-neon">Sesión</span>
              </h1>
              <p className="text-cadenza-light text-sm font-medium tracking-wide uppercase">
                Accede a tu estudio virtual
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 text-red-600 dark:text-red-200 p-3 rounded-xl mb-6 text-sm text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-cadenza-light text-[11px] uppercase tracking-widest font-black mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-3 text-cadenza-text focus:outline-none focus:border-cadenza-neon transition-colors"
                  placeholder="pianista@cadenza.com"
                />
              </div>

              <div>
                <label className="block text-cadenza-light text-[11px] uppercase tracking-widest font-black mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-4 py-3 text-cadenza-text focus:outline-none focus:border-cadenza-neon transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-black tracking-widest transition-all duration-300 shadow-md ${
                  isLoading 
                    ? 'bg-slate-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-cadenza-neon text-white dark:text-cadenza-bg hover:opacity-90 hover:-translate-y-1'
                }`}
              >
                {isLoading ? 'CONECTANDO...' : 'ENTRAR AL ESTUDIO'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}