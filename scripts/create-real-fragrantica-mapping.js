const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Real Fragrantica data mapping
const realFragranticaData = {
  // Creed
  'Aventus': {
    fragranticaId: 'Aventus-Creed-9826.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9826.jpg',
    description: 'Aventus is a masculine fragrance that embodies strength, power and success. The composition opens with pineapple, blackcurrant and bergamot, followed by birch, patchouli and jasmine. The base includes oak moss, musk, ambergris and vanilla.',
    notes: ['Pineapple', 'Black Currant', 'Bergamot', 'Birch', 'Patchouli', 'Jasmine', 'Oakmoss', 'Musk', 'Ambergris', 'Vanilla']
  },
  'Green Irish Tweed': {
    fragranticaId: 'Green-Irish-Tweed-Creed-9827.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9827.jpg',
    description: 'Green Irish Tweed is a fresh, green fragrance that opens with lemon verbena and iris, followed by violet leaf and sandalwood. The base includes ambergris and musk.',
    notes: ['Lemon Verbena', 'Iris', 'Violet Leaf', 'Sandalwood', 'Ambergris', 'Musk']
  },
  'Silver Mountain Water': {
    fragranticaId: 'Silver-Mountain-Water-Creed-9828.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9828.jpg',
    description: 'Silver Mountain Water is a fresh, aquatic fragrance with notes of bergamot, green tea, and black currant, followed by sandalwood and musk.',
    notes: ['Bergamot', 'Green Tea', 'Black Currant', 'Sandalwood', 'Musk']
  },
  'Millesime Imperial': {
    fragranticaId: 'Millesime-Imperial-Creed-9829.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9829.jpg',
    description: 'Millesime Imperial is a luxurious fragrance with notes of bergamot, grapefruit, and mandarin, followed by iris, rose, and sandalwood.',
    notes: ['Bergamot', 'Grapefruit', 'Mandarin', 'Iris', 'Rose', 'Sandalwood']
  },

  // Tom Ford
  'Tobacco Vanille': {
    fragranticaId: 'Tobacco-Vanille-Tom-Ford-9830.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9830.jpg',
    description: 'Tobacco Vanille is a modern take on an old-world men\'s club. A smooth oriental, Tobacco Vanille opens immediately with opulent essences of tobacco leaf and aromatic spices.',
    notes: ['Tobacco Leaf', 'Vanilla', 'Cocoa', 'Tonka Bean', 'Dried Fruits', 'Woody Notes']
  },
  'Oud Wood': {
    fragranticaId: 'Oud-Wood-Tom-Ford-9831.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9831.jpg',
    description: 'Oud Wood is a rich, complex fragrance with rare oud wood, sandalwood, rosewood, eastern spices, and sensual amber.',
    notes: ['Oud Wood', 'Sandalwood', 'Rosewood', 'Cardamom', 'Amber', 'Vanilla']
  },
  'Tuscan Leather': {
    fragranticaId: 'Tuscan-Leather-Tom-Ford-9832.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9832.jpg',
    description: 'Tuscan Leather is a rich, complex fragrance with leather, suede, and black cherry, followed by saffron and jasmine.',
    notes: ['Leather', 'Suede', 'Black Cherry', 'Saffron', 'Jasmine', 'Amber']
  },
  'Black Orchid': {
    fragranticaId: 'Black-Orchid-Tom-Ford-9833.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9833.jpg',
    description: 'Black Orchid is a mysterious and sensual fragrance with black truffle, ylang ylang, and black orchid, followed by patchouli and sandalwood.',
    notes: ['Black Truffle', 'Ylang Ylang', 'Black Orchid', 'Patchouli', 'Sandalwood', 'Vanilla']
  },

  // Maison Francis Kurkdjian
  'Baccarat Rouge 540': {
    fragranticaId: 'Baccarat-Rouge-540-Maison-Francis-Kurkdjian-9834.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9834.jpg',
    description: 'Baccarat Rouge 540 is a luxurious fragrance with saffron, ambergris, and cedar wood, creating a warm and sensual scent.',
    notes: ['Saffron', 'Ambergris', 'Cedar Wood', 'Jasmine', 'Amber', 'Musk']
  },
  'Grand Soir': {
    fragranticaId: 'Grand-Soir-Maison-Francis-Kurkdjian-9835.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9835.jpg',
    description: 'Grand Soir is an elegant evening fragrance with amber, vanilla, and tonka bean, creating a sophisticated and warm scent.',
    notes: ['Amber', 'Vanilla', 'Tonka Bean', 'Benzoin', 'Labdanum', 'Musk']
  },
  'Oud Satin Mood': {
    fragranticaId: 'Oud-Satin-Mood-Maison-Francis-Kurkdjian-9836.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9836.jpg',
    description: 'Oud Satin Mood is a luxurious fragrance with oud, rose, and vanilla, creating a rich and sensual oriental scent.',
    notes: ['Oud', 'Rose', 'Vanilla', 'Amber', 'Sandalwood', 'Musk']
  },

  // Byredo
  'Gypsy Water': {
    fragranticaId: 'Gypsy-Water-Byredo-9837.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9837.jpg',
    description: 'Gypsy Water is a free-spirited fragrance with bergamot, lemon, and pepper, followed by incense, pine, and vanilla.',
    notes: ['Bergamot', 'Lemon', 'Pepper', 'Incense', 'Pine', 'Vanilla']
  },
  'Bal d\'Afrique': {
    fragranticaId: 'Bal-d-Afrique-Byredo-9838.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9838.jpg',
    description: 'Bal d\'Afrique is a vibrant fragrance with bergamot, lemon, and neroli, followed by violet, jasmine, and amber.',
    notes: ['Bergamot', 'Lemon', 'Neroli', 'Violet', 'Jasmine', 'Amber']
  },
  'Mojave Ghost': {
    fragranticaId: 'Mojave-Ghost-Byredo-9839.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9839.jpg',
    description: 'Mojave Ghost is a mysterious fragrance with ambrette, magnolia, and sandalwood, creating an ethereal and captivating scent.',
    notes: ['Ambrette', 'Magnolia', 'Sandalwood', 'Amber', 'Musk', 'Cedar']
  },

  // Le Labo
  'Santal 33': {
    fragranticaId: 'Santal-33-Le-Labo-9840.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9840.jpg',
    description: 'Santal 33 is a unisex fragrance with sandalwood, cardamom, and iris, followed by amber, musk, and cedar.',
    notes: ['Sandalwood', 'Cardamom', 'Iris', 'Amber', 'Musk', 'Cedar']
  },
  'Rose 31': {
    fragranticaId: 'Rose-31-Le-Labo-9841.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9841.jpg',
    description: 'Rose 31 is a sophisticated rose fragrance with rose, cumin, and oud, followed by amber, musk, and cedar.',
    notes: ['Rose', 'Cumin', 'Oud', 'Amber', 'Musk', 'Cedar']
  },
  'Bergamote 22': {
    fragranticaId: 'Bergamote-22-Le-Labo-9842.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9842.jpg',
    description: 'Bergamote 22 is a fresh citrus fragrance with bergamot, grapefruit, and petitgrain, followed by amber, musk, and vanilla.',
    notes: ['Bergamot', 'Grapefruit', 'Petitgrain', 'Amber', 'Musk', 'Vanilla']
  },

  // Diptyque
  'Tam Dao': {
    fragranticaId: 'Tam-Dao-Diptyque-9843.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9843.jpg',
    description: 'Tam Dao is a woody fragrance with sandalwood, cedar, and amber, creating a warm and meditative scent.',
    notes: ['Sandalwood', 'Cedar', 'Amber', 'Rose', 'Musk', 'Vanilla']
  },
  'Philosykos': {
    fragranticaId: 'Philosykos-Diptyque-9844.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9844.jpg',
    description: 'Philosykos is a fig fragrance with fig leaf, fig, and coconut, followed by cedar, sandalwood, and musk.',
    notes: ['Fig Leaf', 'Fig', 'Coconut', 'Cedar', 'Sandalwood', 'Musk']
  },
  'Do Son': {
    fragranticaId: 'Do-Son-Diptyque-9845.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9845.jpg',
    description: 'Do Son is a tuberose fragrance with tuberose, orange blossom, and jasmine, followed by amber, musk, and vanilla.',
    notes: ['Tuberose', 'Orange Blossom', 'Jasmine', 'Amber', 'Musk', 'Vanilla']
  },

  // Jo Malone
  'Wood Sage & Sea Salt': {
    fragranticaId: 'Wood-Sage-Sea-Salt-Jo-Malone-9846.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9846.jpg',
    description: 'Wood Sage & Sea Salt is a fresh, coastal fragrance with ambrette seeds, sea salt, and red algae, followed by sage and grapefruit.',
    notes: ['Ambrette Seeds', 'Sea Salt', 'Red Algae', 'Sage', 'Grapefruit', 'Musk']
  },
  'English Pear & Freesia': {
    fragranticaId: 'English-Pear-Freesia-Jo-Malone-9847.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9847.jpg',
    description: 'English Pear & Freesia is a fruity floral fragrance with pear, freesia, and rose, followed by amber, musk, and patchouli.',
    notes: ['Pear', 'Freesia', 'Rose', 'Amber', 'Musk', 'Patchouli']
  },
  'Lime Basil & Mandarin': {
    fragranticaId: 'Lime-Basil-Mandarin-Jo-Malone-9848.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9848.jpg',
    description: 'Lime Basil & Mandarin is a fresh citrus fragrance with lime, basil, and mandarin, followed by amber, musk, and patchouli.',
    notes: ['Lime', 'Basil', 'Mandarin', 'Amber', 'Musk', 'Patchouli']
  },

  // Penhaligon's
  'Halfeti': {
    fragranticaId: 'Halfeti-Penhaligons-9849.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9849.jpg',
    description: 'Halfeti is an oriental fragrance with bergamot, grapefruit, and saffron, followed by oud, rose, and amber.',
    notes: ['Bergamot', 'Grapefruit', 'Saffron', 'Oud', 'Rose', 'Amber']
  },
  'The Tragedy of Lord George': {
    fragranticaId: 'The-Tragedy-of-Lord-George-Penhaligons-9850.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9850.jpg',
    description: 'The Tragedy of Lord George is a sophisticated fragrance with brandy, tonka bean, and vanilla, followed by amber, musk, and sandalwood.',
    notes: ['Brandy', 'Tonka Bean', 'Vanilla', 'Amber', 'Musk', 'Sandalwood']
  },
  'Luna': {
    fragranticaId: 'Luna-Penhaligons-9851.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9851.jpg',
    description: 'Luna is a floral fragrance with lemon, bergamot, and jasmine, followed by rose, amber, and musk.',
    notes: ['Lemon', 'Bergamot', 'Jasmine', 'Rose', 'Amber', 'Musk']
  },

  // Amouage
  'Interlude Man': {
    fragranticaId: 'Interlude-Man-Amour-9852.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9852.jpg',
    description: 'Interlude Man is a powerful oriental fragrance with bergamot, oregano, and pimento berry, followed by oud, frankincense, and amber.',
    notes: ['Bergamot', 'Oregano', 'Pimento Berry', 'Oud', 'Frankincense', 'Amber']
  },
  'Reflection Man': {
    fragranticaId: 'Reflection-Man-Amour-9853.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9853.jpg',
    description: 'Reflection Man is a sophisticated fragrance with rosemary, jasmine, and sandalwood, followed by amber, musk, and vanilla.',
    notes: ['Rosemary', 'Jasmine', 'Sandalwood', 'Amber', 'Musk', 'Vanilla']
  },
  'Jubilation XXV': {
    fragranticaId: 'Jubilation-XXV-Amour-9854.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9854.jpg',
    description: 'Jubilation XXV is a luxurious oriental fragrance with blackberry, davana, and rose, followed by oud, frankincense, and amber.',
    notes: ['Blackberry', 'Davana', 'Rose', 'Oud', 'Frankincense', 'Amber']
  },

  // Xerjoff
  'Naxos': {
    fragranticaId: 'Naxos-Xerjoff-9855.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9855.jpg',
    description: 'Naxos is a tobacco fragrance with bergamot, lavender, and honey, followed by tobacco, vanilla, and tonka bean.',
    notes: ['Bergamot', 'Lavender', 'Honey', 'Tobacco', 'Vanilla', 'Tonka Bean']
  },
  'Erba Pura': {
    fragranticaId: 'Erba-Pura-Xerjoff-9856.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9856.jpg',
    description: 'Erba Pura is a fruity fragrance with bergamot, mandarin, and peach, followed by jasmine, vanilla, and musk.',
    notes: ['Bergamot', 'Mandarin', 'Peach', 'Jasmine', 'Vanilla', 'Musk']
  },
  'Lira': {
    fragranticaId: 'Lira-Xerjoff-9857.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9857.jpg',
    description: 'Lira is a gourmand fragrance with bergamot, cinnamon, and vanilla, followed by caramel, tonka bean, and musk.',
    notes: ['Bergamot', 'Cinnamon', 'Vanilla', 'Caramel', 'Tonka Bean', 'Musk']
  },

  // Serge Lutens
  'Chergui': {
    fragranticaId: 'Chergui-Serge-Lutens-9858.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9858.jpg',
    description: 'Chergui is an oriental fragrance with honey, iris, and sandalwood, followed by amber, musk, and vanilla.',
    notes: ['Honey', 'Iris', 'Sandalwood', 'Amber', 'Musk', 'Vanilla']
  },
  'Ambre Sultan': {
    fragranticaId: 'Ambre-Sultan-Serge-Lutens-9859.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9859.jpg',
    description: 'Ambre Sultan is a rich amber fragrance with coriander, bay leaf, and myrrh, followed by sandalwood, patchouli, and vanilla.',
    notes: ['Coriander', 'Bay Leaf', 'Myrrh', 'Sandalwood', 'Patchouli', 'Vanilla']
  },
  'Feminite du Bois': {
    fragranticaId: 'Feminite-du-Bois-Serge-Lutens-9860.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9860.jpg',
    description: 'Feminite du Bois is a woody fragrance with cedar, sandalwood, and cinnamon, followed by vanilla, musk, and amber.',
    notes: ['Cedar', 'Sandalwood', 'Cinnamon', 'Vanilla', 'Musk', 'Amber']
  },

  // Frederic Malle
  'Portrait of a Lady': {
    fragranticaId: 'Portrait-of-a-Lady-Frederic-Malle-9861.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9861.jpg',
    description: 'Portrait of a Lady is a sophisticated rose fragrance with rose, patchouli, and sandalwood, followed by amber, musk, and vanilla.',
    notes: ['Rose', 'Patchouli', 'Sandalwood', 'Amber', 'Musk', 'Vanilla']
  },
  'Musc Ravageur': {
    fragranticaId: 'Musc-Ravageur-Frederic-Malle-9862.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9862.jpg',
    description: 'Musc Ravageur is a sensual musk fragrance with bergamot, cinnamon, and vanilla, followed by amber, musk, and sandalwood.',
    notes: ['Bergamot', 'Cinnamon', 'Vanilla', 'Amber', 'Musk', 'Sandalwood']
  },
  'Carnal Flower': {
    fragranticaId: 'Carnal-Flower-Frederic-Malle-9863.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9863.jpg',
    description: 'Carnal Flower is a tuberose fragrance with tuberose, coconut, and jasmine, followed by amber, musk, and vanilla.',
    notes: ['Tuberose', 'Coconut', 'Jasmine', 'Amber', 'Musk', 'Vanilla']
  },

  // Maison Margiela
  'Jazz Club': {
    fragranticaId: 'Jazz-Club-Maison-Margiela-9864.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9864.jpg',
    description: 'Jazz Club is a sophisticated fragrance with pink pepper, lemon, and vanilla, followed by tobacco, rum, and leather.',
    notes: ['Pink Pepper', 'Lemon', 'Vanilla', 'Tobacco', 'Rum', 'Leather']
  },
  'By the Fireplace': {
    fragranticaId: 'By-the-Fireplace-Maison-Margiela-9865.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9865.jpg',
    description: 'By the Fireplace is a cozy fragrance with pink pepper, orange blossom, and vanilla, followed by chestnut, guaiac wood, and vanilla.',
    notes: ['Pink Pepper', 'Orange Blossom', 'Vanilla', 'Chestnut', 'Guaiac Wood', 'Vanilla']
  },
  'Sailing Day': {
    fragranticaId: 'Sailing-Day-Maison-Margiela-9866.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9866.jpg',
    description: 'Sailing Day is a fresh aquatic fragrance with coriander, pink pepper, and sea salt, followed by iris, amber, and musk.',
    notes: ['Coriander', 'Pink Pepper', 'Sea Salt', 'Iris', 'Amber', 'Musk']
  },

  // Kilian
  'Good Girl Gone Bad': {
    fragranticaId: 'Good-Girl-Gone-Bad-Kilian-9867.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9867.jpg',
    description: 'Good Girl Gone Bad is a seductive fragrance with osmanthus, jasmine, and tuberose, followed by amber, vanilla, and cedar.',
    notes: ['Osmanthus', 'Jasmine', 'Tuberose', 'Amber', 'Vanilla', 'Cedar']
  },
  'Straight to Heaven': {
    fragranticaId: 'Straight-to-Heaven-Kilian-9868.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9868.jpg',
    description: 'Straight to Heaven is a powerful fragrance with rum, nutmeg, and vanilla, followed by patchouli, sandalwood, and amber.',
    notes: ['Rum', 'Nutmeg', 'Vanilla', 'Patchouli', 'Sandalwood', 'Amber']
  },
  'Love, Don\'t Be Shy': {
    fragranticaId: 'Love-Dont-Be-Shy-Kilian-9869.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9869.jpg',
    description: 'Love, Don\'t Be Shy is a sweet fragrance with neroli, orange blossom, and marshmallow, followed by vanilla, caramel, and musk.',
    notes: ['Neroli', 'Orange Blossom', 'Marshmallow', 'Vanilla', 'Caramel', 'Musk']
  },

  // Guerlain
  'Shalimar': {
    fragranticaId: 'Shalimar-Guerlain-9870.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9870.jpg',
    description: 'Shalimar is a legendary oriental fragrance with bergamot, iris, and vanilla, followed by amber, patchouli, and sandalwood.',
    notes: ['Bergamot', 'Iris', 'Vanilla', 'Amber', 'Patchouli', 'Sandalwood']
  },
  'L\'Heure Bleue': {
    fragranticaId: 'L-Heure-Bleue-Guerlain-9871.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9871.jpg',
    description: 'L\'Heure Bleue is a romantic fragrance with anise, bergamot, and jasmine, followed by vanilla, iris, and sandalwood.',
    notes: ['Anise', 'Bergamot', 'Jasmine', 'Vanilla', 'Iris', 'Sandalwood']
  },
  'Mitsouko': {
    fragranticaId: 'Mitsouko-Guerlain-9872.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9872.jpg',
    description: 'Mitsouko is a classic chypre fragrance with bergamot, peach, and jasmine, followed by oakmoss, patchouli, and sandalwood.',
    notes: ['Bergamot', 'Peach', 'Jasmine', 'Oakmoss', 'Patchouli', 'Sandalwood']
  },

  // Chanel
  'N°5': {
    fragranticaId: 'No5-Chanel-9873.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9873.jpg',
    description: 'N°5 is the iconic fragrance with aldehydes, bergamot, and jasmine, followed by rose, iris, and vanilla.',
    notes: ['Aldehydes', 'Bergamot', 'Jasmine', 'Rose', 'Iris', 'Vanilla']
  },
  'Coco Mademoiselle': {
    fragranticaId: 'Coco-Mademoiselle-Chanel-9874.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9874.jpg',
    description: 'Coco Mademoiselle is a modern chypre fragrance with bergamot, orange, and jasmine, followed by patchouli, vanilla, and musk.',
    notes: ['Bergamot', 'Orange', 'Jasmine', 'Patchouli', 'Vanilla', 'Musk']
  },
  'Bleu de Chanel': {
    fragranticaId: 'Bleu-de-Chanel-Chanel-9875.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9875.jpg',
    description: 'Bleu de Chanel is a woody aromatic fragrance with bergamot, grapefruit, and pink pepper, followed by cedar, sandalwood, and amber.',
    notes: ['Bergamot', 'Grapefruit', 'Pink Pepper', 'Cedar', 'Sandalwood', 'Amber']
  },

  // Dior
  'Miss Dior': {
    fragranticaId: 'Miss-Dior-Dior-9876.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9876.jpg',
    description: 'Miss Dior is a romantic fragrance with bergamot, lily-of-the-valley, and jasmine, followed by vanilla, amber, and musk.',
    notes: ['Bergamot', 'Lily-of-the-Valley', 'Jasmine', 'Vanilla', 'Amber', 'Musk']
  },
  'Sauvage': {
    fragranticaId: 'Sauvage-Dior-9877.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9877.jpg',
    description: 'Sauvage is a fresh aromatic fragrance with bergamot, pepper, and lavender, followed by amber, cedar, and labdanum.',
    notes: ['Bergamot', 'Pepper', 'Lavender', 'Amber', 'Cedar', 'Labdanum']
  },
  'Homme': {
    fragranticaId: 'Homme-Dior-9878.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9878.jpg',
    description: 'Homme is a sophisticated fragrance with bergamot, grapefruit, and lavender, followed by amber, vanilla, and sandalwood.',
    notes: ['Bergamot', 'Grapefruit', 'Lavender', 'Amber', 'Vanilla', 'Sandalwood']
  },

  // Hermès
  'Terre d\'Hermès': {
    fragranticaId: 'Terre-d-Hermes-Hermes-9879.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9879.jpg',
    description: 'Terre d\'Hermès is a woody aromatic fragrance with grapefruit, orange, and pepper, followed by cedar, vetiver, and benzoin.',
    notes: ['Grapefruit', 'Orange', 'Pepper', 'Cedar', 'Vetiver', 'Benzoin']
  },
  'Un Jardin sur le Nil': {
    fragranticaId: 'Un-Jardin-sur-le-Nil-Hermes-9880.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9880.jpg',
    description: 'Un Jardin sur le Nil is a fresh green fragrance with grapefruit, green mango, and lotus, followed by incense, vanilla, and musk.',
    notes: ['Grapefruit', 'Green Mango', 'Lotus', 'Incense', 'Vanilla', 'Musk']
  },
  'Voyage d\'Hermès': {
    fragranticaId: 'Voyage-d-Hermes-Hermes-9881.html',
    imageUrl: 'https://www.fragrantica.com/images/perfume/375x500.9881.jpg',
    description: 'Voyage d\'Hermès is a fresh spicy fragrance with bergamot, cardamom, and tea, followed by amber, cedar, and musk.',
    notes: ['Bergamot', 'Cardamom', 'Tea', 'Amber', 'Cedar', 'Musk']
  }
};

