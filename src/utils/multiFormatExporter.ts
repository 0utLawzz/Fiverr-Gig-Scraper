import { FiverrGig } from '../types/scraper';
import { getFilenameTimestamp, generateCsvContent } from './csvExporter';

export type ExportFormat = 'csv' | 'json' | 'excel';

/**
 * Generates formatted JSON file content with metadata header
 */
export function generateJsonContent(gigs: FiverrGig[]): string {
  const exportPayload = {
    metadata: {
      exported_at: new Date().toISOString(),
      generator: 'Fiverr Gig Scraper Pro',
      format_version: '1.0',
      total_records: gigs.length,
      average_price: gigs.length > 0 ? (gigs.reduce((acc, g) => acc + g.price, 0) / gigs.length).toFixed(2) : 0,
      average_rating: gigs.length > 0 ? (gigs.reduce((acc, g) => acc + g.rating, 0) / gigs.length).toFixed(2) : 0,
    },
    gigs: gigs.map((gig) => ({
      position: gig.position,
      title: gig.title,
      seller_name: gig.sellerName,
      seller_level: gig.sellerLevel,
      rating: gig.rating,
      review_count: gig.reviewCount,
      price: gig.price,
      currency: gig.currency,
      image_url: gig.imageUrl,
      gig_url: gig.gigUrl,
      badges: gig.badges,
      keywords: gig.keywords,
      delivery_time: gig.deliveryTime,
      scraped_at: gig.timestamp,
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Generates Microsoft Excel compatible XML Spreadsheet (.xls)
 * Opens natively in Excel, Google Sheets, Numbers with styled header and typed fields.
 */
export function generateExcelXmlContent(gigs: FiverrGig[]): string {
  const escapeXml = (str: unknown) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const rowsXml = gigs
    .map(
      (gig) => `
      <Row>
        <Cell ss:StyleID="sNumber"><Data ss:Type="Number">${gig.position}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.title)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.sellerName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.sellerLevel)}</Data></Cell>
        <Cell ss:StyleID="sDecimal"><Data ss:Type="Number">${gig.rating.toFixed(1)}</Data></Cell>
        <Cell ss:StyleID="sNumber"><Data ss:Type="Number">${gig.reviewCount}</Data></Cell>
        <Cell ss:StyleID="sCurrency"><Data ss:Type="Number">${gig.price}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.currency || '$')}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.imageUrl)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.gigUrl)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.badges.join(', '))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.keywords.join(', '))}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.deliveryTime)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(gig.timestamp)}</Data></Cell>
      </Row>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#000000"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="sHeader">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#059669"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
      <Interior ss:Color="#10B981" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="sNumber">
      <NumberFormat ss:Format="#,##0"/>
    </Style>
    <Style ss:ID="sDecimal">
      <NumberFormat ss:Format="0.0"/>
    </Style>
    <Style ss:ID="sCurrency">
      <NumberFormat ss:Format="$#,##0.00"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Fiverr Gigs">
    <Table ss:DefaultRowHeight="20">
      <Column ss:Width="50"/>
      <Column ss:Width="250"/>
      <Column ss:Width="120"/>
      <Column ss:Width="100"/>
      <Column ss:Width="60"/>
      <Column ss:Width="80"/>
      <Column ss:Width="70"/>
      <Column ss:Width="50"/>
      <Column ss:Width="200"/>
      <Column ss:Width="200"/>
      <Column ss:Width="140"/>
      <Column ss:Width="180"/>
      <Column ss:Width="110"/>
      <Column ss:Width="150"/>
      <Row ss:StyleID="sHeader">
        <Cell><Data ss:Type="String">Position</Data></Cell>
        <Cell><Data ss:Type="String">Title</Data></Cell>
        <Cell><Data ss:Type="String">Seller Name</Data></Cell>
        <Cell><Data ss:Type="String">Level</Data></Cell>
        <Cell><Data ss:Type="String">Rating</Data></Cell>
        <Cell><Data ss:Type="String">Reviews</Data></Cell>
        <Cell><Data ss:Type="String">Price</Data></Cell>
        <Cell><Data ss:Type="String">Currency</Data></Cell>
        <Cell><Data ss:Type="String">Image URL</Data></Cell>
        <Cell><Data ss:Type="String">Gig URL</Data></Cell>
        <Cell><Data ss:Type="String">Badges</Data></Cell>
        <Cell><Data ss:Type="String">Keywords</Data></Cell>
        <Cell><Data ss:Type="String">Delivery Time</Data></Cell>
        <Cell><Data ss:Type="String">Scraped Timestamp</Data></Cell>
      </Row>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
}

/**
 * Universal export function supporting CSV, JSON, and Excel (.xls)
 */
export function exportDataset(
  gigs: FiverrGig[],
  format: ExportFormat = 'csv',
  customPrefix = 'fiverr_gigs'
): { filename: string; content: string; mimeType: string } {
  const timestamp = getFilenameTimestamp();
  let content = '';
  let extension = '';
  let mimeType = '';

  switch (format) {
    case 'json':
      content = generateJsonContent(gigs);
      extension = 'json';
      mimeType = 'application/json;charset=utf-8;';
      break;
    case 'excel':
      content = generateExcelXmlContent(gigs);
      extension = 'xls';
      mimeType = 'application/vnd.ms-excel;charset=utf-8;';
      break;
    case 'csv':
    default:
      content = generateCsvContent(gigs);
      extension = 'csv';
      mimeType = 'text/csv;charset=utf-8;';
      break;
  }

  const filename = `${customPrefix}_${timestamp}.${extension}`;

  // Download trigger
  const blob =
    format === 'csv'
      ? new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), content], { type: mimeType })
      : new Blob([content], { type: mimeType });

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
  }, 1200);

  return { filename, content, mimeType };
}
