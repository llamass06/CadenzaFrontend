import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ 
    isOpen, 
    setIsOpen, 
    isDark, 
    setIsDark, 
    fontSize, 
    setFontSize,
    showUserMenu = true 
}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('cadenza_token');
        navigate('/'); // Te manda a la página principal/login
    };

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-cadenza-card border-r border-cadenza-border transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out shadow-xl flex flex-col`}>
            <div className="p-6 flex-1 flex flex-col space-y-8 overflow-y-auto">
                {/* Cabecera Sidebar */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-cadenza-neon tracking-tighter">CADENZA</h2>
                    <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center text-xl hover:rotate-90 transition-transform text-cadenza-text rounded-md hover:bg-cadenza-bg">✕</button>
                </div>

                {/* Navegación */}
                <nav className="space-y-6 flex-1">
                    {showUserMenu && (
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold text-cadenza-light uppercase tracking-widest">Usuario</h3>
                            <button className="flex items-center space-x-3 w-full p-2 hover:bg-cadenza-blue/10 rounded-lg transition-colors text-cadenza-text">
                                <span className="text-lg">👤</span> <span className="font-semibold text-sm">Mi Perfil</span>
                            </button>
                        </div>
                    )}

                    <div className="pt-4 border-t border-cadenza-border space-y-5">
                        <h3 className="text-[10px] font-bold text-cadenza-light uppercase tracking-widest">Personalización</h3>

                        <div className="flex items-center justify-between bg-cadenza-bg p-2.5 rounded-lg border border-cadenza-border">
                            <span className="text-xs font-bold text-cadenza-text">Modo Oscuro</span>
                            <button onClick={() => setIsDark(!isDark)} className={`w-10 h-5 rounded-full p-1 transition-colors ${isDark ? 'bg-cadenza-neon' : 'bg-slate-400'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full transform transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <span className="text-xs font-bold text-cadenza-text">Tamaño de Interfaz</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['text-xs', 'text-sm', 'text-base'].map(size => (
                                    <button key={size} onClick={() => setFontSize(size)} className={`py-1.5 text-[10px] rounded-md border-2 transition-all ${fontSize === size ? 'border-cadenza-neon bg-cadenza-neon/10 text-cadenza-neon font-black' : 'border-cadenza-border text-cadenza-light'}`}>
                                        {size.split('-')[1].toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* BOTÓN CERRAR SESIÓN (Anclado abajo) */}
                {showUserMenu && (
                    <div className="pt-4 border-t border-cadenza-border mt-auto">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center justify-center space-x-2 w-full p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-bold text-sm"
                        >
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}