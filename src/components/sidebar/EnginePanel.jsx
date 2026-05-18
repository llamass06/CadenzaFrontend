import { IconChip, IconServer, IconActivity, IconMoon } from '../icons';
import { StatRow } from './StatRow';

/**
 * EnginePanel
 *
 * Panel "Engine": muestra el estado del modelo IA, del servidor y del
 * rendimiento, más un toggle de modo oscuro.
 *
 * @param {boolean}  isDark    - Estado actual del modo oscuro.
 * @param {Function} setIsDark - Setter del modo oscuro.
 */
export function EnginePanel({ isDark, setIsDark }) {
    return (
        <div className="rounded-xl p-3 space-y-3 bg-cadenza-bg/60 border border-cadenza-border">
            <StatRow
                icon={<IconChip />}
                label="Modelo IA"
                value="HTDEMUCS v4"
                valueClass="bg-cadenza-neon/15 text-cadenza-neon border-cadenza-neon/30"
            />
            <StatRow
                icon={<IconServer />}
                label="Servidor"
                value="GPU ONLINE"
                valueClass="bg-green-500/15 text-green-500 border-green-500/25"
            />
            <StatRow
                icon={<IconActivity />}
                label="Rendimiento"
                value="ÓPTIMO"
                valueClass="bg-cadenza-blue/15 text-cadenza-blue border-cadenza-blue/30"
            />

            <div className="h-px bg-cadenza-border" />

            {/* Toggle modo oscuro */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconMoon className="w-4 h-4 text-cadenza-light/40" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-cadenza-light/50">
                        Modo Oscuro
                    </span>
                </div>
                {/*
                 * El thumb se desplaza con translate-x-4 cuando isDark=true.
                 * El track se tiñe de neón.
                 */}
                <button
                    onClick={() => setIsDark(!isDark)}
                    className={`relative w-9 h-5 rounded-full p-0.5 transition-all duration-300
                        ${isDark
                            ? 'bg-cadenza-neon shadow-[0_0_10px] shadow-cadenza-neon/30'
                            : 'bg-cadenza-border'
                        }`}
                >
                    <div className={`
                        w-4 h-4 bg-cadenza-card rounded-full shadow-sm
                        transform transition-transform duration-300
                        ${isDark ? 'translate-x-4' : 'translate-x-0'}
                    `} />
                </button>
            </div>
        </div>
    );
}
