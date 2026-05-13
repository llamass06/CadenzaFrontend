/**
 * @file api.js
 * @module services/api
 *
 * Capa de servicio centralizada para todas las peticiones HTTP al backend de Cadenza.
 * Todas las funciones exportadas son async y lanzan un Error con un mensaje descriptivo
 * en caso de fallo, para que los componentes puedan capturarlos con try/catch.
 *
 * Convenciones:
 *  - Las rutas bajo /api/v1 usan el helper `getHeaders()` para inyectar el JWT.
 *  - Los errores de FastAPI vienen en el campo `detail` del JSON de error.
 *  - Un 401 se lanza con el mensaje centinela "UNAUTHORIZED" para que los componentes
 *    puedan distinguirlo y redirigir al login si es necesario.
 */

/** URL base del backend. Cambiar a la URL de producción cuando se despliegue. */
const API_URL = "http://127.0.0.1:8000/api/v1";

/**
 * getHeaders
 *
 * Construye el objeto de cabeceras de autenticación leyendo el JWT almacenado
 * en localStorage. Se llama en cada petición para garantizar que siempre usa
 * el token más reciente (por si se renueva la sesión).
 *
 * NOTA: No incluye `Content-Type` porque las peticiones con FormData necesitan
 * que el navegador lo establezca automáticamente con el boundary correcto.
 *
 * @returns {{ Authorization: string }} Cabecera Bearer lista para incluir en fetch.
 */
const getHeaders = () => {
    const token = localStorage.getItem('cadenza_token');
    return {
        "Authorization": `Bearer ${token}`
    };
};

/**
 * fetchMisObras
 *
 * Obtiene la lista de obras del usuario autenticado.
 * Endpoint: GET /api/v1/mis-obras
 *
 * Manejo especial de errores:
 *  - 401 Unauthorized → lanza Error("UNAUTHORIZED") como centinela para que
 *    el componente pueda redirigir al login sin mostrar un mensaje de error genérico.
 *  - Otros errores HTTP → lanza un Error genérico.
 *
 * @returns {Promise<Array>} Array de objetos de obra del usuario.
 * @throws {Error} "UNAUTHORIZED" si el token ha expirado o es inválido.
 * @throws {Error} Mensaje genérico en caso de otro fallo del servidor.
 */
export const fetchMisObras = async () => {
    const response = await fetch(`${API_URL}/mis-obras`, {
        headers: getHeaders(),
    });

    // Tratamos el 401 por separado para diferenciarlo de otros errores de red
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
 *
 * Envía un archivo de audio al motor de IA (HTDemucs) para separar sus pistas.
 * Endpoint: POST /api/v1/separar
 *
 * Recibe un FormData porque el archivo se sube como multipart/form-data.
 * NO se añade Content-Type en las cabeceras; el navegador lo pone solo con
 * el boundary correcto cuando el body es FormData.
 *
 * En caso de error extrae el campo `detail` del JSON de FastAPI, que contiene
 * mensajes específicos como "límite de almacenamiento alcanzado".
 *
 * @param {FormData} formData - FormData con el campo `file` y cualquier metadato adicional.
 * @returns {Promise<Object>} Resultado del análisis (URLs de pistas, BPM, contexto IA, etc.).
 * @throws {Error} Mensaje del servidor (campo `detail`) o mensaje genérico de fallback.
 */
export const separarPistas = async (formData) => {
    const response = await fetch(`${API_URL}/separar`, {
        method: 'POST',
        headers: getHeaders(), // Sin Content-Type: el navegador lo gestiona con FormData
        body: formData,
    });

    if (!response.ok) {
        // FastAPI devuelve el motivo del error en `detail` (ej: "Storage limit reached")
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'Error en el servidor');
    }
    return await response.json();
};

/**
 * eliminarObraApi
 *
 * Elimina una obra del usuario por su ID.
 * Endpoint: DELETE /api/v1/obras/:id
 *
 * Devuelve `true` en caso de éxito para que el componente pueda actualizar
 * su estado local sin necesidad de refetch.
 *
 * @param {number|string} id - ID único de la obra a eliminar.
 * @returns {Promise<true>} Siempre devuelve true si la operación fue exitosa.
 * @throws {Error} Si el servidor responde con un código de error.
 */
export const eliminarObraApi = async (id) => {
    const response = await fetch(`${API_URL}/obras/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });

    if (!response.ok) {
        throw new Error("Error deleting obra");
    }
    return true; // Señal de éxito para que el componente elimine el item de su estado local
};

/**
 * getObraContexto
 *
 * Genera o recupera el contexto musicológico de una obra usando la IA del backend.
 * Endpoint: POST /api/contexto/   (fuera del prefijo /api/v1, ruta legacy)
 *
 * @deprecated Usar preferiblemente el contexto devuelto directamente por `separarPistas`,
 *             que ya incluye el campo `contexto` en su respuesta. Esta función se mantiene
 *             por compatibilidad con flujos anteriores (V0).
 *
 * @param {string} nombreObra - Nombre de la obra para la que se solicita el contexto.
 * @returns {Promise<Object>} Objeto con el texto del contexto musicológico generado por la IA.
 * @throws {Error} Si el servidor no puede generar el contexto.
 */
export const getObraContexto = async (nombreObra) => {
    // Esta función no usa getHeaders() porque fue escrita antes de centralizar el helper.
    // TODO: Refactorizar para usar getHeaders() y eliminar la URL hardcodeada.
    const token = localStorage.getItem('cadenza_token');
    const response = await fetch(`http://127.0.0.1:8000/api/contexto/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // Aquí sí se necesita porque el body es JSON
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nombre_obra: nombreObra }),
    });

    if (!response.ok) throw new Error("Error al obtener el contexto de la IA");
    return await response.json();
};