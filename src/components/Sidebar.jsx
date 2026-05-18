import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { IconHome, IconPiano, IconEar, IconDocs, IconAuthor, IconSettings, IconMusicBot, IconPlan } from './icons';
import AuthorModal from './modals/AuthorModal';
import DocsModal from './modals/DocsModal';

import { obtenerNombreDelToken } from '../utils/auth';
import { usePWAInstall } from '../utils/usePWAInstall';

import { SectionLabel } from './sidebar/SectionLabel';
import { NavItem } from './sidebar/NavItem';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { EnginePanel } from './sidebar/EnginePanel';
import { UserFooter } from './sidebar/UserFooter';

/**
 * Sidebar
 *
 * Panel de navegación lateral fijo de Cadenza. Se desliza desde la izquierda
 * con una transición CSS (translate-x). En móvil incluye un overlay que cierra
 * el panel al tocarlo.
 *
 * Secciones:
 *  1. Cabecera        — Logo + título + botón de cierre.
 *  2. Menú principal  — Dashboard, Estudio Virtual, Ajustes (deshabilitado), Generador.
 *  3. Engine          — Estado del modelo IA + toggle de modo oscuro.
 *  4. Soporte         — Documentación y Sobre el Autor (abren modales).
 *  5. Footer de usuario — Avatar, botón PWA y cerrar sesión (solo si showUserMenu=true).
 *
 * @param {boolean}  isOpen              - Si la Sidebar está abierta.
 * @param {Function} setIsOpen           - Setter para abrir/cerrar la Sidebar.
 * @param {boolean}  isDark              - Estado del modo oscuro.
 * @param {Function} setIsDark           - Setter del modo oscuro.
 * @param {boolean}  [showUserMenu=true] - Oculta el footer en páginas de auth.
 */
export default function Sidebar({ isOpen, setIsOpen, isDark, setIsDark, showUserMenu = true }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [nombreUsuario] = useState(obtenerNombreDelToken);
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [showDocsModal, setShowDocsModal] = useState(false);

    const { isInstallable, handleInstallClick } = usePWAInstall();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('cadenza_token');
        navigate('/');
    };

    return (
        <>
            {/* Overlay semitransparente (solo móvil) */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-cadenza-bg/70 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/*
             * Panel lateral.
             * translate-x-0 / -translate-x-full controlan la animación de entrada/salida.
             * z-50 asegura que quede por encima del overlay (z-40).
             */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-cadenza-card border-r border-cadenza-border
                shadow-[4px_0_32px_rgba(0,0,0,0.2)]
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>

                {/* ── Cabecera ── */}
                <SidebarHeader onClose={() => setIsOpen(false)} />

                {/* ── Cuerpo scrollable ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-8 space-y-8 custom-scrollbar">

                    {/* Menú Principal */}
                    <div>
                        <SectionLabel text="Menú Principal" />
                        <div className="space-y-0.5">
                            <NavItem
                                icon={<IconHome />}
                                label="Dashboard"
                                active={isActive('/dashboard')}
                                onClick={() => navigate('/dashboard')}
                            />


                            <NavItem icon={<IconSettings />} label="Ajustes" disabled />

                            <NavItem icon={<IconEar />} label="Generador de Partituras" disabled />

                            <NavItem icon={<IconMusicBot />} label="Coda ChatBot" disabled />
                            
                            <NavItem icon={<IconPlan />} label="Mi Plan" disabled />
                        </div>
                    </div>

                    {/* Engine */}
                    <div>
                        <SectionLabel text="Engine" />
                        <EnginePanel isDark={isDark} setIsDark={setIsDark} />
                    </div>

                    {/* Soporte */}
                    <div>
                        <SectionLabel text="Soporte" />
                        <div className="space-y-0.5">
                            <NavItem
                                icon={<IconDocs />}
                                label="Documentación"
                                onClick={() => setShowDocsModal(true)}
                            />
                            <NavItem
                                icon={<IconAuthor />}
                                label="Sobre el Autor"
                                onClick={() => setShowAuthorModal(true)}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Footer de usuario ── */}
                {showUserMenu && (
                    <UserFooter
                        nombreUsuario={nombreUsuario}
                        isInstallable={isInstallable}
                        onInstallClick={handleInstallClick}
                        onLogout={handleLogout}
                    />
                )}
            </aside>

            {/* Modales montados fuera del aside para evitar conflictos de z-index */}
            {showAuthorModal && <AuthorModal onClose={() => setShowAuthorModal(false)} />}
            {showDocsModal && <DocsModal onClose={() => setShowDocsModal(false)} />}
        </>
    );
}