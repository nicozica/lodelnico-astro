# Lo del Nico - Galería de Fotografía

Un sitio web estático construido con Astro que funciona como galería de fotografía headless usando la API REST de WordPress de lodelnico.com.

## 🚀 Características

- **Galería headless**: Consume imágenes directamente desde la API de WordPress
- **Diseño responsivo**: Grid adaptable de 3x3 en desktop, 2x2 en tablet, 1x1 en móvil
- **Carga optimizada**: Las imágenes se cargan de forma lazy y en tamaños apropiados
- **Build estático**: Generación estática para máxima performance
- **Multiidioma**: Soporte para español (AR)

## 🛠️ Tecnologías

- [Astro](https://astro.build/) - Framework para sitios estáticos
- [WordPress REST API](https://developer.wordpress.org/rest-api/) - Fuente de contenido
- TypeScript - Type safety
- CSS moderno - Grid layouts y responsive design

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## � Configuración

La API de WordPress está configurada en `src/utils/wordpress-api.ts`:

```typescript
const WORDPRESS_API_BASE = 'https://lodelnico.com/wp-json/wp/v2';
```

### Endpoints utilizados

- `/media` - Obtiene las imágenes con metadata
- Parámetros: `per_page`, `orderby=date`, `order=desc`

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── Hero.astro          # Header simple con logos
│   └── PhotoGrid.astro     # Grid de fotos 3x3
├── layouts/
│   └── BaseLayout.astro    # Layout base
├── pages/
│   ├── index.astro         # Página principal
│   └── gallery.astro       # Galería completa
├── utils/
│   ├── photo-utils.ts      # Utilidades para fotos
│   └── wordpress-api.ts    # Cliente API de WordPress
└── styles/
    └── global.css          # Estilos globales
```

## 🎨 Diseño

El sitio replica el diseño simple mostrado en el mockup:

- Header con título "Estás en Lo del Nico" y logos de Blur FM
- Grid de 3x3 fotos cuadradas con bordes redondeados
- Paginación simple con controles de navegación
- Colores neutros y tipografía limpia

## 🚀 Despliegue

El sitio se puede desplegar en cualquier servicio de hosting estático:

```bash
npm run build
# Los archivos generados están en dist/
```

### Opciones recomendadas:
- Netlify
- Vercel  
- GitHub Pages
- Cloudflare Pages

## � Responsive

- **Desktop (>768px)**: Grid 3x3
- **Tablet (480-768px)**: Grid 2x2  
- **Móvil (<480px)**: Grid 1x1

## 🔄 Futuros desarrollos

- [ ] Lightbox para ver imágenes en tamaño completo
- [ ] Filtros por categoría
- [ ] Búsqueda de imágenes
- [ ] Lazy loading mejorado con IntersectionObserver
- [ ] Previsualización de metadatos en hover

## 📄 Licencia

MIT

---

Desarrollado por Nicolas para [lodelnico.com](https://lodelnico.com)
