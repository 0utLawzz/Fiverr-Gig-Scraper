import { FiverrGig } from '../types/scraper';

/**
 * Returns formatted timestamp string for filenames, e.g. "2026-11-06_21-35-12"
 */
export function getFilenameTimestamp(date = new Date()): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
}

/**
 * Escapes a single CSV field following RFC 4180 rules
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, double-quote, or newline, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Converts an array of FiverrGig objects into RFC 4180 CSV string
 */
export function generateCsvContent(gigs: FiverrGig[]): string {
  const headers = [
    'Position',
    'Title',
    'Seller Name',
    'Level',
    'Rating',
    'Review Count',
    'Price',
    'Currency',
    'Image URL',
    'Gig URL',
    'Badges',
    'Keywords',
    'Delivery Time',
    'Scraped Timestamp',
  ];

  const rows = gigs.map((gig) => [
    gig.position,
    gig.title,
    gig.sellerName,
    gig.sellerLevel,
    gig.rating.toFixed(1),
    gig.reviewCount,
    gig.price,
    gig.currency || '$',
    gig.imageUrl,
    gig.gigUrl,
    gig.badges.join(' | '),
    gig.keywords.join(', '),
    gig.deliveryTime,
    gig.timestamp,
  ]);

  const csvLines = [
    headers.map(escapeCsvField).join(','),
    ...rows.map((row) => row.map(escapeCsvField).join(',')),
  ];

  return csvLines.join('\r\n');
}

/**
 * Initiates automatic browser download of CSV
 */
export function downloadCsvFile(gigs: FiverrGig[], customPrefix = 'fiverr_gigs'): { filename: string; content: string } {
  const content = generateCsvContent(gigs);
  const timestamp = getFilenameTimestamp();
  const filename = `${customPrefix}_${timestamp}.csv`;

  // Create blob with UTF-8 BOM so Excel opens it with proper encoding
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return { filename, content };
}
