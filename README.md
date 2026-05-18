## 🎹 Proyecto Cadenza - Frontend

Este repositorio contiene la interfaz de usuario (Frontend) para Cadenza, una aplicación web orientada a la deconstrucción orquestal mediante Inteligencia Artificial y la inmersión musical interactiva. Desarrollado como Trabajo de Fin de Grado (TFG) del ciclo superior de Desarrollo de Aplicaciones Multiplataforma (DAM).
## 🚀 Estado del Proyecto

Actualmente, el frontend es plenamente funcional y está desplegado en producción. Se comunica de forma segura con el backend para procesar el audio, gestionar la biblioteca del usuario y renderizar el entorno del Estudio Virtual.
## 🌟 Características Implementadas

Dashboard Interactivo: Panel de control principal con sistema de subida de archivos Drag & Drop, extracción automática de metadatos de audio (etiquetas ID3 mediante jsmediatags) y validación de formatos (WAV, FLAC, MP3).

Gestión de Biblioteca Cloud: Panel lateral y central para administrar las obras procesadas, incluyendo un sistema de control de cuotas en tiempo real (semáforo visual para el límite de 3 obras del plan gratuito).

Estudio Virtual (Virtual Studio): Reproductor de audio avanzado que permite al pianista escuchar la pista orquestal (sin piano), con visualización del BPM, control de metrónomo sincronizado y lectura del contexto histórico/técnico generado por IA (Google Gemini).

Progressive Web App (PWA): Soporte para instalación nativa de la aplicación en dispositivos móviles y de escritorio.

Autenticación y Seguridad: Conexión directa con la API RESTful. Gestión segura de sesión almacenando el token JWT en localStorage y protección estricta mediante Guards (ProtectedRoute) para evitar accesos no autorizados.

Deduplicación de Peticiones: Arquitectura de red optimizada que intercepta promesas en vuelo para evitar llamadas duplicadas a la API y reducir la carga en el servidor.

## 🛠️ Stack Tecnológico

El proyecto ha sido construido utilizando las herramientas más modernas del ecosistema web para asegurar un rendimiento óptimo, escalabilidad y un desarrollo ágil:

    Framework Web: React 18 + Vite (Tiempos de compilación instantáneos y Hot Module Replacement).

    Estilos y UI: Tailwind CSS v4 (Framework utility-first implementando un tema personalizado oscuro y acentos "Cian Neón").

    Enrutamiento: React Router Dom (Gestión de SPA y rutas privadas).

    Testing & QA: Jest + React Testing Library para validación de componentes condicionales y flujos de usuario.

    Despliegue (CI/CD): Vercel (Alojamiento serverless rápido, optimizado y con despliegue continuo).

## ⚙️ Instalación y Uso en Desarrollo

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalado Node.js y sigue estos pasos:

1. Clonar el repositorio:
Bash

        git clone https://github.com/llamass06/CadenzaFrontend.git
        cd CadenzaFrontend/cadenza-frontend

2. Instalar las dependencias:
Bash

        npm install

3. Configurar variables de entorno:
Crea un archivo .env en la raíz del proyecto para definir la URL del backend local o de producción (Ngrok/Hetzner):
Fragmento de código

        VITE_API_URL=http://127.0.0.1:8000

4. Iniciar el servidor de desarrollo:
Bash

        npm run dev

5. Abrir en el navegador:
Navega a http://localhost:5173 para ver la aplicación en funcionamiento.

Desarrollado por Álvaro Llamas Martín.
