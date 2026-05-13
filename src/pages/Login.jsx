import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout, { PasswordField } from '../components/AuthLayout';
import API_URL from '../services/api';
/**
 * Login
 *
 * Página de inicio de sesión de Cadenza.
 * Envía las credenciales al endpoint OAuth2 del backend usando el formato
 * `application/x-www-form-urlencoded` (estándar del flujo Password Flow de OAuth2).
 * Si el servidor responde con un token JWT, lo persiste en localStorage con la
 * clave `cadenza_token` y redirige al usuario a `/dashboard`.
 *
 * Estructura visual (dos columnas via AuthLayout):
 *  - Columna izquierda: formulario de acceso.
 *  - Columna derecha: columna decorativa con el lema de la app (solo en lg+).
 */
export default function Login() {
  const navigate = useNavigate();

  // ─── ESTADO DEL FORMULARIO ─────────────────────────────────────────────
  const [email, setEmail] = useState('');       // Controlado: campo de email
  const [password, setPassword] = useState(''); // Controlado: campo de contraseña
  const [error, setError] = useState(null);     // Mensaje de error de la API o de red
  const [isLoading, setIsLoading] = useState(false); // Bloquea el botón durante la petición

  /**
   * handleLogin
   *
   * Gestiona el envío del formulario de inicio de sesión.
   * Implementa el flujo OAuth2 Password Flow:
   *  1. Codifica las credenciales en formato `application/x-www-form-urlencoded`
   *     (el backend FastAPI espera el campo `username`, no `email`).
   *  2. Envía la petición POST al endpoint `/api/auth/token`.
   *  3. Si el servidor devuelve un error (4xx/5xx), extrae el campo `detail`
   *     del JSON de error (convención de FastAPI HTTPException).
   *  4. Si la autenticación es correcta, persiste el JWT en localStorage y
   *     redirige al dashboard.
   *
   * @param {React.FormEvent} e - Evento nativo del formulario.
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);       // Limpiamos errores anteriores antes de reintentar
    setIsLoading(true);   // Deshabilitamos el botón para evitar envíos duplicados
    try {
      // El endpoint OAuth2 de FastAPI requiere form-urlencoded, no JSON
      const formData = new URLSearchParams();
      formData.append('username', email); // El backend usa 'username' por convención OAuth2
      formData.append('password', password);

      const response = await fetch(`${API_URL}/api/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) {
        // FastAPI devuelve los errores de autenticación en el campo `detail`
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      // Guardamos el JWT para que ProtectedRoute lo detecte en visitas futuras
      localStorage.setItem('cadenza_token', data.access_token);
      navigate('/dashboard');
    } catch (err) {
      // Muestra el mensaje de error bajo el formulario (errores de red o del servidor)
      setError(err.message);
    } finally {
      // Siempre restauramos el botón, tanto si hubo éxito como si hubo error
      setIsLoading(false);
    }
  };


  /*
   * rightColumn
   * Columna decorativa que se muestra solo en pantallas grandes (hidden lg:flex).
   * Contiene el lema de la app en tres líneas con escala de color progresiva:
   *  - cadenza-text   → máxima visibilidad ("Toca.")
   *  - cadenza-light  → semitransparente ("Graba.")
   *  - cadenza-neon   → acento de marca ("Mejora.")
   * Se pasa como prop a AuthLayout, que la renderiza en la mitad derecha del layout.
   */
  const rightColumn = (
    <div className="hidden lg:flex w-1/3 min-h-screen bg-gradient-to-br from-cadenza-blue/10 via-cadenza-bg to-cadenza-bg relative items-center justify-center p-12 border-l border-cadenza-border">
      {/* Patrón de cuadrícula sutil como textura de fondo */}
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
      <div className="relative z-10 text-center space-y-4">
        {/* Texto principal — adapta su color al tema claro/oscuro vía cadenza-text */}
        <span className="text-6xl text-cadenza-text font-black tracking-tight block transition-colors">
          Toca.
        </span>
        {/* Texto atenuado — usa cadenza-light para el efecto desvanecido */}
        <span className="text-6xl text-cadenza-light font-black tracking-tight block transition-colors">
          Graba.
        </span>
        {/* Texto de marca — siempre en neón, independiente del tema */}
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

        {/* Banner de error — solo visible cuando el servidor devuelve un mensaje de fallo */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Campo de email con validación nativa del navegador (type="email" + required) */}
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

          {/*
           * PasswordField — campo reutilizable con toggle de visibilidad.
           * Importado desde AuthLayout para mantener consistencia con Register.
           */}
          <PasswordField
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {/*
           * Botón de envío.
           * Durante la carga (isLoading=true): estilo gris + cursor bloqueado.
           * En reposo: fondo neón con ligera escala al hover.
           */}
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

        {/* Enlace a la página de registro para nuevos usuarios */}
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