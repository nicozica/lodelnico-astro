// Type definitions for photoblog data

export interface PhotoItem {
  id: number;
  title: string;
  date: string;
  taken_at: string; // unified field for date-time formatting
  year: number;
  image: string;
  url: string;
  contentHtml?: string;
  contentText?: string;
  contentHtmlNoImg?: string;
  location?: string;
  tags?: string[];
}
