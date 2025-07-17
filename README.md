# LIHWEC - Eventos de Tecnología

LIHWEC (Laura Is Here With Events and Competitions) es una plataforma web para descubrir y participar en eventos de tecnología como hackathones, workshops, keynotes y competencias de programación.

## 🚀 Características

- **Búsqueda en tiempo real**: Busca eventos por nombre, organización, ubicación o tipo
- **Filtros avanzados**: Filtra por categoría, modalidad y organización
- **API REST con Django**: Utiliza Django Rest Framework para servir datos
- **Interfaz moderna**: Diseño responsive con animaciones suaves
- **Indicadores de estado**: Monitoreo de conexión con el servidor
- **Carga dinámica**: Datos obtenidos de endpoints REST
- **Autenticación**: Soporte para tokens JWT (opcional)

## 📋 Requisitos

### Frontend

- Navegador web moderno
- Servidor HTTP para servir archivos estáticos

### Backend (Django Rest Framework)

- Python 3.8+
- Django 4.0+
- Django Rest Framework
- Base de datos (SQLite, PostgreSQL, MySQL, etc.)

## 🛠️ Configuración

### Frontend

1. Clona el repositorio:

```bash
git clone https://github.com/LauraNotFound/LIHWEC.git
cd LIHWEC
```

2. Configura la URL de tu backend Django en `config.js`:

```javascript
// Para desarrollo
apiURL: "http://localhost:8000/api";

// Para producción
apiURL: "https://tu-dominio.com/api";
```

3. Sirve los archivos estáticos:

```bash
# Para desarrollo local solamente:

# Opción 1: Python (recomendado)
python -m http.server 8080

# Opción 2: Node.js (si tienes http-server instalado)
npx http-server -p 8080

# Opción 3: Live Server en VS Code
# Usa la extensión Live Server
```

**Nota:** Para GitHub Pages no necesitas estos comandos, GitHub sirve los archivos automáticamente.

### Backend Django (No incluido)

Tu backend Django debe implementar los siguientes endpoints:

```python
# urls.py ejemplo
urlpatterns = [
    path('api/events/', EventListCreateView.as_view(), name='event-list'),
    path('api/events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),
    path('api/events/search/', EventSearchView.as_view(), name='event-search'),
    path('api/events/filter/', EventFilterView.as_view(), name='event-filter'),
    path('api/organizations/', OrganizationListView.as_view(), name='organization-list'),
    path('api/categories/', CategoryListView.as_view(), name='category-list'),
]
```

## 🚀 Uso

### Desarrollo Local

1. **Configurar la API**: Edita `config.js` con la URL de tu backend Django
2. **Servir archivos**: Usa cualquier servidor HTTP para servir los archivos estáticos
3. **Abrir aplicación**: Ve a tu URL local
4. **Probar API**: Ve a `/test-api.html` para probar los endpoints

#### Opciones para desarrollo local:

```bash
# Opción 1: Python (recomendado)
python -m http.server 8080
# Luego ve a: http://localhost:8080

# Opción 2: Node.js (si tienes http-server instalado)
npx http-server -p 8080

# Opción 3: Live Server en VS Code
# Usa la extensión Live Server
```

### Despliegue en GitHub Pages

1. **Fork o clona** este repositorio
2. **Configura tu backend Django** en `config.js`:

```javascript
// Para producción
apiURL: "https://tu-backend-django.com/api";
```

3. **Habilita GitHub Pages** en Settings > Pages
4. **Selecciona la rama** main como fuente
5. **Accede** a tu URL de GitHub Pages: `https://tu-usuario.github.io/LIHWEC`

### Verificar que todo funciona

1. Abre tu URL (local o GitHub Pages) para la aplicación principal
2. Ve a `/test-api.html` para probar la API de Django
3. Verifica que Django responde en tu URL de producción

## 📡 Endpoints de la API

La aplicación utiliza los siguientes endpoints de json-server:

### Eventos

- `GET /events` - Obtener todos los eventos
- `GET /events/:id` - Obtener un evento específico
- `GET /events?category=competencia` - Filtrar por categoría
- `GET /events?modality=virtual` - Filtrar por modalidad
- `GET /events?organization=Google` - Filtrar por organización
- `GET /events?q=hackathon` - Búsqueda de texto completo

