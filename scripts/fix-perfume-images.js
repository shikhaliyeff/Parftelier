const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// High-quality perfume bottle images from Unsplash
// These are beautiful, professional perfume bottle photos
const getHighQualityPerfumeImage = (perfume) => {
  const perfumeImages = {
    // Luxury perfume bottles
    'Chanel': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Dior': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Tom Ford': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Jo Malone': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Byredo': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Maison Margiela': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Le Labo': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Creed': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Frederic Malle': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Serge Lutens': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Hermès': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Guerlain': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Yves Saint Laurent': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Givenchy': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Lancôme': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Estée Lauder': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Versace': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Dolce & Gabbana': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Giorgio Armani': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Bvlgari': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Cartier': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Van Cleef & Arpels': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Penhaligon\'s': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Floris': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Amouage': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Xerjoff': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Roja Dove': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Parfums de Marly': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Initio': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Kilian': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Maison Francis Kurkdjian': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Diptyque': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'L\'Artisan Parfumeur': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Annick Goutal': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Lutens': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85'
  };
  
  return perfumeImages[perfume.brand] || perfumeImages['Chanel'];
};

async function fixPerfumeImages() {
  try {
    console.log('🖼️  Starting to fix perfume images with high-quality placeholder images...');
    
    // Get all perfumes
    const result = await pool.query(`
      SELECT id, name, brand, image_url
      FROM perfumes
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} perfumes to process`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const perfume of result.rows) {
      try {
        // Use high-quality brand-specific placeholder images
        const imageUrl = getHighQualityPerfumeImage(perfume);
        
        // Update the perfume
        await pool.query(
          'UPDATE perfumes SET image_url = $1 WHERE id = $2',
          [imageUrl, perfume.id]
        );
        
        console.log(`✅ Updated: ${perfume.name} by ${perfume.brand} with high-quality image`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating ${perfume.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Perfume image fix completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} perfumes`);
    console.log(`❌ Errors: ${errorCount} perfumes`);
    console.log(`📝 Note: All images are high-quality placeholder images from Unsplash`);
    
  } catch (error) {
    console.error('❌ Error in fixPerfumeImages:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
fixPerfumeImages().catch(console.error);
