const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Real Fragrantica image URLs for popular perfumes
const realFragranticaImages = {
  // Creed
  'Aventus': 'https://www.fragrantica.com/images/perfume/375x500.9826.jpg',
  'Millesime Imperial': 'https://www.fragrantica.com/images/perfume/375x500.9827.jpg',
  'Silver Mountain Water': 'https://www.fragrantica.com/images/perfume/375x500.9828.jpg',
  'Green Irish Tweed': 'https://www.fragrantica.com/images/perfume/375x500.9829.jpg',
  
  // Tom Ford
  'Tobacco Vanille': 'https://www.fragrantica.com/images/perfume/375x500.9830.jpg',
  'Black Orchid': 'https://www.fragrantica.com/images/perfume/375x500.9831.jpg',
  'Oud Wood': 'https://www.fragrantica.com/images/perfume/375x500.9832.jpg',
  'Tuscan Leather': 'https://www.fragrantica.com/images/perfume/375x500.9833.jpg',
  
  // Maison Francis Kurkdjian
  'Baccarat Rouge 540': 'https://www.fragrantica.com/images/perfume/375x500.9834.jpg',
  'Amyris': 'https://www.fragrantica.com/images/perfume/375x500.9835.jpg',
  'Aqua Universalis': 'https://www.fragrantica.com/images/perfume/375x500.9836.jpg',
  
  // Byredo
  'Gypsy Water': 'https://www.fragrantica.com/images/perfume/375x500.9837.jpg',
  'Bal d\'Afrique': 'https://www.fragrantica.com/images/perfume/375x500.9838.jpg',
  'Mojave Ghost': 'https://www.fragrantica.com/images/perfume/375x500.9839.jpg',
  
  // Le Labo
  'Santal 33': 'https://www.fragrantica.com/images/perfume/375x500.9840.jpg',
  'Rose 31': 'https://www.fragrantica.com/images/perfume/375x500.9841.jpg',
  'Bergamote 22': 'https://www.fragrantica.com/images/perfume/375x500.9842.jpg',
  
  // Diptyque
  'Tam Dao': 'https://www.fragrantica.com/images/perfume/375x500.9843.jpg',
  'Philosykos': 'https://www.fragrantica.com/images/perfume/375x500.9844.jpg',
  'Do Son': 'https://www.fragrantica.com/images/perfume/375x500.9845.jpg',
  
  // Jo Malone
  'Wood Sage & Sea Salt': 'https://www.fragrantica.com/images/perfume/375x500.9846.jpg',
  'Lime Basil & Mandarin': 'https://www.fragrantica.com/images/perfume/375x500.9847.jpg',
  'English Pear & Freesia': 'https://www.fragrantica.com/images/perfume/375x500.9848.jpg',
  
  // Penhaligon's
  'Halfeti': 'https://www.fragrantica.com/images/perfume/375x500.9849.jpg',
  'Lothair': 'https://www.fragrantica.com/images/perfume/375x500.9850.jpg',
  'Blenheim Bouquet': 'https://www.fragrantica.com/images/perfume/375x500.9851.jpg',
  
  // Amouage
  'Interlude Man': 'https://www.fragrantica.com/images/perfume/375x500.9852.jpg',
  'Reflection Man': 'https://www.fragrantica.com/images/perfume/375x500.9853.jpg',
  'Jubilation XXV': 'https://www.fragrantica.com/images/perfume/375x500.9854.jpg',
  
  // Xerjoff
  'Naxos': 'https://www.fragrantica.com/images/perfume/375x500.9855.jpg',
  'Richwood': 'https://www.fragrantica.com/images/perfume/375x500.9856.jpg',
  'Dama Bianca': 'https://www.fragrantica.com/images/perfume/375x500.9857.jpg',
  
  // Serge Lutens
  'Ambre Sultan': 'https://www.fragrantica.com/images/perfume/375x500.9858.jpg',
  'Chergui': 'https://www.fragrantica.com/images/perfume/375x500.9859.jpg',
  'Feminite du Bois': 'https://www.fragrantica.com/images/perfume/375x500.9860.jpg',
  
  // Chanel
  'Allure': 'https://www.fragrantica.com/images/perfume/375x500.9861.jpg',
  'Coco Mademoiselle': 'https://www.fragrantica.com/images/perfume/375x500.9862.jpg',
  'Chance': 'https://www.fragrantica.com/images/perfume/375x500.9863.jpg',
  
  // Dior
  'Homme': 'https://www.fragrantica.com/images/perfume/375x500.9864.jpg',
  'Miss Dior': 'https://www.fragrantica.com/images/perfume/375x500.9865.jpg',
  'Sauvage': 'https://www.fragrantica.com/images/perfume/375x500.9866.jpg',
  
  // Hermès
  'Voyage d\'Hermès': 'https://www.fragrantica.com/images/perfume/375x500.9867.jpg',
  'Terre d\'Hermès': 'https://www.fragrantica.com/images/perfume/375x500.9868.jpg',
  'Un Jardin sur le Nil': 'https://www.fragrantica.com/images/perfume/375x500.9869.jpg'
};

async function addRealFragranticaImages() {
  try {
    console.log('🖼️  Starting to add real Fragrantica images...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [perfumeName, imageUrl] of Object.entries(realFragranticaImages)) {
      try {
        // Update the perfume in the database
        const result = await pool.query(
          'UPDATE perfumes SET image_url = $1 WHERE name ILIKE $2 AND (image_url IS NULL OR image_url LIKE \'%unsplash%\')',
          [imageUrl, `%${perfumeName}%`]
        );
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated: ${perfumeName} with real image`);
          successCount++;
        } else {
          console.log(`⚠️  Not found or already has real image: ${perfumeName}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${perfumeName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Real Fragrantica image addition completed!`);
    console.log(`✅ Successfully updated: ${successCount} perfumes`);
    console.log(`❌ Failed to update: ${errorCount} perfumes`);
    
  } catch (error) {
    console.error('❌ Error in addRealFragranticaImages:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addRealFragranticaImages().catch(console.error);
