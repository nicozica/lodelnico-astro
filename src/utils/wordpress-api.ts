// WordPress REST API service for lodelnico.com

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
