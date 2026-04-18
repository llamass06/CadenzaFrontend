import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudio from './pages/Estudio';

// Componente "Guardia de Seguridad"
// Comprueba si hay un token; si no lo hay, te expulsa al Login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cadenza_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida: Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estudio"
          element={
            <ProtectedRoute>
              <Estudio />
            </ProtectedRoute>
          }
        />
        {/* Si el usuario escribe una URL que no existe, lo mandamos al Login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}