### Ejemplos de uso de la API

```javascript
// Obtener todos los eventos
fetch("http://localhost:3000/events");

// Buscar eventos de Google
fetch("http://localhost:3000/events?organization=Google");

// Buscar eventos virtuales
fetch("http://localhost:3000/events?modality=virtual");

// Búsqueda de texto
fetch("http://localhost:3000/events?q=hackathon");

// Obtener evento específico
fetch("http://localhost:3000/events/1");
```

## 🏗️ Estructura del Proyecto

```
LIHWEC/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica JavaScript para Django Rest Framework
├── config.js               # Configuración de la API
├── test-api.html           # Página de prueba para endpoints de Django
├── DJANGO_INTEGRATION.md   # Documentación para implementar el backend
├── README.md               # Documentación principal
├── LICENSE                 # Licencia del proyecto
└── .gitignore              # Archivos a ignorar en Git
```

## 🌐 Características de la API

### Filtros Soportados

- **Categoría**: `competencia`, `evento`
- **Modalidad**: `presencial`, `virtual`, `hibrido`
- **Organización**: Google, Microsoft, Amazon, etc.
- **Búsqueda**: Texto completo en todos los campos

### Formato de Datos

Cada evento tiene la siguiente estructura:

```json
{
  "id": 1,
  "name": "Google I/O Extended Lima",
  "date": "2025-08-15",
  "time": "09:00",
  "modality": "presencial",
  "location": "Centro de Convenciones Lima",
  "organization": "Google",
  "category": "evento",
  "type": "keynote",
  "image": "https://via.placeholder.com/400x200/4285F4/FFFFFF?text=Google+I/O",
  "description": "Únete a la transmisión en vivo del Google I/O..."
}
```

## 🔧 Personalización

### Agregar Nuevos Eventos

1. Edita el archivo `data.json`
2. Agrega un nuevo objeto al array `events`
3. Reinicia json-server para que los cambios tengan efecto

### Modificar Estilos

Los estilos están organizados en `styles.css` con secciones claramente definidas:

- Variables CSS para colores
- Estilos responsivos
- Animaciones
- Componentes específicos

## 🌟 Funcionalidades Avanzadas

### Monitoreo de Conexión

La aplicación monitorea automáticamente la conexión con json-server y muestra indicadores de estado.

### Búsqueda Optimizada

Utiliza debounce para optimizar las búsquedas y reduce las llamadas a la API.

### Filtros Combinados

Permite combinar múltiples filtros para búsquedas más específicas.

### Carga Asíncrona

Todos los datos se cargan de forma asíncrona con indicadores de carga.

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👤 Autor

**LauraNotFound🍄**

