import JSZip from 'jszip';

export interface ExtensionFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const MANIFEST_JSON = `{
  "manifest_version": 3,
  "name": "Fiverr Gig Scraper & Exporter",
  "version": "1.0.0",
  "description": "Scrapes Fiverr gig listing pages with MutationObserver lazy loading, live progress bar, filters, and auto CSV export.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
    "downloads"
  ],
  "host_permissions": [
    "*://*.fiverr.com/*"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["*://*.fiverr.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`;

export const CONTENT_JS = `/**
 * Fiverr Gig Scraper - Content Script
 * Uses MutationObserver to capture dynamically & lazy-loaded gig cards.
 * Injects an on-screen progress HUD and triggers automated CSV export.
 */

(function () {
  // Prevent multiple injections
  if (window.__fiverrScraperActive) {
    console.log('[Fiverr Scraper] Already initialized.');
    return;
  }
  window.__fiverrScraperActive = true;

  let isScraping = false;
  let isPaused = false;
  let observer = null;
  let scrollInterval = null;
  const scrapedGigs = new Map(); // gigId -> gigData
  let gigPositionCounter = 0;

  // Default configuration
  let config = {
    targetCount: 50,
    minRating: 0,
    minPrice: 0,
    maxPrice: 999999,
    autoDownloadCsv: true,
    scrollSpeed: 'medium', // 'slow' (1200ms), 'medium' (800ms), 'fast' (400ms)
  };

  // --- FLOATING HUD CREATION ---
  let hudEl = null;
  let hudProgressBar = null;
  let hudProgressText = null;
  let hudCountText = null;
  let hudStatusBadge = null;

  function createHUD() {
    if (document.getElementById('fiverr-scraper-hud')) return;

    hudEl = document.createElement('div');
    hudEl.id = 'fiverr-scraper-hud';
    hudEl.innerHTML = \`
      <div class="fsh-header">
        <div class="fsh-title-box">
          <span class="fsh-dot"></span>
          <span class="fsh-title">Fiverr Gig Scraper</span>
        </div>
        <div class="fsh-badge" id="fsh-status-badge">Idle</div>
      </div>

      <div class="fsh-progress-section">
        <div class="fsh-progress-bar-bg">
          <div class="fsh-progress-bar-fill" id="fsh-progress-fill" style="width: 0%"></div>
        </div>
        <div class="fsh-progress-meta">
          <span id="fsh-progress-text">0 / 50 gigs</span>
          <span id="fsh-percent-text">0%</span>
        </div>
      </div>

      <div class="fsh-stats-grid">
        <div class="fsh-stat-item">
          <span class="fsh-stat-label">Collected</span>
          <span class="fsh-stat-value" id="fsh-stat-collected">0</span>
        </div>
        <div class="fsh-stat-item">
          <span class="fsh-stat-label">Filtered</span>
          <span class="fsh-stat-value" id="fsh-stat-filtered">0</span>
        </div>
        <div class="fsh-stat-item">
          <span class="fsh-stat-label">Observer Events</span>
          <span class="fsh-stat-value" id="fsh-stat-mutations">0</span>
        </div>
      </div>

      <div class="fsh-filter-summary" id="fsh-filter-summary">
        Filters: Min ★ 0.0 | Price $0 - $∞
      </div>

      <div class="fsh-actions">
        <button class="fsh-btn fsh-btn-pause" id="fsh-btn-pause">Pause</button>
        <select class="fsh-select-format" id="fsh-select-format" style="background:#1f2937;color:#f3f4f6;border:1px solid #374151;border-radius:6px;font-size:11px;padding:4px 6px;">
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="json">JSON</option>
        </select>
        <button class="fsh-btn fsh-btn-export" id="fsh-btn-export">Export</button>
        <button class="fsh-btn fsh-btn-close" id="fsh-btn-close">✕</button>
      </div>
    \`;

    document.body.appendChild(hudEl);

    hudProgressBar = document.getElementById('fsh-progress-fill');
    hudProgressText = document.getElementById('fsh-progress-text');
    hudStatusBadge = document.getElementById('fsh-status-badge');

    document.getElementById('fsh-btn-pause').addEventListener('click', togglePause);
    document.getElementById('fsh-btn-export').addEventListener('click', () => {
      const fmt = document.getElementById('fsh-select-format').value || 'csv';
      exportDataset(fmt);
    });
    document.getElementById('fsh-btn-close').addEventListener('click', () => {
      stopScraping();
      hudEl.style.display = 'none';
    });
  }

  function updateHUD() {
    if (!hudEl) return;
    const collected = scrapedGigs.size;
    const target = config.targetCount;
    const percent = Math.min(100, Math.round((collected / target) * 100));

    if (hudProgressBar) hudProgressBar.style.width = percent + '%';
    if (hudProgressText) hudProgressText.innerText = \`\${collected} / \${target} gigs\`;
    const percentEl = document.getElementById('fsh-percent-text');
    if (percentEl) percentEl.innerText = percent + '%';

    const statColl = document.getElementById('fsh-stat-collected');
    if (statColl) statColl.innerText = collected;

    if (isPaused) {
      if (hudStatusBadge) {
        hudStatusBadge.innerText = 'Paused';
        hudStatusBadge.className = 'fsh-badge fsh-badge-paused';
      }
    } else if (isScraping) {
      if (hudStatusBadge) {
        hudStatusBadge.innerText = 'Scraping...';
        hudStatusBadge.className = 'fsh-badge fsh-badge-active';
      }
    } else if (collected >= target) {
      if (hudStatusBadge) {
        hudStatusBadge.innerText = 'Completed';
        hudStatusBadge.className = 'fsh-badge fsh-badge-complete';
      }
    }
  }

  // --- GIG PARSING LOGIC ---
  // Selectors targeting Fiverr's listing structure across desktop and responsive views
  const CARD_SELECTORS = [
    'div[data-testid="gig-card-layout"]',
    '.gig-card-layout',
    'div[class*="gigCard"]',
    'div.basic-gig-card',
    'div[data-gig-id]',
    'li[data-gig-id]',
    'article.gig-card'
  ];

  function extractGigFromElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;

    // Must be a gig card or contain one
    let card = null;
    for (const sel of CARD_SELECTORS) {
      if (el.matches && el.matches(sel)) {
        card = el;
        break;
      }
      const found = el.querySelector && el.querySelector(sel);
      if (found) {
        card = found;
        break;
      }
    }

    if (!card) return null;

    // 1. Gig Link & ID
    const linkEl = card.querySelector('a[href*="/gigs/"], a[href*="/categories/"], a[data-testid="gig-title-link"]') || card.querySelector('a');
    let gigUrl = linkEl ? linkEl.href : '';
    if (gigUrl && !gigUrl.startsWith('http')) {
      gigUrl = new URL(gigUrl, window.location.origin).href;
    }
    // Clean tracking query params from URL
    const cleanUrl = gigUrl ? gigUrl.split('?')[0] : '';
    const uniqueKey = card.getAttribute('data-gig-id') || cleanUrl || card.innerText.slice(0, 40);

    if (scrapedGigs.has(uniqueKey)) {
      return null; // Already scraped
    }

    // 2. Title
    const titleEl = card.querySelector('[data-testid="gig-card-title"], .gig-card-title, h3, a[title]') || linkEl;
    let title = titleEl ? (titleEl.getAttribute('title') || titleEl.innerText || '').trim() : '';
    title = title.replace(/\\s+/g, ' ');

    // 3. Seller Name & Level
    const sellerEl = card.querySelector('[data-testid="seller-name"], .seller-name, .username, [class*="sellerName"]');
    const sellerName = sellerEl ? sellerEl.innerText.trim() : 'Fiverr Freelancer';

    const levelEl = card.querySelector('[data-testid="seller-badge"], .seller-level, [class*="badge"], [aria-label*="level"]');
    let sellerLevel = 'New Seller';
    const cardText = card.innerText;
    if (cardText.includes('Top Rated')) sellerLevel = 'Top Rated';
    else if (cardText.includes('Level 2')) sellerLevel = 'Level 2';
    else if (cardText.includes('Level 1')) sellerLevel = 'Level 1';
    else if (cardText.includes('Pro Verified') || cardText.includes('Pro Talent')) sellerLevel = 'Pro Verified';
    else if (levelEl && levelEl.innerText) sellerLevel = levelEl.innerText.trim();

    // 4. Rating & Review Count
    let rating = 5.0;
    let reviewCount = 0;
    const ratingEl = card.querySelector('[data-testid="rating-score"], .rating-score, [class*="rating"]');
    if (ratingEl) {
      const match = ratingEl.innerText.match(/([0-5](\\.[0-9]+)?)/);
      if (match) rating = parseFloat(match[1]);
    } else {
      const match = cardText.match(/★?\\s*([0-5]\\.[0-9])/);
      if (match) rating = parseFloat(match[1]);
    }

    const reviewEl = card.querySelector('[data-testid="rating-count"], .rating-count, [class*="reviewCount"]');
    if (reviewEl) {
      const cleaned = reviewEl.innerText.replace(/[^0-9kK.]/g, '');
      if (cleaned.toLowerCase().includes('k')) {
        reviewCount = Math.round(parseFloat(cleaned) * 1000);
      } else {
        reviewCount = parseInt(cleaned, 10) || 0;
      }
    } else {
      const match = cardText.match(/\\(([0-9,]+(\\.[0-9]+)?k?)\\)/i);
      if (match) {
        let raw = match[1].replace(/,/g, '');
        if (raw.toLowerCase().includes('k')) reviewCount = Math.round(parseFloat(raw) * 1000);
        else reviewCount = parseInt(raw, 10) || 0;
      }
    }

    // 5. Price & Currency
    let price = 0;
    let currency = '$';
    const priceEl = card.querySelector('[data-testid="price"], .price, [class*="priceText"], [class*="Price"]');
    const priceText = priceEl ? priceEl.innerText : cardText;
    const priceMatch = priceText.match(/([$€£₹¥])\\s*([0-9,]+)/);
    if (priceMatch) {
      currency = priceMatch[1];
      price = parseInt(priceMatch[2].replace(/,/g, ''), 10);
    } else {
      const numMatch = priceText.match(/From\\s*([0-9,]+)/i) || priceText.match(/US\\$\\s*([0-9,]+)/i);
      if (numMatch) price = parseInt(numMatch[1].replace(/,/g, ''), 10);
    }

    // 6. Image URL (Support lazy loaded srcset and data-src)
    const imgEl = card.querySelector('img[src], img[data-src], img[srcset]');
    let imageUrl = '';
    if (imgEl) {
      imageUrl = imgEl.currentSrc || imgEl.src || imgEl.getAttribute('data-src') || '';
      if (imgEl.srcset && !imageUrl) {
        const sources = imgEl.srcset.split(',').map(s => s.trim().split(' ')[0]);
        imageUrl = sources[sources.length - 1] || '';
      }
    }

    // 7. Badges
    const badges = [];
    if (cardText.includes("Fiverr's Choice")) badges.push("Fiverr's Choice");
    if (cardText.includes("Top Rated")) badges.push("Top Rated");
    if (cardText.includes("Pro")) badges.push("Pro Verified");
    if (cardText.includes("Repeat orders")) badges.push("Repeat Buyer Favorite");

    // 8. Keywords & Tags
    const keywords = [];
    const tagElements = card.querySelectorAll('[data-testid="tag"], [class*="subCategory"], [class*="tagPill"]');
    tagElements.forEach(t => {
      const txt = t.innerText.trim();
      if (txt && !keywords.includes(txt)) keywords.push(txt);
    });
    if (keywords.length === 0 && title) {
      const words = title.split(' ')
        .filter(w => w.length > 3 && !['with','your','will','from','this','that'].includes(w.toLowerCase()))
        .slice(0, 4);
      keywords.push(...words);
    }

    // 9. Delivery Time
    let deliveryTime = 'Standard (2-3 days)';
    const delMatch = cardText.match(/([0-9]+\\s*(day|days|hour|hours)\\s*delivery)/i);
    if (delMatch) {
      deliveryTime = delMatch[1];
    } else if (cardText.includes('24hr delivery') || cardText.includes('24h delivery')) {
      deliveryTime = '24h Delivery';
    }

    // --- APPLY FILTERS ---
    if (rating < config.minRating) {
      incrementFilteredCount();
      return null;
    }
    if (price < config.minPrice || price > config.maxPrice) {
      incrementFilteredCount();
      return null;
    }

    gigPositionCounter++;
    const gigData = {
      id: uniqueKey,
      position: gigPositionCounter,
      title: title || 'Untitled Gig',
      sellerName,
      sellerLevel,
      rating,
      reviewCount,
      price,
      currency,
      imageUrl,
      gigUrl: cleanUrl || window.location.href,
      badges,
      keywords,
      deliveryTime,
      timestamp: new Date().toISOString()
    };

    scrapedGigs.set(uniqueKey, gigData);
    updateHUD();

    if (scrapedGigs.size >= config.targetCount) {
      finishScraping();
    }

    return gigData;
  }

  let filteredCount = 0;
  function incrementFilteredCount() {
    filteredCount++;
    const el = document.getElementById('fsh-stat-filtered');
    if (el) el.innerText = filteredCount;
  }

  let mutationEventCount = 0;
  function processNodeList(nodes) {
    if (!isScraping || isPaused) return;

    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        extractGigFromElement(node);
        const subCards = node.querySelectorAll ? node.querySelectorAll(CARD_SELECTORS.join(',')) : [];
        for (const sub of subCards) {
          extractGigFromElement(sub);
        }
      }
    }
  }

  // --- MUTATION OBSERVER SETUP ---
  function setupMutationObserver() {
    if (observer) observer.disconnect();

    observer = new MutationObserver((mutations) => {
      if (!isScraping || isPaused) return;
      mutationEventCount += mutations.length;
      const el = document.getElementById('fsh-stat-mutations');
      if (el) el.innerText = mutationEventCount;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          processNodeList(mutation.addedNodes);
        }
      }
    });

    const targetNode = document.querySelector('main, #main-wrapper, div[data-testid="search-results-list"]') || document.body;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    console.log('[Fiverr Scraper] MutationObserver active on:', targetNode);
  }

  // --- AUTO SCROLL FOR LAZY LOADED CONTENT ---
  function startAutoScroll() {
    if (scrollInterval) clearInterval(scrollInterval);

    const delays = { slow: 1400, medium: 800, fast: 400 };
    const stepDelay = delays[config.scrollSpeed] || 800;

    let noNewContentRounds = 0;
    let lastCollected = scrapedGigs.size;

    scrollInterval = setInterval(() => {
      if (!isScraping || isPaused) return;

      window.scrollBy({ top: 600, behavior: 'smooth' });

      // Check if we reached bottom of page
      const atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 300);

      if (scrapedGigs.size === lastCollected) {
        noNewContentRounds++;
      } else {
        noNewContentRounds = 0;
        lastCollected = scrapedGigs.size;
      }

      // If at bottom and no new cards appeared after 4 attempts, attempt clicking 'Next' or finish
      if (atBottom && noNewContentRounds >= 4) {
        const nextBtn = document.querySelector('a[aria-label="Next"], [data-testid="pagination-next"], .pagination-next');
        if (nextBtn && scrapedGigs.size < config.targetCount) {
          console.log('[Fiverr Scraper] Clicking next page button...');
          nextBtn.click();
          noNewContentRounds = 0;
        } else {
          console.log('[Fiverr Scraper] Reached end of results.');
          finishScraping();
        }
      }
    }, stepDelay);
  }

  // --- START / PAUSE / FINISH ---
  function startScraping(userConfig) {
    if (userConfig) config = { ...config, ...userConfig };
    createHUD();
    document.getElementById('fsh-filter-summary').innerText = 
      \`Filters: Min ★ \${config.minRating} | Price $\${config.minPrice} - $\${config.maxPrice === 999999 ? '∞' : config.maxPrice}\`;

    isScraping = true;
    isPaused = false;
    scrapedGigs.clear();
    gigPositionCounter = 0;
    filteredCount = 0;
    mutationEventCount = 0;

    setupMutationObserver();

    // Initial batch sweep on currently visible cards
    const initialCards = document.querySelectorAll(CARD_SELECTORS.join(','));
    initialCards.forEach(c => extractGigFromElement(c));

    startAutoScroll();
    updateHUD();
  }

  function togglePause() {
    isPaused = !isPaused;
    const btn = document.getElementById('fsh-btn-pause');
    if (btn) btn.innerText = isPaused ? 'Resume' : 'Pause';
    updateHUD();
  }

  function stopScraping() {
    isScraping = false;
    isPaused = false;
    if (observer) observer.disconnect();
    if (scrollInterval) clearInterval(scrollInterval);
    updateHUD();
  }

  function finishScraping(forceManual = false) {
    stopScraping();
    updateHUD();

    if (config.autoDownloadCsv || forceManual) {
      const fmt = (document.getElementById('fsh-select-format') && document.getElementById('fsh-select-format').value) || config.exportFormat || 'csv';
      exportDataset(fmt);
    }
  }

  // --- MULTI-FORMAT DATASET EXPORT (CSV, EXCEL, JSON) ---
  function exportDataset(format = 'csv') {
    const list = Array.from(scrapedGigs.values());
    if (list.length === 0) {
      alert('[Fiverr Scraper] No gigs matched your criteria to export.');
      return;
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = \`\${now.getFullYear()}-\${pad(now.getMonth() + 1)}-\${pad(now.getDate())}_\${pad(now.getHours())}-\${pad(now.getMinutes())}-\${pad(now.getSeconds())}\`;

    let blob;
    let filename = \`fiverr_gigs_\${timestamp}.\${format === 'excel' ? 'xls' : format}\`;

    if (format === 'json') {
      const jsonContent = JSON.stringify({
        metadata: {
          exported_at: now.toISOString(),
          total_records: list.length,
          scraper: 'Fiverr Gig Scraper Pro'
        },
        gigs: list
      }, null, 2);
      blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    } else if (format === 'excel') {
      // Excel XML Spreadsheet format (.xls)
      const escapeXml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      const rows = list.map(g => \`
        <Row>
          <Cell><Data ss:Type="Number">\${g.position}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.title)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.sellerName)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.sellerLevel)}</Data></Cell>
          <Cell><Data ss:Type="Number">\${g.rating.toFixed(1)}</Data></Cell>
          <Cell><Data ss:Type="Number">\${g.reviewCount}</Data></Cell>
          <Cell><Data ss:Type="Number">\${g.price}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.currency)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.imageUrl)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.gigUrl)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.badges.join(', '))}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.keywords.join(', '))}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.deliveryTime)}</Data></Cell>
          <Cell><Data ss:Type="String">\${escapeXml(g.timestamp)}</Data></Cell>
        </Row>\`).join('');

      const excelXml = \`<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Fiverr Gigs">
    <Table>
      <Row>
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
      \${rows}
    </Table>
  </Worksheet>
</Workbook>\`;
      blob = new Blob([excelXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    } else {
      // Default CSV
      const headers = [
        'Position', 'Title', 'Seller Name', 'Level', 'Rating',
        'Review Count', 'Price', 'Currency', 'Image URL', 'Gig URL',
        'Badges', 'Keywords', 'Delivery Time', 'Scraped Timestamp'
      ];
      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const s = String(val).replace(/"/g, '""');
        return \`"\${s}"\`;
      };
      const rows = list.map(g => [
        g.position, g.title, g.sellerName, g.sellerLevel,
        g.rating.toFixed(1), g.reviewCount, g.price, g.currency,
        g.imageUrl, g.gigUrl, g.badges.join(' | '), g.keywords.join(', '),
        g.deliveryTime, g.timestamp
      ]);
      const csvContent = [
        headers.map(escape).join(','),
        ...rows.map(r => r.map(escape).join(','))
      ].join('\\r\\n');

      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
      blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(url), 2000);

    if (hudStatusBadge) {
      hudStatusBadge.innerText = \`Exported (\${format.toUpperCase()})!\`;
      hudStatusBadge.className = 'fsh-badge fsh-badge-complete';
    }
    console.log(\`[Fiverr Scraper] Successfully exported \${list.length} gigs to \${filename}\`);
  }

  // Listen for messages from popup or background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'START_SCRAPING') {
      startScraping(request.config);
      sendResponse({ status: 'started' });
    } else if (request.action === 'GET_STATUS') {
      sendResponse({
        isScraping,
        isPaused,
        count: scrapedGigs.size,
        target: config.targetCount
      });
    } else if (request.action === 'STOP_SCRAPING') {
      stopScraping();
      sendResponse({ status: 'stopped' });
    } else if (request.action === 'EXPORT_CSV') {
      exportToCsv();
      sendResponse({ status: 'exported' });
    }
  });

  console.log('[Fiverr Scraper] Extension loaded and waiting for commands.');
})();
`;

