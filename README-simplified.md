# Lo del Nico - Fotoblog Simplificado

Galería de fotografías personal que obtiene imágenes desde WordPress REST API con paginación estática.

## ✨ Características

- **Simple y minimalista**: Una sola vista de galería con paginación
- **Build-time data**: Datos generados estáticamente desde WordPress
- **Responsive**: Diseño que se adapta a todos los dispositivos
- **9 fotos por página**: Layout 3x3 en desktop, adaptativo en móvil
- **SEO optimizado**: Meta tags, sitemap, y URLs limpias

## 🏗 Estructura del Proyecto

```
src/
├── pages/
│   ├── index.astro           # Home con preview de últimas fotos
│   ├── about.astro           # Página sobre
│   └── gallery/
│       ├── index.astro       # Redirect a /gallery/1
│       └── [page].astro      # Páginas de galería paginadas
├── components/
│   ├── HeroClean.astro       # Hero component
│   └── PhotoGridClean.astro  # Grid de fotos (unused in current version)
├── data/
│   └── photoblog.json        # Datos generados en build-time
├── scripts/
│   └── fetch-photoblog.mjs   # Script para fetch desde WordPress
└── types/
    └── photoblog.ts          # TypeScript interfaces
```

## 🚀 Comandos

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build local
- `node scripts/fetch-photoblog.mjs` - Actualizar datos manualmente

## 📊 Datos de WordPress

El proyecto obtiene posts desde `https://www.lodelnico.com/wp-json/wp/v2/posts` con:

- **Featured media embebida**: Para obtener imágenes destacadas
- **Contenido parsing**: Extrae primera imagen del contenido si no hay featured media
- **Fallback a attachments**: Busca en attachments si no encuentra imagen
- **Metadata completa**: Título, fecha, ubicación, tags, URL original

## 🎯 Rutas Generadas

- `/` - Página de inicio con preview de 6 fotos más recientes
- `/gallery/1` hasta `/gallery/16` - Páginas de galería (9 fotos cada una)
- `/about` - Información personal

## 🔄 Actualización de Datos

Los datos se actualizan automáticamente en cada build via el script `prebuild` en `package.json`. Para actualizar manualmente:

```bash
node scripts/fetch-photoblog.mjs
```

## 📱 Responsive Design

- **Desktop**: Grid 3x3 (9 fotos por página)
- **Tablet**: Grid 2x2 adaptativo
- **Mobile**: Grid 1x1 (lista vertical)

## 🛠 Tecnologías

- **Astro**: Framework principal
- **TypeScript**: Tipado estático
- **CSS**: Estilos custom sin frameworks
- **WordPress REST API**: Fuente de datos
- **Static Generation**: Build-time data fetching

## 📈 Performance

- Todas las páginas son estáticas
- Imágenes con lazy loading
- CSS optimizado y minificado
- Sitemap automático generado
- Datos pre-procesados en build-time

---

**Última actualización**: Enero 2025  
**Fotos disponibles**: 136 imágenes  
**Años cubiertos**: 2010-2025
