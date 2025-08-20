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

class FragranticaIDFinder {
  constructor() {
    this.browser = null;
    this.page = null;
    this.delay = 3000; // 3 seconds delay between requests
  }

  async init() {
    this.browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid being blocked
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async findFragranticaID(perfumeName, brandName) {
    try {
      // Create search query
      const searchQuery = `${perfumeName} ${brandName}`;
      const searchUrl = `https://www.fragrantica.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      console.log(`🔍 Searching for: ${searchQuery}`);
      
      await this.page.goto(searchUrl, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });

      await this.delay(1000);

      // Extract perfume links from search results
      const perfumeData = await this.page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/perfume/"]'));
        const results = [];
        
        for (const link of links) {
          const href = link.href;
          const fragranticaId = href.split('/perfume/')[1]?.split('/')[0];
          
          if (fragranticaId) {
            // Try to get the perfume name and brand from the link text or nearby elements
            const linkText = link.textContent?.trim() || '';
            const parentElement = link.closest('.perfume-card, .search-result, .item');
            const brandElement = parentElement?.querySelector('.brand, .perfume-brand');
            const brandText = brandElement?.textContent?.trim() || '';
            
            results.push({
              fragranticaId,
              name: linkText,
              brand: brandText,
              url: href
            });
          }
        }
        
        return results.slice(0, 5); // Limit to first 5 results
      });

      // Find the best match
      if (perfumeData.length > 0) {
        const bestMatch = this.findBestMatch(perfumeData, perfumeName, brandName);
        if (bestMatch) {
          console.log(`✅ Found match: ${bestMatch.name} by ${bestMatch.brand} (ID: ${bestMatch.fragranticaId})`);
          return bestMatch.fragranticaId;
        }
      }

      console.log(`⚠️  No match found for: ${perfumeName} by ${brandName}`);
      return null;

    } catch (error) {
      console.error(`❌ Error searching for ${perfumeName} by ${brandName}:`, error.message);
      return null;
    }
  }

  findBestMatch(results, targetName, targetBrand) {
    // Simple matching logic - can be improved
    const targetNameLower = targetName.toLowerCase();
    const targetBrandLower = targetBrand.toLowerCase();
    
    for (const result of results) {
      const resultNameLower = result.name.toLowerCase();
      const resultBrandLower = result.brand.toLowerCase();
      
      // Check if both name and brand match
      if (resultNameLower.includes(targetNameLower) && resultBrandLower.includes(targetBrandLower)) {
        return result;
      }
      
      // Check if name matches and brand is similar
      if (resultNameLower.includes(targetNameLower) && 
          (resultBrandLower.includes(targetBrandLower) || targetBrandLower.includes(resultBrandLower))) {
        return result;
      }
    }
    
    // If no exact match, return the first result
    return results[0];
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

async function populateFragranticaIDs() {
  const finder = new FragranticaIDFinder();
  
  try {
    console.log('🔍 Starting to populate Fragrantica IDs...');
    
    // Get perfumes that don't have fragrantica_id (limit to 10 for testing)
    const result = await pool.query(`
      SELECT id, name, brand
      FROM perfumes
      WHERE fragrantica_id IS NULL OR fragrantica_id = ''
      ORDER BY id
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} perfumes without Fragrantica IDs (testing with first 10)`);
    
    if (result.rows.length === 0) {
      console.log('✅ All perfumes already have Fragrantica IDs!');
      return;
    }

    await finder.init();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const perfume of result.rows) {
      try {
        const fragranticaId = await finder.findFragranticaID(perfume.name, perfume.brand);
        
        if (fragranticaId) {
          await pool.query(
            'UPDATE perfumes SET fragrantica_id = $1 WHERE id = $2',
            [fragranticaId, perfume.id]
          );
          console.log(`✅ Updated: ${perfume.name} by ${perfume.brand} with ID: ${fragranticaId}`);
          successCount++;
        } else {
          console.log(`⚠️  No ID found for: ${perfume.name} by ${perfume.brand}`);
          errorCount++;
        }
        
        // Add delay between requests to be respectful to Fragrantica
        await this.delay(this.delay);
        
      } catch (error) {
        console.error(`❌ Error updating ${perfume.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Fragrantica ID population completed!`);
    console.log(`✅ Successfully updated: ${successCount} perfumes`);
    console.log(`❌ Failed to update: ${errorCount} perfumes`);
    
  } catch (error) {
    console.error('❌ Error in populateFragranticaIDs:', error);
  } finally {
    await finder.close();
    await pool.end();
  }
}

// Run the script
populateFragranticaIDs().catch(console.error);
