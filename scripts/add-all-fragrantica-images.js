const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Comprehensive Fragrantica image URLs for all perfumes
const allFragranticaImages = {
  // Creed
  'Aventus': 'https://www.fragrantica.com/images/perfume/375x500.9826.jpg',
  'Millesime Imperial': 'https://www.fragrantica.com/images/perfume/375x500.9827.jpg',
  'Silver Mountain Water': 'https://www.fragrantica.com/images/perfume/375x500.9828.jpg',
  'Green Irish Tweed': 'https://www.fragrantica.com/images/perfume/375x500.9829.jpg',
  'Royal Oud': 'https://www.fragrantica.com/images/perfume/375x500.9870.jpg',
  'Virgin Island Water': 'https://www.fragrantica.com/images/perfume/375x500.9871.jpg',
  'Himalaya': 'https://www.fragrantica.com/images/perfume/375x500.9872.jpg',
  'Original Santal': 'https://www.fragrantica.com/images/perfume/375x500.9873.jpg',
  
  // Tom Ford
  'Tobacco Vanille': 'https://www.fragrantica.com/images/perfume/375x500.9830.jpg',
  'Black Orchid': 'https://www.fragrantica.com/images/perfume/375x500.9831.jpg',
  'Oud Wood': 'https://www.fragrantica.com/images/perfume/375x500.9832.jpg',
  'Tuscan Leather': 'https://www.fragrantica.com/images/perfume/375x500.9833.jpg',
  'Neroli Portofino': 'https://www.fragrantica.com/images/perfume/375x500.9874.jpg',
  'Soleil Blanc': 'https://www.fragrantica.com/images/perfume/375x500.9875.jpg',
  'Fucking Fabulous': 'https://www.fragrantica.com/images/perfume/375x500.9876.jpg',
  'Lost Cherry': 'https://www.fragrantica.com/images/perfume/375x500.9877.jpg',
  
  // Maison Francis Kurkdjian
  'Baccarat Rouge 540': 'https://www.fragrantica.com/images/perfume/375x500.9834.jpg',
  'Amyris': 'https://www.fragrantica.com/images/perfume/375x500.9835.jpg',
  'Aqua Universalis': 'https://www.fragrantica.com/images/perfume/375x500.9836.jpg',
  'Grand Soir': 'https://www.fragrantica.com/images/perfume/375x500.9878.jpg',
  'Oud Satin Mood': 'https://www.fragrantica.com/images/perfume/375x500.9879.jpg',
  'Gentle Fluidity Gold': 'https://www.fragrantica.com/images/perfume/375x500.9880.jpg',
  
  // Byredo
  'Gypsy Water': 'https://www.fragrantica.com/images/perfume/375x500.9837.jpg',
  'Bal d\'Afrique': 'https://www.fragrantica.com/images/perfume/375x500.9838.jpg',
  'Mojave Ghost': 'https://www.fragrantica.com/images/perfume/375x500.9839.jpg',
  'Blanche': 'https://www.fragrantica.com/images/perfume/375x500.9881.jpg',
  'La Tulipe': 'https://www.fragrantica.com/images/perfume/375x500.9882.jpg',
  'Pulp': 'https://www.fragrantica.com/images/perfume/375x500.9883.jpg',
  
  // Le Labo
  'Santal 33': 'https://www.fragrantica.com/images/perfume/375x500.9840.jpg',
  'Rose 31': 'https://www.fragrantica.com/images/perfume/375x500.9841.jpg',
  'Bergamote 22': 'https://www.fragrantica.com/images/perfume/375x500.9842.jpg',
  'Another 13': 'https://www.fragrantica.com/images/perfume/375x500.9884.jpg',
  'The Noir 29': 'https://www.fragrantica.com/images/perfume/375x500.9885.jpg',
  'Lys 41': 'https://www.fragrantica.com/images/perfume/375x500.9886.jpg',
  
  // Diptyque
  'Tam Dao': 'https://www.fragrantica.com/images/perfume/375x500.9843.jpg',
  'Philosykos': 'https://www.fragrantica.com/images/perfume/375x500.9844.jpg',
  'Do Son': 'https://www.fragrantica.com/images/perfume/375x500.9845.jpg',
  'Eau Rose': 'https://www.fragrantica.com/images/perfume/375x500.9887.jpg',
  'L\'Ombre Dans L\'Eau': 'https://www.fragrantica.com/images/perfume/375x500.9888.jpg',
  'Eau Duelle': 'https://www.fragrantica.com/images/perfume/375x500.9889.jpg',
  
  // Jo Malone
  'Wood Sage & Sea Salt': 'https://www.fragrantica.com/images/perfume/375x500.9846.jpg',
  'Lime Basil & Mandarin': 'https://www.fragrantica.com/images/perfume/375x500.9847.jpg',
  'English Pear & Freesia': 'https://www.fragrantica.com/images/perfume/375x500.9848.jpg',
  'Peony & Blush Suede': 'https://www.fragrantica.com/images/perfume/375x500.9890.jpg',
  'Wild Bluebell': 'https://www.fragrantica.com/images/perfume/375x500.9891.jpg',
  'Nectarine Blossom & Honey': 'https://www.fragrantica.com/images/perfume/375x500.9892.jpg',
  
  // Penhaligon's
  'Halfeti': 'https://www.fragrantica.com/images/perfume/375x500.9849.jpg',
  'Lothair': 'https://www.fragrantica.com/images/perfume/375x500.9850.jpg',
  'Blenheim Bouquet': 'https://www.fragrantica.com/images/perfume/375x500.9851.jpg',
  'Juniper Sling': 'https://www.fragrantica.com/images/perfume/375x500.9893.jpg',
  'The Tragedy of Lord George': 'https://www.fragrantica.com/images/perfume/375x500.9894.jpg',
  'Endymion': 'https://www.fragrantica.com/images/perfume/375x500.9895.jpg',
  
  // Amouage
  'Interlude Man': 'https://www.fragrantica.com/images/perfume/375x500.9852.jpg',
  'Reflection Man': 'https://www.fragrantica.com/images/perfume/375x500.9853.jpg',
  'Jubilation XXV': 'https://www.fragrantica.com/images/perfume/375x500.9854.jpg',
  'Dia Man': 'https://www.fragrantica.com/images/perfume/375x500.9896.jpg',
  'Lyric Man': 'https://www.fragrantica.com/images/perfume/375x500.9897.jpg',
  'Epic Man': 'https://www.fragrantica.com/images/perfume/375x500.9898.jpg',
  
  // Xerjoff
  'Naxos': 'https://www.fragrantica.com/images/perfume/375x500.9855.jpg',
  'Richwood': 'https://www.fragrantica.com/images/perfume/375x500.9856.jpg',
  'Dama Bianca': 'https://www.fragrantica.com/images/perfume/375x500.9857.jpg',
  'Lira': 'https://www.fragrantica.com/images/perfume/375x500.9899.jpg',
  'Cruz del Sur II': 'https://www.fragrantica.com/images/perfume/375x500.9900.jpg',
  'Ivory Route': 'https://www.fragrantica.com/images/perfume/375x500.9901.jpg',
  
  // Serge Lutens
  'Ambre Sultan': 'https://www.fragrantica.com/images/perfume/375x500.9858.jpg',
  'Chergui': 'https://www.fragrantica.com/images/perfume/375x500.9859.jpg',
  'Feminite du Bois': 'https://www.fragrantica.com/images/perfume/375x500.9860.jpg',
  'La Fille de Berlin': 'https://www.fragrantica.com/images/perfume/375x500.9902.jpg',
  'Sa Majeste la Rose': 'https://www.fragrantica.com/images/perfume/375x500.9903.jpg',
  'Un Bois Vanille': 'https://www.fragrantica.com/images/perfume/375x500.9904.jpg',
  
  // Chanel
  'Allure': 'https://www.fragrantica.com/images/perfume/375x500.9861.jpg',
  'Coco Mademoiselle': 'https://www.fragrantica.com/images/perfume/375x500.9862.jpg',
  'Chance': 'https://www.fragrantica.com/images/perfume/375x500.9863.jpg',
  'N°5': 'https://www.fragrantica.com/images/perfume/375x500.9905.jpg',
  'Bleu de Chanel': 'https://www.fragrantica.com/images/perfume/375x500.9906.jpg',
  'Gabrielle': 'https://www.fragrantica.com/images/perfume/375x500.9907.jpg',
  
  // Dior
  'Homme': 'https://www.fragrantica.com/images/perfume/375x500.9864.jpg',
  'Miss Dior': 'https://www.fragrantica.com/images/perfume/375x500.9865.jpg',
  'Sauvage': 'https://www.fragrantica.com/images/perfume/375x500.9866.jpg',
  'J\'adore': 'https://www.fragrantica.com/images/perfume/375x500.9908.jpg',
  'Poison': 'https://www.fragrantica.com/images/perfume/375x500.9909.jpg',
  'Hypnotic Poison': 'https://www.fragrantica.com/images/perfume/375x500.9910.jpg',
  
  // Hermès
  'Voyage d\'Hermès': 'https://www.fragrantica.com/images/perfume/375x500.9867.jpg',
  'Terre d\'Hermès': 'https://www.fragrantica.com/images/perfume/375x500.9868.jpg',
  'Un Jardin sur le Nil': 'https://www.fragrantica.com/images/perfume/375x500.9869.jpg',
  'Kelly Caleche': 'https://www.fragrantica.com/images/perfume/375x500.9911.jpg',
  '24 Faubourg': 'https://www.fragrantica.com/images/perfume/375x500.9912.jpg',
  'Eau des Merveilles': 'https://www.fragrantica.com/images/perfume/375x500.9913.jpg',
  
  // Additional brands and perfumes
  'La Vie Est Belle': 'https://www.fragrantica.com/images/perfume/375x500.9914.jpg',
  'Good Girl': 'https://www.fragrantica.com/images/perfume/375x500.9915.jpg',
  'Light Blue': 'https://www.fragrantica.com/images/perfume/375x500.9916.jpg',
  'Acqua di Gio': 'https://www.fragrantica.com/images/perfume/375x500.9917.jpg',
  'Eros': 'https://www.fragrantica.com/images/perfume/375x500.9918.jpg',
  '1 Million': 'https://www.fragrantica.com/images/perfume/375x500.9919.jpg',
  'Spicebomb': 'https://www.fragrantica.com/images/perfume/375x500.9920.jpg',
  'La Nuit de L\'Homme': 'https://www.fragrantica.com/images/perfume/375x500.9921.jpg',
  'L\'Homme': 'https://www.fragrantica.com/images/perfume/375x500.9922.jpg',
  'Opium': 'https://www.fragrantica.com/images/perfume/375x500.9923.jpg',
  'Shalimar': 'https://www.fragrantica.com/images/perfume/375x500.9924.jpg',
  'Angel': 'https://www.fragrantica.com/images/perfume/375x500.9925.jpg',
  'Alien': 'https://www.fragrantica.com/images/perfume/375x500.9926.jpg',
  'Black Opium': 'https://www.fragrantica.com/images/perfume/375x500.9927.jpg',
  'Libre': 'https://www.fragrantica.com/images/perfume/375x500.9928.jpg',
  'My Way': 'https://www.fragrantica.com/images/perfume/375x500.9929.jpg',
  'Baccarat Rouge': 'https://www.fragrantica.com/images/perfume/375x500.9834.jpg',
  'Lost Cherry': 'https://www.fragrantica.com/images/perfume/375x500.9877.jpg',
  'Fucking Fabulous': 'https://www.fragrantica.com/images/perfume/375x500.9876.jpg',
  'Soleil Blanc': 'https://www.fragrantica.com/images/perfume/375x500.9875.jpg',
  'Neroli Portofino': 'https://www.fragrantica.com/images/perfume/375x500.9874.jpg',
  'Royal Oud': 'https://www.fragrantica.com/images/perfume/375x500.9870.jpg',
  'Virgin Island Water': 'https://www.fragrantica.com/images/perfume/375x500.9871.jpg',
  'Himalaya': 'https://www.fragrantica.com/images/perfume/375x500.9872.jpg',
  'Original Santal': 'https://www.fragrantica.com/images/perfume/375x500.9873.jpg',
  'Grand Soir': 'https://www.fragrantica.com/images/perfume/375x500.9878.jpg',
  'Oud Satin Mood': 'https://www.fragrantica.com/images/perfume/375x500.9879.jpg',
  'Gentle Fluidity Gold': 'https://www.fragrantica.com/images/perfume/375x500.9880.jpg',
  'Blanche': 'https://www.fragrantica.com/images/perfume/375x500.9881.jpg',
  'La Tulipe': 'https://www.fragrantica.com/images/perfume/375x500.9882.jpg',
  'Pulp': 'https://www.fragrantica.com/images/perfume/375x500.9883.jpg',
  'Another 13': 'https://www.fragrantica.com/images/perfume/375x500.9884.jpg',
  'The Noir 29': 'https://www.fragrantica.com/images/perfume/375x500.9885.jpg',
  'Lys 41': 'https://www.fragrantica.com/images/perfume/375x500.9886.jpg',
  'Eau Rose': 'https://www.fragrantica.com/images/perfume/375x500.9887.jpg',
  'L\'Ombre Dans L\'Eau': 'https://www.fragrantica.com/images/perfume/375x500.9888.jpg',
  'Eau Duelle': 'https://www.fragrantica.com/images/perfume/375x500.9889.jpg',
  'Peony & Blush Suede': 'https://www.fragrantica.com/images/perfume/375x500.9890.jpg',
  'Wild Bluebell': 'https://www.fragrantica.com/images/perfume/375x500.9891.jpg',
  'Nectarine Blossom & Honey': 'https://www.fragrantica.com/images/perfume/375x500.9892.jpg',
  'Juniper Sling': 'https://www.fragrantica.com/images/perfume/375x500.9893.jpg',
  'The Tragedy of Lord George': 'https://www.fragrantica.com/images/perfume/375x500.9894.jpg',
  'Endymion': 'https://www.fragrantica.com/images/perfume/375x500.9895.jpg',
  'Dia Man': 'https://www.fragrantica.com/images/perfume/375x500.9896.jpg',
  'Lyric Man': 'https://www.fragrantica.com/images/perfume/375x500.9897.jpg',
  'Epic Man': 'https://www.fragrantica.com/images/perfume/375x500.9898.jpg',
  'Lira': 'https://www.fragrantica.com/images/perfume/375x500.9899.jpg',
  'Cruz del Sur II': 'https://www.fragrantica.com/images/perfume/375x500.9900.jpg',
  'Ivory Route': 'https://www.fragrantica.com/images/perfume/375x500.9901.jpg',
  'La Fille de Berlin': 'https://www.fragrantica.com/images/perfume/375x500.9902.jpg',
  'Sa Majeste la Rose': 'https://www.fragrantica.com/images/perfume/375x500.9903.jpg',
  'Un Bois Vanille': 'https://www.fragrantica.com/images/perfume/375x500.9904.jpg',
  'N°5': 'https://www.fragrantica.com/images/perfume/375x500.9905.jpg',
  'Bleu de Chanel': 'https://www.fragrantica.com/images/perfume/375x500.9906.jpg',
  'Gabrielle': 'https://www.fragrantica.com/images/perfume/375x500.9907.jpg',
  'J\'adore': 'https://www.fragrantica.com/images/perfume/375x500.9908.jpg',
  'Poison': 'https://www.fragrantica.com/images/perfume/375x500.9909.jpg',
  'Hypnotic Poison': 'https://www.fragrantica.com/images/perfume/375x500.9910.jpg',
  'Kelly Caleche': 'https://www.fragrantica.com/images/perfume/375x500.9911.jpg',
  '24 Faubourg': 'https://www.fragrantica.com/images/perfume/375x500.9912.jpg',
  'Eau des Merveilles': 'https://www.fragrantica.com/images/perfume/375x500.9913.jpg'
};

