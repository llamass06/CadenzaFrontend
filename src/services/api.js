/**
 * @file api.js
 * @module services/api
 *
 * Capa de servicio centralizada para todas las peticiones HTTP al backend de Cadenza.
 */

/** URL base del backend. */
export const API_URL = "https://disparity-risotto-regretful.ngrok-free.dev";

/**
 * getHeaders
 * Construye el objeto de cabeceras de autenticación leyendo el JWT almacenado.
 */
const getHeaders = () => {
    const token = localStorage.getItem('cadenza_token');
    return {
        "Authorization": `Bearer ${token}`,
        "ngrok-skip-browser-warning": "69420"
    };
};

/**
 * fetchMisObras
 * Endpoint: GET /api/v1/mis-obras
 */
export const fetchMisObras = async () => {
    console.log("YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAI");
    const response = await fetch(`${API_URL}/api/v1/mis-obras`, {
        headers: getHeaders(),
    });

    if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    if (!response.ok) {
        throw new Error("Error fetching obras");
    }
    return await response.json();
};

/**
 * separarPistas
 * Endpoint: POST /api/v1/separar
 */
export const separarPistas = async (formData, signal = undefined) => {
    const response = await fetch(`${API_URL}/api/v1/separar`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
        signal,
    });

    if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'Error en el servidor');
    }
    return await response.json();
};

/**
 * eliminarObraApi
 * Endpoint: DELETE /api/v1/obras/:id
 */
export const eliminarObraApi = async (id) => {
    const response = await fetch(`${API_URL}/api/v1/obras/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error("Error deleting obra");
    }
    return true;
};

/**
 * getObraContexto
 * Endpoint: POST /api/contexto/
 */
export const getObraContexto = async (nombreObra) => {
    const response = await fetch(`${API_URL}/api/contexto/`, {
        method: "POST",
        headers: {
            ...getHeaders(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre_obra: nombreObra }),
    });

    if (!response.ok) throw new Error("Error al obtener el contexto de la IA");
    return await response.json();
};

/**
 * fetchEstadoCola
 * Endpoint: GET /api/v1/cola-estado
 * Consulta cuántas tareas están activas y si el servidor está saturado.
 * Usado por el polling del Dashboard para mostrar el aviso de saturación.
 */
export const fetchEstadoCola = async () => {
    const response = await fetch(`${API_URL}/api/v1/cola-estado`, {
        headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Error al consultar estado de la cola");
    return await response.json();
};