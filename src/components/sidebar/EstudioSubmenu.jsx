import { IconMusic } from '../icons';

/**
 * EstudioSubmenu
 *
 * Submenú desplegable de Estudio Virtual con la lista de obras del usuario.
 * Se anima con slide desde arriba al montarse.
 *
 * @param {Array}    obras     - Lista de obras a mostrar.
 * @param {Function} onSelect  - Callback al seleccionar una obra.
 */
export function EstudioSubmenu({ obras, onSelect }) {
    return (
        <div className="pl-6 pr-2 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
            {obras.length > 0
                ? obras.map((obra) => (
                    <button
                        key={obra.id}
                        onClick={() => onSelect(obra)}
                        className="group/item w-full flex items-center gap-3 py-2 px-3 rounded-lg
                                   text-[10px] font-bold uppercase tracking-wide
                                   text-cadenza-text/40 hover:text-cadenza-neon hover:bg-cadenza-neon/5
                                   transition-all"
                    >
                        <span className="opacity-40 group-hover/item:opacity-100 transition-opacity">
                            <IconMusic />
                        </span>
                        <span className="truncate">{obra.title}</span>
                    </button>
                ))
                : (
                    <p className="text-[9px] text-cadenza-light/30 italic px-3 py-2">
                        Biblioteca vacía
                    </p>
                )
            }
        </div>
    );
}
