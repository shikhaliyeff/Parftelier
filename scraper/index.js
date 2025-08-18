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
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('🚀 Scraper initialized');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapePerfumePage(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await this.delay(this.delay);

      const perfumeData = await this.page.evaluate(() => {
        const extractText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };

        const extractNotes = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent.trim());
        };

        const extractYear = (text) => {
          if (!text) return null;
          const match = text.match(/(\d{4})/);
          return match ? parseInt(match[1]) : null;
        };

        // Basic info
        const name = extractText('.fragrance-name h1');
        const brand = extractText('.fragrance-brand a');
        const year = extractYear(extractText('.fragrance-year'));
        const concentration = extractText('.fragrance-concentration');
        const family = extractText('.fragrance-family');
        const gender = extractText('.fragrance-gender');
        const perfumer = extractText('.fragrance-perfumer');
        const description = extractText('.fragrance-description');
        
        // Performance
        const longevity = extractText('.longevity-rating');
        const sillage = extractText('.sillage-rating');
        
        // Notes
        const topNotes = extractNotes('.top-notes .note');
        const middleNotes = extractNotes('.middle-notes .note');
        const baseNotes = extractNotes('.base-notes .note');

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

  async scrapePopularPerfumes() {
    try {
      console.log('🔍 Starting to scrape popular perfumes...');
      
      // Start with popular perfumes page
      await this.page.goto('https://www.fragrantica.com/popular/', { waitUntil: 'networkidle2' });
      await this.delay(this.delay);

      const perfumeLinks = await this.page.evaluate(() => {
        const links = document.querySelectorAll('.perfume-card a[href*="/perfume/"]');
        return Array.from(links).map(link => link.href).slice(0, 100);
      });

      console.log(`📋 Found ${perfumeLinks.length} perfumes to scrape`);

      for (const link of perfumeLinks) {
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

      console.log(`🎉 Scraping completed! Scraped ${this.scrapedCount} perfumes`);
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
    await scraper.scrapePopularPerfumes();
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