export const CONTENT_CSS = `/* Injected Floating HUD for Fiverr Pages */
#fiverr-scraper-hud {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  background: #111827;
  color: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  padding: 16px;
  z-index: 9999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  user-select: none;
  animation: fshFadeIn 0.25s ease-out;
}

@keyframes fshFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.fsh-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.fsh-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fsh-dot {
  width: 10px;
  height: 10px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.fsh-title {
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
}

.fsh-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  background-color: #374151;
  color: #d1d5db;
}

.fsh-badge-active {
  background-color: #065f46;
  color: #6ee7b7;
  animation: fshPulse 1.5s infinite;
}

.fsh-badge-paused {
  background-color: #78350f;
  color: #fcd34d;
}

.fsh-badge-complete {
  background-color: #1e3a8a;
  color: #93c5fd;
}

@keyframes fshPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fsh-progress-section {
  margin-bottom: 12px;
}

.fsh-progress-bar-bg {
  width: 100%;
  height: 8px;
  background: #374151;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 6px;
}

.fsh-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s ease;
  border-radius: 9999px;
}

.fsh-progress-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.fsh-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #1f2937;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
  text-align: center;
}

.fsh-stat-item {
  display: flex;
  flex-direction: column;
}

.fsh-stat-label {
  font-size: 10px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fsh-stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #f3f4f6;
}

.fsh-filter-summary {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 12px;
  padding: 4px 6px;
  background: #1e293b;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fsh-actions {
  display: flex;
  gap: 6px;
}

.fsh-btn {
  flex: 1;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fsh-btn-pause {
  background: #374151;
  color: #f3f4f6;
}
.fsh-btn-pause:hover {
  background: #4b5563;
}

.fsh-btn-export {
  background: #10b981;
  color: #ffffff;
}
.fsh-btn-export:hover {
  background: #059669;
}

.fsh-btn-close {
  flex: 0 0 28px;
  background: transparent;
  color: #9ca3af;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fsh-btn-close:hover {
  color: #ef4444;
}
`;

