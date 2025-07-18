// Configuración de la aplicación LIHWEC para Django Rest Framework
const LIHWEC_CONFIG = {
    // Configuración de la API Django
    api: {
        // URL base del backend Django (cambiar según tu configuración)
        baseURL: 'http://127.0.0.1:8080/api',

        // Endpoints del backend Django Rest Framework
        endpoints: {
            // Eventos
            events: '/events/',
            eventDetail: (id) => `/events/${id}/`,
            eventSearch: '/events/search/',
            eventFilter: '/events/filter/',

            // Categorías
            categories: '/categories/',

            // Organizaciones
            organizations: '/organizations/',

        },

        // Headers por defecto
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },

        // Configuración de paginación
        pagination: {
            pageSize: 20,
            pageSizeParam: 'page_size',
            pageParam: 'page'
        },

        // Configuración de búsqueda
        search: {
            minLength: 2,
            debounceDelay: 300
        }
    },

    // Configuración de la aplicación
    app: {
        name: 'LIHWEC',
        version: '2.0.0',
        author: 'LauraNotFound',

        // Configuración de UI
        ui: {
            loadingTimeout: 10000, // 10 segundos
            messageTimeout: 5000,  // 5 segundos
            connectionCheckInterval: 30000 // 30 segundos
        },

        // Configuración de desarrollo
        development: {
            enableDebug: true,
            enableAPILogs: true,
            enablePerformanceLogs: false
        }
    },

    // URLs de desarrollo, GitHub Pages y producción
    environments: {
        development: {
            apiURL: 'http://127.0.0.1:8080/api',
            enableCORS: true,
            enableDebug: true
        },
        'github-pages': {
            // Para GitHub Pages, necesitas usar un túnel público como ngrok
            // o desplegar el backend en un servicio como Render
            apiURL: 'https://tu-backend-render.onrender.com/api', // URL del backend desplegado
            enableCORS: false,
            enableDebug: false
        },
        production: {
            apiURL: 'https://tu-dominio.com/api',
            enableCORS: false,
            enableDebug: false
        }
    }
};

// Función para obtener la configuración actual según el entorno
function getCurrentConfig() {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    const isGitHubPages = hostname.includes('github.io');

    let env = 'production';
    if (isLocalhost) {
        env = 'development';
    } else if (isGitHubPages) {
        env = 'github-pages';
    }

    return {
        ...LIHWEC_CONFIG,
        currentEnvironment: env,
        api: {
            ...LIHWEC_CONFIG.api,
            baseURL: LIHWEC_CONFIG.environments[env]?.apiURL || LIHWEC_CONFIG.environments.production.apiURL
        }
    };
}

// Función para configurar CORS si es necesario
function setupCORS() {
    const config = getCurrentConfig();

    if (config.environments[config.currentEnvironment].enableCORS) {
        // IMPORTANTE: Los headers Access-Control-Allow-* son headers de RESPUESTA del servidor,
        // NO se pueden enviar desde el navegador como headers de petición.
        // Si necesitas configurar algo adicional para CORS, hazlo aquí.

        // Por ahora, esta función no hace nada porque el CORS se maneja en el servidor Django
        console.log('CORS configurado para entorno:', config.currentEnvironment);
    }
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LIHWEC_CONFIG, getCurrentConfig, setupCORS };
}
