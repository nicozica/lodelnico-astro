// Simplified WordPress API for posts with images

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

// Simple function to get posts and extract their featured images
export async function getSimplePaginatedPhotos(page: number = 1, photosPerPage: number = 9): Promise<PaginatedPhotos> {
  try {
    // Fetch more posts than we need photos to ensure we have enough
    const postsToFetch = Math.max(photosPerPage * 2, 20);
    const url = `${WORDPRESS_API_URL}?per_page=${postsToFetch}&page=1&orderby=date&order=desc&_embed=wp:featuredmedia`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: WordPressPost[] = await response.json();
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
    
    // Calculate pagination
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
  } catch (error) {
    console.error('Error fetching simple paginated photos:', error);
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
