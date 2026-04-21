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

            alert("¡Cuenta creada con éxito! Por favor, inicia sesión.");
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const rightColumn = (
        <div className="hidden lg:flex w-1/3 bg-gradient-to-br from-cadenza-bg via-cadenza-bg to-cadenza-blue/20 items-center justify-center p-8 border-l border-cadenza-border">
            <div className="text-center space-y-2">
                <span className="text-4xl text-white/70 font-black block">Explora.</span>
                <span className="text-4xl text-white/90 font-black block">Aisla.</span>
                <span className="text-4xl text-cadenza-neon font-black block">Domina.</span>
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

            <div className="bg-cadenza-card border border-cadenza-border rounded-2xl p-8 shadow-xl relative overflow-hidden w-full max-w-md">
                <div className="relative z-10 mb-6 text-left">
                    <h2 className="text-lg font-black text-cadenza-neon uppercase">Crear Cuenta</h2>
                    <p className="text-cadenza-light text-xs">Comienza a deconstruir tus obras</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-[10px] font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="text-left">
                        <label className="block text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1">
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
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
                            className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
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
                        className={`w-full mt-2 py-3 rounded-xl font-black text-xs tracking-widest transition-all ${isLoading
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-cadenza-blue text-white hover:scale-[1.01]'
                            }`}
                    >
                        {isLoading ? 'CREANDO...' : 'REGISTRARSE'}
                    </button>
                </form>

                <div className="mt-8 pt-5 border-t border-cadenza-border text-center">
                    <p className="text-slate-500 dark:text-cadenza-light text-[10px] font-bold uppercase tracking-widest">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="text-cadenza-neon hover:underline cursor-pointer">
                            Inicia Sesión
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}