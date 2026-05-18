import { IconChevron } from '../icons';

/**
 * NavItem
 *
 * Botón de navegación de la Sidebar con tres estados visuales:
 *  - active   → fondo neón + indicador lateral izquierdo.
 *  - disabled → texto atenuado + badge "Pronto" + cursor bloqueado.
 *  - default  → hover suave.
 *
 * @param {React.ReactNode} icon          - Icono a mostrar a la izquierda.
 * @param {string}          label         - Texto del botón.
 * @param {boolean}         active        - Si es la ruta activa actual.
 * @param {Function}        onClick       - Handler de clic.
 * @param {boolean}         [disabled]    - Bloquea la interacción y muestra "Pronto".
 * @param {boolean}         [hasDropdown] - Muestra un chevron animado para submenús.
 * @param {boolean}         [isOpen]      - Estado abierto/cerrado del submenú.
 */
export function NavItem({
    icon,
    label,
    active = false,
    onClick,
    disabled = false,
    hasDropdown = false,
    isOpen = false,
}) {
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
            {/* Indicador lateral neón — visible solo en el ítem activo */}
            {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cadenza-neon rounded-r-full" />
            )}

            {/* Icono */}
            <span className={`
                transition-colors duration-200
                ${active ? 'text-cadenza-neon' : 'text-cadenza-light/40 group-hover:text-cadenza-light'}
            `}>
                {icon}
            </span>

            {/* Etiqueta */}
            <span className="font-bold text-[11px] uppercase tracking-wider leading-none flex-1 text-left">
                {label}
            </span>

            {/* Chevron — indica si el submenú está abierto */}
            {hasDropdown && (
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <IconChevron />
                </span>
            )}

            {/* Badge "Pronto" — solo en ítems deshabilitados */}
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
