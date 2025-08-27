// WordPress API for posts with images

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      id: number;
      source_url: string;
      alt_text: string;
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
          full: {
            source_url: string;
            width: number;
            height: number;
          };
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

// Extract images from post content HTML
function extractImagesFromContent(content: string, postId: number, postTitle: string, postDate: string): Photo[] {
  const photos: Photo[] = [];
  
  // Use regex to find all img tags in the content
  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  let match;
  let index = 0;
  
  while ((match = imgRegex.exec(content)) !== null) {
    const [, src, alt] = match;
    
    // Only include images from the same domain to avoid external images
    if (src && src.includes('lodelnico.com')) {
      photos.push({
        id: `post-${postId}-img-${index}` as any, // Convert to number later if needed
        title: `${postTitle} - Imagen ${index + 1}`,
        src,
        alt: alt || `${postTitle} - Imagen ${index + 1}`,
        date: postDate,
        postId,
        postTitle
      });
      index++;
    }
  }
  
  return photos;
}

export async function getPostsWithImages(page: number = 1, postsPerPage: number = 10): Promise<PaginatedPhotos> {
  try {
    // Fetch posts with embedded featured media
    const url = `${WORDPRESS_API_URL}?per_page=${postsPerPage}&page=${page}&orderby=date&order=desc&_embed=wp:featuredmedia`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: WordPressPost[] = await response.json();
    
    // Get total count from headers
    const _totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    
    let allPhotos: Photo[] = [];
    
    // Extract images from each post
    for (const post of posts) {
      const postTitle = post.title.rendered.replace(/<[^>]*>/g, ''); // Strip HTML
      
      // Add featured image if exists
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        const featuredMedia = post._embedded['wp:featuredmedia'][0];
        allPhotos.push({
          id: featuredMedia.id,
          title: `${postTitle} - Imagen destacada`,
          src: featuredMedia.media_details.sizes.medium?.source_url || featuredMedia.source_url,
          alt: featuredMedia.alt_text || `${postTitle} - Imagen destacada`,
          date: post.date,
          postId: post.id,
          postTitle
        });
      }
      
      // Extract images from post content
      const contentImages = extractImagesFromContent(post.content.rendered, post.id, postTitle, post.date);
      allPhotos = [...allPhotos, ...contentImages];
    }

    return {
      photos: allPhotos,
      totalPhotos: allPhotos.length,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching posts with images:', error);
    return {
      photos: [],
      totalPhotos: 0,
      totalPages: 0,
      currentPage: page,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
}

// Function to get a specific number of photos across all posts
export async function getPaginatedPhotosFromPosts(page: number = 1, photosPerPage: number = 9): Promise<PaginatedPhotos> {
  try {
    let allPhotos: Photo[] = [];
    let currentPostPage = 1;
    const postsPerRequest = 20; // Get more posts per request
    const maxPostPages = 5; // Limit to avoid infinite loops
    
    // Keep fetching posts until we have enough photos for pagination
    while (currentPostPage <= maxPostPages) {
      const postData = await getPostsWithImages(currentPostPage, postsPerRequest);
      
      if (postData.photos.length === 0) {
        break; // No more posts with photos
      }
      
      allPhotos = [...allPhotos, ...postData.photos];
      
      // If we have enough photos for the requested page, we can break
      if (allPhotos.length >= (page * photosPerPage)) {
        break;
      }
      
      currentPostPage++;
      
      // If we've reached the end of posts, break
      if (!postData.hasNextPage) {
        break;
      }
    }
    
    // Remove duplicates based on src
    const uniquePhotos = allPhotos.filter((photo, index, self) => 
      index === self.findIndex(p => p.src === photo.src)
    );
    
    // Calculate pagination for photos
    const totalPhotos = uniquePhotos.length;
    const totalPages = Math.ceil(totalPhotos / photosPerPage);
    const startIndex = (page - 1) * photosPerPage;
    const endIndex = startIndex + photosPerPage;
    const paginatedPhotos = uniquePhotos.slice(startIndex, endIndex);
    
    return {
      photos: paginatedPhotos,
      totalPhotos,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching paginated photos from posts:', error);
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
