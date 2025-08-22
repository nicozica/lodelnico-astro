// WordPress API with pagination support

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
  id: number;
  title: string;
  src: string;
  alt: string;
  date: string;
}

export interface PaginatedPhotos {
  photos: Photo[];
  totalPhotos: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const WORDPRESS_API_URL = 'https://lodelnico.com/wp-json/wp/v2/media';

export async function getPhotos(limit: number = 9): Promise<Photo[]> {
  try {
    const url = `${WORDPRESS_API_URL}?per_page=${limit}&orderby=date&order=desc`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WordPressMedia[] = await response.json();
    
    // Filter only images that have media_details (processed images)
    const validImages = data.filter(item => 
      item.media_type === 'image' && 
      item.media_details && 
      item.media_details.sizes
    );

    // Transform the data
    const photos = validImages.map(item => ({
      id: item.id,
      src: item.media_details.sizes.medium?.source_url || item.source_url,
      alt: item.alt_text || item.title?.rendered || 'Photo from Lo del Nico',
      title: item.title?.rendered || '',
      date: item.date
    }));

    return photos;
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export async function getPaginatedPhotos(page: number = 1, limit: number = 9): Promise<PaginatedPhotos> {
  try {
    const url = `${WORDPRESS_API_URL}?per_page=${limit}&page=${page}&orderby=date&order=desc`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WordPressMedia[] = await response.json();
    
    // Get total count from headers
    const totalPhotos = parseInt(response.headers.get('X-WP-Total') || '0');
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
    
    // Filter only images that have media_details (processed images)
    const validImages = data.filter(item => 
      item.media_type === 'image' && 
      item.media_details && 
      item.media_details.sizes
    );

    // Transform the data
    const photos = validImages.map(item => ({
      id: item.id,
      src: item.media_details.sizes.medium?.source_url || item.source_url,
      alt: item.alt_text || item.title?.rendered || 'Photo from Lo del Nico',
      title: item.title?.rendered || '',
      date: item.date
    }));

    return {
      photos,
      totalPhotos,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('Error fetching paginated photos:', error);
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
