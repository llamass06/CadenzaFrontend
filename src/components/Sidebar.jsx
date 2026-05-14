import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImagen from '../assets/Logo.png';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

/**
 * obtenerNombreDelToken
 *
 * Extrae el campo `username` del payload de un JWT almacenado en localStorage.
 * El payload de un JWT es la segunda sección (índice 1) separada por puntos,
 * codificada en Base64Url. Se convierte a Base64 estándar, se decodifica y
 * se parsea como JSON para leer el campo `username`.
 *
 * @returns {string} El nombre de usuario extraído del token, o 'Usuario' si no
 *                   existe token o el decode falla.
 */
const obtenerNombreDelToken = () => {
    const token = localStorage.getItem('cadenza_token');
    if (!token) return 'Usuario';
    try {
        // Extraemos el payload (parte central del JWT) y normalizamos Base64Url → Base64
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decodificamos respetando caracteres Unicode multi-byte
        const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload).username || 'Usuario';
    } catch {
        // Si el token está malformado o expirado, devolvemos el fallback
        return 'Usuario';
    }
};

import {
    IconHome, IconPiano, IconMusic, IconChevron, IconEar,
    IconDocs, IconAuthor, IconLogout, IconClose, IconDownload,
    IconChip, IconServer, IconActivity, IconMoon
} from './icons';
import AuthorModal from './modals/AuthorModal';
import DocsModal from './modals/DocsModal';
import { fetchMisObras } from '../services/api';

/* ─── SVG icons ────────────────────────────────────────────────────────────── */

/**
 * Icons
 *
 * Mapa de alias de iconos para evitar instanciar componentes JSX inline en
 * cada render. Permite referenciarlos como `Icons.home` en lugar de `<IconHome />`.
 */
const Icons = {
    home: <IconHome />,
    piano: <IconPiano />,
    music: <IconMusic />,
    chevron: <IconChevron />,
    ear: <IconEar />,
    docs: <IconDocs />,
    author: <IconAuthor />,
    logout: <IconLogout />,
    close: <IconClose />,
    download: <IconDownload />
};

/* ─── sub-components ───────────────────────────────────────────────────────── */

/**
 * SectionLabel
 *
 * Etiqueta de sección en mayúsculas para agrupar elementos del menú lateral.
 *
 * @param {string} text - Texto de la etiqueta.
 */
function SectionLabel({ text }) {
    return (
        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-cadenza-light/50 px-2 mb-2">
            {text}
        </p>
    );
}

/**
 * NavItem
 *
 * Botón de navegación de la Sidebar. Soporta tres estados visuales:
 *  - active   → fondo neón + indicador lateral izquierdo.
 *  - disabled → texto atenuado + badge "Pronto" + cursor bloqueado.
 *  - default  → hover suave.
 * Opcionalmente muestra un chevron animado para elementos con submenú.
 *
 * @param {React.ReactNode} icon         - Icono a mostrar a la izquierda.
 * @param {string}          label        - Texto del botón.
 * @param {boolean}         active       - Si es la ruta activa actual.
 * @param {Function}        onClick      - Handler de clic.
 * @param {boolean}         [disabled]   - Bloquea la interacción y muestra "Pronto".
 * @param {boolean}         [hasDropdown]- Si tiene submenú desplegable (muestra chevron).
 * @param {boolean}         [isOpen]     - Estado abierto/cerrado del submenú (rota el chevron).
 */
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
            {/* Indicador lateral neón — solo visible en el item activo */}
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cadenza-neon rounded-r-full" />
            )}

            {/* Icono — cambia de color según el estado del item */}
            <span className={`
                transition-colors duration-200
                ${active ? 'text-cadenza-neon' : 'text-cadenza-light/40 group-hover:text-cadenza-light'}
            `}>
                {icon}
            </span>

            {/* Etiqueta del item */}
            <span className="font-bold text-[11px] uppercase tracking-wider leading-none flex-1 text-left">
                {label}
            </span>

            {/* Chevron rotado — indica si el submenú está abierto o cerrado */}
            {hasDropdown && (
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    {Icons.chevron}
                </span>
            )}

            {/* Badge "Pronto" — visible solo en items deshabilitados */}
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

/**
 * StatRow
 *
 * Fila de estadística del panel "Engine" con icono, etiqueta y valor con badge.
 *
 * @param {React.ReactNode} icon       - Icono descriptivo de la métrica.
 * @param {string}          label      - Nombre de la métrica.
 * @param {string}          value      - Valor a mostrar en el badge.
 * @param {string}          valueClass - Clases Tailwind del badge (color según estado).
 */
