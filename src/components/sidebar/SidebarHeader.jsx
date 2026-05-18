import logoImagen from '../../assets/Logo.png';
import { IconClose } from '../icons';

/**
 * SidebarHeader
 *
 * Cabecera de la Sidebar: logo + nombre de la app + botón de cierre.
 *
 * @param {Function} onClose - Cierra la Sidebar.
 */
export function SidebarHeader({ onClose }) {
    return (
        <div className="px-5 pt-8 pb-6 flex items-center justify-between border-b border-cadenza-border flex-shrink-0">
            <div className="flex items-center gap-3">
                {/* Logo con brillo neón sutil */}
                <div className="relative w-[70px] h-[70px] flex-shrink-0 flex items-center justify-center">
                    <img
                        src={logoImagen}
                        alt="Icono Cadenza"
                        className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,242,255,0.3)]"
                    />
                </div>

                {/* Nombre y subtítulo */}
                <div className="overflow-hidden">
                    <h2 className="text-[15px] font-black text-cadenza-text tracking-[0.2em] leading-none mb-1.5">
                        CADENZA
                    </h2>
                    <div className="text-cadenza-neon/40 font-bold text-[7px] uppercase tracking-[0.3em] whitespace-nowrap">
                        AI AUDIO INSIGHTS
                    </div>
                </div>
            </div>

            {/* Botón cerrar */}
            <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-cadenza-light/40 hover:text-cadenza-text hover:bg-cadenza-border/50 transition-all ml-1"
            >
                <IconClose />
            </button>
        </div>
    );
}
