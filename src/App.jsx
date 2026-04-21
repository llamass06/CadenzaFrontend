import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudio from './pages/Estudio';
import ProtectedRoute from './components/ProtectedRoute'; // Importamos el portero
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Protegidas*/}
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

        {/* Redirección por defecto: si no conoce la ruta, al login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;