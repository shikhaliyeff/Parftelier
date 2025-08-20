const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Rate limiting to be respectful to Fragrantica
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fragrantica data fetching with multiple approaches
class FragranticaDataFetcher {
  constructor() {
    this.baseUrl = 'https://www.fragrantica.com';
    this.session = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0',
      }
    });
  }

  // Try direct perfume URLs based on common patterns
  async tryDirectUrl(perfumeName, brandName) {
    const commonUrls = [
      // Common Fragrantica URL patterns
      `/perfume/${brandName.toLowerCase().replace(/\s+/g, '-')}/${perfumeName.toLowerCase().replace(/\s+/g, '-')}`,
      `/perfume/${perfumeName.toLowerCase().replace(/\s+/g, '-')}-${brandName.toLowerCase().replace(/\s+/g, '-')}`,
      `/perfume/${perfumeName.toLowerCase().replace(/\s+/g, '-')}`,
    ];

    for (const url of commonUrls) {
      try {
        console.log(`🔗 Trying direct URL: ${url}`);
        const fullUrl = `${this.baseUrl}${url}`;
        const response = await this.session.get(fullUrl);
        
        if (response.status === 200) {
          console.log(`✅ Found direct URL: ${fullUrl}`);
          return url;
        }
      } catch (error) {
        // Continue to next URL
        continue;
      }
    }
    
    return null;
  }

  // Try brand page approach
  async tryBrandPage(perfumeName, brandName) {
    try {
      const brandUrl = `/brand/${brandName.toLowerCase().replace(/\s+/g, '-')}`;
      console.log(`🔗 Trying brand page: ${brandUrl}`);
      
      const fullUrl = `${this.baseUrl}${brandUrl}`;
      const response = await this.session.get(fullUrl);
      
      if (response.status === 200) {
        const $ = cheerio.load(response.data);
        
        // Look for perfume links on brand page
        const perfumeLinks = $('a[href*="/perfume/"]');
        console.log(`📊 Found ${perfumeLinks.length} perfumes on brand page`);
        
        // Find matching perfume
        const perfumeNameLower = perfumeName.toLowerCase();
        for (let i = 0; i < perfumeLinks.length; i++) {
          const link = perfumeLinks.eq(i);
          const text = link.text().toLowerCase();
          const href = link.attr('href');
          
          if (text.includes(perfumeNameLower)) {
            console.log(`✅ Found perfume on brand page: ${href}`);
            return href;
          }
        }
      }
    } catch (error) {
      console.log(`❌ Brand page approach failed: ${error.message}`);
    }
    
    return null;
  }

  async getPerfumeData(perfumeUrl) {
    try {
      console.log(`📖 Fetching data from: ${perfumeUrl}`);
      
      const fullUrl = perfumeUrl.startsWith('http') ? perfumeUrl : `${this.baseUrl}${perfumeUrl}`;
      const response = await this.session.get(fullUrl);
      
      if (response.status !== 200) {
        console.log(`❌ Failed to fetch ${perfumeUrl}: Status ${response.status}`);
        return null;
      }

      const $ = cheerio.load(response.data);
      
      // Extract image URL - try multiple selectors
      const imageSelectors = [
        '.perfume-image img',
        '.fragrance-image img', 
        '.perfume-pic img',
        '.perfume-bottle img',
        'img[src*="perfume"]',
        'img[src*="bottle"]',
        '.main-image img',
        '.product-image img'
      ];
      
      let imageUrl = null;
      for (const selector of imageSelectors) {
        const imageElement = $(selector);
        if (imageElement.length > 0) {
          imageUrl = imageElement.first().attr('src');
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${this.baseUrl}${imageUrl}`;
          }
          console.log(`🖼️  Found image with selector "${selector}": ${imageUrl}`);
          break;
        }
      }

      // Extract description - try multiple selectors
      const descSelectors = [
        '.perfume-description',
        '.fragrance-description', 
        '.description',
        '.perfume-info',
        '.fragrance-info',
        '.product-description'
      ];
      
      let description = null;
      for (const selector of descSelectors) {
        const descElement = $(selector);
        if (descElement.length > 0) {
          description = descElement.first().text().trim();
          console.log(`📝 Found description with selector "${selector}": ${description.substring(0, 100)}...`);
          break;
        }
      }

      // Extract notes - try multiple selectors
      const notesSelectors = [
        '.notes-section .note',
        '.fragrance-notes .note',
        '.perfume-notes .note',
        '.notes .note',
        '.fragrance-notes span',
        '.perfume-notes span'
      ];
      
      const notes = [];
      for (const selector of notesSelectors) {
        $(selector).each((i, element) => {
          const note = $(element).text().trim();
          if (note && !notes.includes(note)) notes.push(note);
        });
        if (notes.length > 0) break;
      }
      
      console.log(`🌿 Found ${notes.length} notes: ${notes.slice(0, 5).join(', ')}...`);

      // Extract fragrantica ID from URL
      const fragranticaId = perfumeUrl.match(/\/perfume\/([^\/]+)/)?.[1];
      console.log(`🆔 Fragrantica ID: ${fragranticaId}`);

      return {
        fragranticaId,
        imageUrl,
        description,
        notes: notes.slice(0, 10) // Limit to first 10 notes
      };
    } catch (error) {
      console.log(`❌ Error fetching data from ${perfumeUrl}:`, error.message);
      return null;
    }
  }

  async processPerfume(perfume) {
    try {
      console.log(`\n🔍 Processing: ${perfume.name} by ${perfume.brand}`);
      
      // Try direct URL first
      let perfumeUrl = await this.tryDirectUrl(perfume.name, perfume.brand);
      
      // If direct URL fails, try brand page approach
      if (!perfumeUrl) {
        perfumeUrl = await this.tryBrandPage(perfume.name, perfume.brand);
      }
      
      if (!perfumeUrl) {
        console.log(`⚠️  Could not find ${perfume.name} by ${perfume.brand}`);
        return null;
      }

      // Get detailed data
      const data = await this.getPerfumeData(perfumeUrl);
      
      if (!data) {
        console.log(`⚠️  Could not fetch data for ${perfume.name}`);
        return null;
      }

      return {
        id: perfume.id,
        fragranticaId: data.fragranticaId,
        imageUrl: data.imageUrl,
        description: data.description,
        notes: data.notes
      };
    } catch (error) {
      console.log(`❌ Error processing ${perfume.name}:`, error.message);
      return null;
    }
  }
}

async function testFragranticaAPI() {
  const fetcher = new FragranticaDataFetcher();
  
  try {
    console.log('🧪 Testing Fragrantica API approaches...');
    
    // Test with just 2 perfumes
    const result = await pool.query('SELECT id, name, brand FROM perfumes ORDER BY id LIMIT 2');
    const perfumes = result.rows;
    
    console.log(`📊 Testing with ${perfumes.length} perfumes`);
    
    for (let i = 0; i < perfumes.length; i++) {
      const perfume = perfumes[i];
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🧪 TEST ${i + 1}: ${perfume.name} by ${perfume.brand}`);
      console.log(`${'='.repeat(60)}`);
      
      const data = await fetcher.processPerfume(perfume);
      
      if (data) {
        console.log(`✅ SUCCESS: Found data for ${perfume.name}`);
        console.log(`🆔 Fragrantica ID: ${data.fragranticaId}`);
        console.log(`🖼️  Image URL: ${data.imageUrl}`);
        console.log(`📝 Description: ${data.description ? data.description.substring(0, 100) + '...' : 'None'}`);
        console.log(`🌿 Notes: ${data.notes.join(', ')}`);
      } else {
        console.log(`❌ FAILED: No data found for ${perfume.name}`);
      }
      
      // Rate limiting
      if (i < perfumes.length - 1) {
        console.log(`⏳ Waiting 5 seconds before next request...`);
        await delay(5000);
      }
    }

    console.log(`\n🎉 Test completed!`);

  } catch (error) {
    console.error('❌ Error in testFragranticaAPI:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testFragranticaAPI().catch(console.error);
