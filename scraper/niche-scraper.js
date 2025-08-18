const puppeteer = require('puppeteer');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Comprehensive list of niche perfume brands
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
  'Yves Saint Laurent',
  'Narciso Rodriguez',
  'Comme des Garçons',
  'Maison Martin Margiela',
  'Atelier Cologne',
  'Acqua di Parma',
  'L\'Occitane',
  'Miller Harris',
  'Floris',
  'Creed',
  'Bond No. 9',
  'Clive Christian',
  'Roja Parfums',
  'House of Sillage',
  'M. Micallef',
  'The Different Company',
  'Etat Libre d\'Orange',
  'Nasomatto',
  'Orto Parisi',
  'Profumum Roma',
  'Santa Maria Novella',
  'Carthusia',
  'Acqua di Stresa',
  'Profumo di Firenze',
  'I Profumi di Firenze',
  'Lorenzo Villoresi',
  'Bois 1920',
  'Nobile 1942',
  'Meo Fusciuni',
  'Bogue',
  'Areej Le Doré',
  'Ensar Oud',
  'Agar Aura',
  'Rising Phoenix Perfumery',
  'Sultan Pasha Attars',
  'Al Shareef Oudh',
  'Feel Oud',
  'Agarscents Bazaar',
  'Oudimentary',
  'Mellifluence',
  'Alkemia Perfumes',
  'Solstice Scents',
  'Sixteen92',
  'Deconstructing Eden',
  'Possets Perfume',
  'Black Phoenix Alchemy Lab',
  'Arcana Wildcraft',
  'Nui Cobalt Designs',
  'CocoaPink',
  'Haus of Gloi',
  'Sucreabeille',
  'The Strange South',
  'Hexennacht',
  'Death and Floral',
  'Stereoplasm',
  'Fantôme',
  'Pulp Fragrance',
  'Poesie',
  'Kyse Perfumes',
  'Luvmilk',
  'Siren Song Elixirs',
  'Alpha Musk',
  'Andromeda\'s Curse',
  'Astrid Perfume',
  'Black Baccara',
  'Blooddrop',
  'BPAL',
  'Crow & Pebble',
  'Darling Clandestine',
  'Deep Midnight',
  'Epically Epic',
  'Firebird',
  'Future Primitive',
  'Haus of Gloi',
  'Haus of Gloi',
  'Imaginary Authors',
  'Indie Beauté',
  'Kheimistrii',
  'Latherati',
  'Lou Lou\'s',
  'Moonalisa',
  'Nocturne Alchemy',
  'Olympic Orchids',
  'Paintbox Soapworks',
  'Possets',
  'Savor',
  'Sixteen92',
  'Smelly Yeti',
  'Solstice Scents',
  'Southern Comforts',
  'Sugar & Spite',
  'Ten Three Labs',
  'The Strange South',
  'Violette Market',
  'Wylde Ivy',
  'Zoologist',
  'BeauFort London',
  'Boadicea the Victorious',
  'Bond No. 9',
  'By Kilian',
  'Clive Christian',
  'Creed',
  'Dusita',
  'Etat Libre d\'Orange',
  'Fragrance Du Bois',
  'House of Sillage',
  'Initio Parfums',
  'Kilian',
  'Maison Francis Kurkdjian',
  'Mancera',
  'M. Micallef',
  'Montale',
  'Nasomatto',
  'Orto Parisi',
  'Parfums de Marly',
  'Profumum Roma',
  'Roja Dove',
  'Serge Lutens',
  'The Different Company',
  'Xerjoff'
];

class NichePerfumeScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.delay = 3000; // 3 seconds between requests
    this.maxPerfumes = 1000;
    this.scrapedCount = 0;
    this.existingPerfumes = new Set();
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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    // Load existing perfumes to avoid duplicates
    await this.loadExistingPerfumes();
    
    console.log('🚀 Niche Perfume Scraper initialized');
  }

  async loadExistingPerfumes() {
    try {
      const result = await pool.query('SELECT name, brand FROM perfumes');
      result.rows.forEach(row => {
        this.existingPerfumes.add(`${row.name}|${row.brand}`);
      });
      console.log(`📋 Loaded ${this.existingPerfumes.size} existing perfumes`);
    } catch (error) {
      console.error('❌ Error loading existing perfumes:', error);
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapeBrandPerfumes(brand) {
    try {
      console.log(`🔍 Scraping perfumes from ${brand}...`);
      
      // Search for the brand on Fragrantica
      const searchUrl = `https://www.fragrantica.com/search?q=${encodeURIComponent(brand)}`;
      
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      await this.delay(this.delay);

      // Extract perfume links
      const perfumeLinks = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/perfume/"]'));
        return links
          .map(link => link.href)
          .filter(href => href.includes('/perfume/'))
          .slice(0, 50); // Limit to 50 perfumes per brand
      });

      console.log(`📋 Found ${perfumeLinks.length} perfumes from ${brand}`);

      // Scrape each perfume
      for (const link of perfumeLinks) {
        if (this.scrapedCount >= this.maxPerfumes) {
          console.log(`🛑 Reached maximum limit of ${this.maxPerfumes} perfumes`);
          return;
        }

        const fragranticaId = link.split('/perfume/')[1]?.split('/')[0];
        if (!fragranticaId) continue;

        const perfumeData = await this.scrapePerfumePage(link);
        if (perfumeData && perfumeData.name && perfumeData.brand) {
          const key = `${perfumeData.name}|${perfumeData.brand}`;
          if (!this.existingPerfumes.has(key)) {
            const saved = await this.savePerfumeToDatabase(perfumeData, fragranticaId);
            if (saved) {
              this.scrapedCount++;
              this.existingPerfumes.add(key);
            }
          }
        }

        await this.delay(this.delay);
      }

    } catch (error) {
      console.error(`❌ Error scraping ${brand}:`, error.message);
    }
  }

  async scrapePerfumePage(url) {
    try {
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      await this.delay(1000);

      const perfumeData = await this.page.evaluate(() => {
        const extractText = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };

        const extractNotes = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements)
            .map(el => el.textContent.trim())
            .filter(note => note.length > 0);
        };

        const extractYear = (text) => {
          if (!text) return null;
          const match = text.match(/(\d{4})/);
          return match ? parseInt(match[1]) : null;
        };

        // Try multiple selectors for different page layouts
        const name = extractText('h1') || 
                    extractText('.fragrance-name h1') || 
                    extractText('.perfume-name') ||
                    extractText('.name');

        const brand = extractText('.brand a') || 
                     extractText('.fragrance-brand a') || 
                     extractText('.perfume-brand') ||
                     extractText('.brand');

        const year = extractYear(extractText('.year') || 
                               extractText('.fragrance-year') || 
                               extractText('.perfume-year'));

        const concentration = extractText('.concentration') || 
                            extractText('.fragrance-concentration');

        const family = extractText('.family') || 
                      extractText('.fragrance-family') || 
                      extractText('.perfume-family');

        const gender = extractText('.gender') || 
                      extractText('.fragrance-gender') || 
                      extractText('.perfume-gender');

        const perfumer = extractText('.perfumer') || 
                        extractText('.fragrance-perfumer');

        const description = extractText('.description') || 
                           extractText('.fragrance-description') || 
                           extractText('.perfume-description');

        const longevity = extractText('.longevity') || 
                         extractText('.longevity-rating');

        const sillage = extractText('.sillage') || 
                       extractText('.sillage-rating');

        // Notes - try multiple selectors
        const topNotes = extractNotes('.top-notes .note') || 
                        extractNotes('.pyramid .top .note') || 
                        extractNotes('.notes .top .note') ||
                        extractNotes('.top .note');

        const middleNotes = extractNotes('.middle-notes .note') || 
                           extractNotes('.pyramid .middle .note') || 
                           extractNotes('.notes .middle .note') ||
                           extractNotes('.middle .note');

        const baseNotes = extractNotes('.base-notes .note') || 
                         extractNotes('.pyramid .base .note') || 
                         extractNotes('.notes .base .note') ||
                         extractNotes('.base .note');

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

  async scrapeAllNichePerfumes() {
    try {
      console.log('🔍 Starting to scrape all niche perfumes...');
      
      for (const brand of nicheBrands) {
        await this.scrapeBrandPerfumes(brand);
        
        // Be respectful with delays between brands
        await this.delay(this.delay * 2);
      }

      console.log(`🎉 Scraping completed! Scraped ${this.scrapedCount} new niche perfumes`);
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

const runNicheScraper = async () => {
  const scraper = new NichePerfumeScraper();
  
  try {
    await scraper.init();
    await scraper.scrapeAllNichePerfumes();
  } catch (error) {
    console.error('💥 Scraper failed:', error);
  } finally {
    await scraper.close();
  }
};

if (require.main === module) {
  runNicheScraper();
}

module.exports = { NichePerfumeScraper };
