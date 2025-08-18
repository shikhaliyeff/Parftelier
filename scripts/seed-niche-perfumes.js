const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Comprehensive list of niche perfumes based on Fragrantica data
const nichePerfumes = [
  // Creed
  {
    name: "Aventus",
    brand: "Creed",
    year: 2010,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Olivier Creed, Erwin Creed",
    description: "A bold, masculine fragrance with notes of pineapple, blackcurrant, birch, and musk. Known for its distinctive smoky pineapple opening and long-lasting woody base.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Pineapple", "Blackcurrant", "Bergamot", "Apple"], middle: ["Birch", "Rose", "Jasmine", "Patchouli"], base: ["Musk", "Oakmoss", "Ambergris", "Vanilla"] }
  },
  {
    name: "Green Irish Tweed",
    brand: "Creed",
    year: 1985,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Masculine",
    perfumer: "Pierre Bourdon",
    description: "A fresh, green fragrance with notes of violet leaf, iris, and sandalwood. Inspired by the Irish countryside.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Violet Leaf", "Iris", "Lemon Verbena"], middle: ["Sandalwood", "Cedar"], base: ["Ambergris", "Musk"] }
  },
  {
    name: "Silver Mountain Water",
    brand: "Creed",
    year: 1995,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Olivier Creed",
    description: "A crisp, aquatic fragrance with notes of green tea, blackcurrant, and sandalwood. Inspired by the Swiss Alps.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Mandarin", "Green Tea"], middle: ["Blackcurrant", "Sandalwood"], base: ["Musk", "Galbanum"] }
  },
  {
    name: "Millesime Imperial",
    brand: "Creed",
    year: 1995,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Olivier Creed",
    description: "A luxurious aquatic fragrance with notes of sea salt, bergamot, and ambergris. Inspired by the Mediterranean.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Mandarin", "Sea Salt"], middle: ["Ambergris", "Sandalwood"], base: ["Musk", "Vanilla"] }
  },

  // Tom Ford
  {
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Tom Ford",
    description: "A modern take on an old-world men's club. A smooth oriental, tobacco leaf, vanilla, cocoa, and spices.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Tobacco Leaf", "Spices"], middle: ["Vanilla", "Cocoa", "Tonka Bean"], base: ["Dried Fruits", "Woody Notes"] }
  },
  {
    name: "Oud Wood",
    brand: "Tom Ford",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Tom Ford",
    description: "A sophisticated woody fragrance with notes of oud, sandalwood, and spices. Rich and complex.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Oud", "Sandalwood", "Cardamom"], middle: ["Rose", "Cedar"], base: ["Amber", "Musk", "Vanilla"] }
  },
  {
    name: "Tuscan Leather",
    brand: "Tom Ford",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Leather",
    gender: "Masculine",
    perfumer: "Tom Ford",
    description: "A luxurious leather fragrance with notes of suede, raspberry, and saffron. Bold and sophisticated.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Raspberry", "Saffron", "Thyme"], middle: ["Leather", "Suede"], base: ["Amber", "Musk"] }
  },
  {
    name: "Black Orchid",
    brand: "Tom Ford",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Tom Ford",
    description: "A mysterious oriental fragrance with notes of black truffle, orchid, and patchouli. Dark and seductive.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Black Truffle", "Bergamot", "Mandarin"], middle: ["Orchid", "Jasmine", "Lotus"], base: ["Patchouli", "Sandalwood", "Vanilla"] }
  },

  // Maison Francis Kurkdjian
  {
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A sophisticated fragrance with notes of saffron, ambergris, and cedar. Known for its unique molecular structure and long-lasting sillage.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Saffron", "Jasmine"], middle: ["Ambergris", "Cedar"], base: ["Fir Resin", "Musk"] }
  },
  {
    name: "Grand Soir",
    brand: "Maison Francis Kurkdjian",
    year: 2016,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A warm, amber fragrance with notes of vanilla, tonka bean, and benzoin. Perfect for evening wear.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Vanilla", "Tonka Bean"], middle: ["Benzoin", "Amber"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Oud Satin Mood",
    brand: "Maison Francis Kurkdjian",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A luxurious oud fragrance with notes of rose, vanilla, and oud. Rich and opulent.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Oud", "Rose"], middle: ["Vanilla", "Amber"], base: ["Musk", "Sandalwood"] }
  },

  // Byredo
  {
    name: "Gypsy Water",
    brand: "Byredo",
    year: 2008,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Jerome Epinette",
    description: "A free-spirited fragrance with notes of bergamot, incense, and vanilla. Inspired by the nomadic lifestyle of the Romani people.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Lemon", "Pepper"], middle: ["Incense", "Pine Needles", "Orris"], base: ["Vanilla", "Amber", "Sandalo"] }
  },
  {
    name: "Bal d'Afrique",
    brand: "Byredo",
    year: 2009,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Jerome Epinette",
    description: "A warm, woody fragrance with notes of marigold, vetiver, and vanilla. Inspired by Paris in the 1920s.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Marigold", "Bergamot", "Lemon"], middle: ["Vetiver", "Cedar"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Mojave Ghost",
    brand: "Byredo",
    year: 2014,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Jerome Epinette",
    description: "A mysterious woody fragrance with notes of ambrette, sandalwood, and magnolia. Inspired by the Mojave Desert.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Ambrettolide", "Sandalwood"], middle: ["Magnolia", "Violet"], base: ["Musk", "Cedar"] }
  },

  // Le Labo
  {
    name: "Santal 33",
    brand: "Le Labo",
    year: 2011,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Frank Voelkl",
    description: "A unisex fragrance with notes of sandalwood, cardamom, and leather. Known for its distinctive pickle-like opening that transforms into a warm, woody base.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Cardamom", "Iris", "Ambrox"], middle: ["Cedar", "Violet"], base: ["Sandalwood", "Leather", "Amber"] }
  },
  {
    name: "Rose 31",
    brand: "Le Labo",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Unisex",
    perfumer: "Daphne Bugey",
    description: "A sophisticated rose fragrance with notes of rose, cumin, and oud. Masculine take on a classic floral.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Cumin", "Cardamom"], middle: ["Oud", "Cedar"], base: ["Amber", "Musk"] }
  },
  {
    name: "Bergamote 22",
    brand: "Le Labo",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Citrus",
    gender: "Unisex",
    perfumer: "Daphne Bugey",
    description: "A fresh citrus fragrance with notes of bergamot, grapefruit, and vetiver. Bright and uplifting.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Grapefruit", "Lemon"], middle: ["Vetiver", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Diptyque
  {
    name: "Tam Dao",
    brand: "Diptyque",
    year: 2003,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Diptyque",
    description: "A sophisticated woody fragrance inspired by the sacred forests of Vietnam. Features sandalwood, cedar, and amber notes.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Discreet",
    notes: { top: ["Rosewood", "Cypress"], middle: ["Sandalwood", "Cedar"], base: ["Amber", "Musk"] }
  },
  {
    name: "Philosykos",
    brand: "Diptyque",
    year: 1996,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Olivia Giacobetti",
    description: "A fig fragrance with notes of fig tree, fig leaf, and coconut. Fresh and natural.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Fig Tree", "Fig Leaf"], middle: ["Coconut", "Green Notes"], base: ["Woody Notes", "Musk"] }
  },
  {
    name: "Do Son",
    brand: "Diptyque",
    year: 2005,
    concentration: "Eau de Toilette",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Fabrice Pellegrin",
    description: "A tuberose fragrance with notes of tuberose, jasmine, and pink pepper. Romantic and feminine.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Tuberose", "Jasmine"], middle: ["Pink Pepper", "Rose"], base: ["Musk", "Amber"] }
  },

  // Jo Malone
  {
    name: "Wood Sage & Sea Salt",
    brand: "Jo Malone",
    year: 2014,
    concentration: "Cologne",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Christine Nagel",
    description: "A fresh, aquatic fragrance with notes of ambrette seeds, sea salt, and sage. Inspired by the British coastline.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Ambrette Seeds", "Sea Salt"], middle: ["Sage", "Sea Fennel"], base: ["Musk", "Woody Notes"] }
  },
  {
    name: "English Pear & Freesia",
    brand: "Jo Malone",
    year: 2010,
    concentration: "Cologne",
    family: "Fruity",
    gender: "Feminine",
    perfumer: "Christine Nagel",
    description: "A fruity floral fragrance with notes of pear, freesia, and patchouli. Fresh and elegant.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Pear", "Freesia"], middle: ["Rose", "Magnolia"], base: ["Patchouli", "Musk"] }
  },
  {
    name: "Lime Basil & Mandarin",
    brand: "Jo Malone",
    year: 1999,
    concentration: "Cologne",
    family: "Citrus",
    gender: "Unisex",
    perfumer: "Jo Malone",
    description: "A fresh citrus fragrance with notes of lime, basil, and mandarin. Bright and energizing.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Lime", "Basil", "Mandarin"], middle: ["White Thyme", "Petitgrain"], base: ["Amber", "Musk"] }
  },

  // Penhaligon's
  {
    name: "Halfeti",
    brand: "Penhaligon's",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Christian Provenzano",
    description: "A mysterious oriental fragrance inspired by the Turkish village of Halfeti. Features notes of oud, rose, and spices.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Bergamot", "Grapefruit", "Cardamom"], middle: ["Rose", "Oud", "Cedar"], base: ["Amber", "Musk", "Vanilla"] }
  },
  {
    name: "The Tragedy of Lord George",
    brand: "Penhaligon's",
    year: 2016,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Alberto Morillas",
    description: "A sophisticated oriental fragrance with notes of brandy, tonka bean, and amber. Rich and complex.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Brandy", "Tonka Bean"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  },
  {
    name: "Luna",
    brand: "Penhaligon's",
    year: 2016,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christian Provenzano",
    description: "A romantic floral fragrance with notes of juniper berry, rose, and amber. Inspired by moonlight.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Juniper Berry", "Rose"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  },

  // Amouage
  {
    name: "Interlude Man",
    brand: "Amouage",
    year: 2012,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Pierre Negrin",
    description: "A complex oriental fragrance with notes of frankincense, oud, and spices. Known for its intense, long-lasting character.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Bergamot", "Oregano", "Pink Pepper"], middle: ["Frankincense", "Oud", "Cedar"], base: ["Amber", "Musk", "Vanilla"] }
  },
  {
    name: "Reflection Man",
    brand: "Amouage",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Masculine",
    perfumer: "Lucas Sieuzac",
    description: "A sophisticated floral fragrance with notes of rose, jasmine, and sandalwood. Elegant and refined.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Jasmine"], middle: ["Sandalwood", "Cedar"], base: ["Amber", "Musk"] }
  },
  {
    name: "Jubilation XXV",
    brand: "Amouage",
    year: 2008,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Bertrand Duchaufour",
    description: "A luxurious oriental fragrance with notes of blackberry, frankincense, and oud. Rich and opulent.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Blackberry", "Frankincense"], middle: ["Oud", "Rose"], base: ["Amber", "Musk"] }
  },

  // Xerjoff
  {
    name: "Naxos",
    brand: "Xerjoff",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Chris Maurice",
    description: "A luxurious oriental fragrance with notes of tobacco, honey, and vanilla. Inspired by the Greek island of Naxos.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Bergamot", "Lemon", "Lavender"], middle: ["Tobacco", "Honey", "Cinnamon"], base: ["Vanilla", "Tonka Bean", "Musk"] }
  },
  {
    name: "Erba Pura",
    brand: "Xerjoff",
    year: 2008,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Christian Carbonnel",
    description: "A fresh, fruity fragrance with notes of peach, vanilla, and musk. Bright and uplifting.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Peach", "Vanilla"], middle: ["Musk", "Amber"], base: ["Sandalwood", "Cedar"] }
  },
  {
    name: "Lira",
    brand: "Xerjoff",
    year: 2003,
    concentration: "Eau de Parfum",
    family: "Gourmand",
    gender: "Feminine",
    perfumer: "Christian Carbonnel",
    description: "A sweet gourmand fragrance with notes of caramel, vanilla, and cinnamon. Delicious and comforting.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Caramel", "Vanilla"], middle: ["Cinnamon", "Amber"], base: ["Musk", "Sandalwood"] }
  },

  // Serge Lutens
  {
    name: "Chergui",
    brand: "Serge Lutens",
    year: 2001,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Christopher Sheldrake",
    description: "A warm oriental fragrance with notes of honey, tobacco, and amber. Rich and complex.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Honey", "Tobacco"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  },
  {
    name: "Ambre Sultan",
    brand: "Serge Lutens",
    year: 2000,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Christopher Sheldrake",
    description: "A rich amber fragrance with notes of amber, vanilla, and spices. Warm and sensual.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Amber", "Vanilla"], middle: ["Spices", "Cedar"], base: ["Musk", "Sandalwood"] }
  },
  {
    name: "Feminite du Bois",
    brand: "Serge Lutens",
    year: 1992,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Feminine",
    perfumer: "Pierre Bourdon",
    description: "A woody fragrance with notes of sandalwood, cedar, and spices. Sophisticated and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Sandalwood", "Cedar"], middle: ["Spices", "Rose"], base: ["Musk", "Amber"] }
  },

  // Frederic Malle
  {
    name: "Portrait of a Lady",
    brand: "Frederic Malle",
    year: 2010,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Dominique Ropion",
    description: "A sophisticated rose fragrance with notes of rose, patchouli, and incense. Elegant and timeless.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Patchouli"], middle: ["Incense", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Musc Ravageur",
    brand: "Frederic Malle",
    year: 2000,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Maurice Roucel",
    description: "A sensual musk fragrance with notes of vanilla, cinnamon, and amber. Warm and seductive.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Vanilla", "Cinnamon"], middle: ["Amber", "Musk"], base: ["Sandalwood", "Cedar"] }
  },
  {
    name: "Carnal Flower",
    brand: "Frederic Malle",
    year: 2005,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Dominique Ropion",
    description: "A voluptuous tuberose fragrance with notes of tuberose, coconut, and musk. Rich and intoxicating.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Tuberose", "Coconut"], middle: ["Jasmine", "Rose"], base: ["Musk", "Amber"] }
  },

  // Maison Margiela
  {
    name: "Jazz Club",
    brand: "Maison Margiela",
    year: 2013,
    concentration: "Eau de Toilette",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Marie Salamagne",
    description: "A sophisticated fragrance with notes of rum, tobacco, and vanilla. Inspired by jazz clubs in Brooklyn.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rum", "Tobacco"], middle: ["Vanilla", "Amber"], base: ["Musk", "Cedar"] }
  },
  {
    name: "By the Fireplace",
    brand: "Maison Margiela",
    year: 2015,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Marie Salamagne",
    description: "A cozy woody fragrance with notes of chestnut, vanilla, and smoke. Perfect for winter evenings.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Chestnut", "Vanilla"], middle: ["Smoke", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Sailing Day",
    brand: "Maison Margiela",
    year: 2017,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Marie Salamagne",
    description: "A fresh aquatic fragrance with notes of sea salt, coriander, and amber. Inspired by sailing adventures.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Sea Salt", "Coriander"], middle: ["Amber", "Cedar"], base: ["Musk", "Woody Notes"] }
  },

  // Kilian
  {
    name: "Good Girl Gone Bad",
    brand: "Kilian",
    year: 2012,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Alberto Morillas",
    description: "A seductive floral fragrance with notes of osmanthus, jasmine, and amber. Dangerous and alluring.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Osmanthus", "Jasmine"], middle: ["Rose", "Amber"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Straight to Heaven",
    brand: "Kilian",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Sidonie Lancesseur",
    description: "A sophisticated oriental fragrance with notes of rum, vanilla, and patchouli. Rich and complex.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Rum", "Vanilla"], middle: ["Patchouli", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Love, Don't Be Shy",
    brand: "Kilian",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Gourmand",
    gender: "Feminine",
    perfumer: "Sidonie Lancesseur",
    description: "A sweet gourmand fragrance with notes of marshmallow, vanilla, and orange blossom. Playful and romantic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Marshmallow", "Vanilla"], middle: ["Orange Blossom", "Rose"], base: ["Musk", "Amber"] }
  },

  // Guerlain
  {
    name: "Shalimar",
    brand: "Guerlain",
    year: 1925,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Jacques Guerlain",
    description: "A legendary oriental fragrance with notes of vanilla, iris, and amber. Timeless and elegant.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Vanilla", "Iris"], middle: ["Amber", "Rose"], base: ["Musk", "Sandalwood"] }
  },
  {
    name: "L'Heure Bleue",
    brand: "Guerlain",
    year: 1912,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Jacques Guerlain",
    description: "A romantic floral fragrance with notes of iris, violet, and vanilla. Inspired by the blue hour of twilight.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Iris", "Violet"], middle: ["Rose", "Jasmine"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Mitsouko",
    brand: "Guerlain",
    year: 1919,
    concentration: "Eau de Parfum",
    family: "Chypre",
    gender: "Feminine",
    perfumer: "Jacques Guerlain",
    description: "A classic chypre fragrance with notes of peach, oakmoss, and vanilla. Sophisticated and complex.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Peach", "Oakmoss"], middle: ["Rose", "Jasmine"], base: ["Vanilla", "Musk"] }
  },

  // Chanel
  {
    name: "N°5",
    brand: "Chanel",
    year: 1921,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Ernest Beaux",
    description: "The most famous fragrance in the world. A sophisticated floral with notes of rose, jasmine, and vanilla.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Jasmine"], middle: ["Iris", "Violet"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Coco Mademoiselle",
    brand: "Chanel",
    year: 2001,
    concentration: "Eau de Parfum",
    family: "Chypre",
    gender: "Feminine",
    perfumer: "Jacques Polge",
    description: "A modern chypre fragrance with notes of orange, rose, and patchouli. Fresh and sophisticated.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Orange", "Rose"], middle: ["Patchouli", "Cedar"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Bleu de Chanel",
    brand: "Chanel",
    year: 2010,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Jacques Polge",
    description: "A sophisticated woody fragrance with notes of grapefruit, sandalwood, and amber. Modern and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Grapefruit", "Sandalwood"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  },

  // Dior
  {
    name: "Miss Dior",
    brand: "Dior",
    year: 1947,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Jean Carles",
    description: "A classic floral fragrance with notes of rose, jasmine, and vanilla. Timeless and romantic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Jasmine"], middle: ["Iris", "Violet"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Sauvage",
    brand: "Dior",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Masculine",
    perfumer: "Francois Demachy",
    description: "A fresh, modern fragrance with notes of bergamot, ambroxan, and amber. Clean and sophisticated.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Bergamot", "Ambroxan"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  },
  {
    name: "Homme",
    brand: "Dior",
    year: 2005,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Francois Demachy",
    description: "A sophisticated woody fragrance with notes of iris, vanilla, and amber. Elegant and refined.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Iris", "Vanilla"], middle: ["Amber", "Cedar"], base: ["Musk", "Sandalwood"] }
  },

  // Hermès
  {
    name: "Terre d'Hermès",
    brand: "Hermès",
    year: 2006,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Jean-Claude Ellena",
    description: "A sophisticated woody fragrance with notes of grapefruit, vetiver, and amber. Inspired by the earth.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Grapefruit", "Vetiver"], middle: ["Amber", "Cedar"], base: ["Musk", "Oakmoss"] }
  },
  {
    name: "Un Jardin sur le Nil",
    brand: "Hermès",
    year: 2005,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Jean-Claude Ellena",
    description: "A fresh, green fragrance with notes of grapefruit, lotus, and incense. Inspired by the Nile gardens.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Grapefruit", "Lotus"], middle: ["Incense", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Voyage d'Hermès",
    brand: "Hermès",
    year: 2010,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Jean-Claude Ellena",
    description: "A fresh, spicy fragrance with notes of cardamom, tea, and amber. Inspired by travel.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Cardamom", "Tea"], middle: ["Amber", "Cedar"], base: ["Musk", "Vanilla"] }
  }
];

