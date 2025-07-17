// Variables globales
let allEvents = [];
let filteredEvents = [];

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const modalityFilter = document.getElementById('modalityFilter');
const organizationFilter = document.getElementById('organizationFilter');
const competitionsGrid = document.getElementById('competitionsGrid');
const eventsGrid = document.getElementById('eventsGrid');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    setupEventListeners();
    setupSmoothScrolling();
});

// Cargar eventos desde el archivo JSON
async function loadEvents() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allEvents = data.events;
        filteredEvents = [...allEvents];
        
        populateOrganizationFilter();
        renderEvents();
    } catch (error) {
        console.error('Error loading events:', error);
        showError('Error al cargar los eventos. Por favor, intenta de nuevo más tarde.');
    }
}

// Configurar event listeners
function setupEventListeners() {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    categoryFilter.addEventListener('change', handleFilterChange);
    modalityFilter.addEventListener('change', handleFilterChange);
    organizationFilter.addEventListener('change', handleFilterChange);
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

// Poblar el filtro de organizaciones
function populateOrganizationFilter() {
    const organizations = [...new Set(allEvents.map(event => event.organization))].sort();
    
    organizations.forEach(org => {
        const option = document.createElement('option');
        option.value = org;
        option.textContent = org;
        organizationFilter.appendChild(option);
    });
}

// Manejar búsqueda
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredEvents = [...allEvents];
    } else {
        filteredEvents = allEvents.filter(event => 
            event.name.toLowerCase().includes(searchTerm) ||
            event.organization.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.type.toLowerCase().includes(searchTerm)
        );
    }
    
    applyFilters();
}

// Manejar cambios en los filtros
function handleFilterChange() {
    applyFilters();
}

// Aplicar filtros
function applyFilters() {
    let filtered = [...filteredEvents];
    
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
    
    // Actualizar eventos filtrados
    filteredEvents = filtered;
    renderEvents();
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
    switch(modality) {
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
function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    modalityFilter.value = '';
    organizationFilter.value = '';
    
    filteredEvents = [...allEvents];
    renderEvents();
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
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
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
document.addEventListener('DOMContentLoaded', function() {
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
window.addEventListener('scroll', function() {
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
