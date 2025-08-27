// Type definitions for photoblog data

export interface PhotoItem {
  id: number;
  title: string;
  date: string;
  year: number;
  image: string;
  url: string;
  location?: string;
  tags?: string[];
}