async function seedNichePerfumes() {
  try {
    console.log('🌱 Starting to seed niche perfumes...');
    
    for (const perfume of nichePerfumes) {
      // Insert perfume
      const perfumeQuery = `
        INSERT INTO perfumes (
          name, brand, year, concentration, family, gender, 
          perfumer, description, longevity, sillage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const perfumeValues = [
        perfume.name,
        perfume.brand,
        perfume.year,
        perfume.concentration,
        perfume.family,
        perfume.gender,
        perfume.perfumer,
        perfume.description,
        perfume.longevity,
        perfume.sillage
      ];

      const perfumeResult = await pool.query(perfumeQuery, perfumeValues);
      const perfumeId = perfumeResult.rows[0].id;

      // Insert notes
      if (perfume.notes) {
        for (const [category, notes] of Object.entries(perfume.notes)) {
          for (const noteName of notes) {
            // Insert note if it doesn't exist
            const noteQuery = `
              INSERT INTO notes (name, category, family)
              VALUES ($1, $2, $3)
              ON CONFLICT (name) DO UPDATE SET
                category = EXCLUDED.category,
                family = EXCLUDED.family
              RETURNING id
            `;
            
            const noteResult = await pool.query(noteQuery, [noteName, category, null]);
            const noteId = noteResult.rows[0].id;

            // Link note to perfume
            const perfumeNoteQuery = `
              INSERT INTO perfume_notes (perfume_id, note_id)
              VALUES ($1, $2)
              ON CONFLICT (perfume_id, note_id) DO NOTHING
            `;
            
            await pool.query(perfumeNoteQuery, [perfumeId, noteId]);
          }
        }
      }

      console.log(`✅ Seeded: ${perfume.name} by ${perfume.brand}`);
    }

    console.log(`🎉 Seeding completed! Added ${nichePerfumes.length} niche perfumes`);
  } catch (error) {
    console.error('❌ Error seeding perfumes:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedNichePerfumes();
}

module.exports = { seedNichePerfumes };
