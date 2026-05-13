import React, { useState } from 'react';
import { useThemeSettings } from '../utils/useThemeSettings';
import Sidebar from '../components/Sidebar';

/**
 * PasswordField
 *
 * Campo de contraseña reutilizable con toggle de visibilidad (ojo).
 * Centraliza la lógica de "mostrar/ocultar contraseña" y aplica el estilo
 * minimalista de Cadenza, compatible con modo claro y oscuro.
 *
 * @param {string}   label        - Etiqueta visible encima del input.
 * @param {string}   value        - Valor controlado del input.
 * @param {Function} onChange     - Handler de cambio para actualizar el estado del formulario padre.
 * @param {string}   placeholder  - Texto de ayuda dentro del input cuando está vacío.
 * @param {boolean}  [required=true] - Indica si el campo es obligatorio en el formulario.
 */
export function PasswordField({ label, value, onChange, placeholder, required = true }) {
    // Estado local: controla si la contraseña se muestra como texto plano o como puntos.
    const [show, setShow] = useState(false);

    return (
        <div className="relative text-left">
            {/* Etiqueta del campo — estilo tiny uppercase */}
            <label className="block text-slate-500 dark:text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1">
                {label}
            </label>

            <div className="relative">
                {/*
                 * Input de contraseña.
                 * - type cambia entre "password" y "text" según el estado `show`.
                 * - pr-14 deja espacio para el botón del ojo sin solaparse con el texto.
                 * - focus:border-cadenza-neon resalta el campo activo con el color neón.
                 */}
                <input
                    type={show ? "text" : "password"}
                    required={required}
                    value={value}
                    onChange={onChange}
                    className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 pr-14 text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
                    placeholder={placeholder}
                />

                {/*
                 * Botón de visibilidad (ojo / ojo tachado).
                 * - type="button" evita que un clic aquí envíe el formulario.
                 * - tabIndex="-1" excluye el botón del flujo de navegación por teclado
                 *   para que el usuario no se detenga en él al usar Tab entre campos.
                 */}
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cadenza-light/50 hover:text-cadenza-neon transition-colors p-1"
                    tabIndex="-1"
                >
                    {show ? (
                        /* Icono de ojo tachado — indica que la contraseña está visible */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                            <path d="M16.616 16.624A10 10 0 0 1 2 12a10 10 0 0 1 15.905-8.07M21.904 14.232a10 10 0 0 1-5.288 6.136" />
                            <path d="M22 2 2 22" />
                        </svg>
                    ) : (
                        /* Icono de ojo abierto — indica que la contraseña está oculta */
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

/**
 * AuthLayout
 *
 * Layout de dos columnas para las páginas de autenticación (Login, Register, etc.).
 * A diferencia de AppLayout, la Sidebar se muestra sin el menú de usuario
 * (showUserMenu={false}) y se incluye un botón hamburguesa inline cuando está cerrada.
 *
 * Estructura:
 *  ┌─────────────┬──────────────────┐
 *  │   Sidebar   │  main            │
 *  │ (colapsable)│  ├─ col izquierda (2/3): formulario + hamburguesa │
 *  │             │  └─ col derecha (rightColumn): decorativa          │
 *  └─────────────┴──────────────────┘
 *
 * @param {React.ReactNode} children      - Formulario de autenticación (Login/Register).
 * @param {React.ReactNode} [rightColumn] - Columna decorativa derecha (imagen, ilustración, etc.).
 */
export default function AuthLayout({ children, rightColumn }) {
    /*
     * useThemeSettings gestiona de forma centralizada:
     *  - isDark / setIsDark         → modo oscuro/claro (persiste en localStorage)
     *  - fontSize / setFontSize     → escala de fuente global
     *  - isSidebarOpen / setIsSidebarOpen → estado de apertura de la Sidebar
     */
    const {
        isDark, setIsDark,
        fontSize, setFontSize,
        isSidebarOpen, setIsSidebarOpen,
    } = useThemeSettings();

    return (
        /*
         * Contenedor raíz.
         * Idéntico al de AppLayout: min-h-screen, flex horizontal, font-scale,
         * y overflow-x-hidden para absorber el desplazamiento de la Sidebar.
         */
        <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>

            {/*
             * Sidebar en modo autenticación.
             * - showUserMenu={false}: oculta la sección de perfil/logout, que no aplica
             *   antes de iniciar sesión.
             */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isDark={isDark}
                setIsDark={setIsDark}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showUserMenu={false}
            />

            {/*
             * Área de contenido principal.
             * - ml-64 cuando la Sidebar está abierta; ml-0 cuando está cerrada.
             * - flex (sin flex-col) para disponer las dos columnas en horizontal.
             */}
            <main className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>

                {/*
                 * Columna izquierda — ocupa 2/3 del ancho en pantallas grandes.
                 * Contiene el formulario de autenticación centrado vertical y horizontalmente.
                 * position: relative sirve de contexto para el botón hamburguesa absoluto.
                 */}
                <div className="w-full lg:w-2/3 p-8 md:p-12 flex flex-col relative">

                    {/*
                     * Botón hamburguesa inline — solo visible cuando la Sidebar está cerrada.
                     * Permite reabrirla sin que ocupe espacio cuando no es necesario.
                     */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="absolute top-10 left-10 z-20 w-10 h-10 text-2xl hover:bg-cadenza-card rounded-md transition-colors"
                        >
                            ☰
                        </button>
                    )}

                    {/* Centra el formulario (children) vertical y horizontalmente en la columna */}
                    <div className="flex-1 flex flex-col items-center justify-center w-full">
                        {children}
                    </div>
                </div>

                {/*
                 * Columna derecha decorativa — ocupa el 1/3 restante.
                 * Cada página de autenticación puede pasar su propia ilustración o panel
                 * decorativo a través de la prop `rightColumn`.
                 */}
                {rightColumn}
            </main>
        </div>
    );
}