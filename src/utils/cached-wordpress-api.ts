// WordPress API with caching for better performance

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
      media_details: {
        sizes: {
          medium?: { source_url: string; };
          large?: { source_url: string; };
          full: { source_url: string; };
        };
      };
    }>;
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

const WORDPRESS_API_URL = 'https://lodelnico.com/wp-json/wp/v2/posts';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple in-memory cache
let cache: {
  data?: PaginatedPhotos;
  timestamp?: number;
} = {};

// Function to check if cache is valid
function isCacheValid(): boolean {
  return !!(cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION));
}

export async function getCachedPaginatedPhotos(page: number = 1, photosPerPage: number = 9): Promise<PaginatedPhotos> {
  // Return cached data if valid
  if (isCacheValid() && page === 1) {
    const cached = cache.data!;
    const startIndex = (page - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    const paginatedPhotos = cached.photos.slice(startIndex, endIndex);
    
    return {
      ...cached,
      photos: paginatedPhotos,
      currentPage: page,
      hasNextPage: page < cached.totalPages,
      hasPrevPage: page > 1
    };
  }

  try {
    // Fetch more posts than we need photos to ensure we have enough
    const postsToFetch = Math.max(photosPerPage * 3, 30); // Fetch more for better caching
    const url = `${WORDPRESS_API_URL}?per_page=${postsToFetch}&page=1&orderby=date&order=desc&_embed=wp:featuredmedia`;
    
    console.log('Fetching from WordPress API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
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

    const posts: WordPressPost[] = await response.json();
    console.log(`Fetched ${posts.length} posts from WordPress`);
    
    const allPhotos: Photo[] = [];
    
    // Extract featured images from posts
    for (const post of posts) {
      const postTitle = post.title.rendered.replace(/<[^>]*>/g, ''); // Strip HTML
      
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const featuredMedia = post._embedded['wp:featuredmedia'][0];
        allPhotos.push({
          id: featuredMedia.id,
          title: postTitle,
          src: featuredMedia.media_details.sizes.medium?.source_url || 
               featuredMedia.media_details.sizes.large?.source_url || 
               featuredMedia.source_url,
          alt: featuredMedia.alt_text || postTitle,
          date: post.date,
          postId: post.id,
          postTitle
        });
      }
    }
    
    // Cache the full result
    const fullResult: PaginatedPhotos = {
      photos: allPhotos,
      totalPhotos: allPhotos.length,
      totalPages: Math.ceil(allPhotos.length / photosPerPage),
      currentPage: 1,
      hasNextPage: allPhotos.length > photosPerPage,
      hasPrevPage: false
    };
    
    cache.data = fullResult;
    cache.timestamp = Date.now();
    console.log(`Cached ${allPhotos.length} photos`);
    
    // Return paginated result
    const startIndex = (page - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    const paginatedPhotos = allPhotos.slice(startIndex, endIndex);
    
    return {
      photos: paginatedPhotos,
      totalPhotos: allPhotos.length,
      totalPages: Math.ceil(allPhotos.length / photosPerPage),
      currentPage: page,
      hasNextPage: page < Math.ceil(allPhotos.length / photosPerPage),
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching cached photos:', error);
    
    // Return cached data if available, even if expired
    if (cache.data) {
      console.log('Using expired cache due to error');
      const cached = cache.data;
      const startIndex = (page - 1) * photosPerPage;
      const endIndex = startIndex + photosPerPage;
      const paginatedPhotos = cached.photos.slice(startIndex, endIndex);
      
      return {
        ...cached,
        photos: paginatedPhotos,
        currentPage: page,
        hasNextPage: page < cached.totalPages,
        hasPrevPage: page > 1
      };
    }
    
    // Fallback to empty result
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
