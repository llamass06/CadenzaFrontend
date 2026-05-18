import React from 'react';
import { IconClose } from '../icons';
import authorPhoto from '../../assets/yoAhora.jpeg';

/**
 * AuthorModal
 *
 * Modal informativo que muestra la tarjeta de perfil del creador de Cadenza.
 * Se renderiza centrado sobre un overlay oscuro con efecto blur. Al hacer clic
 * fuera del panel (sobre el overlay) se cierra; el clic dentro del panel se
 * detiene con stopPropagation para evitar el cierre accidental.
 *
 * Contiene:
 *  - Avatar con halo neón animado al hover.
 *  - Nombre y rol del autor.
 *  - Descripción del proyecto.
 *  - Botones de enlace a GitHub y LinkedIn.
 *  - Footer con versión y copyright.
 *
 * @param {Function} onClose - Callback que cierra el modal (llamado desde el overlay y el botón ×).
 */
export default function AuthorModal({ onClose }) {
    return (
        /*
         * Overlay de pantalla completa.
         * - z-[100] para quedar sobre todos los demás elementos del Dashboard.
         * - backdrop-blur-md + bg-cadenza-bg/80 para el efecto de cristal esmerilado.
         * - El clic en el overlay llama a onClose para cerrar el modal.
         */
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cadenza-bg/80 backdrop-blur-md" onClick={onClose}>

            {/*
             * Panel del modal.
             * - max-w-md limita el ancho para mantener la legibilidad.
             * - stopPropagation evita que el clic dentro del panel propague al overlay y lo cierre.
             */}
            <div className="relative w-full max-w-md bg-cadenza-card border border-cadenza-border rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Halo decorativo de fondo — gradiente neón difuminado en la parte superior */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cadenza-neon/10 rounded-full blur-[50px] pointer-events-none"></div>

                {/* Botón de cierre (×) — posicionado en la esquina superior derecha */}
                <button onClick={onClose} className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-cadenza-bg/50 text-cadenza-light/40 hover:text-cadenza-text hover:bg-cadenza-border/50 transition-all cursor-pointer">
                    <IconClose />
                </button>

                {/* ── Cuerpo principal ── */}
                <div className="p-8 pb-6 flex flex-col items-center text-center relative z-10">

                    {/* Avatar con halo neón que se intensifica al hacer hover */}
                    <div className="relative mb-6 group">
                        {/* Círculo del avatar con borde neón — muestra la foto real del autor */}
                        <div className="relative w-24 h-24 rounded-full border-2 border-cadenza-neon/60 shadow-[0_0_18px_rgba(var(--color-cadenza-neon),0.35)] overflow-hidden">
                            <img
                                src={authorPhoto}
                                alt="Foto de Álvaro Llamas Martín"
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>

                    {/* Nombre del autor */}
                    <h3 className="text-2xl font-black text-cadenza-text tracking-widest uppercase mb-1 drop-shadow-md">
                        Álvaro Llamas Martín
                    </h3>

                    {/* Rol / título del autor */}
                    <p className="text-[10px] font-bold text-cadenza-neon uppercase tracking-[0.3em] mb-5">
                        Creador de Cadenza
                    </p>

                    {/* Bloque de descripción del proyecto */}
                    <div className="bg-cadenza-bg/40 border border-cadenza-border/50 rounded-xl p-5 mb-6 shadow-inner">
                        <p className="text-cadenza-light/80 text-xs leading-relaxed">
                            Cadenza es un proyecto desarrollado con pasión por la música y la tecnología.
                            Su objetivo es democratizar el aprendizaje musical utilizando el poder de la
                            <span className="text-cadenza-neon font-semibold"> Inteligencia Artificial </span>
                            para ofrecer una experiencia inmersiva y única.
                        </p>
                    </div>

                    {/* ── Botones de redes sociales ── */}
                    <div className="flex gap-3 w-full">

                        {/* Enlace a GitHub — icono SVG inline del logo de GitHub */}
                        <a href="https://github.com/llamass06" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cadenza-bg border border-cadenza-border hover:border-cadenza-light/30 hover:bg-white/5 text-cadenza-light hover:text-white transition-all group">
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                        </a>

                        {/* Enlace a LinkedIn — icono SVG inline del logo de LinkedIn con colores de marca */}
                        <a href="https://linkedin.com/in/alvaro-llamas" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0077b5]/10 border border-[#0077b5]/30 hover:bg-[#0077b5]/20 hover:border-[#0077b5]/50 text-[#0077b5] hover:text-[#00a0dc] transition-all group shadow-[0_0_15px_rgba(0,119,181,0)] hover:shadow-[0_0_15px_rgba(0,119,181,0.2)]">
                            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0077b5] group-hover:text-[#00a0dc]">LinkedIn</span>
                        </a>
                    </div>
                </div>

                {/* Footer — versión de la app y copyright */}
                <div className="bg-cadenza-bg/80 border-t border-cadenza-border px-8 py-4 flex justify-between items-center text-[9px] uppercase tracking-widest text-cadenza-light/40 font-bold">
                    <span>Versión 1.0.0</span>
                    <span>© 2026 Cadenza</span>
                </div>
            </div>
        </div>
    );
}
