import React, { useState } from 'react'; // Añadimos useState
import { useThemeSettings } from '../utils/useThemeSettings';
import Sidebar from '../components/Sidebar';

/**
 * Componente de entrada de contraseña reutilizable
 * Centraliza la lógica de "ver contraseña" y el estilo minimalista.
 */
export function PasswordField({ label, value, onChange, placeholder, required = true }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative text-left">
      <label className="block text-slate-500 dark:text-cadenza-light text-[10px] uppercase font-black mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-50 dark:bg-black/20 border-2 border-cadenza-border rounded-xl px-5 py-4 pr-14 text-gray-900 dark:text-cadenza-text placeholder:text-slate-400 dark:placeholder:text-cadenza-light/50 focus:outline-none focus:border-cadenza-neon transition-colors"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-cadenza-light/50 hover:text-cadenza-neon transition-colors p-1"
          tabIndex="-1" // Para que al usar TAB no se detenga en el ojo
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
              <path d="M16.616 16.624A10 10 0 0 1 2 12a10 10 0 0 1 15.905-8.07M21.904 14.232a10 10 0 0 1-5.288 6.136" />
              <path d="M22 2 2 22" />
            </svg>
          ) : (
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

export default function AuthLayout({ children, rightColumn }) {
  const {
    isDark, setIsDark,
    fontSize, setFontSize,
    isSidebarOpen, setIsSidebarOpen,
  } = useThemeSettings();

  return (
    <div className={`min-h-screen bg-cadenza-bg text-cadenza-text flex ${fontSize} transition-all duration-300 overflow-x-hidden`}>
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDark={isDark}
        setIsDark={setIsDark}
        fontSize={fontSize}
        setFontSize={setFontSize}
        showUserMenu={false}
      />
      <main className={`flex-1 flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="w-full lg:w-2/3 p-8 md:p-12 flex flex-col relative">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-10 left-10 z-20 w-10 h-10 text-2xl hover:bg-cadenza-card rounded-md transition-colors"
            >
              ☰
            </button>
          )}
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            {children}
          </div>
        </div>
        {rightColumn}
      </main>
    </div>
  );
}