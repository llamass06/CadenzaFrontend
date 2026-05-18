/**
 * StatRow
 *
 * Fila de estadística del panel "Engine": icono + etiqueta + badge de valor.
 *
 * @param {React.ReactNode} icon       - Icono descriptivo de la métrica.
 * @param {string}          label      - Nombre de la métrica.
 * @param {string}          value      - Valor a mostrar en el badge.
 * @param {string}          valueClass - Clases Tailwind del badge (color según estado).
 */
export function StatRow({ icon, label, value, valueClass }) {
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
