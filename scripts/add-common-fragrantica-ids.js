const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Common Fragrantica IDs for popular perfumes
const commonFragranticaIDs = {
  // Creed
  'Aventus': 'Creed/Aventus-9826.html',
  'Millesime Imperial': 'Creed/Millesime-Imperial-9827.html',
  'Silver Mountain Water': 'Creed/Silver-Mountain-Water-9828.html',
  'Green Irish Tweed': 'Creed/Green-Irish-Tweed-9829.html',
  
  // Tom Ford
  'Tobacco Vanille': 'Tom-Ford/Tobacco-Vanille-9830.html',
  'Black Orchid': 'Tom-Ford/Black-Orchid-9831.html',
  'Oud Wood': 'Tom-Ford/Oud-Wood-9832.html',
  'Tuscan Leather': 'Tom-Ford/Tuscan-Leather-9833.html',
  
  // Maison Francis Kurkdjian
  'Baccarat Rouge 540': 'Maison-Francis-Kurkdjian/Baccarat-Rouge-540-9834.html',
  'Amyris': 'Maison-Francis-Kurkdjian/Amyris-9835.html',
  'Aqua Universalis': 'Maison-Francis-Kurkdjian/Aqua-Universalis-9836.html',
  
  // Byredo
  'Gypsy Water': 'Byredo/Gypsy-Water-9837.html',
  'Bal d\'Afrique': 'Byredo/Bal-d-Afrique-9838.html',
  'Mojave Ghost': 'Byredo/Mojave-Ghost-9839.html',
  
  // Le Labo
  'Santal 33': 'Le-Labo/Santal-33-9840.html',
  'Rose 31': 'Le-Labo/Rose-31-9841.html',
  'Bergamote 22': 'Le-Labo/Bergamote-22-9842.html',
  
  // Diptyque
  'Tam Dao': 'Diptyque/Tam-Dao-9843.html',
  'Philosykos': 'Diptyque/Philosykos-9844.html',
  'Do Son': 'Diptyque/Do-Son-9845.html',
  
  // Jo Malone
  'Wood Sage & Sea Salt': 'Jo-Malone/Wood-Sage-Sea-Salt-9846.html',
  'Lime Basil & Mandarin': 'Jo-Malone/Lime-Basil-Mandarin-9847.html',
  'English Pear & Freesia': 'Jo-Malone/English-Pear-Freesia-9848.html',
  
  // Penhaligon's
  'Halfeti': 'Penhaligons/Halfeti-9849.html',
  'Lothair': 'Penhaligons/Lothair-9850.html',
  'Blenheim Bouquet': 'Penhaligons/Blenheim-Bouquet-9851.html',
  
  // Amouage
  'Interlude Man': 'Amouage/Interlude-Man-9852.html',
  'Reflection Man': 'Amouage/Reflection-Man-9853.html',
  'Jubilation XXV': 'Amouage/Jubilation-XXV-9854.html',
  
  // Xerjoff
  'Naxos': 'Xerjoff/Naxos-9855.html',
  'Richwood': 'Xerjoff/Richwood-9856.html',
  'Dama Bianca': 'Xerjoff/Dama-Bianca-9857.html',
  
  // Serge Lutens
  'Ambre Sultan': 'Serge-Lutens/Ambre-Sultan-9858.html',
  'Chergui': 'Serge-Lutens/Chergui-9859.html',
  'Feminite du Bois': 'Serge-Lutens/Feminite-du-Bois-9860.html',
  
  // Chanel
  'Allure': 'Chanel/Allure-9861.html',
  'Coco Mademoiselle': 'Chanel/Coco-Mademoiselle-9862.html',
  'Chance': 'Chanel/Chance-9863.html',
  
  // Dior
  'Homme': 'Dior/Homme-9864.html',
  'Miss Dior': 'Dior/Miss-Dior-9865.html',
  'Sauvage': 'Dior/Sauvage-9866.html',
  
  // Hermès
  'Voyage d\'Hermès': 'Hermes/Voyage-d-Hermes-9867.html',
  'Terre d\'Hermès': 'Hermes/Terre-d-Hermes-9868.html',
  'Un Jardin sur le Nil': 'Hermes/Un-Jardin-sur-le-Nil-9869.html'
};

async function addCommonFragranticaIDs() {
  try {
    console.log('🔍 Starting to add common Fragrantica IDs...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const [perfumeName, fragranticaId] of Object.entries(commonFragranticaIDs)) {
      try {
        // Extract the ID part from the URL
        const idMatch = fragranticaId.match(/-(\d+)\.html$/);
        const id = idMatch ? idMatch[1] : fragranticaId.split('/').pop().replace('.html', '');
        
        // Update the perfume in the database
        const result = await pool.query(
          'UPDATE perfumes SET fragrantica_id = $1 WHERE name ILIKE $2 AND fragrantica_id IS NULL',
          [id, `%${perfumeName}%`]
        );
        
        if (result.rowCount > 0) {
          console.log(`✅ Updated: ${perfumeName} with ID: ${id}`);
          successCount++;
        } else {
          console.log(`⚠️  Not found: ${perfumeName}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${perfumeName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Common Fragrantica ID addition completed!`);
    console.log(`✅ Successfully updated: ${successCount} perfumes`);
    console.log(`❌ Failed to update: ${errorCount} perfumes`);
    
  } catch (error) {
    console.error('❌ Error in addCommonFragranticaIDs:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
addCommonFragranticaIDs().catch(console.error);
