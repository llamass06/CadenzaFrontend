import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Estudio() {
    const navigate = useNavigate();

    // ESTADOS
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [bpm, setBpm] = useState(120);
    const [isDark, setIsDark] = useState(true);
    const [fontSize, setFontSize] = useState('text-sm');
    const [obraInfo, setObraInfo] = useState("Cargando información histórica de la obra...");

    // Aplicar modo oscuro/claro
    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

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

            {/* 🎛️ CONTENIDO PRINCIPAL */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <div className="p-6 w-full">

                    {/* Cabecera */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-cadenza-border pb-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className={`text-2xl p-1.5 hover:bg-cadenza-card rounded-md transition-colors ${isSidebarOpen ? 'opacity-0 scale-0 hidden' : 'opacity-100 scale-100'}`}
                            >
                                ☰
                            </button>
                            <div className="text-left">
                                <h1 className="text-2xl font-black tracking-tight">Estudio <span className="text-cadenza-neon">Virtual</span></h1>
                                <p className="text-cadenza-light font-semibold mt-0.5 uppercase tracking-widest text-[10px]">Chopin: Nocturno Op. 9 No. 2</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-widest text-cadenza-light hover:text-cadenza-neon transition-colors border-b-2 border-transparent hover:border-cadenza-neon"
                        >
                            ← Volver al Dashboard
                        </button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                        {/* COLUMNA PRINCIPAL */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Reproductor Principal */}
                            <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-md">
                                <h2 className="text-lg font-black mb-4 text-cadenza-text uppercase tracking-tight">Acompañamiento Orquestal</h2>
                                <div className="h-28 bg-slate-100 dark:bg-black/40 rounded-xl flex items-center justify-center border border-dashed border-cadenza-border mb-6 group overflow-hidden relative">
                                    <div className="absolute inset-0 bg-cadenza-neon/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <span className="text-cadenza-neon font-bold tracking-widest text-[10px] uppercase animate-pulse">Waveform Engine v1.0</span>
                                </div>
                                <div className="flex items-center space-x-6 justify-center">
                                    <button className="text-xl text-cadenza-light hover:text-cadenza-neon transition">⏪</button>
                                    <button className="w-14 h-14 rounded-full bg-cadenza-neon text-white dark:text-black flex items-center justify-center text-xl shadow-[0_5px_15px_rgba(0,242,255,0.3)] hover:scale-105 transition-transform">▶</button>
                                    <button className="text-xl text-cadenza-light hover:text-cadenza-neon transition">⏩</button>
                                </div>
                            </section>

                            {/* Recuadro Informativo */}
                            <section className="bg-cadenza-card p-6 rounded-2xl border-l-4 border-cadenza-neon shadow-md">
                                <h3 className="flex items-center space-x-2 text-base font-black text-cadenza-neon mb-3 uppercase tracking-tight">
                                    <span className="text-lg">✨</span> <span>Contexto de la Obra</span>
                                </h3>
                                <p className="text-cadenza-text font-medium leading-relaxed opacity-90 text-sm text-left">
                                    {obraInfo}
                                </p>
                            </section>
                        </div>

                        {/* COLUMNA DE HERRAMIENTAS */}
                        <div className="lg:col-span-3 space-y-6">

                            {/* Metrónomo */}
                            <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm">
                                <h3 className="text-sm font-black text-cadenza-light mb-4 uppercase tracking-widest border-b border-cadenza-border pb-2">Metrónomo</h3>
                                <div className="text-center py-2">
                                    <div className="text-5xl font-black mb-5 text-cadenza-text tracking-tighter">{bpm}</div>
                                    <div className="flex justify-center space-x-3">
                                        <button onClick={() => setBpm(b => b - 1)} className="w-10 h-10 bg-cadenza-bg border border-cadenza-border rounded-lg text-lg font-bold hover:border-cadenza-neon transition-colors">-</button>
                                        <button className="flex-1 bg-cadenza-neon text-white dark:text-black font-black rounded-lg shadow-md hover:opacity-90 transition-opacity uppercase text-xs tracking-widest">Iniciar</button>
                                        <button onClick={() => setBpm(b => b + 1)} className="w-10 h-10 bg-cadenza-bg border border-cadenza-border rounded-lg text-lg font-bold hover:border-cadenza-neon transition-colors">+</button>
                                    </div>
                                </div>
                            </section>

                            {/* Grabación */}
                            <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm">
                                <h3 className="text-sm font-black text-cadenza-light mb-4 uppercase tracking-widest border-b border-cadenza-border pb-2">Grabación</h3>

                                <div className="flex justify-center mb-6 mt-2">
                                    <button className="flex items-center space-x-3 px-6 py-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border-2 border-cyan-300 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-400 font-black tracking-widest hover:border-cyan-400 dark:hover:border-cyan-500 transition-all shadow-sm">
                                        <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></span>
                                        <span className="text-sm">GRABAR</span>
                                    </button>
                                </div>

                                {/* Aviso UX */}
                                <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-900/40 rounded-xl p-4 text-xs text-cyan-800 dark:text-cyan-200 flex items-start space-x-3 transition-colors">
                                    <span className="text-lg">🎧</span>
                                    <p className="font-semibold leading-relaxed">
                                        Para evitar que el acompañamiento se filtre en tu micrófono, usa auriculares.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* COLUMNA VISUALIZADOR DE ONDAS */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-cadenza-card p-6 rounded-2xl border border-cadenza-border shadow-sm h-full flex flex-col min-h-[480px]">
                                <h3 className="text-sm font-black text-cadenza-light mb-4 uppercase tracking-widest border-b border-cadenza-border pb-2 text-center">Espectro</h3>
                                <div className="flex-1 flex items-end justify-center space-x-1.5 pb-2">
                                    {[40, 70, 100, 50, 80, 30, 90].map((height, i) => {
                                        const colors = ['bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500'];
                                        return (
                                            <div
                                                key={i}
                                                className={`w-3 rounded-t-sm animate-pulse ${colors[i % colors.length]}`}
                                                style={{ height: `${height}%`, animationDelay: `${i * 150}ms` }}
                                            ></div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}