// Mock data for testing when WordPress API is slow/unavailable

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

const MOCK_PHOTOS: Photo[] = [
  {
    id: 1,
    title: "Atardecer en Buenos Aires",
    src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500&h=500&fit=crop",
    alt: "Atardecer en Buenos Aires",
    date: "2023-12-01",
    postId: 1,
    postTitle: "Post de prueba 1"
  },
  {
    id: 2,
    title: "Calle de San Telmo",
    src: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500&h=500&fit=crop",
    alt: "Calle de San Telmo",
    date: "2023-11-30",
    postId: 2,
    postTitle: "Post de prueba 2"
  },
  {
    id: 3,
    title: "La Boca",
    src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop",
    alt: "La Boca",
    date: "2023-11-29",
    postId: 3,
    postTitle: "Post de prueba 3"
  },
  {
    id: 4,
    title: "Puerto Madero",
    src: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500&h=500&fit=crop",
    alt: "Puerto Madero",
    date: "2023-11-28",
    postId: 4,
    postTitle: "Post de prueba 4"
  },
  {
    id: 5,
    title: "Palermo",
    src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500&h=500&fit=crop",
    alt: "Palermo",
    date: "2023-11-27",
    postId: 5,
    postTitle: "Post de prueba 5"
  },
  {
    id: 6,
    title: "Recoleta",
    src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop",
    alt: "Recoleta",
    date: "2023-11-26",
    postId: 6,
    postTitle: "Post de prueba 6"
  },
  {
    id: 7,
    title: "Microcentro",
    src: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500&h=500&fit=crop",
    alt: "Microcentro",
    date: "2023-11-25",
    postId: 7,
    postTitle: "Post de prueba 7"
  },
  {
    id: 8,
    title: "Belgrano",
    src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500&h=500&fit=crop",
    alt: "Belgrano",
    date: "2023-11-24",
    postId: 8,
    postTitle: "Post de prueba 8"
  },
  {
    id: 9,
    title: "Villa Crespo",
    src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop",
    alt: "Villa Crespo",
    date: "2023-11-23",
    postId: 9,
    postTitle: "Post de prueba 9"
  },
  {
    id: 10,
    title: "Barracas",
    src: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=500&h=500&fit=crop",
    alt: "Barracas",
    date: "2023-11-22",
    postId: 10,
    postTitle: "Post de prueba 10"
  },
  {
    id: 11,
    title: "Chacarita",
    src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=500&h=500&fit=crop",
    alt: "Chacarita",
    date: "2023-11-21",
    postId: 11,
    postTitle: "Post de prueba 11"
  },
  {
    id: 12,
    title: "Flores",
    src: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500&h=500&fit=crop",
    alt: "Flores",
    date: "2023-11-20",
    postId: 12,
    postTitle: "Post de prueba 12"
  }
];

export async function getMockPaginatedPhotos(page: number = 1, photosPerPage: number = 9): Promise<PaginatedPhotos> {
  // Simulate a small delay to mimic API call
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const totalPhotos = MOCK_PHOTOS.length;
  const totalPages = Math.ceil(totalPhotos / photosPerPage);
  const startIndex = (page - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const paginatedPhotos = MOCK_PHOTOS.slice(startIndex, endIndex);
  
  return {
    photos: paginatedPhotos,
    totalPhotos,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
}
