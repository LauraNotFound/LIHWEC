# TechEvents - Plataforma de Eventos de Tecnología

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