function StatRow({ icon, label, value, valueClass }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-cadenza-light/40">
                {icon}
                <span className="text-[9px] font-semibold uppercase tracking-widest text-cadenza-light/50">
                    {label}
                </span>
            </div>
            {/* Badge con color dinámico según el estado de la métrica */}
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${valueClass}`}>
                {value}
            </span>
        </div>
    );
}

/* ─── componente principal ─────────────────────────────────────────────────── */

/**
 * Sidebar
 *
 * Panel de navegación lateral fijo de Cadenza. Se desliza desde la izquierda
 * con una transición CSS (translate-x). En móvil incluye un overlay de fondo
 * que cierra la Sidebar al tocarlo.
 *
 * Secciones:
 *  1. Cabecera    — Logo + título + botón de cierre.
 *  2. Menú principal — Dashboard, Estudio Virtual (con submenú de obras), Generador.
 *  3. Engine      — Estadísticas del modelo IA + toggle de modo oscuro.
 *  4. Soporte     — Documentación y Sobre el Autor (abren modales).
 *  5. Footer      — Avatar de usuario, botón instalar PWA y cerrar sesión
 *                   (solo visible si showUserMenu=true).
 *
 * @param {boolean}  isOpen        - Si la Sidebar está abierta.
 * @param {Function} setIsOpen     - Setter para abrir/cerrar la Sidebar.
 * @param {boolean}  isDark        - Estado del modo oscuro.
 * @param {Function} setIsDark     - Setter del modo oscuro.
 * @param {boolean}  [showUserMenu=true] - Muestra el footer de usuario (false en páginas de auth).
 */
export default function Sidebar({ isOpen, setIsOpen, isDark, setIsDark, showUserMenu = true }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Nombre del usuario extraído del JWT al montar el componente (no cambia en runtime)
    const [nombreUsuario] = useState(obtenerNombreDelToken);

    const [obras, setObras] = useState([]);                        // Lista de obras para el submenú de Estudio
    const [isEstudioMenuOpen, setIsEstudioMenuOpen] = useState(false); // Estado del submenú de Estudio
    const [showAuthorModal, setShowAuthorModal] = useState(false); // Controla el modal "Sobre el Autor"
    const [showDocsModal, setShowDocsModal] = useState(false);     // Controla el modal "Documentación"

    // ─── INSTALACIÓN PWA ────────────────────────────────────────────────────
    const [deferredPrompt, setDeferredPrompt] = useState(null);   // Evento nativo de instalación guardado
    const [isInstallable, setIsInstallable] = useState(false);    // Controla la visibilidad del botón "Instalar App"

    useEffect(() => {
        /*
         * El evento 'beforeinstallprompt' lo lanza el navegador cuando detecta
         * que la app cumple los criterios de PWA instalable.
         * Lo interceptamos con preventDefault() para evitar el banner nativo y
         * mostramos en su lugar nuestro botón personalizado en el footer.
         */
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();       // Suprime el banner automático del navegador
            setDeferredPrompt(e);     // Almacena el evento para dispararlo manualmente
            setIsInstallable(true);   // Activa el botón "Instalar App"
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 'appinstalled' se dispara cuando el usuario completa la instalación; ocultamos el botón
        window.addEventListener('appinstalled', () => {
            setIsInstallable(false);
            setDeferredPrompt(null);
        });

        // Limpieza: eliminamos el listener al desmontar para evitar fugas de memoria
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    /**
     * handleInstallClick
     * Dispara el diálogo nativo de instalación de la PWA usando el evento guardado.
     * Si el usuario acepta, ocultamos el botón; en cualquier caso liberamos el evento.
     */
    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();                            // Muestra el diálogo nativo del navegador
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstallable(false);                        // El usuario instaló la app
        }
        setDeferredPrompt(null);                            // El evento solo puede usarse una vez
    };
    // ────────────────────────────────────────────────────────────────────────

    // Carga las obras del usuario al montar para poblar el submenú de Estudio Virtual
    useEffect(() => {
        // No cargamos las obras si estamos en una página pública (login/registro)
        if (!showUserMenu) return;

        const loadObras = async () => {
            try {
                const data = await fetchMisObras();
                setObras(data);
            } catch (error) {
                console.error("Error cargando obras en sidebar:", error);
            }
        };
        loadObras();
    }, [showUserMenu]);

    /**
     * handleLogout
     * Elimina el token de sesión de localStorage y redirige a la página de inicio.
     */
    const handleLogout = () => {
        localStorage.removeItem('cadenza_token');
        navigate('/');
    };

    /** isActive — devuelve true si la ruta actual coincide exactamente con `path`. */
    const isActive = (path) => location.pathname === path;

    /**
     * abrirObra
     * Navega al Estudio Virtual pasando los metadatos de la obra por `state`
     * (evita exponerlos en la URL) y cierra la Sidebar.
     *
     * @param {Object} obra - Objeto de obra con title, artist, backing_url, bpm y contexto.
     */
    const abrirObra = (obra) => {
        navigate('/estudio', {
            state: {
                nombreObra: obra.title,
                autorObra: obra.artist,
                backingUrl: obra.backing_url,
                bpmDetectado: obra.bpm,
                contextoIA: obra.contexto
            }
        });
        setIsOpen(false); // Cierra la Sidebar al navegar para liberar espacio en la vista del Estudio
    };

    return (
        <>
            {/*
             * Overlay semitransparente para móvil.
             * Solo se renderiza cuando la Sidebar está abierta y en viewports pequeños (lg:hidden).
             * Un clic sobre él cierra la Sidebar sin navegar.
             */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-cadenza-bg/70 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/*
             * Panel lateral (aside).
             * - w-64: ancho fijo de 16rem.
             * - translate-x-0 / -translate-x-full: entrada/salida por la izquierda.
             * - z-50: por encima del overlay (z-40) y del contenido principal.
             */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-cadenza-card border-r border-cadenza-border
                shadow-[4px_0_32px_rgba(0,0,0,0.2)]
                transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                transition-transform duration-300 ease-in-out
            `}>

                {/* ── CABECERA: Logo + título CADENZA + botón de cierre ── */}
                <div className="px-5 pt-8 pb-6 flex items-center justify-between border-b border-cadenza-border flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Logo a tamaño fijo de 70×70 px con brillo neón sutil */}
                        <div className="relative w-[70px] h-[70px] flex-shrink-0 flex items-center justify-center">
                            <img
                                src={logoImagen}
                                alt="Icono Cadenza"
                                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]"
                            />
                        </div>

                        {/* Nombre de la app y subtítulo */}
                        <div className="overflow-hidden">
                            <h2 className="text-[15px] font-black text-cadenza-text tracking-[0.2em] leading-none mb-1.5">
                                CADENZA
                            </h2>
                            <div className="text-cadenza-neon/40 font-bold text-[7px] uppercase tracking-[0.3em] whitespace-nowrap">
                                AI AUDIO INSIGHTS
                            </div>
                        </div>
                    </div>

                    {/* Botón para cerrar la Sidebar (×) */}
                    <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-cadenza-light/40 hover:text-cadenza-text hover:bg-cadenza-border/50 transition-all ml-1">
                        {Icons.close}
                    </button>
                </div>

                {/* ── CUERPO SCROLLABLE: navegación + engine + soporte ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-8 space-y-8 custom-scrollbar">

                    {/* Sección: Menú Principal */}
                    <div>
                        <SectionLabel text="Menú Principal" />
                        <div className="space-y-0.5">
                            <NavItem icon={Icons.home} label="Dashboard" active={isActive('/dashboard')} onClick={() => navigate('/dashboard')} />

                            {/* Estudio Virtual con submenú desplegable de obras */}
                            <div className="space-y-1">
                                <NavItem
                                    icon={Icons.piano}
                                    label="Estudio Virtual"
                                    active={isActive('/estudio')}
                                    hasDropdown
                                    isOpen={isEstudioMenuOpen}
                                    onClick={() => setIsEstudioMenuOpen(!isEstudioMenuOpen)}
                                />

                                {/* Submenú de obras — animado con slide desde arriba */}
                                {isEstudioMenuOpen && (
                                    <div className="pl-6 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                                        {obras.length > 0 ? obras.map((obra) => (
                                            <button
                                                key={obra.id}
                                                onClick={() => abrirObra(obra)}
                                                className="group/item w-full flex items-center gap-3 py-2 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wide text-cadenza-text/40 hover:text-cadenza-neon hover:bg-cadenza-neon/5 transition-all"
                                            >
                                                <span className="opacity-40 group-hover/item:opacity-100 transition-opacity">{Icons.music}</span>
                                                <span className="truncate">{obra.title}</span>
                                            </button>
                                        )) : <p className="text-[9px] text-cadenza-light/30 italic px-3 py-2">Biblioteca vacía</p>}
                                    </div>
                                )}
                            </div>

                            {/* Generador de Partituras — deshabilitado, mostrará "Pronto" */}
                            <NavItem icon={Icons.ear} label="Generador de Partituras" disabled />
                        </div>
                    </div>

                    {/* Sección: Engine — estado del modelo de IA y toggle de tema */}
                    <div>
                        <SectionLabel text="Engine" />
                        <div className="rounded-xl p-3 space-y-3 bg-cadenza-bg/60 border border-cadenza-border">
                            {/* Modelo de separación de fuentes */}
                            <StatRow
                                icon={<IconChip />}
                                label="Modelo IA"
                                value="HTDEMUCS v4"
                                valueClass="bg-cadenza-neon/15 text-cadenza-neon border-cadenza-neon/30"
                            />
                            {/* Estado del servidor de inferencia */}
                            <StatRow
                                icon={<IconServer />}
                                label="Servidor"
                                value="GPU ONLINE"
                                valueClass="bg-green-500/15 text-green-500 border-green-500/25"
                            />
                            {/* Rendimiento general del sistema */}
                            <StatRow
                                icon={<IconActivity />}
                                label="Rendimiento"
                                value="ÓPTIMO"
                                valueClass="bg-cadenza-blue/15 text-cadenza-blue border-cadenza-blue/30"
                            />

                            <div className="h-px bg-cadenza-border" />

                            {/* Toggle de modo oscuro — pill animado que cambia de color */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <IconMoon className="w-4 h-4 text-cadenza-light/40" />
                                    <span className="text-[9px] font-semibold uppercase tracking-widest text-cadenza-light/50">Modo Oscuro</span>
                                </div>
                                {/*
                                 * El thumb (círculo blanco) se desplaza con translate-x-4
                                 * cuando isDark=true; el track se tiñe de neón.
                                 */}
                                <button onClick={() => setIsDark(!isDark)} className={`relative w-9 h-5 rounded-full p-0.5 transition-all duration-300 ${isDark ? 'bg-cadenza-neon shadow-[0_0_10px] shadow-cadenza-neon/30' : 'bg-cadenza-border'}`}>
                                    <div className={`w-4 h-4 bg-cadenza-card rounded-full shadow-sm transform transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sección: Soporte — abre los modales correspondientes */}
                    <div>
                        <SectionLabel text="Soporte" />
                        <div className="space-y-0.5">
                            <NavItem icon={<IconDocs />} label="Documentación" onClick={() => setShowDocsModal(true)} />
                            <NavItem icon={<IconAuthor />} label="Sobre el Autor" onClick={() => setShowAuthorModal(true)} />
                        </div>
                    </div>
                </div>

                {/*
                 * ── FOOTER DE USUARIO ──
                 * Solo visible cuando showUserMenu=true (páginas autenticadas).
                 * En páginas de auth (Login/Register) se oculta con showUserMenu=false.
                 */}
                {showUserMenu && (
                    <div className="px-3 pb-5 pt-5 border-t border-cadenza-border flex-shrink-0">

                        {/* Tarjeta de perfil: inicial del nombre + nombre + indicador de plan */}
                        <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-xl hover:bg-cadenza-border/30 transition-colors cursor-default">
                            {/* Avatar con inicial del nombre de usuario */}
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-cadenza-blue/15 border border-cadenza-border text-cadenza-neon font-black text-sm">
                                {nombreUsuario.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-[11px] font-black text-cadenza-text uppercase tracking-tight truncate leading-tight">{nombreUsuario}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {/* Punto verde pulsante — indica sesión activa */}
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_1px] shadow-green-500/40" />
                                    <span className="text-[8px] font-bold text-cadenza-light/40 uppercase tracking-widest">Plan Free</span>
                                </div>
                            </div>
                        </div>

                        {/*
                         * Botón "Instalar App" (PWA) — solo aparece si:
                         *  1. El navegador ha emitido el evento 'beforeinstallprompt'.
                         *  2. La app aún no está instalada ('appinstalled' no se ha disparado).
                         */}
                        {isInstallable && (
                            <button
                                onClick={handleInstallClick}
                                className="group flex items-center justify-center gap-2 w-full py-2.5 mb-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] bg-cadenza-neon/10 text-cadenza-neon border border-cadenza-neon/30 hover:bg-cadenza-neon hover:text-cadenza-bg hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all duration-300"
                            >
                                {Icons.download} <span>Instalar App</span>
                            </button>
                        )}

                        {/* Botón de cerrar sesión — elimina el token y redirige al inicio */}
                        <button onClick={handleLogout} className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-cadenza-card hover:border-red-500 hover:shadow-lg hover:shadow-red-500/15 transition-all duration-300">
                            {Icons.logout} <span>Cerrar Sesión</span>
                        </button>
                    </div>
                )}
            </aside>

            {/* Modales controlados por la Sidebar — montados fuera del aside para evitar z-index issues */}
            {showAuthorModal && <AuthorModal onClose={() => setShowAuthorModal(false)} />}
            {showDocsModal && <DocsModal onClose={() => setShowDocsModal(false)} />}
        </>
    );
}