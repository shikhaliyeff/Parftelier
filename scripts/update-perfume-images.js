const { Pool } = require('pg');
const puppeteer = require('puppeteer');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

class FragranticaImageScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.delay = 2000; // 2 seconds delay between requests
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid being blocked
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scrapePerfumeImage(fragranticaId) {
    try {
      const url = `https://www.fragrantica.com/perfume/${fragranticaId}`;
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      await this.delay(1000);

      // Extract the main perfume image
      const imageUrl = await this.page.evaluate(() => {
        // Try multiple selectors for the main perfume image
        const selectors = [
          '.perfume-image img',
          '.fragrance-image img',
          '.main-image img',
          '.perfume-photo img',
          '.fragrance-photo img',
          '.product-image img',
          '.image-container img',
          'img[alt*="perfume"]',
          'img[alt*="fragrance"]'
        ];

        for (const selector of selectors) {
          const img = document.querySelector(selector);
          if (img && img.src) {
            return img.src;
          }
        }

        // If no specific perfume image found, try to get any image that looks like a perfume bottle
        const allImages = document.querySelectorAll('img');
        for (const img of allImages) {
          const src = img.src;
          const alt = img.alt || '';
          
          // Look for images that are likely perfume bottles
          if (src && 
              (src.includes('fragrantica') || src.includes('perfume') || src.includes('bottle')) &&
              !src.includes('logo') && 
              !src.includes('avatar') &&
              !src.includes('icon') &&
              img.width > 100 && 
              img.height > 100) {
            return src;
          }
        }

        return null;
      });

      return imageUrl;
    } catch (error) {
      console.error(`❌ Error scraping image for fragrantica ID ${fragranticaId}:`, error.message);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function updatePerfumeImages() {
  const scraper = new FragranticaImageScraper();
  
  try {
    console.log('🖼️  Starting to update perfume images with real Fragrantica images...');
    
    // Get perfumes that have fragrantica_id but no real image
    const result = await pool.query(`
      SELECT id, name, brand, fragrantica_id, image_url
      FROM perfumes
      WHERE fragrantica_id IS NOT NULL 
        AND fragrantica_id != ''
        AND (image_url IS NULL 
             OR image_url = '' 
             OR image_url LIKE '%unsplash%'
             OR image_url LIKE '%placeholder%'
             OR image_url NOT LIKE '%fragrantica%')
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} perfumes to update with real Fragrantica images`);
    
    if (result.rows.length === 0) {
      console.log('✅ All perfumes already have real images!');
      return;
    }

    await scraper.init();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const perfume of result.rows) {
      try {
        console.log(`🔍 Scraping image for: ${perfume.name} by ${perfume.brand} (ID: ${perfume.fragrantica_id})`);
        
        const imageUrl = await scraper.scrapePerfumeImage(perfume.fragrantica_id);
        
        if (imageUrl) {
          await pool.query(
            'UPDATE perfumes SET image_url = $1 WHERE id = $2',
            [imageUrl, perfume.id]
          );
          console.log(`✅ Updated: ${perfume.name} by ${perfume.brand} with real image`);
          successCount++;
        } else {
          console.log(`⚠️  No image found for: ${perfume.name} by ${perfume.brand}`);
          errorCount++;
        }
        
        // Add delay between requests to be respectful to Fragrantica
        await scraper.delay(scraper.delay);
        
      } catch (error) {
        console.error(`❌ Error updating ${perfume.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Image update completed!`);
    console.log(`✅ Successfully updated: ${successCount} perfumes`);
    console.log(`❌ Failed to update: ${errorCount} perfumes`);
    
  } catch (error) {
    console.error('❌ Error in updatePerfumeImages:', error);
  } finally {
    await scraper.close();
    await pool.end();
  }
}

// Run the script
updatePerfumeImages().catch(console.error);
