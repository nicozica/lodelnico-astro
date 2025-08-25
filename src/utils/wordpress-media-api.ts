// WordPress Media API - Gets images directly from media library

export interface WordPressMedia {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  source_url: string;
  alt_text: string;
  media_type: string;
  media_details: {
    width: number;
    height: number;
    sizes: {
      medium?: {
        source_url: string;
        width: number;
        height: number;
      };
      large?: {
        source_url: string;
        width: number;
        height: number;
      };
      thumbnail?: {
        source_url: string;
        width: number;
        height: number;
      };
      full: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
}

export interface Photo {
  id: string | number;
  title: string;
  src: string;
  alt: string;
  date: string;
  postId: number;
  postTitle: string;
}

export interface PaginatedPhotos {
  photos: Photo[];
  totalPhotos: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const WORDPRESS_MEDIA_URL = 'https://lodelnico.com/wp-json/wp/v2/media';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Simple in-memory cache
let cache: {
  data?: Photo[];
  timestamp?: number;
} = {};

// Function to check if cache is valid
function isCacheValid(): boolean {
  return !!(cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION));
}

export async function getMediaPaginatedPhotos(page: number = 1, photosPerPage: number = 9): Promise<PaginatedPhotos> {
  let allPhotos: Photo[] = [];

  // Use cached data if available and valid
  if (isCacheValid()) {
    console.log('Using cached media data');
    allPhotos = cache.data!;
  } else {
    try {
      // Fetch images directly from media library
      const mediaToFetch = Math.max(photosPerPage * 4, 50); // Fetch more for better caching
      const url = `${WORDPRESS_MEDIA_URL}?per_page=${mediaToFetch}&media_type=image&orderby=date&order=desc`;
      
      console.log('Fetching from WordPress Media API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Astro-Site/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const mediaItems: WordPressMedia[] = await response.json();
      console.log(`Fetched ${mediaItems.length} media items from WordPress`);
      
      // Filter only valid images with media details
      const validImages = mediaItems.filter(item => 
        item.media_type === 'image' && 
        item.media_details && 
        item.media_details.sizes
      );

      console.log(`Found ${validImages.length} valid images`);
      
      // Transform the data
      allPhotos = validImages.map(item => ({
        id: item.id,
        src: item.media_details.sizes.medium?.source_url || 
             item.media_details.sizes.large?.source_url || 
             item.source_url,
        alt: item.alt_text || item.title?.rendered || 'Fotografía de Lo del Nico',
        title: item.title?.rendered || `Fotografía ${item.id}`,
        date: item.date,
        postId: item.id, // Use media ID as post ID since we're getting from media
        postTitle: item.title?.rendered || `Media ${item.id}`
      }));

      // Cache the results
      cache.data = allPhotos;
      cache.timestamp = Date.now();
      console.log(`Cached ${allPhotos.length} photos from media`);
      
    } catch (error) {
      console.error('Error fetching media photos:', error);
      
      // Return cached data if available, even if expired
      if (cache.data) {
        console.log('Using expired cache due to error');
        allPhotos = cache.data;
      } else {
        // Return empty array if no cache available
        return {
          photos: [],
          totalPhotos: 0,
          totalPages: 1,
          currentPage: page,
          hasNextPage: false,
          hasPrevPage: false
        };
      }
    }
  }
  
  // Calculate pagination AFTER getting all photos
  const totalPhotos = allPhotos.length;
  const totalPages = Math.ceil(totalPhotos / photosPerPage);
  const startIndex = (page - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const paginatedPhotos = allPhotos.slice(startIndex, endIndex);
  
  return {
    photos: paginatedPhotos,
    totalPhotos,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
