/**
 * obtenerNombreDelToken
 *
 * Extrae el campo `username` del payload de un JWT almacenado en localStorage.
 * El payload (segunda sección separada por '.') está codificado en Base64Url;
 * se normaliza a Base64 estándar, se decodifica y se parsea como JSON.
 *
 * @returns {string} Nombre de usuario del token, o 'Usuario' como fallback.
 */
export const obtenerNombreDelToken = () => {
    const token = localStorage.getItem('cadenza_token');
    if (!token) return 'Usuario';

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload).username || 'Usuario';
    } catch {
        return 'Usuario';
    }
};
