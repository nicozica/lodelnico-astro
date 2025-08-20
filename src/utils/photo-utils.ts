// Image optimization utilities for the photoblog
export interface PhotoData {
  id: number;
  title: string;
  src: string;
  alt: string;
  category: string;
  date: string;
  width?: number;
  height?: number;
}

// Generate responsive image srcset
export function generateSrcSet(imageSrc: string, sizes: number[] = [400, 800, 1200, 1600]): string {
  const basePath = imageSrc.replace(/\.[^/.]+$/, '');
  const extension = imageSrc.split('.').pop();
  
  return sizes
    .map(size => `${basePath}-${size}w.${extension} ${size}w`)
    .join(', ');
}

// Generate sizes attribute for responsive images
export function generateSizes(breakpoints: { [key: string]: string } = {
  '(max-width: 768px)': '100vw',
  '(max-width: 1200px)': '50vw',
  'default': '33vw'
}): string {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`);
  const defaultSize = entries[entries.length - 1][1];
  
  return [...mediaQueries, defaultSize].join(', ');
}

// Format date for display
export function formatDate(dateString: string, locale: string = 'en-US'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get category color for styling
export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    landscape: '#4ade80',
    portrait: '#f59e0b',
    street: '#ef4444',
    nature: '#10b981',
    architecture: '#6366f1',
    abstract: '#8b5cf6',
    urban: '#06b6d4',
    default: '#6b7280'
  };
  
  return colors[category] || colors.default;
}

// Sort photos by date (newest first)
export function sortPhotosByDate(photos: PhotoData[]): PhotoData[] {
  return photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Filter photos by category
export function filterPhotosByCategory(photos: PhotoData[], category: string): PhotoData[] {
  if (category === 'all') return photos;
  return photos.filter(photo => photo.category === category);
}

// Get unique categories from photos
export function getUniqueCategories(photos: PhotoData[]): string[] {
  const categories = photos.map(photo => photo.category);
  return [...new Set(categories)].sort();
}

// Lazy loading intersection observer utility
export function setupLazyLoading(selector: string = '[loading="lazy"]'): void {
  if (typeof window === 'undefined') return;
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        observer.unobserve(img);
      }
    });
  });

  const lazyImages = document.querySelectorAll(selector);
  lazyImages.forEach(img => imageObserver.observe(img));
}