export const POPUP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fiverr Gig Scraper</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 340px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 16px;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid #1e293b;
    }
    .logo-badge {
      background: #10b981;
      color: #ffffff;
      font-weight: 900;
      font-size: 14px;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .title-box h1 {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
    }
    .title-box p {
      font-size: 11px;
      color: #94a3b8;
    }
    .form-group {
      margin-bottom: 12px;
    }
    .form-label {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .input-row {
      display: flex;
      gap: 8px;
    }
    input[type="number"], select {
      width: 100%;
      background: #1e293b;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 13px;
    }
    input[type="number"]:focus, select:focus {
      outline: none;
      border-color: #10b981;
    }
    .slider-box {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    input[type="range"] {
      flex: 1;
      accent-color: #10b981;
    }
    .slider-val {
      font-weight: 700;
      color: #10b981;
      font-size: 13px;
      min-width: 32px;
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      cursor: pointer;
    }
    .checkbox-row input {
      accent-color: #10b981;
      width: 16px;
      height: 16px;
    }
    .checkbox-row span {
      font-size: 12px;
      color: #cbd5e1;
    }
    .btn-start {
      width: 100%;
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 10px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-start:hover {
      background: #059669;
    }
    .status-msg {
      margin-top: 10px;
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-badge">fi</div>
    <div class="title-box">
      <h1>Fiverr Gig Scraper</h1>
      <p>MutationObserver + Auto CSV Export</p>
    </div>
  </div>

  <div class="form-group">
    <div class="form-label">
      <span>Target Gigs to Scrape</span>
      <span id="target-count-val">50</span>
    </div>
    <div class="slider-box">
      <input type="range" id="targetCount" min="10" max="250" step="5" value="50" />
    </div>
  </div>

  <div class="form-group">
    <div class="form-label">
      <span>Minimum Rating Filter</span>
      <span class="slider-val" id="minRating-val">4.5 ★</span>
    </div>
    <div class="slider-box">
      <input type="range" id="minRating" min="0" max="5.0" step="0.1" value="4.5" />
    </div>
  </div>

  <div class="form-group">
    <div class="form-label">Price Range Filter ($ USD)</div>
    <div class="input-row">
      <input type="number" id="minPrice" placeholder="Min $" min="0" value="0" />
      <input type="number" id="maxPrice" placeholder="Max $" min="0" value="500" />
    </div>
  </div>

  <div class="form-group">
    <div class="form-label">Scroll Speed (Lazy Trigger)</div>
    <select id="scrollSpeed">
      <option value="medium" selected>Medium (Recommended - 800ms)</option>
      <option value="slow">Slow & Safe (1400ms)</option>
      <option value="fast">Fast (400ms)</option>
    </select>
  </div>

  <div class="form-group">
    <div class="form-label">Auto Export Format</div>
    <select id="exportFormat">
      <option value="csv" selected>CSV (.csv - Standard RFC 4180)</option>
      <option value="excel">Excel (.xls - Microsoft Excel / Sheets)</option>
      <option value="json">JSON (.json - Formatted)</option>
    </select>
  </div>

  <label class="checkbox-row">
    <input type="checkbox" id="autoDownloadCsv" checked />
    <span>Automatically download dataset when done</span>
  </label>

  <button class="btn-start" id="startBtn">
    🚀 Start Scraping Gigs
  </button>

  <div class="status-msg" id="statusMsg">
    Open any Fiverr search or category page to begin
  </div>

  <script src="popup.js"></script>
</body>
</html>`;

export const POPUP_JS = `// Extension Popup Logic
document.addEventListener('DOMContentLoaded', () => {
  const targetCount = document.getElementById('targetCount');
  const targetCountVal = document.getElementById('targetCountVal');
  const minRating = document.getElementById('minRating');
  const minRatingVal = document.getElementById('minRatingVal');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const scrollSpeed = document.getElementById('scrollSpeed');
  const autoDownloadCsv = document.getElementById('autoDownloadCsv');
  const exportFormat = document.getElementById('exportFormat');
  const startBtn = document.getElementById('startBtn');
  const statusMsg = document.getElementById('statusMsg');

  // Sliders feedback
  targetCount.addEventListener('input', () => {
    targetCountVal.innerText = targetCount.value;
  });
  minRating.addEventListener('input', () => {
    minRatingVal.innerText = parseFloat(minRating.value).toFixed(1) + ' ★';
  });

  // Verify current tab is Fiverr
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab || !currentTab.url || !currentTab.url.includes('fiverr.com')) {
      statusMsg.innerText = '⚠️ Please navigate to a Fiverr search or category page first!';
      statusMsg.style.color = '#f59e0b';
    } else {
      statusMsg.innerText = 'Ready to scrape: ' + new URL(currentTab.url).pathname;
    }
  });

  startBtn.addEventListener('click', () => {
    const config = {
      targetCount: parseInt(targetCount.value, 10),
      minRating: parseFloat(minRating.value),
      minPrice: parseFloat(minPrice.value) || 0,
      maxPrice: parseFloat(maxPrice.value) || 999999,
      scrollSpeed: scrollSpeed.value,
      autoDownloadCsv: autoDownloadCsv.checked,
      exportFormat: exportFormat ? exportFormat.value : 'csv'
    };

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) return;

      chrome.tabs.sendMessage(activeTab.id, {
        action: 'START_SCRAPING',
        config
      }, (response) => {
        if (chrome.runtime.lastError) {
          // If content script was not yet injected, inject it programmatically
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          }, () => {
            chrome.scripting.insertCSS({
              target: { tabId: activeTab.id },
              files: ['content.css']
            }, () => {
              chrome.tabs.sendMessage(activeTab.id, {
                action: 'START_SCRAPING',
                config
              });
              window.close();
            });
          });
        } else {
          window.close();
        }
      });
    });
  });
});
`;

export const BACKGROUND_JS = `// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Fiverr Gig Scraper] Extension successfully installed.');
});
`;

export const README_MD = `# Fiverr Gig Scraper - Chrome Extension (Manifest V3)

