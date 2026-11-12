export interface FiverrGig {
  id: string;
  position: number;
  title: string;
  sellerName: string;
  sellerLevel: 'Top Rated' | 'Level 2' | 'Level 1' | 'Pro Verified' | 'New Seller' | 'Rising Talent';
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  gigUrl: string;
  badges: string[];
  keywords: string[];
  deliveryTime: string;
  timestamp: string;
}

export interface ScrapeFilters {
  minRating: number;
  minPrice: number;
  maxPrice: number;
  targetCount: number;
  autoDownloadCsv: boolean;
  scrollSpeed: 'slow' | 'medium' | 'fast';
}

export type ScraperStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface ScraperLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'mutation';
}
