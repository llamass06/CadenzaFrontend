import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout, { PasswordField } from '../components/AuthLayout';
import API_URL from '../services/api';
/**
 * Register
 *
 * Página de creación de cuenta de Cadenza.
 * El flujo es:
 *  1. El usuario rellena el formulario (username, email, password, confirmPassword).
 *  2. Se realiza validación client-side antes de tocar la red (coincidencia y longitud).
 *  3. Se envía una petición POST con JSON al endpoint `/api/auth/register`.
 *  4. Si el servidor acepta el registro, se sustituye el formulario por una pantalla
 *     de éxito que indica al usuario que revise su email para verificar la cuenta.
 *  5. Si hay error (email duplicado, etc.), se muestra el mensaje devuelto por FastAPI.
 *
 * Estructura visual (dos columnas vía AuthLayout):
 *  - Columna izquierda : formulario de registro ↔️ pantalla de éxito (modo condicional).
 *  - Columna derecha   : lema decorativo solo en lg+.
 */
export default function Register() {
    const navigate = useNavigate();

    // ─── ESTADO DEL FORMULARIO ──────────────────────────────────────────
    const [email, setEmail] = useState('');                       // Controlado: email del usuario
    const [username, setUsername] = useState('');                 // Controlado: nombre de usuario público
    const [password, setPassword] = useState('');                 // Controlado: contraseña
    const [confirmPassword, setConfirmPassword] = useState('');   // Controlado: confirmación (solo client-side)

    const [error, setError] = useState(null);         // Mensaje de error de validación o de la API
    const [isLoading, setIsLoading] = useState(false); // Bloquea el botón mientras espera respuesta

    // Estados de la pantalla de éxito post-registro
    const [isSuccess, setIsSuccess] = useState(false);        // Si true, reemplaza el formulario con la confirmación
    const [successMessage, setSuccessMessage] = useState(''); // Mensaje personalizado del servidor

  /**
   * handleRegister
   *
   * Gestiona el envío del formulario de registro.
   *
   * Validaciones client-side (antes de enviar la petición):
   *  - Coincidencia de contraseñas: evita el viaje al servidor si son distintas.
   *  - Longitud mínima de 6 caracteres: requisito básico de seguridad.
   *
   * Petición al servidor:
   *  - Usa JSON (a diferencia del Login, que usa form-urlencoded).
   *  - El backend devuelve { message } en caso de éxito o { detail } en caso de error
   *    (convención de FastAPI HTTPException).
   *
   * En caso de éxito, se activa la pantalla de confirmación (`isSuccess=true`)
   * en lugar de un `alert()` nativo, para mantener la consistencia visual.
   *
   * @param {React.FormEvent} e - Evento nativo del formulario.
   */
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null); // Limpiamos errores anteriores en cada intento

        // ─ Validaciones client-side (no requieren red) ───────────────────────
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return; // Salimos antes de hacer la petición
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        try {
            // El registro usa JSON, no form-urlencoded (a diferencia del endpoint de login)
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
                // NOTA: confirmPassword NO se envía al servidor (solo validación local)
            });

            if (!response.ok) {
                // FastAPI devuelve el motivo del error en el campo `detail`
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear la cuenta');
            }

            // Capturamos el mensaje de éxito que devuelve FastAPI (ej: "Revisa tu email")
            const data = await response.json();

            // Activamos la pantalla de confirmación (evita el alert() nativo)
            setSuccessMessage(data.message);
            setIsSuccess(true);

        } catch (err) {
            setError(err.message);
        } finally {
            // Siempre restauramos el botón, tanto si hubo éxito como si hubo error
            setIsLoading(false);
        }
    };

  /*
   * rightColumn
   * Columna decorativa visible solo en pantallas grandes (hidden lg:flex).
   * Gradiente inverso al de Login: en claro parte de cadenza-bg, en oscuro de cadenza-blue/20.
   * El lema usa la misma escala de color progresiva que Login pero con distinto orden:
   *  - cadenza-light → atenuado ("Explora.")
   *  - cadenza-text  → prominente ("Aísla.")
   *  - cadenza-neon  → acento de marca ("Domina.")
   */
    const rightColumn = (
        <div className="hidden lg:flex w-1/3 min-h-screen bg-gradient-to-br from-cadenza-bg dark:from-cadenza-blue/20 to-cadenza-blue/20 dark:to-cadenza-bg relative items-center justify-center p-12 border-l border-cadenza-border transition-colors duration-300">
            {/* Patrón de cuadrícula sutil como textura de fondo */}
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
            <div className="relative z-10 text-center space-y-4">
                {/* Texto atenuado — desvanecido para crear profundidad visual */}
                <span className="text-6xl text-cadenza-light font-black tracking-tight block transition-colors">
                    Explora.
                </span>
                {/* Texto principal — máxima visibilidad */}
                <span className="text-6xl text-cadenza-text font-black tracking-tight block transition-colors">
                    Aísla.
                </span>
                {/* Texto de marca — siempre en neón, independiente del tema */}
                <span className="text-6xl text-cadenza-neon font-black tracking-tight block">
                    Domina.
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
                    Únete al Estudio Virtual
                </p>
            </div>

            <div className="bg-cadenza-card border border-cadenza-border rounded-2xl p-8 shadow-xl relative overflow-hidden w-full max-w-md min-h-[400px] flex flex-col justify-center">
                
                {/*
                 * Alternancia condicional de vistas dentro de la tarjeta:
                 *  isSuccess=true  → pantalla de confirmación (tick + mensaje + botón).
                 *  isSuccess=false → formulario de registro estándar.
                 * Se usa min-h-[400px] en el contenedor para evitar el "salto" visual al cambiar.
                 */}
                {isSuccess ? (
                    /* ── PANTALLA DE ÉXITO POST-REGISTRO ──
                     * Animación fade-in + zoom-in para dar sensación de éxito.
                     * Muestra el mensaje que devuelve el servidor (ej: "Revisa tu email").
                     * Si el servidor no devuelve mensaje, usa el fallback hardcodeado. */
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                        {/* Ícono de verificación con halo neón */}
                        <div className="w-20 h-20 bg-cadenza-neon/10 border-2 border-cadenza-neon/30 rounded-full flex items-center justify-center mx-auto text-cadenza-neon shadow-[0_0_30px_rgba(0,242,255,0.2)]">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black text-cadenza-text uppercase tracking-widest">
                                ¡Todo Listo!
                            </h3>
                            {/* Muestra el mensaje del servidor o el fallback si viene vacío */}
                            <p className="text-cadenza-light text-xs leading-relaxed px-2 font-medium">
                                {successMessage || "Hemos enviado un enlace a tu correo electrónico. Haz clic en él para activar tu cuenta antes de entrar al estudio."}
                            </p>
                        </div>
                        <div className="pt-4">
                            {/* Botón de navegación al Login con hover neón */}
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-all duration-300 shadow-md bg-cadenza-border/40 text-cadenza-text hover:bg-cadenza-neon hover:text-cadenza-bg hover:shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                            >
                                Ir a Iniciar Sesión
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── FORMULARIO DE REGISTRO NORMAL ── */
                    <>
                        <div className="relative z-10 mb-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-black text-cadenza-neon uppercase">Crear Cuenta</h2>
                            <p className="text-cadenza-light text-xs">Comienza a deconstruir tus obras</p>
                        </div>

                        {/* Banner de error — visible si falla la validación local o el servidor responde con error */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] font-bold animate-in fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Campo: Nombre de usuario (identificador público en la plataforma) */}
                            <div className="text-left">
                                <label className="block text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1">
                                    Nombre de Usuario
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-sm text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
                                    placeholder="Ej: Mozart99"
                                />
                            </div>

                            {/* Campo: Email (se usará para verificación y como identificador de login) */}
                            <div className="text-left">
                                <label className="block text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-sm text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
                                    placeholder="pianista@cadenza.com"
                                />
                            </div>

                            {/* Campo: Contraseña con toggle de visibilidad (componente reutilizable) */}
                            <PasswordField
                                label="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                            />

                            {/* Campo: Confirmación de contraseña — comparada client-side, NO se envía al servidor */}
                            <PasswordField
                                label="Confirmar Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                            />

                            {/*
                             * Botón de envío.
                             * Durante la carga: gris + cursor bloqueado (evita doble envío).
                             * En reposo: fondo neón con escala al hover.
                             */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full mt-2 py-4 rounded-xl font-black tracking-widest transition-all duration-300 shadow-md ${
                                    isLoading
                                        ? 'bg-slate-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : 'bg-cadenza-neon text-white dark:text-cadenza-bg hover:opacity-90 hover:scale-[1.01] cursor-pointer'
                                }`}
                            >
                                {isLoading ? 'CREANDO...' : 'REGISTRARSE'}
                            </button>
                        </form>

                        {/* Enlace al Login para usuarios que ya tienen cuenta */}
                        <div className="mt-8 pt-5 border-t border-cadenza-border text-center animate-in fade-in">
                            <p className="text-slate-500 dark:text-cadenza-light text-[10px] font-bold uppercase tracking-widest">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-cadenza-neon hover:underline cursor-pointer">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </AuthLayout>
    );
}