A Chrome extension built to scrape Fiverr gig listing and search result pages with:
- **MutationObserver** to capture lazy-loaded gig cards as they render in the DOM.
- **Real-time on-screen HUD & progress bar** showing gigs collected, filtered, and mutation events.
- **Filter options**: Minimum rating filter (e.g. >= 4.5) and price range ($min - $max).
- **12 Data Points Extracted**:
  1. Title
  2. Seller Name
  3. Seller Level (Top Rated, Level 2, Level 1, Pro Verified, New Seller)
  4. Rating score (0.0 - 5.0)
  5. Review Count (e.g. 1420)
  6. Price (USD or local currency)
  7. Image URL (handles responsive srcset / lazy data-src)
  8. Gig URL (normalized direct link)
  9. Badges ("Fiverr's Choice", "Pro Verified", "Top Rated")
  10. Keywords & Tags
  11. Delivery Time (turnaround speed)
  12. Position index in search results
  * Plus Scraped Timestamp (ISO and formatted for filename)
- **Automatic CSV Download**: Once scraping finishes or target gig count is reached, an RFC 4180 compliant CSV file is automatically generated and downloaded with a timestamped filename.
- **100% Client-Side**: No backend required.

---

## 🚀 How to Install in Google Chrome / Brave / Edge (30 Seconds)

