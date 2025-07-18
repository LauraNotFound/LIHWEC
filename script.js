// Variables globales
let allEvents = [];
let filteredEvents = [];

// Obtener configuración desde config.js
const APP_CONFIG = getCurrentConfig();
setupCORS(); // Configurar CORS si es necesario

// URLs completas de los endpoints usando la configuración centralizada
const API_ENDPOINTS = {
    events: `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.events}`,
    eventById: (id) => `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.eventDetail(id)}`,
    categories: `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.categories}`,
    organizations: `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.organizations}`,
    search: `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.eventSearch}`,
    filter: `${APP_CONFIG.api.baseURL}${APP_CONFIG.api.endpoints.eventFilter}`
};

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modalityFilter = document.getElementById('modalityFilter');
const organizationFilter = document.getElementById('organizationFilter');
const competitionsGrid = document.getElementById('competitionsGrid');
const eventsGrid = document.getElementById('eventsGrid');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function () {
    loadEvents();
    setupEventListeners();
    setupSmoothScrolling();
});

// Cargar eventos desde la API de Django Rest Framework
async function loadEvents() {
    try {
        showLoading();
        const response = await fetch(API_ENDPOINTS.events, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // DRF puede devolver datos paginados o directamente la lista
        // Manejar ambos casos
        if (data.results) {
            // Respuesta paginada de DRF
            allEvents = data.results;
            // TODO: Implementar paginación si es necesario
        } else if (Array.isArray(data)) {
            // Lista directa
            allEvents = data;
        } else {
            throw new Error('Formato de respuesta inesperado');
        }

        filteredEvents = [...allEvents];

        await loadOrganizations(); // Cargar organizaciones desde endpoint separado
        renderEvents();
        hideLoading();
    } catch (error) {
        console.error('Error loading events:', error);
        hideLoading();
        showError('Error al cargar los eventos. Asegúrate de que el backend Django esté ejecutándose.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    categoryFilter.addEventListener('change', handleFilterChange);
    modalityFilter.addEventListener('change', handleFilterChange);
    organizationFilter.addEventListener('change', handleFilterChange);

    // Agregar event listener para el botón de limpiar filtros
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
}

// Configurar smooth scrolling para los enlaces de navegación
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Poblar el filtro de organizaciones desde endpoint de DRF
async function loadOrganizations() {
    try {
        // Intentar cargar desde endpoint dedicado
        const response = await fetch(API_ENDPOINTS.organizations, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });

        let organizations = [];

        if (response.ok) {
            const data = await response.json();
            organizations = data.results ? data.results : data;
        } else {
            // Fallback: extraer organizaciones de los eventos cargados
            organizations = [...new Set(allEvents.map(event => event.organization))].sort();
        }

        populateOrganizationFilter(organizations);
    } catch (error) {
        console.warn('Error loading organizations from API, using fallback:', error);
        // Fallback: extraer de los eventos
        const organizations = [...new Set(allEvents.map(event => event.organization))].sort();
        populateOrganizationFilter(organizations);
    }
}

// Poblar el filtro de organizaciones
function populateOrganizationFilter(organizations) {
    // Limpiar opciones existentes (excepto la primera)
    while (organizationFilter.children.length > 1) {
        organizationFilter.removeChild(organizationFilter.lastChild);
    }

    organizations.forEach(org => {
        const option = document.createElement('option');
        // Si org es un objeto de DRF, usar org.name, sino usar el string directamente
        const orgName = typeof org === 'object' ? (org.name || org.organization) : org;
        option.value = orgName;
        option.textContent = orgName;
        organizationFilter.appendChild(option);
    });
}

// Manejar búsqueda usando el endpoint de Django Rest Framework
async function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    try {
        showLoading();

        if (searchTerm === '') {
            // Si no hay término de búsqueda, cargar todos los eventos
            const response = await fetch(API_ENDPOINTS.events, {
                method: 'GET',
                headers: APP_CONFIG.api.headers
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            filteredEvents = data.results ? data.results : data;
        } else {
            // Usar el endpoint de búsqueda de Django
            const searchURL = `${API_ENDPOINTS.search}?q=${encodeURIComponent(searchTerm)}`;
            const response = await fetch(searchURL, {
                method: 'GET',
                headers: APP_CONFIG.api.headers
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            filteredEvents = data.results ? data.results : data;
        }

        applyFilters();
        hideLoading();
    } catch (error) {
        console.error('Error searching events:', error);
        hideLoading();
        showError('Error al buscar eventos. Verifica que el backend Django esté funcionando.');
    }
}

// Manejar cambios en los filtros
function handleFilterChange() {
    applyFilters();
}

// Aplicar filtros usando el endpoint de filtrado de Django Rest Framework
async function applyFilters() {
    try {
        showLoading();

        // Construir query parameters para Django Rest Framework
        const params = new URLSearchParams();

        // Filtro por categoría
        const selectedCategory = categoryFilter.value;
        if (selectedCategory) {
            params.append('category', selectedCategory);
        }

        // Filtro por modalidad
        const selectedModality = modalityFilter.value;
        if (selectedModality) {
            params.append('modality', selectedModality);
        }

        // Filtro por organización
        const selectedOrganization = organizationFilter.value;
        if (selectedOrganization) {
            params.append('organization', selectedOrganization);
        }

        // Agregar término de búsqueda si existe
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            params.append('search', searchTerm);
        }

        // Construir URL con filtros
        let url = API_ENDPOINTS.events;
        if (params.toString()) {
            url = `${API_ENDPOINTS.filter}?${params.toString()}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        filteredEvents = data.results ? data.results : data;

        renderEvents();
        hideLoading();
    } catch (error) {
        console.error('Error applying filters:', error);
        hideLoading();

        // Fallback: aplicar filtros localmente
        console.warn('Applying filters locally as fallback');
        applyFiltersLocally();
    }
}

// Aplicar filtros localmente como fallback
function applyFiltersLocally() {
    let filtered = [...allEvents];

    // Filtro por categoría
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Filtro por modalidad
    const selectedModality = modalityFilter.value;
    if (selectedModality) {
        filtered = filtered.filter(event => event.modality === selectedModality);
    }

    // Filtro por organización
    const selectedOrganization = organizationFilter.value;
    if (selectedOrganization) {
        filtered = filtered.filter(event => event.organization === selectedOrganization);
    }

    // Aplicar filtro de búsqueda local
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(event =>
            event.name.toLowerCase().includes(searchTerm) ||
            event.organization.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.type.toLowerCase().includes(searchTerm)
        );
    }

    filteredEvents = filtered;
    renderEvents();
    hideLoading();
}

// Renderizar eventos
function renderEvents() {
    const competitions = filteredEvents.filter(event => event.category === 'competencia');
    const events = filteredEvents.filter(event => event.category === 'evento');

    renderEventGrid(competitions, competitionsGrid);
    renderEventGrid(events, eventsGrid);
}

// Renderizar grid de eventos
function renderEventGrid(events, container) {
    if (events.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No se encontraron eventos</h3>
                <p>Intenta ajustar tus filtros de búsqueda</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => createEventCard(event)).join('');
}

// Crear tarjeta de evento
function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const modalityIcon = getModalityIcon(event.modality);
    const typeLabel = getTypeLabel(event.type);

    return `
        <div class="event-card">
            <div class="event-category category-${event.category}">
                ${typeLabel}
            </div>
            <img src="${event.image}" alt="${event.name}" class="event-image">
            <div class="event-content">
                <h3 class="event-title">${event.name}</h3>
                <div class="event-info">
                    <span>
                        <i class="fas fa-calendar-alt"></i>
                        ${formattedDate}
                    </span>
                    <span>
                        <i class="fas fa-clock"></i>
                        ${event.time}
                    </span>
                    <span>
                        <i class="${modalityIcon}"></i>
                        ${capitalizeFirst(event.modality)}
                    </span>
                    ${event.location ? `
                        <span>
                            <i class="fas fa-map-marker-alt"></i>
                            ${event.location}
                        </span>
                    ` : ''}
                </div>
                <p class="event-description">${event.description}</p>
                <div class="event-organization">
                    ${event.organization}
                </div>
            </div>
        </div>
    `;
}

// Obtener icono de modalidad
function getModalityIcon(modality) {
    switch (modality) {
        case 'presencial':
            return 'fas fa-building';
        case 'virtual':
            return 'fas fa-laptop';
        case 'hibrido':
            return 'fas fa-globe';
        default:
            return 'fas fa-question';
    }
}

// Obtener etiqueta del tipo
function getTypeLabel(type) {
    const labels = {
        'hackathon': 'Hackathon',
        'programacion-competitiva': 'Programación Competitiva',
        'workshop': 'Workshop',
        'keynote': 'Keynote',
        'open-day': 'Open Day'
    };
    return labels[type] || capitalizeFirst(type);
}

// Capitalizar primera letra
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función debounce para optimizar la búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mostrar error
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="container">
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        </div>
    `;

    document.body.insertBefore(errorDiv, document.body.firstChild);

    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Limpiar filtros
async function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    modalityFilter.value = '';
    organizationFilter.value = '';

    try {
        showLoading();
        const response = await fetch(API_ENDPOINTS.events, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        filteredEvents = data.results ? data.results : data;
        allEvents = [...filteredEvents];
        renderEvents();
        hideLoading();
    } catch (error) {
        console.error('Error clearing filters:', error);
        hideLoading();
        showError('Error al limpiar filtros.');
    }
}

// Obtener un evento específico por ID
async function getEventById(id) {
    try {
        const response = await fetch(API_ENDPOINTS.eventById(id), {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching event by ID:', error);
        throw error;
    }
}

// Obtener eventos por categoría usando Django endpoint
async function getEventsByCategory(category) {
    try {
        const url = `${API_ENDPOINTS.filter}?category=${encodeURIComponent(category)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results ? data.results : data;
    } catch (error) {
        console.error('Error fetching events by category:', error);
        throw error;
    }
}

// Obtener eventos por modalidad usando Django endpoint
async function getEventsByModality(modality) {
    try {
        const url = `${API_ENDPOINTS.filter}?modality=${encodeURIComponent(modality)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results ? data.results : data;
    } catch (error) {
        console.error('Error fetching events by modality:', error);
        throw error;
    }
}

// Obtener eventos por organización usando Django endpoint
async function getEventsByOrganization(organization) {
    try {
        const url = `${API_ENDPOINTS.filter}?organization=${encodeURIComponent(organization)}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: APP_CONFIG.api.headers
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.results ? data.results : data;
    } catch (error) {
        console.error('Error fetching events by organization:', error);
        throw error;
    }
}

// Mostrar indicador de carga
function showLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    } else {
        const loading = document.createElement('div');
        loading.id = 'loading';
        loading.className = 'loading-spinner';
        loading.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
                <p>Cargando eventos...</p>
            </div>
        `;
        document.body.appendChild(loading);
    }
}

// Ocultar indicador de carga
function hideLoading() {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Obtener estadísticas
function getEventStats() {
    const totalEvents = allEvents.length;
    const competitions = allEvents.filter(event => event.category === 'competencia').length;
    const events = allEvents.filter(event => event.category === 'evento').length;
    const organizations = [...new Set(allEvents.map(event => event.organization))].length;

    return {
        total: totalEvents,
        competitions: competitions,
        events: events,
        organizations: organizations
    };
}

// Función para exportar eventos (funcionalidad adicional)
function exportEvents() {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'eventos_tech.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Actualizar estadísticas en tiempo real
function updateStats() {
    const stats = getEventStats();

    // Actualizar contadores si existen en el DOM
    const totalCounter = document.querySelector('.stat:nth-child(1) h3');
    const participantsCounter = document.querySelector('.stat:nth-child(2) h3');
    const organizationsCounter = document.querySelector('.stat:nth-child(3) h3');

    if (totalCounter) totalCounter.textContent = stats.total + '+';
    if (organizationsCounter) organizationsCounter.textContent = stats.organizations + '+';
}

// Animación de números
function animateNumber(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Intersection Observer para animaciones
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.5s ease-out';
        }
    });
}, observerOptions);

// Observar elementos cuando se cargan
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        document.querySelectorAll('.event-card').forEach(card => {
            observer.observe(card);
        });
    }, 100);
});

// Scroll suave al top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Agregar botón de scroll to top
window.addEventListener('scroll', function () {
    const scrollButton = document.getElementById('scrollToTop');
    if (window.pageYOffset > 300) {
        if (!scrollButton) {
            const button = document.createElement('button');
            button.id = 'scrollToTop';
            button.innerHTML = '<i class="fas fa-chevron-up"></i>';
            button.className = 'scroll-to-top';
            button.onclick = scrollToTop;
            document.body.appendChild(button);
        }
        scrollButton.style.display = 'block';
    } else {
        if (scrollButton) {
            scrollButton.style.display = 'none';
        }
    }
});

// Compartir evento
function shareEvent(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event) {
        const shareData = {
            title: event.name,
            text: event.description,
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback para navegadores que no soportan Web Share API
            const textArea = document.createElement('textarea');
            textArea.value = `${event.name} - ${event.description} - ${window.location.href}`;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            alert('Información del evento copiada al portapapeles');
        }
    }
}

// Agregar evento a calendario
function addToCalendar(eventId) {
    const event = allEvents.find(e => e.id === eventId);
    if (event) {
        const startDate = new Date(event.date + 'T' + event.time);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 horas después

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location || 'Online')}`;

        window.open(calendarUrl, '_blank');
    }
}

// Verificar estado de conexión con Django backend
async function checkServerStatus() {
    try {
        const response = await fetch(`${APP_CONFIG.api.baseURL}/`, {
            method: 'HEAD',
            headers: APP_CONFIG.api.headers,
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Mostrar estado de conexión
function showConnectionStatus(isOnline) {
    const statusElement = document.getElementById('connectionStatus');
    if (statusElement) {
        statusElement.remove();
    }

    const status = document.createElement('div');
    status.id = 'connectionStatus';
    status.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
    status.innerHTML = `
        <i class="fas fa-${isOnline ? 'wifi' : 'exclamation-triangle'}"></i>
        ${isOnline ? 'Conectado al backend Django' : 'Backend Django no disponible'}
    `;

    document.body.appendChild(status);

    // Auto-ocultar después de 3 segundos si está online
    if (isOnline) {
        setTimeout(() => {
            if (status.parentNode) {
                status.parentNode.removeChild(status);
            }
        }, 3000);
    }
}

// Monitorear conexión periódicamente
function startConnectionMonitoring() {
    checkServerStatus().then(isOnline => {
        showConnectionStatus(isOnline);
    });

    // Verificar cada 30 segundos
    setInterval(async () => {
        const isOnline = await checkServerStatus();
        const currentStatus = document.getElementById('connectionStatus');

        if (!isOnline && !currentStatus) {
            showConnectionStatus(false);
        } else if (isOnline && currentStatus && currentStatus.classList.contains('offline')) {
            showConnectionStatus(true);
        }
    }, 30000);
}

// Función para refrescar datos
async function refreshData() {
    try {
        showLoading();
        await loadEvents();
        hideLoading();

        // Mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="container">
                <div class="success-content">
                    <i class="fas fa-check-circle"></i>
                    <p>Datos actualizados exitosamente</p>
                </div>
            </div>
        `;

        document.body.appendChild(successMessage);

        setTimeout(() => {
            if (successMessage.parentNode) {
                successMessage.parentNode.removeChild(successMessage);
            }
        }, 2000);

    } catch (error) {
        console.error('Error refreshing data:', error);
        showError('Error al actualizar los datos.');
    }
}

// Inicializar monitoreo de conexión cuando se carga la página
document.addEventListener('DOMContentLoaded', function () {
    startConnectionMonitoring();
});

// ==================== CONFIGURACIÓN Y AUTENTICACIÓN ====================

// Configurar token de autenticación (si es necesario)
function setAuthToken(token) {
    if (token) {
        APP_CONFIG.api.headers['Authorization'] = `Bearer ${token}`;
    } else {
        delete APP_CONFIG.api.headers['Authorization'];
    }
}

// Configurar URL base de la API
function setAPIBaseURL(baseURL) {
    APP_CONFIG.api.baseURL = baseURL;

    // Actualizar todos los endpoints
    Object.keys(API_ENDPOINTS).forEach(key => {
        if (typeof APP_CONFIG.api.endpoints[key] === 'string') {
            API_ENDPOINTS[key] = `${baseURL}${APP_CONFIG.api.endpoints[key]}`;
        }
    });
}

// Obtener configuración actual de la API
function getAPIConfig() {
    return {
        baseURL: APP_CONFIG.api.baseURL,
        endpoints: { ...APP_CONFIG.api.endpoints },
        headers: { ...APP_CONFIG.api.headers }
    };
}

// Función para manejar errores de API de forma consistente
function handleAPIError(error, context = 'API') {
    console.error(`Error in ${context}:`, error);

    if (error.message.includes('404')) {
        showError(`${context}: Endpoint no encontrado. Verifica la configuración del backend.`);
    } else if (error.message.includes('401')) {
        showError(`${context}: No autorizado. Verifica tu token de acceso.`);
    } else if (error.message.includes('403')) {
        showError(`${context}: Acceso prohibido. No tienes permisos para esta acción.`);
    } else if (error.message.includes('500')) {
        showError(`${context}: Error interno del servidor. Contacta al administrador.`);
    } else if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        showError(`${context}: Error de conexión. Verifica que el backend esté funcionando.`);
    } else {
        showError(`${context}: ${error.message}`);
    }
}

// ==================== FUNCIONES UTILITARIAS PARA DRF ====================

// Crear query parameters para Django Rest Framework
function createDRFParams(filters) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    return params;
}

// Hacer petición a Django Rest Framework con manejo de errores
async function makeDRFRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: { ...APP_CONFIG.api.headers }
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        handleAPIError(error, 'DRF Request');
        throw error;
    }
}
