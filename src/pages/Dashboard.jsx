import React from 'react';

export default function Dashboard() {
  // Función temporal para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('cadenza_token');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-cadenza-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-cadenza-blue/30 pb-4">
          <h1 className="text-3xl font-bold">
            Estudio <span className="text-cadenza-neon">Virtual</span>
          </h1>
          <button 
            onClick={handleLogout}
            className="text-sm text-cadenza-light hover:text-white transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>

        <div className="bg-cadenza-card border border-cadenza-blue/30 rounded-2xl p-10 text-center shadow-neon">
          <p className="text-gray-400">
            Aquí irá el reproductor de audio y el botón de grabar.
          </p>
        </div>
      </div>
    </div>
  );
}