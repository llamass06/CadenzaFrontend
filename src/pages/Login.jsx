import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';

export default function Login() {
  // Estados para guardar los datos del formulario y el estado de la petición
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Función que se ejecuta al enviar el formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError(null);
    setIsLoading(true);

    try {
      // FastAPI espera los datos de login en formato formulario (URLSearchParams)
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI usa 'username' por defecto en OAuth2
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Si va bien, guardamos el token en el navegador
      localStorage.setItem('cadenza_token', data.access_token);
      alert('¡Login exitoso! Token guardado.');
      navigate('/dashboard');
      
      // Aquí más adelante haremos la redirección al Dashboard

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cadenza-dark flex flex-col items-center justify-center p-6">
      <div className="bg-cadenza-card p-10 rounded-2xl border border-cadenza-blue/30 w-full max-w-md shadow-2xl">
        
        {/* Cabecera */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Iniciar <span className="text-cadenza-neon">Sesión</span>
          </h1>
          <p className="text-cadenza-light text-sm">
            Accede a tu estudio virtual
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-cadenza-light text-sm font-semibold mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-cadenza-dark border border-cadenza-blue/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cadenza-neon focus:ring-1 focus:ring-cadenza-neon transition-colors"
              placeholder="pianista@cadenza.com"
            />
          </div>

          <div>
            <label className="block text-cadenza-light text-sm font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-cadenza-dark border border-cadenza-blue/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cadenza-neon focus:ring-1 focus:ring-cadenza-neon transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold tracking-widest transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-transparent border-2 border-cadenza-neon text-cadenza-neon hover:bg-cadenza-neon hover:text-cadenza-dark hover:shadow-neon'
            }`}
          >
            {isLoading ? 'CONECTANDO...' : 'ENTRAR'}
          </button>
        </form>

      </div>
    </div>
  );
}