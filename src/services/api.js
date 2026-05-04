const API_URL = "http://127.0.0.1:8000/api/v1";

const getHeaders = () => {
    const token = localStorage.getItem('cadenza_token');
    return {
        "Authorization": `Bearer ${token}`
    };
};

export const fetchMisObras = async () => {
    const response = await fetch(`${API_URL}/mis-obras`, {
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

export const separarPistas = async (formData) => {
    const response = await fetch(`${API_URL}/separar`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData,
    });
    
    if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(errorDetail.detail || 'Error en el servidor');
    }
    return await response.json();
};

export const eliminarObraApi = async (id) => {
    const response = await fetch(`${API_URL}/obras/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    
    if (!response.ok) {
        throw new Error("Error deleting obra");
    }
    return true;
};

// V0 compatibility (if needed)
export const getObraContexto = async (nombreObra) => {
    const token = localStorage.getItem('cadenza_token');
    const response = await fetch(`http://127.0.0.1:8000/api/contexto/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ nombre_obra: nombreObra }),
    });

    if (!response.ok) throw new Error("Error al obtener el contexto de la IA");
    return await response.json();
};