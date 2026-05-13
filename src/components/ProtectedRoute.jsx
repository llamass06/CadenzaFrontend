import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 *
 * Componente de guarda de ruta para páginas que requieren autenticación.
 * Envuelve cualquier ruta privada en el árbol de React Router y decide si
 * el usuario puede acceder o debe ser redirigido al login.
 *
 * Lógica:
 *  1. Comprueba si existe el token de sesión en localStorage bajo la clave 'cadenza_token'.
 *  2. Si NO existe  → redirige a /login con `replace` (sin añadir la ruta bloqueada al historial).
 *  3. Si SÍ existe  → renderiza los children (la página protegida).
 *
 * Uso en el router:
 *  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *
 * @param {React.ReactNode} children - Página o componente protegido que se renderiza si hay sesión activa.
 */
export default function ProtectedRoute({ children }) {
    /*
     * Se lee el token de localStorage.
     * La clave 'cadenza_token' es establecida por el servicio de autenticación
     * al completar el login con éxito.
     * Un valor null indica que el usuario no ha iniciado sesión o que su sesión expiró.
     */
    const token = localStorage.getItem('cadenza_token');

    if (!token) {
        /*
         * Sin token → acceso denegado.
         * - console.warn facilita el diagnóstico en desarrollo sin romper la app.
         * - <Navigate replace> sustituye la entrada del historial en lugar de apilar una nueva,
         *   evitando que el botón "Atrás" del navegador lleve de vuelta a la ruta protegida.
         */
        console.warn("Acceso denegado: No se encontró token de sesión.");
        return <Navigate to="/login" replace />;
    }

    /*
     * Token presente → el usuario está autenticado.
     * Se devuelven los children directamente sin ningún wrapper adicional,
     * para no alterar la estructura del DOM ni afectar estilos del layout.
     */
    return children;
}