import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Asegúrate de que la imagen esté en src/assets/Logo.png
import logoImagen from '../assets/Logo.png'; 

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const obtenerNombreDelToken = () => {
    const token = localStorage.getItem('cadenza_token');
    if (!token) return 'Usuario';
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload).username || 'Usuario';
    } catch {
        return 'Usuario';
    }
};

/* ─── SVG icons ────────────────────────────────────────────────────────────── */
const Icons = {
    home: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    ),
    piano: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="5" x2="6" y2="10" /><line x1="10" y1="5" x2="10" y2="10" /><line x1="14" y1="5" x2="14" y2="10" /><line x1="18" y1="5" x2="18" y2="10" /></svg>
    ),
    music: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
    ),
    chevron: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 transition-transform duration-200"><path d="M6 8l4 4 4-4" /></svg>
    ),
    ear: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M6 18c0-2 1-3.5 2.5-4.5S11 11 11 9a3 3 0 1 0-6 0c0 .7.1 1.3.4 1.9" /><path d="M11 9c0 2-1 3.5-2.5 4.5S6 16 6 18" /><circle cx="11" cy="19" r="1" /></svg>
    ),
    docs: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    ),
    author: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
    ),
    close: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    ),
    download: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
    )
};

/* ─── sub-components ───────────────────────────────────────────────────────── */

function SectionLabel({ text }) {
    return (
        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-cadenza-light/50 px-2 mb-2">
            {text}
        </p>
    );
}

function NavItem({ icon, label, active, onClick, disabled = false, hasDropdown = false, isOpen = false }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                transition-all duration-200
                ${active
                    ? 'bg-cadenza-neon/10 text-cadenza-neon'
                    : disabled
                        ? 'text-cadenza-light/25 cursor-not-allowed'
                        : 'text-cadenza-text/60 hover:text-cadenza-text hover:bg-cadenza-border/40'
                }
            `}
        >
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cadenza-neon rounded-r-full" />
            )}
            <span className={`
                transition-colors duration-200
                ${active ? 'text-cadenza-neon' : 'text-cadenza-light/40 group-hover:text-cadenza-light'}
            `}>
                {icon}
            </span>
            <span className="font-bold text-[11px] uppercase tracking-wider leading-none flex-1 text-left">
                {label}
            </span>
            {hasDropdown && (
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    {Icons.chevron}
                </span>
            )}
            {disabled && (
                <span className="text-[7px] font-black uppercase tracking-widest
                                 bg-cadenza-border/50 text-cadenza-light/30
                                 px-1.5 py-0.5 rounded border border-cadenza-border">
                    Pronto
                </span>
            )}
        </button>
    );
}

function StatRow({ icon, label, value, valueClass }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cadenza-light/40">
                {icon}
                <span className="text-[9px] font-semibold uppercase tracking-widest text-cadenza-light/50">
                    {label}
                </span>
            </div>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${valueClass}`}>
                {value}
            </span>
        </div>
    );
}

