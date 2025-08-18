const puppeteer = require('puppeteer');
const { Pool } = require('pg');
const fs = require('fs').promises;
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

class FragranticaScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.delay = parseInt(process.env.SCRAPER_DELAY_MS) || 2000;
    this.maxPerfumes = parseInt(process.env.SCRAPER_MAX_PERFUMES) || 1000;
    this.scrapedCount = 0;
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    console.log('🚀 Scraper initialized');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapePerfumePage(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(this.delay);

      const perfumeData = await this.page.evaluate(() => {
        const extractText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };

        const extractNotes = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent.trim()).filter(note => note.length > 0);
        };

        const extractYear = (text) => {
          if (!text) return null;
          const match = text.match(/(\d{4})/);
          return match ? parseInt(match[1]) : null;
        };

        // Basic info - updated selectors for Fragrantica
        const name = extractText('h1') || extractText('.fragrance-name h1') || extractText('.perfume-name');
        const brand = extractText('.brand a') || extractText('.fragrance-brand a') || extractText('.perfume-brand');
        const year = extractYear(extractText('.year') || extractText('.fragrance-year') || extractText('.perfume-year'));
        const concentration = extractText('.concentration') || extractText('.fragrance-concentration');
        const family = extractText('.family') || extractText('.fragrance-family') || extractText('.perfume-family');
        const gender = extractText('.gender') || extractText('.fragrance-gender') || extractText('.perfume-gender');
        const perfumer = extractText('.perfumer') || extractText('.fragrance-perfumer');
        const description = extractText('.description') || extractText('.fragrance-description') || extractText('.perfume-description');
        
        // Performance ratings
        const longevity = extractText('.longevity') || extractText('.longevity-rating');
        const sillage = extractText('.sillage') || extractText('.sillage-rating');
        
        // Notes - updated selectors for Fragrantica
        const topNotes = extractNotes('.top-notes .note') || extractNotes('.pyramid .top .note') || extractNotes('.notes .top .note');
        const middleNotes = extractNotes('.middle-notes .note') || extractNotes('.pyramid .middle .note') || extractNotes('.notes .middle .note');
        const baseNotes = extractNotes('.base-notes .note') || extractNotes('.pyramid .base .note') || extractNotes('.notes .base .note');

        return {
          name,
          brand,
          year,
          concentration,
          family,
          gender,
          perfumer,
          description,
          longevity,
          sillage,
          notes: {
            top: topNotes,
            middle: middleNotes,
            base: baseNotes
          }
        };
      });

      return perfumeData;
    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
      return null;
    }
  }

  async savePerfumeToDatabase(perfumeData, fragranticaId) {
    try {
      // Insert perfume
      const perfumeQuery = `
        INSERT INTO perfumes (
          name, brand, year, concentration, family, gender, 
          perfumer, description, longevity, sillage, fragrantica_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (fragrantica_id) DO UPDATE SET
          name = EXCLUDED.name,
          brand = EXCLUDED.brand,
          year = EXCLUDED.year,
          concentration = EXCLUDED.concentration,
          family = EXCLUDED.family,
          gender = EXCLUDED.gender,
          perfumer = EXCLUDED.perfumer,
          description = EXCLUDED.description,
          longevity = EXCLUDED.longevity,
          sillage = EXCLUDED.sillage,
          updated_at = CURRENT_TIMESTAMP
        RETURNING id
      `;

      const perfumeValues = [
        perfumeData.name,
        perfumeData.brand,
        perfumeData.year,
        perfumeData.concentration,
        perfumeData.family,
        perfumeData.gender,
        perfumeData.perfumer,
        perfumeData.description,
        perfumeData.longevity,
        perfumeData.sillage,
        fragranticaId
      ];

      const perfumeResult = await pool.query(perfumeQuery, perfumeValues);
      const perfumeId = perfumeResult.rows[0].id;

      // Insert notes
      if (perfumeData.notes) {
        for (const [category, notes] of Object.entries(perfumeData.notes)) {
          for (const noteName of notes) {
            // Insert note if it doesn't exist
            const noteQuery = `
              INSERT INTO notes (name, category, family)
              VALUES ($1, $2, $3)
              ON CONFLICT (name) DO UPDATE SET
                category = EXCLUDED.category,
                family = EXCLUDED.family
              RETURNING id
            `;
            
            const noteResult = await pool.query(noteQuery, [noteName, category, null]);
            const noteId = noteResult.rows[0].id;

            // Link note to perfume
            const perfumeNoteQuery = `
              INSERT INTO perfume_notes (perfume_id, note_id)
              VALUES ($1, $2)
              ON CONFLICT (perfume_id, note_id) DO NOTHING
            `;
            
            await pool.query(perfumeNoteQuery, [perfumeId, noteId]);
          }
        }
      }

      console.log(`✅ Saved: ${perfumeData.name} by ${perfumeData.brand}`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving perfume to database:`, error);
      return false;
    }
  }

  async scrapeNichePerfumes() {
    try {
      console.log('🔍 Starting to scrape niche perfumes...');
      
      // List of niche perfume brands to scrape
      const nicheBrands = [
        'Creed',
        'Tom Ford',
        'Maison Francis Kurkdjian',
        'Byredo',
        'Le Labo',
        'Diptyque',
        'Jo Malone',
        'Penhaligon\'s',
        'Amouage',
        'Xerjoff',
        'Roja Dove',
        'Parfums de Marly',
        'Initio Parfums',
        'Mancera',
        'Montale',
        'Serge Lutens',
        'L\'Artisan Parfumeur',
        'Annick Goutal',
        'Frederic Malle',
        'Maison Margiela',
        'Kilian',
        'By Kilian',
        'Maison Christian Dior',
        'Guerlain',
        'Chanel',
        'Dior',
        'Hermès',
        'Bvlgari',
        'Cartier',
        'Yves Saint Laurent'
      ];

      const perfumeLinks = [];

      // Scrape perfumes from each niche brand
      for (const brand of nicheBrands) {
        try {
          console.log(`🔍 Scraping perfumes from ${brand}...`);
          
          // Search for the brand on Fragrantica
          const searchUrl = `https://www.fragrantica.com/search?q=${encodeURIComponent(brand)}`;
          await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
          await this.delay(this.delay);

          const brandPerfumes = await this.page.evaluate(() => {
            const links = document.querySelectorAll('a[href*="/perfume/"]');
            return Array.from(links)
              .map(link => link.href)
              .filter(href => href.includes('/perfume/'))
              .slice(0, 20); // Limit to 20 perfumes per brand
          });

          perfumeLinks.push(...brandPerfumes);
          console.log(`📋 Found ${brandPerfumes.length} perfumes from ${brand}`);
          
          // Be respectful with delays between brands
          await this.delay(this.delay * 2);
        } catch (error) {
          console.error(`❌ Error scraping ${brand}:`, error.message);
          continue;
        }
      }

      // Remove duplicates
      const uniqueLinks = [...new Set(perfumeLinks)];
      console.log(`📋 Found ${uniqueLinks.length} unique niche perfumes to scrape`);

      for (const link of uniqueLinks) {
        if (this.scrapedCount >= this.maxPerfumes) {
          console.log(`🛑 Reached maximum limit of ${this.maxPerfumes} perfumes`);
          break;
        }

        const fragranticaId = link.split('/perfume/')[1]?.split('/')[0];
        if (!fragranticaId) continue;

        const perfumeData = await this.scrapePerfumePage(link);
        if (perfumeData && perfumeData.name) {
          const saved = await this.savePerfumeToDatabase(perfumeData, fragranticaId);
          if (saved) {
            this.scrapedCount++;
          }
        }

        // Be respectful with delays
        await this.delay(this.delay);
      }

      console.log(`🎉 Scraping completed! Scraped ${this.scrapedCount} niche perfumes`);
    } catch (error) {
      console.error('❌ Error during scraping:', error);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    await pool.end();
    console.log('🔒 Scraper closed');
  }
}

const runScraper = async () => {
  const scraper = new FragranticaScraper();
  
  try {
    await scraper.init();
    await scraper.scrapeNichePerfumes();
  } catch (error) {
    console.error('💥 Scraper failed:', error);
  } finally {
    await scraper.close();
  }
};

if (require.main === module) {
  runScraper();
}

module.exports = { FragranticaScraper };
