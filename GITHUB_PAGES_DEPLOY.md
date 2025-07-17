# LIHWEC - Despliegue en GitHub Pages

## 🚀 Guía Rápida para GitHub Pages

### 1. Configuración Inicial

1. **Fork** este repositorio o **clona** tu copia
2. **Edita** `config.js` y cambia la URL del backend en la sección `github-pages`:

```javascript
'github-pages': {
    apiURL: 'https://tu-backend-django.herokuapp.com/api', // ← Cambia esta URL
    enableCORS: false,
    enableDebug: false
}
```

### 2. Habilitar GitHub Pages

1. Ve a **Settings** de tu repositorio
2. Scroll hasta **Pages** en el menú lateral
3. En **Source**, selecciona **Deploy from a branch**
4. Selecciona **main** branch y **/ (root)**
5. Haz clic en **Save**

### 3. Tu URL será:

```
https://tu-usuario.github.io/LIHWEC
```

### 4. Verificar Despliegue

- **Frontend**: `https://tu-usuario.github.io/LIHWEC`
- **Test API**: `https://tu-usuario.github.io/LIHWEC/test-api.html`

## 🔧 Configuración del Backend

### Opciones para el Backend Django:

#### Opción 1: Heroku (Recomendado)

```bash
# Instalar Heroku CLI
# Crear app de Heroku
heroku create tu-app-django

# Configurar variables de entorno
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=tu-secret-key

# Desplegar
git push heroku main
```

#### Opción 2: Railway

```bash
# Conectar con GitHub
# Desplegar automáticamente desde tu repositorio Django
```

#### Opción 3: PythonAnywhere

```bash
# Subir código y configurar WSGI
# Configurar base de datos
```

#### Opción 4: DigitalOcean App Platform

```bash
# Conectar repositorio
# Configurar variables de entorno
```

## 🛡️ Configuración CORS para Producción

En tu backend Django, configura CORS para permitir GitHub Pages:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://tu-usuario.github.io",
]

# O para múltiples usuarios
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.github\.io$",
]
```

## 📝 Variables de Entorno Recomendadas

```python
# settings.py
import os
from pathlib import Path

# Para GitHub Pages
ALLOWED_HOSTS = [
    'tu-backend-django.herokuapp.com',
    'localhost',
    '127.0.0.1',
]

CORS_ALLOWED_ORIGINS = [
    "https://tu-usuario.github.io",
    "http://localhost:8080",  # Para desarrollo
]

# Base de datos para producción
if os.environ.get('DATABASE_URL'):
    import dj_database_url
    DATABASES['default'] = dj_database_url.parse(os.environ.get('DATABASE_URL'))
```

## 🚀 Proceso de Despliegue Automático

### GitHub Actions (Opcional)

Puedes crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js (si necesitas build)
        uses: actions/setup-node@v2
        with:
          node-version: "16"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

## 🔍 Solución de Problemas

### Problema: CORS Error

**Solución**: Configurar CORS en Django para permitir GitHub Pages

### Problema: API no disponible

**Solución**: Verificar que el backend esté desplegado y funcionando

### Problema: 404 en GitHub Pages

**Solución**: Verificar que GitHub Pages esté habilitado y el repositorio sea público

### Problema: Archivos no actualizados

**Solución**: GitHub Pages puede tardar unos minutos en actualizar

## 📊 Ejemplo de URLs

### Desarrollo:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8000/api`

### Producción:

- Frontend: `https://lauranotfound.github.io/LIHWEC`
- Backend: `https://lihwec-backend.herokuapp.com/api`

## ✅ Checklist de Despliegue

- [ ] Backend Django desplegado y funcionando
- [ ] CORS configurado correctamente
- [ ] URL del backend actualizada en `config.js`
- [ ] GitHub Pages habilitado
- [ ] Frontend accesible en GitHub Pages
- [ ] API test funcionando desde GitHub Pages
- [ ] SSL/HTTPS funcionando (automático en GitHub Pages)

¡Tu aplicación LIHWEC estará disponible globalmente en GitHub Pages! 🌐
