/**
 * SectionLabel
 *
 * Etiqueta de sección en mayúsculas para agrupar ítems del menú lateral.
 *
 * @param {string} text - Texto de la etiqueta.
 */
export function SectionLabel({ text }) {
    return (
        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-cadenza-light/50 px-2 mb-2">
            {text}
        </p>
    );
}
