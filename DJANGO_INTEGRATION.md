# LIHWEC - Integración con Django Rest Framework

## 📋 Endpoints Requeridos

Tu backend Django debe implementar los siguientes endpoints para que LIHWEC funcione correctamente:

### 🎯 Eventos

#### `GET /api/events/`

- **Descripción**: Lista todos los eventos con paginación opcional
- **Respuesta esperada**:

```json
{
  "count": 15,
  "next": "http://localhost:8000/api/events/?page=2",
  "previous": null,
  "results": [
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
  ]
}
```

#### `GET /api/events/{id}/`

- **Descripción**: Obtiene un evento específico por ID
- **Parámetros**: `id` (integer) - ID del evento

#### `GET /api/events/search/?q={query}`

- **Descripción**: Busca eventos por texto completo
- **Parámetros**: `q` (string) - Término de búsqueda

#### `GET /api/events/filter/`

- **Descripción**: Filtra eventos por múltiples criterios
- **Parámetros opcionales**:
  - `category` (string): "evento" o "competencia"
  - `modality` (string): "presencial", "virtual", "hibrido"
  - `organization` (string): Nombre de la organización
  - `search` (string): Término de búsqueda

### 🏢 Organizaciones

#### `GET /api/organizations/`

- **Descripción**: Lista todas las organizaciones
- **Respuesta esperada**:

```json
[
  {
    "id": 1,
    "name": "Google",
    "description": "Empresa tecnológica"
  },
  {
    "id": 2,
    "name": "Microsoft",
    "description": "Empresa de software"
  }
]
```

### 📂 Categorías

#### `GET /api/categories/`

- **Descripción**: Lista todas las categorías
- **Respuesta esperada**:

```json
[
  {
    "id": 1,
    "name": "evento",
    "display_name": "Eventos de Difusión"
  },
  {
    "id": 2,
    "name": "competencia",
    "display_name": "Competencias"
  }
]
```

## 🛠️ Ejemplo de Implementación Django

### models.py

```python
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)

    def __str__(self):
        return self.display_name

class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Event(models.Model):
    MODALITY_CHOICES = [
        ('presencial', 'Presencial'),
        ('virtual', 'Virtual'),
        ('hibrido', 'Híbrido'),
    ]

    name = models.CharField(max_length=200)
    date = models.DateField()
    time = models.TimeField()
    modality = models.CharField(max_length=20, choices=MODALITY_CHOICES)
    location = models.CharField(max_length=200, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    type = models.CharField(max_length=50)
    image = models.URLField()
    description = models.TextField()

    def __str__(self):
        return self.name
```

### serializers.py

```python
from rest_framework import serializers
from .models import Event, Organization, Category

class EventSerializer(serializers.ModelSerializer):
    organization = serializers.CharField(source='organization.name', read_only=True)
    category = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
```

### views.py

```python
from rest_framework import generics, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Event, Organization, Category
from .serializers import EventSerializer, OrganizationSerializer, CategorySerializer

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category__name', 'modality', 'organization__name']
    search_fields = ['name', 'description', 'organization__name', 'location', 'type']

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer

class EventSearchView(generics.ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Event.objects.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(organization__name__icontains=query) |
                Q(location__icontains=query) |
                Q(type__icontains=query)
            )
        return Event.objects.none()

class EventFilterView(generics.ListAPIView):
    serializer_class = EventSerializer

    def get_queryset(self):
        queryset = Event.objects.all()

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name=category)

        modality = self.request.query_params.get('modality')
        if modality:
            queryset = queryset.filter(modality=modality)

        organization = self.request.query_params.get('organization')
        if organization:
            queryset = queryset.filter(organization__name=organization)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(organization__name__icontains=search) |
                Q(location__icontains=search) |
                Q(type__icontains=search)
            )

        return queryset

class OrganizationListView(generics.ListAPIView):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
```

### urls.py

```python
from django.urls import path
from . import views

urlpatterns = [
    path('api/events/', views.EventListCreateView.as_view(), name='event-list'),
    path('api/events/<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    path('api/events/search/', views.EventSearchView.as_view(), name='event-search'),
    path('api/events/filter/', views.EventFilterView.as_view(), name='event-filter'),
    path('api/organizations/', views.OrganizationListView.as_view(), name='organization-list'),
    path('api/categories/', views.CategoryListView.as_view(), name='category-list'),
]
```

## 🔧 Configuración CORS

No olvides configurar CORS en tu Django para permitir peticiones desde el frontend:

### settings.py

```python
# Instalar django-cors-headers
# pip install django-cors-headers

INSTALLED_APPS = [
    'corsheaders',
    # ... otras apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... otros middlewares
]

# Para desarrollo
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

# Para producción, ser más restrictivo
# CORS_ALLOWED_ORIGINS = [
#     "https://tu-dominio.com",
# ]
```

## 🧪 Probar tu API

1. Ejecuta tu servidor Django: `python manage.py runserver`
2. Abre `test-api.html` en LIHWEC
3. Configura la URL base como `http://localhost:8000/api`
4. Prueba todos los endpoints

## 📝 Notas Importantes

- Los nombres de campos deben coincidir exactamente con los esperados por el frontend
- Si usas paginación, asegúrate de devolver `results`, `count`, `next` y `previous`
- El campo `organization` debe ser el nombre como string, no el ID
- El campo `category` debe ser el nombre como string, no el ID
- Configura CORS correctamente para permitir peticiones cross-origin
