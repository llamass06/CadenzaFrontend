# 🎹 Proyecto Cadenza - Frontend

Este repositorio contiene la interfaz de usuario (Frontend) para **Cadenza**, una aplicación web orientada a la deconstrucción orquestal mediante Inteligencia Artificial y la grabación interactiva. Desarrollado como Trabajo de Fin de Grado (TFG).

## 🚀 Tecnologías Principales

El proyecto ha sido construido utilizando las herramientas más modernas del ecosistema web para asegurar un rendimiento óptimo y un desarrollo ágil:

* **[React](https://react.dev/) + [Vite](https://vitejs.dev/):** Utilizado como motor principal de la aplicación, ofreciendo tiempos de compilación casi instantáneos en comparación con Create React App.
* **[Tailwind CSS v4](https://tailwindcss.com/):** Framework *utility-first* para el diseño visual, implementando un tema personalizado "Synthwave/Neon" oscuro sin necesidad de archivos de configuración externos pesados.
* **[React Router Dom](https://reactrouter.com/):** Gestión de enrutamiento tipo SPA (Single Page Application) con protección de rutas privadas.
* **Web Audio API & MediaRecorder (Próximamente):** Para la grabación del usuario y la reproducción sincronizada de la pista orquestal en el "Estudio Virtual".

## 📂 Estructura del Proyecto
```
cadenza-frontend/
├── public/               # Assets estáticos
├── src/
│   ├── pages/            # Pantallas completas de la aplicación
│   │   ├── Login.jsx     # Interfaz de autenticación
│   │   └── Dashboard.jsx # Estudio virtual y reproductor (Ruta protegida)
│   ├── App.jsx           # Enrutador principal y Guards de seguridad
│   ├── index.css         # Importación de Tailwind y variables CSS (Paleta Cadenza)
│   └── main.jsx          # Punto de entrada de React
├── vite.config.js        # Configuración del servidor y plugins
└── package.json          # Dependencias y scripts
```

## 🔐 Características Actuales
Autenticación Segura: Conexión directa con el backend FastAPI. Los usuarios inician sesión enviando sus credenciales en formato x-www-form-urlencoded.

Gestión de Sesión: Almacenamiento seguro del token JWT en el localStorage.

Rutas Protegidas: Sistema de Guards que redirige automáticamente al Login si se intenta acceder al /dashboard sin un token válido.

UI Responsiva: Diseño completamente adaptado a dispositivos móviles y escritorio.


🛠️ Instalación y Uso en Desarrollo

Para ejecutar este proyecto en tu entorno local, asegúrate de tener instalado Node.js y sigue estos pasos:

Clonar el repositorio:

    git clone [https://github.com/llamass06/CadenzaFrontend.git](https://github.com/llamass06/CadenzaFrontend.git)
    cd CadenzaFrontend/cadenza-frontend

Instalar las dependencias:

    npm install

Iniciar el servidor de desarrollo:

    npm run dev

Abrir en el navegador:

    Navega a http://localhost:5173 para ver la aplicación.