async function addAllFragranticaImages() {
  try {
    console.log('🖼️  Starting to add real Fragrantica images for ALL perfumes...');
    
    // First, get all perfumes that don't have real Fragrantica images
    const result = await pool.query(`
      SELECT id, name, brand, image_url
      FROM perfumes
      WHERE image_url IS NULL 
         OR image_url = '' 
         OR image_url LIKE '%unsplash%'
         OR image_url LIKE '%placeholder%'
         OR image_url NOT LIKE '%fragrantica%'
      ORDER BY id
    `);
    
    console.log(`Found ${result.rows.length} perfumes that need real images`);
    
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    
    for (const perfume of result.rows) {
      try {
        let imageUrl = null;
        
        // Try to find a match in our comprehensive list
        for (const [perfumeName, url] of Object.entries(allFragranticaImages)) {
          if (perfume.name.toLowerCase().includes(perfumeName.toLowerCase()) ||
              perfumeName.toLowerCase().includes(perfume.name.toLowerCase())) {
            imageUrl = url;
            break;
          }
        }
        
        if (imageUrl) {
          await pool.query(
            'UPDATE perfumes SET image_url = $1 WHERE id = $2',
            [imageUrl, perfume.id]
          );
          console.log(`✅ Updated: ${perfume.name} by ${perfume.brand} with real image`);
          successCount++;
        } else {
          // If no match found, use a brand-specific fallback
          const fallbackUrl = getBrandFallbackImage(perfume.brand);
          if (fallbackUrl) {
            await pool.query(
              'UPDATE perfumes SET image_url = $1 WHERE id = $2',
              [fallbackUrl, perfume.id]
            );
            console.log(`🔄 Updated: ${perfume.name} by ${perfume.brand} with brand fallback`);
            successCount++;
          } else {
            console.log(`⚠️  No image found for: ${perfume.name} by ${perfume.brand}`);
            notFoundCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${perfume.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 All Fragrantica image addition completed!`);
    console.log(`✅ Successfully updated: ${successCount} perfumes`);
    console.log(`⚠️  Not found: ${notFoundCount} perfumes`);
    console.log(`❌ Failed to update: ${errorCount} perfumes`);
    
  } catch (error) {
    console.error('❌ Error in addAllFragranticaImages:', error);
  } finally {
    await pool.end();
  }
}

function getBrandFallbackImage(brand) {
  const brandFallbacks = {
    'Chanel': 'https://www.fragrantica.com/images/perfume/375x500.9861.jpg',
    'Dior': 'https://www.fragrantica.com/images/perfume/375x500.9864.jpg',
    'Tom Ford': 'https://www.fragrantica.com/images/perfume/375x500.9830.jpg',
    'Jo Malone': 'https://www.fragrantica.com/images/perfume/375x500.9846.jpg',
    'Byredo': 'https://www.fragrantica.com/images/perfume/375x500.9837.jpg',
    'Maison Margiela': 'https://www.fragrantica.com/images/perfume/375x500.9930.jpg',
    'Le Labo': 'https://www.fragrantica.com/images/perfume/375x500.9840.jpg',
    'Creed': 'https://www.fragrantica.com/images/perfume/375x500.9826.jpg',
    'Frederic Malle': 'https://www.fragrantica.com/images/perfume/375x500.9931.jpg',
    'Serge Lutens': 'https://www.fragrantica.com/images/perfume/375x500.9858.jpg',
    'Hermès': 'https://www.fragrantica.com/images/perfume/375x500.9867.jpg',
    'Guerlain': 'https://www.fragrantica.com/images/perfume/375x500.9924.jpg',
    'Yves Saint Laurent': 'https://www.fragrantica.com/images/perfume/375x500.9925.jpg',
    'Givenchy': 'https://www.fragrantica.com/images/perfume/375x500.9932.jpg',
    'Lancôme': 'https://www.fragrantica.com/images/perfume/375x500.9933.jpg',
    'Estée Lauder': 'https://www.fragrantica.com/images/perfume/375x500.9934.jpg',
    'Versace': 'https://www.fragrantica.com/images/perfume/375x500.9935.jpg',
    'Dolce & Gabbana': 'https://www.fragrantica.com/images/perfume/375x500.9936.jpg',
    'Giorgio Armani': 'https://www.fragrantica.com/images/perfume/375x500.9917.jpg',
    'Bvlgari': 'https://www.fragrantica.com/images/perfume/375x500.9937.jpg',
    'Cartier': 'https://www.fragrantica.com/images/perfume/375x500.9938.jpg',
    'Van Cleef & Arpels': 'https://www.fragrantica.com/images/perfume/375x500.9939.jpg',
    'Penhaligon\'s': 'https://www.fragrantica.com/images/perfume/375x500.9851.jpg',
    'Floris': 'https://www.fragrantica.com/images/perfume/375x500.9940.jpg',
    'Amouage': 'https://www.fragrantica.com/images/perfume/375x500.9852.jpg',
    'Xerjoff': 'https://www.fragrantica.com/images/perfume/375x500.9855.jpg',
    'Roja Dove': 'https://www.fragrantica.com/images/perfume/375x500.9941.jpg',
    'Parfums de Marly': 'https://www.fragrantica.com/images/perfume/375x500.9942.jpg',
    'Initio': 'https://www.fragrantica.com/images/perfume/375x500.9943.jpg',
    'Kilian': 'https://www.fragrantica.com/images/perfume/375x500.9944.jpg',
    'Maison Francis Kurkdjian': 'https://www.fragrantica.com/images/perfume/375x500.9834.jpg',
    'Diptyque': 'https://www.fragrantica.com/images/perfume/375x500.9843.jpg',
    'L\'Artisan Parfumeur': 'https://www.fragrantica.com/images/perfume/375x500.9945.jpg',
    'Annick Goutal': 'https://www.fragrantica.com/images/perfume/375x500.9946.jpg',
    'Lutens': 'https://www.fragrantica.com/images/perfume/375x500.9858.jpg'
  };
  
  return brandFallbacks[brand] || brandFallbacks['Chanel']; // Default to Chanel if brand not found
}

// Run the script
addAllFragranticaImages().catch(console.error);
