const { Pool } = require('pg');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
      const response = await this.session.get(searchUrl);
      
      if (response.status !== 200) {
        console.log(`❌ Search failed for ${perfumeName}: Status ${response.status}`);
        return null;
      }

      const $ = cheerio.load(response.data);
      
      // Look for perfume links in search results
      const perfumeLinks = $('a[href*="/perfume/"]');
      
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
        
        // Calculate match score
        let score = 0;
        if (text.includes(perfumeNameLower)) score += 2;
        if (text.includes(brandNameLower)) score += 1;
        if (href.includes(perfumeNameLower.replace(/\s+/g, '-'))) score += 1;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = href;
        }
      });

      if (bestMatch && bestScore >= 2) {
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
      const imageElement = $('.perfume-image img, .fragrance-image img, .perfume-pic img');
      let imageUrl = null;
      
      if (imageElement.length > 0) {
        imageUrl = imageElement.first().attr('src');
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${this.baseUrl}${imageUrl}`;
        }
      }

      // Extract description
      const descriptionElement = $('.perfume-description, .fragrance-description, .description');
      let description = null;
      
      if (descriptionElement.length > 0) {
        description = descriptionElement.first().text().trim();
      }

      // Extract notes
      const notes = [];
      $('.notes-section .note, .fragrance-notes .note').each((i, element) => {
        const note = $(element).text().trim();
        if (note) notes.push(note);
      });

      // Extract fragrantica ID from URL
      const fragranticaId = perfumeUrl.match(/\/perfume\/([^\/]+)/)?.[1];

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

async function fetchRealFragranticaData() {
  const fetcher = new FragranticaDataFetcher();
  
  try {
    console.log('🔄 Starting to fetch real Fragrantica data...');
    
    // Get all perfumes from database
    const result = await pool.query('SELECT id, name, brand FROM perfumes ORDER BY id');
    const perfumes = result.rows;
    
    console.log(`📊 Found ${perfumes.length} perfumes to process`);
    
    let successCount = 0;
    let errorCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < perfumes.length; i++) {
      const perfume = perfumes[i];
      
      try {
        console.log(`\n[${i + 1}/${perfumes.length}] Processing: ${perfume.name} by ${perfume.brand}`);
        
        const data = await fetcher.processPerfume(perfume);
        
        if (data) {
          // Update database with real Fragrantica data
          await pool.query(
            `UPDATE perfumes 
             SET fragrantica_id = $1, 
                 image_url = $2, 
                 description = $3
             WHERE id = $4`,
            [data.fragranticaId, data.imageUrl, data.description, data.id]
          );

          // Update notes if we have them
          if (data.notes && data.notes.length > 0) {
            // Clear existing notes
            await pool.query('DELETE FROM perfume_notes WHERE perfume_id = $1', [data.id]);
            
            // Add new notes
            for (const note of data.notes) {
              await pool.query(
                `INSERT INTO perfume_notes (perfume_id, note_id) 
                 SELECT $1, id FROM notes WHERE name ILIKE $2`,
                [data.id, note]
              );
            }
          }

          console.log(`✅ Updated: ${perfume.name} with real Fragrantica data`);
          successCount++;
          updatedCount++;
        } else {
          console.log(`⚠️  Skipped: ${perfume.name} - no data found`);
          errorCount++;
        }

        // Rate limiting - be respectful to Fragrantica
        await delay(2000); // 2 second delay between requests
        
      } catch (error) {
        console.error(`❌ Error processing ${perfume.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Fragrantica data fetching completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} perfumes`);
    console.log(`❌ Errors: ${errorCount} perfumes`);
    console.log(`📝 Note: All data is now sourced directly from Fragrantica`);

  } catch (error) {
    console.error('❌ Error in fetchRealFragranticaData:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
fetchRealFragranticaData().catch(console.error);