1. **Download the ZIP**: Click the **"Download Chrome Extension (.zip)"** button in this studio.
2. **Extract the ZIP file**: Unzip \`fiverr-gig-scraper-extension.zip\` into a local folder on your computer.
3. **Open Chrome Extensions**:
   - In Google Chrome, go to \`chrome://extensions/\` in your address bar.
   - Toggle **"Developer mode"** ON in the top-right corner.
   - Click **"Load unpacked"** in the top-left corner.
   - Select the extracted folder!
4. **Scrape Fiverr**:
   - Go to [Fiverr.com](https://www.fiverr.com) and search for any service (e.g., "AI Developer", "Logo Design", "SEO").
   - Click the extension icon in your toolbar, set your target count & filters, and click **🚀 Start Scraping Gigs**!
`;

// Helper to generate simple 128x128 SVG for icon
export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#grad)" />
  <text x="64" y="84" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="64" font-weight="900" fill="#ffffff" text-anchor="middle">fi</text>
  <circle cx="96" cy="36" r="10" fill="#fbbf24" />
</svg>`;

export const EXTENSION_FILES: ExtensionFile[] = [
  {
    name: 'manifest.json',
    path: 'manifest.json',
    language: 'json',
    description: 'Manifest V3 configuration with host_permissions and scripting hooks',
    content: MANIFEST_JSON,
  },
  {
    name: 'content.js',
    path: 'content.js',
    language: 'javascript',
    description: 'Content script with MutationObserver for lazy loading, real-time HUD, and auto CSV download',
    content: CONTENT_JS,
  },
  {
    name: 'content.css',
    path: 'content.css',
    language: 'css',
    description: 'Styling for the draggable on-screen floating scraper progress HUD on Fiverr',
    content: CONTENT_CSS,
  },
  {
    name: 'popup.html',
    path: 'popup.html',
    language: 'html',
    description: 'Popup interface in Chrome toolbar to set filters and launch scraper',
    content: POPUP_HTML,
  },
  {
    name: 'popup.js',
    path: 'popup.js',
    language: 'javascript',
    description: 'Popup controller that communicates with active tab and initiates scraper',
    content: POPUP_JS,
  },
  {
    name: 'background.js',
    path: 'background.js',
    language: 'javascript',
    description: 'Manifest V3 service worker lifecycle handler',
    content: BACKGROUND_JS,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Installation and usage instructions for Chrome, Brave, and Edge',
    content: README_MD,
  },
];

/**
 * Packs all Chrome Extension files into a ZIP using JSZip and triggers browser download
 */
export async function downloadExtensionZipPackage(): Promise<void> {
  const zip = new JSZip();

  // Add files
  zip.file('manifest.json', MANIFEST_JSON);
  zip.file('content.js', CONTENT_JS);
  zip.file('content.css', CONTENT_CSS);
  zip.file('popup.html', POPUP_HTML);
  zip.file('popup.js', POPUP_JS);
  zip.file('background.js', BACKGROUND_JS);
  zip.file('README.md', README_MD);

  // Add icons folder with SVG and standard icon placeholders
  const iconsFolder = zip.folder('icons');
  if (iconsFolder) {
    iconsFolder.file('icon.svg', ICON_SVG);
    // Create simple PNG blobs via canvas in browser
    const createIconPng = (size: number): Promise<Blob | null> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Green rounded background
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, size * 0.22);
          ctx.fill();

          // Text 'fi'
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(size * 0.55)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('fi', size / 2, size / 2 + size * 0.04);
        }
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    };

    try {
      const [b16, b48, b128] = await Promise.all([
        createIconPng(16),
        createIconPng(48),
        createIconPng(128),
      ]);
      if (b16) iconsFolder.file('icon16.png', b16);
      if (b48) iconsFolder.file('icon48.png', b48);
      if (b128) iconsFolder.file('icon128.png', b128);
    } catch {
      // fallback
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fiverr-gig-scraper-chrome-extension.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
