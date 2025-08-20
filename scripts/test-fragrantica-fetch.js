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

// Fragrantica search and data fetching functions
class FragranticaDataFetcher {
  constructor() {
    this.baseUrl = 'https://www.fragrantica.com';
    this.session = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
  }

  async searchPerfume(perfumeName, brandName) {
    try {
      console.log(`🔍 Searching for: ${perfumeName} by ${brandName}`);
      
      // Search on Fragrantica
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(`${perfumeName} ${brandName}`)}`;
      console.log(`🔗 Search URL: ${searchUrl}`);
      
      const response = await this.session.get(searchUrl);
      
      if (response.status !== 200) {
        console.log(`❌ Search failed for ${perfumeName}: Status ${response.status}`);
        return null;
      }

      const $ = cheerio.load(response.data);
      
      // Look for perfume links in search results
      const perfumeLinks = $('a[href*="/perfume/"]');
      console.log(`📊 Found ${perfumeLinks.length} perfume links`);
      
      if (perfumeLinks.length === 0) {
        console.log(`❌ No perfume links found for ${perfumeName}`);
        return null;
      }

      // Find the best match
      let bestMatch = null;
      let bestScore = 0;

      perfumeLinks.each((i, link) => {
        const href = $(link).attr('href');
        const text = $(link).text().toLowerCase();
        const perfumeNameLower = perfumeName.toLowerCase();
        const brandNameLower = brandName.toLowerCase();
        
        console.log(`🔍 Link ${i + 1}: ${text} -> ${href}`);
        
        // Calculate match score
        let score = 0;
        if (text.includes(perfumeNameLower)) score += 2;
        if (text.includes(brandNameLower)) score += 1;
        if (href.includes(perfumeNameLower.replace(/\s+/g, '-'))) score += 1;
        
        console.log(`📊 Score for "${text}": ${score}`);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = href;
        }
      });

      if (bestMatch && bestScore >= 2) {
        console.log(`✅ Best match: ${bestMatch} (score: ${bestScore})`);
        return bestMatch;
      }

      console.log(`❌ No good match found for ${perfumeName}`);
      return null;
    } catch (error) {
      console.log(`❌ Search error for ${perfumeName}:`, error.message);
      return null;
    }
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
      
      // Extract image URL
      const imageElement = $('.perfume-image img, .fragrance-image img, .perfume-pic img, img[src*="perfume"]');
      let imageUrl = null;
      
      if (imageElement.length > 0) {
        imageUrl = imageElement.first().attr('src');
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${this.baseUrl}${imageUrl}`;
        }
        console.log(`🖼️  Found image: ${imageUrl}`);
      } else {
        console.log(`❌ No image found`);
      }

      // Extract description
      const descriptionElement = $('.perfume-description, .fragrance-description, .description, .perfume-info');
      let description = null;
      
      if (descriptionElement.length > 0) {
        description = descriptionElement.first().text().trim();
        console.log(`📝 Found description: ${description.substring(0, 100)}...`);
      } else {
        console.log(`❌ No description found`);
      }

      // Extract notes
      const notes = [];
      $('.notes-section .note, .fragrance-notes .note, .perfume-notes .note').each((i, element) => {
        const note = $(element).text().trim();
        if (note) notes.push(note);
      });
      
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
      // Search for the perfume
      const perfumeUrl = await this.searchPerfume(perfume.name, perfume.brand);
      
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

async function testFragranticaFetch() {
  const fetcher = new FragranticaDataFetcher();
  
  try {
    console.log('🧪 Testing Fragrantica data fetching...');
    
    // Test with just 3 perfumes
    const result = await pool.query('SELECT id, name, brand FROM perfumes ORDER BY id LIMIT 3');
    const perfumes = result.rows;
    
    console.log(`📊 Testing with ${perfumes.length} perfumes`);
    
    for (let i = 0; i < perfumes.length; i++) {
      const perfume = perfumes[i];
      
      console.log(`\n${'='.repeat(50)}`);
      console.log(`🧪 TEST ${i + 1}: ${perfume.name} by ${perfume.brand}`);
      console.log(`${'='.repeat(50)}`);
      
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
        console.log(`⏳ Waiting 3 seconds before next request...`);
        await delay(3000);
      }
    }

    console.log(`\n🎉 Test completed!`);

  } catch (error) {
    console.error('❌ Error in testFragranticaFetch:', error);
  } finally {
    await pool.end();
  }
}

// Run the test
testFragranticaFetch().catch(console.error);