/* ─── componente principal ─────────────────────────────────────────────────── */
export default function Sidebar({ isOpen, setIsOpen, isDark, setIsDark, showUserMenu = true }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [nombreUsuario] = useState(obtenerNombreDelToken);
    
    const [obras, setObras] = useState([]);
    const [isEstudioMenuOpen, setIsEstudioMenuOpen] = useState(false);
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [showDocsModal, setShowDocsModal] = useState(false);

    // ─── ESTADOS PARA LA INSTALACIÓN DE LA PWA ───
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        // Atrapa el evento que lanza el navegador cuando detecta una PWA válida
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault(); // Evita que salga el aviso feo por defecto
            setDeferredPrompt(e); // Guarda el evento para usarlo luego
            setIsInstallable(true); // Muestra nuestro botón personalizado
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Oculta el botón si la app ya fue instalada
        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt(); // Muestra el diálogo nativo de instalación
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
        setDeferredPrompt(null);
    };
    // ─────────────────────────────────────────────

    useEffect(() => {
        const fetchObras = async () => {
            const token = localStorage.getItem('cadenza_token');
            if (!token) return;
            try {
                const response = await fetch('http://127.0.0.1:8000/api/v1/mis-obras', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setObras(data);
                }
            } catch (error) {
                console.error("Error cargando obras en sidebar:", error);
            }
        };
        fetchObras();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('cadenza_token');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const abrirObra = (obra) => {
        navigate('/estudio', {
            state: { 
                nombreObra: obra.title, 
                autorObra: obra.artist, 
                backingUrl: obra.backing_url, 
                bpmDetectado: obra.bpm, 
                contextoMusicologico: obra.contextoMusicologico
            } 
        });
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-cadenza-bg/70 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-cadenza-card border-r border-cadenza-border
                shadow-[4px_0_32px_rgba(0,0,0,0.2)]
                transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                transition-transform duration-300 ease-in-out
            `}>

                {/* ── CABECERA (Logo a medida 70px) ─────────────────── */}
                <div className="px-5 pt-8 pb-6 flex items-center justify-between border-b border-cadenza-border flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Contenedor del Logo ajustado a 70px exactos */}
                        <div className="relative w-[70px] h-[70px] flex-shrink-0 flex items-center justify-center">
                            <img 
                                src={logoImagen} 
                                alt="Icono Cadenza" 
                                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]" 
                            />
                        </div>
                        
                        {/* Título CADENZA con whitespace-nowrap de seguridad */}
                        <div className="overflow-hidden">
                            <h2 className="text-[15px] font-black text-cadenza-text tracking-[0.2em] leading-none mb-1.5">
                                CADENZA
                            </h2>
                            <div className="text-cadenza-neon/40 font-bold text-[7px] uppercase tracking-[0.3em] whitespace-nowrap">
                                AI AUDIO INSIGHTS
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-cadenza-light/40 hover:text-cadenza-text hover:bg-cadenza-border/50 transition-all ml-1">
                        {Icons.close}
                    </button>
                </div>

                {/* ── CUERPO SCROLLABLE ────── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-8 space-y-8 custom-scrollbar">
                    
                    {/* Navegación principal */}
                    <div>
                        <SectionLabel text="Menú Principal" />
                        <div className="space-y-0.5">
                            <NavItem icon={Icons.home} label="Dashboard" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />
                            
                            <div className="space-y-1">
                                <NavItem icon={Icons.piano} label="Estudio Virtual" active={isActive('/estudio')} hasDropdown isOpen={isEstudioMenuOpen} onClick={() => setIsEstudioMenuOpen(!isEstudioMenuOpen)} />
                                {isEstudioMenuOpen && (
                                    <div className="pl-6 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                        {obras.length > 0 ? obras.map((obra) => (
                                            <button key={obra.id} onClick={() => abrirObra(obra)} className="group/item w-full flex items-center gap-3 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide text-cadenza-text/40 hover:text-cadenza-neon hover:bg-cadenza-neon/5 transition-all">
                                                <span className="opacity-40 group-hover/item:opacity-100 transition-opacity">{Icons.music}</span>
                                                <span className="truncate">{obra.title}</span>
                                            </button>
                                        )) : <p className="text-[9px] text-cadenza-light/30 italic px-3 py-2">Biblioteca vacía</p>}
                                    </div>
                                )}
                            </div>
                            <NavItem icon={Icons.ear} label="Generador de Partituras" disabled />
                        </div>
                    </div>

                    {/* Engine settings */}
                    <div>
                        <SectionLabel text="Engine" />
                        <div className="rounded-xl p-3 space-y-3 bg-cadenza-bg/60 border border-cadenza-border">
                            <StatRow icon={Icons.chip} label="IA Engine" value="DEMUCS V4" valueClass="bg-cadenza-blue/15 text-cadenza-blue border-cadenza-blue/30" />
                            <StatRow icon={Icons.signal} label="Latencia" value="BAJA · 11ms" valueClass="bg-green-500/15 text-green-500 border-green-500/25" />
                            <div className="h-px bg-cadenza-border" />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-cadenza-light/40">{Icons.moon}</span>
                                    <span className="text-[9px] font-semibold uppercase tracking-widest text-cadenza-light/50">Modo Oscuro</span>
                                </div>
                                <button onClick={() => setIsDark(!isDark)} className={`relative w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${isDark ? 'bg-cadenza-neon shadow-[0_0_10px] shadow-cadenza-neon/30' : 'bg-cadenza-border'}`}>
                                    <div className={`w-4 h-4 bg-cadenza-card rounded-full shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Soporte */}
                    <div>
                        <SectionLabel text="Soporte" />
                        <div className="space-y-0.5">
                            <NavItem icon={Icons.docs} label="Documentación" onClick={() => setShowDocsModal(true)} />
                            <NavItem icon={Icons.author} label="Sobre el Autor" onClick={() => setShowAuthorModal(true)} />
                        </div>
                    </div>
                </div>

                {/* ── FOOTER DE USUARIO ───────────────────── */}
                {showUserMenu && (
                    <div className="px-3 pb-5 pt-5 border-t border-cadenza-border flex-shrink-0">
                        <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-xl hover:bg-cadenza-border/30 transition-colors cursor-default">
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-cadenza-blue/15 border border-cadenza-border text-cadenza-neon font-black text-sm">
                                {nombreUsuario.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-[11px] font-black text-cadenza-text uppercase tracking-tight truncate leading-tight">{nombreUsuario}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_1px] shadow-green-500/40" />
                                    <span className="text-[8px] font-bold text-cadenza-light/40 uppercase tracking-widest">Plan Free</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón de Instalación PWA (Solo visible si el navegador lo permite y no está instalada) */}
                        {isInstallable && (
                            <button 
                                onClick={handleInstallClick} 
                                className="group flex items-center justify-center gap-2 w-full py-2.5 mb-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] bg-cadenza-neon/10 text-cadenza-neon border border-cadenza-neon/30 hover:bg-cadenza-neon hover:text-cadenza-bg hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all duration-300"
                            >
                                {Icons.download} <span>Instalar App</span>
                            </button>
                        )}

                        <button onClick={handleLogout} className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-cadenza-card hover:border-red-500 hover:shadow-lg hover:shadow-red-500/15 transition-all duration-300">
                            {Icons.logout} <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* ── MODALES MANTENIDOS ── */}
            {showAuthorModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cadenza-bg/80 backdrop-blur-md" onClick={() => setShowAuthorModal(false)}>
                    <div className="relative w-full max-w-md bg-cadenza-card border border-cadenza-border rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden" onClick={e => e.stopPropagation()}>
                        
                        {/* Fondo Decorativo */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cadenza-neon/10 rounded-full blur-[50px] pointer-events-none"></div>

                        <button onClick={() => setShowAuthorModal(false)} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-cadenza-bg/50 text-cadenza-light/40 hover:text-cadenza-text hover:bg-cadenza-border/50 transition-all cursor-pointer">
                            {Icons.close}
                        </button>
                        
                        <div className="p-8 pb-6 flex flex-col items-center text-center relative z-10">
                            {/* Avatar Icon */}
                            <div className="relative mb-6 group">
                                <div className="absolute inset-0 bg-cadenza-neon rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                                <div className="relative w-24 h-24 rounded-full bg-cadenza-bg border border-cadenza-neon/50 flex items-center justify-center shadow-inner overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-cadenza-neon/10 to-transparent"></div>
                                    <span className="text-4xl text-cadenza-neon relative z-10 scale-125">{Icons.author}</span>
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-cadenza-text tracking-widest uppercase mb-1 drop-shadow-md">
                                Álvaro Llamas Martín
                            </h3>
                            <p className="text-[10px] font-bold text-cadenza-neon uppercase tracking-[0.3em] mb-5">
                                Creador de Cadenza
                            </p>
                            
                            <div className="bg-cadenza-bg/40 border border-cadenza-border/50 rounded-xl p-5 mb-6 shadow-inner">
                                <p className="text-cadenza-light/80 text-xs leading-relaxed">
                                    Cadenza es un proyecto desarrollado con pasión por la música y la tecnología. 
                                    Su objetivo es democratizar el aprendizaje musical utilizando el poder de la 
                                    <span className="text-cadenza-neon font-semibold"> Inteligencia Artificial </span>
                                    para ofrecer una experiencia inmersiva y única.
                                </p>
                            </div>
                            
                            {/* Redes */}
                            <div className="flex gap-3 w-full">
                                <a href="https://github.com/llamass06" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cadenza-bg border border-cadenza-border hover:border-cadenza-light/30 hover:bg-white/5 text-cadenza-light hover:text-white transition-all group">
                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                                </a>
                                
                                <a href="https://linkedin.com/in/alvaro-llamas" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/30 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 text-[#0077b5] hover:text-[#00a0dc] transition-all group shadow-[0_0_15px_rgba(0,119,181,0)] hover:shadow-[0_0_15px_rgba(0,119,181,0.2)]">
                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5] group-hover:text-[#00a0dc]">LinkedIn</span>
                                </a>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-cadenza-bg/80 border-t border-cadenza-border px-8 py-4 flex justify-between items-center text-[9px] uppercase tracking-widest text-cadenza-light/40 font-bold">
                            <span>Versión 1.0.0</span>
                            <span>© 2026 Cadenza</span>
                        </div>
                    </div>
                </div>
            )}
            {showDocsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cadenza-bg/80 backdrop-blur-md" onClick={() => setShowDocsModal(false)}>
                    <div className="relative w-full max-w-lg bg-cadenza-card border border-cadenza-border rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowDocsModal(false)} className="absolute top-4 right-4 text-cadenza-light/40 hover:text-cadenza-text transition-colors z-10">
                            {Icons.close}
                        </button>
                        
                        <div className="flex items-center gap-4 mb-6 flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-cadenza-neon/10 border border-cadenza-neon/30 flex items-center justify-center text-cadenza-neon">
                                <span className="scale-125">{Icons.docs}</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-cadenza-text tracking-widest uppercase">Documentación</h3>
                                <p className="text-xs text-cadenza-light/50 font-bold uppercase tracking-wider">Flujo de la Aplicación</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                            
                            {/* Flujo Visual */}
                            <div className="bg-cadenza-bg/50 p-6 rounded-xl border border-cadenza-border relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cadenza-neon/5 rounded-full blur-2xl"></div>
                                
                                <h4 className="text-sm font-black text-cadenza-text mb-6 flex items-center gap-2 uppercase tracking-widest">
                                    <span className="w-2 h-2 rounded-full bg-cadenza-neon shadow-[0_0_8px_rgba(0,242,255,0.8)]"></span>
                                    Cómo funciona
                                </h4>
                                
                                <div className="flex flex-col gap-6 relative">
                                    {/* Línea conectora */}
                                    <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cadenza-neon via-cadenza-blue to-cadenza-border/30 opacity-50"></div>
                                    
                                    {/* Paso 1 */}
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-neon/50 flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.15)] relative">
                                            <div className="absolute inset-0 bg-cadenza-neon/10 rounded-xl animate-pulse"></div>
                                            <span className="text-[10px] font-black text-cadenza-neon uppercase relative z-10">Paso</span>
                                            <span className="text-lg font-black text-cadenza-text leading-none relative z-10">1</span>
                                        </div>
                                        <div className="pt-1.5">
                                            <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Subida de Audio</h5>
                                            <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Sube tus pistas en formato de audio al sistema desde la biblioteca.</p>
                                        </div>
                                    </div>
                                    
                                    {/* Paso 2 */}
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-blue/50 flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                            <span className="text-[10px] font-black text-cadenza-blue uppercase">Paso</span>
                                            <span className="text-lg font-black text-cadenza-text leading-none">2</span>
                                        </div>
                                        <div className="pt-1.5">
                                            <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Procesamiento IA</h5>
                                            <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Nuestro motor Demucs V4 analiza el tempo, extrae el contexto y separa los instrumentos.</p>
                                        </div>
                                    </div>
                                    
                                    {/* Paso 3 */}
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-12 h-12 rounded-xl bg-cadenza-card border border-cadenza-border flex flex-col items-center justify-center flex-shrink-0">
                                            <span className="text-[10px] font-black text-cadenza-light/50 uppercase">Paso</span>
                                            <span className="text-lg font-black text-cadenza-text leading-none">3</span>
                                        </div>
                                        <div className="pt-1.5">
                                            <h5 className="text-xs font-bold text-cadenza-text uppercase tracking-wider mb-1">Estudio Virtual</h5>
                                            <p className="text-[10px] text-cadenza-light/60 leading-relaxed">Interactúa con la obra: visualiza partituras, muta pistas o reproduce el backing track.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botón Descargar Manual */}
                            <button className="group relative w-full flex items-center justify-center gap-4 py-4 rounded-xl bg-cadenza-card border border-cadenza-border hover:border-cadenza-neon/50 transition-all overflow-hidden" onClick={(e) => e.preventDefault()}>
                                <div className="absolute inset-0 bg-gradient-to-r from-cadenza-neon/0 via-cadenza-neon/5 to-cadenza-neon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                <div className="w-10 h-10 rounded-lg bg-cadenza-neon/10 border border-cadenza-neon/20 text-cadenza-neon flex items-center justify-center shadow-[0_0_10px_rgba(0,242,255,0.2)]">
                                    <span className="scale-125">{Icons.download}</span>
                                </div>
                                <div className="text-left flex-1">
                                    <span className="block text-xs font-black text-cadenza-text uppercase tracking-widest mb-0.5">Manual de Usuario</span>
                                    <span className="block text-[9px] font-bold text-cadenza-light/40 uppercase tracking-wider">PDF · 2.4 MB · <span className="text-cadenza-neon/70">Próximamente</span></span>
                                </div>
                            </button>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-cadenza-border flex justify-end flex-shrink-0">
                            <button onClick={() => setShowDocsModal(false)} className="px-6 py-2 rounded-xl bg-cadenza-border/50 text-cadenza-text font-bold text-xs uppercase tracking-widest hover:bg-cadenza-border hover:text-white transition-all">
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}