import { IconLogout, IconDownload } from '../icons';

/**
 * UserFooter
 *
 * Footer de la Sidebar con la tarjeta de perfil del usuario, el botón de
 * instalación de la PWA (opcional) y el botón de cerrar sesión.
 *
 * @param {string}   nombreUsuario      - Nombre de usuario a mostrar.
 * @param {boolean}  isInstallable      - Muestra el botón "Instalar App".
 * @param {Function} onInstallClick     - Dispara el diálogo de instalación PWA.
 * @param {Function} onLogout           - Cierra la sesión del usuario.
 */
export function UserFooter({ nombreUsuario, isInstallable, onInstallClick, onLogout }) {
    return (
        <div className="px-3 pb-5 pt-5 border-t border-cadenza-border flex-shrink-0">

            {/* Tarjeta de perfil */}
            <div className="flex items-center gap-3 px-2 py-2 mb-3 rounded-xl hover:bg-cadenza-border/30 transition-colors cursor-default">
                {/* Avatar: inicial del nombre */}
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-cadenza-blue/15 border border-cadenza-border text-cadenza-neon font-black text-sm">
                    {nombreUsuario.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-[11px] font-black text-cadenza-text uppercase tracking-tight truncate leading-tight">
                        {nombreUsuario}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        {/* Punto verde pulsante — sesión activa */}
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_1px] shadow-green-500/40" />
                        <span className="text-[8px] font-bold text-cadenza-light/40 uppercase tracking-widest">
                            Plan Free
                        </span>
                    </div>
                </div>
            </div>

            {/* Botón instalar PWA — visible solo si el navegador emitió beforeinstallprompt */}
            {isInstallable && (
                <button
                    onClick={onInstallClick}
                    className="group flex items-center justify-center gap-2 w-full py-2.5 mb-2 rounded-xl
                               font-black text-[9px] uppercase tracking-[0.2em]
                               bg-cadenza-neon/10 text-cadenza-neon border border-cadenza-neon/30
                               hover:bg-cadenza-neon hover:text-cadenza-bg
                               hover:shadow-[0_0_15px_rgba(0,242,255,0.4)]
                               transition-all duration-300"
                >
                    <IconDownload />
                    <span>Instalar App</span>
                </button>
            )}

            {/* Cerrar sesión */}
            <button
                onClick={onLogout}
                className="group flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                           font-black text-[9px] uppercase tracking-[0.2em]
                           border border-red-500/20 text-red-500/60
                           hover:bg-red-500 hover:text-cadenza-card hover:border-red-500
                           hover:shadow-lg hover:shadow-red-500/15
                           transition-all duration-300"
            >
                <IconLogout />
                <span>Cerrar Sesión</span>
            </button>
        </div>
    );
}
