const API_URL = "http://127.0.0.1:8000/api";

export const getObraContexto = async (nombreObra) => {
    const token = localStorage.getItem('cadenza_token');
    const response = await fetch(`${API_URL}/contexto/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Por si luego proteges el endpoint
        },
        body: JSON.stringify({ nombre_obra: nombreObra }),
    });

    if (!response.ok) throw new Error("Error al obtener el contexto de la IA");
    return await response.json();
};