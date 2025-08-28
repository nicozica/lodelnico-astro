// Type definitions for photoblog data

export interface PhotoItem {
  id: number;
  title: string;
  date: string;
  year: number;
  image: string;
  url: string;
  contentHtml?: string;
  contentText?: string;
  contentHtmlNoImg?: string;
  location?: string;
  tags?: string[];
}