- GitHub: [@LauraNotFound](https://github.com/LauraNotFound)
- LinkedIn: [Laura Cecilia Mendoza Morales](https://www.linkedin.com/in/laura-cecilia-mendoza-morales/)
- Instagram: [@lauranotfound97](https://www.instagram.com/lauranotfound97/)

## 📝 Notas

- Asegúrate de que json-server esté ejecutándose antes de usar la aplicación
- La aplicación se conecta por defecto a `http://localhost:3000`
- Si cambias el puerto de json-server, actualiza la constante `API_BASE_URL` en `script.js`

---

¡Hecho con ❤️ por LauraNotFound🍄! - Plataforma de Eventos de Tecnología

Una página web moderna y responsive para difundir eventos sobre tecnología, incluyendo competencias (hackathones, programación competitiva) y eventos de difusión (workshops, keynotes, open days).

## 🚀 Características

- **Diseño Responsive**: Funciona perfectamente en dispositivos móviles, tablets y escritorio
- **Búsqueda Avanzada**: Barra de búsqueda con filtros por categoría, modalidad y organización
- **Dos Tipos de Eventos**:
  - **Competencias**: Hackathones y torneos de programación competitiva
  - **Eventos de Difusión**: Workshops, keynotes, open days
- **Información Completa**: Cada evento incluye imagen, nombre, fecha, hora, modalidad, ubicación y organización
- **Interfaz Moderna**: Diseño atractivo con animaciones y efectos visuales
- **Filtros Inteligentes**: Sistema de filtrado dinámico y en tiempo real

## 📁 Estructura del Proyecto

```
Eventos-Web/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidad JavaScript
├── data.json           # Base de datos simulada (backend)
└── README.md           # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño responsive con Flexbox y Grid
- **JavaScript (ES6+)**: Funcionalidad interactiva
- **JSON**: Simulación de backend
- **Font Awesome**: Iconografía

## 📊 Datos de Eventos

El archivo `data.json` contiene eventos de ejemplo de organizaciones como:

- Google
- Microsoft
- Amazon (AWS)
- Meta
- IBM
- Netflix
- Tesla
- GitHub
- Salesforce
- OpenAI
- Y más...

Cada evento incluye:

- **id**: Identificador único
- **name**: Nombre del evento
- **date**: Fecha en formato YYYY-MM-DD
- **time**: Hora en formato HH:MM
- **modality**: presencial, virtual o híbrido
- **location**: Ubicación (si es presencial)
- **organization**: Organización responsable
- **category**: competencia o evento
- **type**: hackathon, workshop, keynote, etc.
- **image**: URL de la imagen
- **description**: Descripción del evento

## 🚀 Instalación y Uso

1. **Clona o descarga** el proyecto
2. **Abre** `index.html` en tu navegador web
3. **Explora** los eventos usando la barra de búsqueda y filtros

### Usar con un servidor local (recomendado)

Para evitar problemas con CORS al cargar el archivo JSON:

```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (si tienes http-server instalado)
npx http-server

# Usando PHP
php -S localhost:8000
```

Luego visita `http://localhost:8000` en tu navegador.

## 🎯 Funcionalidades

### Búsqueda y Filtros

- **Barra de búsqueda**: Busca por nombre, organización, ubicación o tipo
- **Filtro por categoría**: Competencias vs Eventos de difusión
- **Filtro por modalidad**: Presencial, virtual o híbrido
- **Filtro por organización**: Filtra por empresa/organización

### Eventos Separados

- **Sección de Competencias**: Hackathones y programación competitiva
- **Sección de Eventos**: Workshops, keynotes, open days

### Información Detallada

- Imagen representativa del evento
- Fecha y hora formateadas
- Modalidad con iconos descriptivos
- Ubicación (para eventos presenciales)
- Organización responsable
- Descripción completa

## 🎨 Personalización

### Agregar Nuevos Eventos

Edita el archivo `data.json` y agrega nuevos eventos siguiendo la estructura existente:

```json
{
  "id": 16,
  "name": "Nuevo Evento Tech",
  "date": "2025-12-01",
  "time": "10:00",
  "modality": "virtual",
  "location": "",
  "organization": "TechCorp",
  "category": "evento",
  "type": "workshop",
  "image": "https://via.placeholder.com/400x200",
  "description": "Descripción del evento..."
}
```

### Modificar Estilos

Edita `styles.css` para cambiar:

- Colores del tema
- Tipografías
- Espaciado y layouts
- Animaciones

### Agregar Funcionalidades

Modifica `script.js` para:

- Agregar nuevos filtros
- Implementar funcionalidades adicionales
- Conectar con una API real

## 📱 Responsive Design

La página está optimizada para:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Funcionalidades Avanzadas

- **Debounce en búsqueda**: Optimiza el rendimiento
- **Animaciones CSS**: Efectos visuales atractivos
- **Intersection Observer**: Animaciones al hacer scroll
- **Scroll suave**: Navegación fluida
- **Botón scroll to top**: Fácil navegación
- **Estados de carga**: Indicadores visuales
- **Manejo de errores**: Mensajes informativos

## 🌟 Mejoras Futuras

- Integración con APIs reales
- Sistema de favoritos
- Compartir en redes sociales
- Exportar eventos a calendario
- Notificaciones push
- Modo oscuro
- Múltiples idiomas

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado por LauraNotFound🍄

---

¡Disfruta explorando los eventos tech más emocionantes! 🚀
