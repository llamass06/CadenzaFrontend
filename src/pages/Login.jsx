import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout, { PasswordField } from '../components/AuthLayout';

export default function Login() {
  const navigate = useNavigate();

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


  const rightColumn = (
    <div className="hidden lg:flex w-1/3 min-h-screen bg-gradient-to-br from-cadenza-blue/10 via-cadenza-bg to-cadenza-bg relative items-center justify-center p-12 border-l border-cadenza-border">
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
      <div className="relative z-10 text-center space-y-4">
        {/* Usa tu variable de texto principal (Oscuro en modo claro, claro en modo oscuro) */}
        <span className="text-6xl text-cadenza-text font-black tracking-tight block transition-colors">
          Toca.
        </span>
        {/* Usa tu variable de texto secundario para el efecto desvanecido */}
        <span className="text-6xl text-cadenza-light font-black tracking-tight block transition-colors">
          Graba.
        </span>
        {/* El neón se queda intacto */}
        <span className="text-6xl text-cadenza-neon font-black tracking-tight block">
          Mejora.
        </span>
      </div>
    </div>
  );

  return (
    <AuthLayout rightColumn={rightColumn}>
      <div className="w-full max-w-md mb-6 text-left px-2">
        <h1 className="text-2xl font-black tracking-tighter">
          CADENZA<span className="text-cadenza-neon">.</span>
        </h1>
        <p className="text-cadenza-light text-[9px] font-bold uppercase tracking-[0.3em]">
          Plataforma de Estudio
        </p>
      </div>

      <div className="bg-cadenza-card border border-cadenza-border rounded-2xl p-8 shadow-xl relative overflow-hidden w-full max-w-md">
        <div className="relative z-10 mb-8 text-left">
          <h2 className="text-lg font-black text-cadenza-neon uppercase">Acceso</h2>
          <p className="text-cadenza-light text-xs">Tu estudio personal te espera</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1 text-left">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
              placeholder="pianista@cadenza.com"
            />
          </div>

          <PasswordField
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 rounded-xl font-black tracking-widest transition-all duration-300 shadow-md ${isLoading
              ? 'bg-slate-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-cadenza-neon text-white dark:text-cadenza-bg hover:opacity-90 hover:scale-[1.01]'
              }`}
          >
            {isLoading ? 'CONECTANDO...' : 'ENTRAR AL ESTUDIO'}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-cadenza-border text-center">
          <p className="text-slate-500 dark:text-cadenza-light text-[10px] font-bold uppercase tracking-widest">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-cadenza-neon hover:underline cursor-pointer">
              Crea una ahora
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}