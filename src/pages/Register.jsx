import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout, { PasswordField } from '../components/AuthLayout';

export default function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // NUEVOS ESTADOS PARA LA PANTALLA DE ÉXITO
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al crear la cuenta');
            }

            // Capturamos el mensaje que devuelve FastAPI
            const data = await response.json();
            
            // En lugar de alert(), activamos la pantalla de éxito
            setSuccessMessage(data.message);
            setIsSuccess(true);
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const rightColumn = (
        <div className="hidden lg:flex w-1/3 min-h-screen bg-gradient-to-br from-cadenza-bg dark:from-cadenza-blue/20 to-cadenza-blue/20 dark:to-cadenza-bg relative items-center justify-center p-12 border-l border-cadenza-border transition-colors duration-300">
            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
            <div className="relative z-10 text-center space-y-4">
                <span className="text-6xl text-cadenza-light font-black tracking-tight block transition-colors">
                    Explora.
                </span>
                <span className="text-6xl text-cadenza-text font-black tracking-tight block transition-colors">
                    Aísla.
                </span>
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
                
                {/* SI EL REGISTRO ES EXITOSO, MOSTRAMOS ESTA PANTALLA */}
                {isSuccess ? (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
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
                            <p className="text-cadenza-light text-xs leading-relaxed px-2 font-medium">
                                {successMessage || "Hemos enviado un enlace a tu correo electrónico. Haz clic en él para activar tu cuenta antes de entrar al estudio."}
                            </p>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-4 rounded-xl font-black tracking-widest uppercase text-xs transition-all duration-300 shadow-md bg-cadenza-border/40 text-cadenza-text hover:bg-cadenza-neon hover:text-cadenza-bg hover:shadow-[0_0_15px_rgba(0,242,255,0.4)]"
                            >
                                Ir a Iniciar Sesión
                            </button>
                        </div>
                    </div>
                ) : (
                    /* SI NO, MOSTRAMOS EL FORMULARIO NORMAL */
                    <>
                        <div className="relative z-10 mb-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-lg font-black text-cadenza-neon uppercase">Crear Cuenta</h2>
                            <p className="text-cadenza-light text-xs">Comienza a deconstruir tus obras</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] font-bold animate-in fade-in">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
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

                            <PasswordField
                                label="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                            />

                            <PasswordField
                                label="Confirmar Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite la contraseña"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full mt-2 py-4 rounded-xl font-black tracking-widest transition-all duration-300 shadow-md ${isLoading
                                    ? 'bg-slate-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-cadenza-neon text-white dark:text-cadenza-bg hover:opacity-90 hover:scale-[1.01] cursor-pointer'
                                    }`}
                            >
                                {isLoading ? 'CREANDO...' : 'REGISTRARSE'}
                            </button>
                        </form>

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