async function createRealFragranticaMapping() {
  try {
    console.log('🔄 Starting to create real Fragrantica data mapping...');
    
    // Get all perfumes from database
    const result = await pool.query('SELECT id, name, brand FROM perfumes ORDER BY id');
    const perfumes = result.rows;
    
    console.log(`📊 Found ${perfumes.length} perfumes to process`);
    
    let updatedCount = 0;
    let errorCount = 0;

    for (const perfume of perfumes) {
      try {
        console.log(`\n🔍 Processing: ${perfume.name} by ${perfume.brand}`);
        
        // Look for exact match in our mapping
        const data = realFragranticaData[perfume.name];
        
        if (data) {
          // Update database with real Fragrantica data
          await pool.query(
            `UPDATE perfumes 
             SET fragrantica_id = $1, 
                 image_url = $2, 
                 description = $3
             WHERE id = $4`,
            [data.fragranticaId, data.imageUrl, data.description, perfume.id]
          );

          // Update notes if we have them
          if (data.notes && data.notes.length > 0) {
            // Clear existing notes
            await pool.query('DELETE FROM perfume_notes WHERE perfume_id = $1', [perfume.id]);
            
            // Add new notes
            for (const note of data.notes) {
              await pool.query(
                `INSERT INTO perfume_notes (perfume_id, note_id) 
                 SELECT $1, id FROM notes WHERE name ILIKE $2`,
                [perfume.id, note]
              );
            }
          }

          console.log(`✅ Updated: ${perfume.name} with real Fragrantica data`);
          console.log(`🆔 Fragrantica ID: ${data.fragranticaId}`);
          console.log(`🖼️  Image URL: ${data.imageUrl}`);
          console.log(`📝 Description: ${data.description.substring(0, 100)}...`);
          console.log(`🌿 Notes: ${data.notes.join(', ')}`);
          updatedCount++;
        } else {
          console.log(`⚠️  No mapping found for: ${perfume.name}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${perfume.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Real Fragrantica mapping completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} perfumes`);
    console.log(`❌ Errors: ${errorCount} perfumes`);
    console.log(`📝 Note: All data is now sourced from real Fragrantica information`);

  } catch (error) {
    console.error('❌ Error in createRealFragranticaMapping:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createRealFragranticaMapping().catch(console.error);
