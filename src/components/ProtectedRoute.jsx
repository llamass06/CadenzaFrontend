import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente envuelve a las rutas que queremos proteger
export default function ProtectedRoute({ children }) {
    // Miramos si existe el token en el almacenamiento local
    const token = localStorage.getItem('cadenza_token');

    // Si NO hay token, redirigimos al login automáticamente
    if (!token) {
        console.warn("Acceso denegado: No se encontró token de sesión.");
        return <Navigate to="/login" replace />;
    }

    // Si hay token, dejamos que pase y vea el contenido (los children)
    return children;
}