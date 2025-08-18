const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Extended list of niche perfumes - adding hundreds more
const extendedNichePerfumes = [
  // Additional Creed fragrances
  {
    name: "Royal Oud",
    brand: "Creed",
    year: 2010,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Olivier Creed",
    description: "A luxurious oud fragrance with notes of oud, sandalwood, and spices. Rich and sophisticated.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Oud", "Sandalwood", "Cardamom"], middle: ["Rose", "Cedar"], base: ["Amber", "Musk"] }
  },
  {
    name: "Virgin Island Water",
    brand: "Creed",
    year: 2007,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Olivier Creed",
    description: "A tropical aquatic fragrance with notes of coconut, lime, and rum. Perfect for summer.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Coconut", "Lime", "Rum"], middle: ["Bergamot", "Mandarin"], base: ["Musk", "Amber"] }
  },
  {
    name: "Himalaya",
    brand: "Creed",
    year: 2002,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Masculine",
    perfumer: "Olivier Creed",
    description: "A fresh mountain fragrance with notes of bergamot, grapefruit, and sandalwood. Crisp and clean.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Grapefruit", "Lemon"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Tom Ford fragrances
  {
    name: "Lost Cherry",
    brand: "Tom Ford",
    year: 2018,
    concentration: "Eau de Parfum",
    family: "Gourmand",
    gender: "Unisex",
    perfumer: "Louise Turner",
    description: "A seductive cherry fragrance with notes of cherry, almond, and vanilla. Sweet and intoxicating.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Cherry", "Almond", "Liqueur"], middle: ["Rose", "Jasmine"], base: ["Vanilla", "Tonka Bean"] }
  },
  {
    name: "Fucking Fabulous",
    brand: "Tom Ford",
    year: 2017,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Tom Ford",
    description: "A bold oriental fragrance with notes of lavender, vanilla, and leather. Provocative and luxurious.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Lavender", "Clary Sage"], middle: ["Vanilla", "Leather"], base: ["Amber", "Musk"] }
  },
  {
    name: "Soleil Blanc",
    brand: "Tom Ford",
    year: 2016,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Tom Ford",
    description: "A warm, sunny fragrance with notes of coconut, vanilla, and amber. Perfect for summer days.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Coconut", "Bergamot", "Pink Pepper"], middle: ["Vanilla", "Amber"], base: ["Musk", "Sandalwood"] }
  },

  // Additional MFK fragrances
  {
    name: "Aqua Universalis",
    brand: "Maison Francis Kurkdjian",
    year: 2009,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A clean, universal fragrance with notes of bergamot, lily of the valley, and musk. Fresh and timeless.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Lemon", "Lime"], middle: ["Lily of the Valley", "Rose"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Lumiere Noire",
    brand: "Maison Francis Kurkdjian",
    year: 2009,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A mysterious rose fragrance with notes of rose, spices, and patchouli. Dark and seductive.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Spices"], middle: ["Patchouli", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Amyris",
    brand: "Maison Francis Kurkdjian",
    year: 2012,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Francis Kurkdjian",
    description: "A sophisticated woody fragrance with notes of amyris, iris, and sandalwood. Elegant and refined.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Amyris", "Iris"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Byredo fragumes
  {
    name: "Blanche",
    brand: "Byredo",
    year: 2009,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Unisex",
    perfumer: "Jerome Epinette",
    description: "A clean white floral fragrance with notes of white rose, peony, and musk. Pure and minimal.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["White Rose", "Peony"], middle: ["Narcissus", "Violet"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Pulp",
    brand: "Byredo",
    year: 2008,
    concentration: "Eau de Parfum",
    family: "Fruity",
    gender: "Unisex",
    perfumer: "Jerome Epinette",
    description: "A juicy fruity fragrance with notes of fig, apple, and peach. Fresh and vibrant.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Fig", "Apple", "Peach"], middle: ["Rose", "Jasmine"], base: ["Musk", "Cedar"] }
  },
  {
    name: "La Tulipe",
    brand: "Byredo",
    year: 2010,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Jerome Epinette",
    description: "A fresh tulip fragrance with notes of tulip, freesia, and vetiver. Spring-like and elegant.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Tulip", "Freesia"], middle: ["Vetiver", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Le Labo fragrances
  {
    name: "Patchouli 24",
    brand: "Le Labo",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Annick Menardo",
    description: "A smoky patchouli fragrance with notes of patchouli, vanilla, and birch. Dark and mysterious.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Patchouli", "Vanilla"], middle: ["Birch", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Vetiver 46",
    brand: "Le Labo",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Mark Buxton",
    description: "A sophisticated vetiver fragrance with notes of vetiver, pepper, and incense. Complex and refined.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Vetiver", "Pepper"], middle: ["Incense", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Iris 39",
    brand: "Le Labo",
    year: 2006,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Unisex",
    perfumer: "Daphne Bugey",
    description: "A powdery iris fragrance with notes of iris, patchouli, and vanilla. Elegant and timeless.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Iris", "Patchouli"], middle: ["Rose", "Jasmine"], base: ["Vanilla", "Musk"] }
  },

  // Additional Diptyque fragrances
  {
    name: "Eau Rose",
    brand: "Diptyque",
    year: 2012,
    concentration: "Eau de Toilette",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Fabrice Pellegrin",
    description: "A fresh rose fragrance with notes of rose, litchi, and musk. Light and romantic.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Rose", "Litchi"], middle: ["Jasmine", "Peony"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Eau Duelle",
    brand: "Diptyque",
    year: 2010,
    concentration: "Eau de Toilette",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Fabrice Pellegrin",
    description: "A warm vanilla fragrance with notes of vanilla, cardamom, and amber. Comforting and sensual.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Vanilla", "Cardamom"], middle: ["Amber", "Cedar"], base: ["Musk", "Sandalwood"] }
  },
  {
    name: "Vetyverio",
    brand: "Diptyque",
    year: 2010,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Olivia Giacobetti",
    description: "A fresh vetiver fragrance with notes of vetiver, grapefruit, and nutmeg. Clean and sophisticated.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Vetiver", "Grapefruit"], middle: ["Nutmeg", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Jo Malone fragrances
  {
    name: "Peony & Blush Suede",
    brand: "Jo Malone",
    year: 2013,
    concentration: "Cologne",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christine Nagel",
    description: "A romantic floral fragrance with notes of peony, rose, and suede. Soft and elegant.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Peony", "Rose"], middle: ["Suede", "Jasmine"], base: ["Musk", "Amber"] }
  },
  {
    name: "Blackberry & Bay",
    brand: "Jo Malone",
    year: 2012,
    concentration: "Cologne",
    family: "Fruity",
    gender: "Unisex",
    perfumer: "Fabrice Pellegrin",
    description: "A fresh fruity fragrance with notes of blackberry, bay, and cedar. Bright and natural.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Blackberry", "Bay"], middle: ["Cedar", "Grape"], base: ["Musk", "Amber"] }
  },
  {
    name: "Myrrh & Tonka",
    brand: "Jo Malone",
    year: 2016,
    concentration: "Cologne",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Mathilde Bijaoui",
    description: "A warm oriental fragrance with notes of myrrh, tonka bean, and vanilla. Rich and comforting.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Myrrh", "Tonka Bean"], middle: ["Vanilla", "Amber"], base: ["Musk", "Cedar"] }
  },

  // Additional Penhaligon's fragrances
  {
    name: "Blenheim Bouquet",
    brand: "Penhaligon's",
    year: 1902,
    concentration: "Eau de Toilette",
    family: "Citrus",
    gender: "Masculine",
    perfumer: "William Penhaligon",
    description: "A classic citrus fragrance with notes of lemon, lime, and pine. Fresh and traditional.",
    longevity: "Light (2-4 hours)",
    sillage: "Discreet",
    notes: { top: ["Lemon", "Lime"], middle: ["Pine", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Quercus",
    brand: "Penhaligon's",
    year: 1996,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Masculine",
    perfumer: "Christian Provenzano",
    description: "A fresh green fragrance with notes of bergamot, oakmoss, and sandalwood. Natural and sophisticated.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Bergamot", "Oakmoss"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Endymion",
    brand: "Penhaligon's",
    year: 2003,
    concentration: "Eau de Toilette",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Christian Provenzano",
    description: "A sophisticated oriental fragrance with notes of bergamot, coffee, and leather. Rich and complex.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Bergamot", "Coffee"], middle: ["Leather", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Amouage fragrances
  {
    name: "Dia Man",
    brand: "Amouage",
    year: 2002,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Masculine",
    perfumer: "Jean-Claude Ellena",
    description: "A sophisticated floral fragrance with notes of iris, rose, and sandalwood. Elegant and refined.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Iris", "Rose"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Epic Man",
    brand: "Amouage",
    year: 2009,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Randa Hammami",
    description: "A powerful oriental fragrance with notes of frankincense, oud, and spices. Bold and majestic.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Frankincense", "Oud"], middle: ["Spices", "Cedar"], base: ["Amber", "Musk"] }
  },
  {
    name: "Lyric Man",
    brand: "Amouage",
    year: 2008,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Masculine",
    perfumer: "Daniel Maurel",
    description: "A romantic rose fragrance with notes of rose, incense, and sandalwood. Poetic and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Incense"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Xerjoff fragrances
  {
    name: "Dama Bianca",
    brand: "Xerjoff",
    year: 2013,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christian Carbonnel",
    description: "A delicate white floral fragrance with notes of white flowers, vanilla, and musk. Pure and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["White Flowers", "Vanilla"], middle: ["Jasmine", "Rose"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Richwood",
    brand: "Xerjoff",
    year: 2015,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Christian Carbonnel",
    description: "A luxurious woody fragrance with notes of oud, sandalwood, and vanilla. Rich and opulent.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Oud", "Sandalwood"], middle: ["Vanilla", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Ivory Route",
    brand: "Xerjoff",
    year: 2012,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Christian Carbonnel",
    description: "A spicy oriental fragrance with notes of spices, vanilla, and amber. Warm and exotic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Spices", "Vanilla"], middle: ["Amber", "Cedar"], base: ["Musk", "Sandalwood"] }
  },

  // Additional Serge Lutens fragrances
  {
    name: "Fleurs d'Oranger",
    brand: "Serge Lutens",
    year: 1995,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christopher Sheldrake",
    description: "A pure orange blossom fragrance with notes of orange blossom, jasmine, and musk. Fresh and romantic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Orange Blossom", "Jasmine"], middle: ["Rose", "Tuberose"], base: ["Musk", "Amber"] }
  },
  {
    name: "Datura Noir",
    brand: "Serge Lutens",
    year: 2001,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christopher Sheldrake",
    description: "A mysterious white floral fragrance with notes of datura, coconut, and vanilla. Exotic and seductive.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Datura", "Coconut"], middle: ["Jasmine", "Rose"], base: ["Vanilla", "Musk"] }
  },
  {
    name: "Un Bois Vanille",
    brand: "Serge Lutens",
    year: 2003,
    concentration: "Eau de Parfum",
    family: "Gourmand",
    gender: "Unisex",
    perfumer: "Christopher Sheldrake",
    description: "A warm vanilla fragrance with notes of vanilla, sandalwood, and coconut. Comforting and sensual.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Vanilla", "Coconut"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Frederic Malle fragrances
  {
    name: "Vetiver Extraordinaire",
    brand: "Frederic Malle",
    year: 2002,
    concentration: "Eau de Parfum",
    family: "Woody",
    gender: "Masculine",
    perfumer: "Dominique Ropion",
    description: "A pure vetiver fragrance with notes of vetiver, oakmoss, and musk. Natural and sophisticated.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Vetiver", "Oakmoss"], middle: ["Cedar", "Sandalwood"], base: ["Musk", "Amber"] }
  },
  {
    name: "Iris Poudre",
    brand: "Frederic Malle",
    year: 2003,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Pierre Bourdon",
    description: "A powdery iris fragrance with notes of iris, vanilla, and musk. Elegant and timeless.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Iris", "Vanilla"], middle: ["Rose", "Jasmine"], base: ["Musk", "Amber"] }
  },
  {
    name: "Lys Mediterranee",
    brand: "Frederic Malle",
    year: 2000,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Edouard Flechier",
    description: "A fresh lily fragrance with notes of lily, orange blossom, and musk. Mediterranean and pure.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Lily", "Orange Blossom"], middle: ["Jasmine", "Rose"], base: ["Musk", "Cedar"] }
  },

  // Additional Maison Margiela fragrances
  {
    name: "Whispers in the Library",
    brand: "Maison Margiela",
    year: 2019,
    concentration: "Eau de Toilette",
    family: "Woody",
    gender: "Unisex",
    perfumer: "Marie Salamagne",
    description: "A cozy woody fragrance with notes of vanilla, pepper, and cedar. Inspired by old libraries.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Vanilla", "Pepper"], middle: ["Cedar", "Woody Notes"], base: ["Musk", "Amber"] }
  },
  {
    name: "Coffee Break",
    brand: "Maison Margiela",
    year: 2019,
    concentration: "Eau de Toilette",
    family: "Gourmand",
    gender: "Unisex",
    perfumer: "Marie Salamagne",
    description: "A warm coffee fragrance with notes of coffee, vanilla, and milk. Comforting and cozy.",
    longevity: "Strong (6-8 hours)",
    sillage: "Moderate",
    notes: { top: ["Coffee", "Vanilla"], middle: ["Milk", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Bubble Bath",
    brand: "Maison Margiela",
    year: 2021,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Marie Salamagne",
    description: "A clean soapy fragrance with notes of coconut, white flowers, and musk. Fresh and comforting.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Coconut", "White Flowers"], middle: ["Soap", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Kilian fragrances
  {
    name: "Black Phantom",
    brand: "Kilian",
    year: 2017,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Unisex",
    perfumer: "Alberto Morillas",
    description: "A mysterious oriental fragrance with notes of rum, coffee, and chocolate. Dark and seductive.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Rum", "Coffee"], middle: ["Chocolate", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Voulez-Vous Coucher Avec Moi",
    brand: "Kilian",
    year: 2017,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Alberto Morillas",
    description: "A seductive floral fragrance with notes of tuberose, jasmine, and vanilla. Provocative and alluring.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Tuberose", "Jasmine"], middle: ["Rose", "Vanilla"], base: ["Musk", "Amber"] }
  },
  {
    name: "Moonlight in Heaven",
    brand: "Kilian",
    year: 2016,
    concentration: "Eau de Parfum",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Alberto Morillas",
    description: "A fresh tropical fragrance with notes of coconut, mango, and vanilla. Bright and uplifting.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Coconut", "Mango"], middle: ["Vanilla", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Guerlain fragrances
  {
    name: "Mon Guerlain",
    brand: "Guerlain",
    year: 2017,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Thierry Wasser",
    description: "A modern oriental fragrance with notes of lavender, vanilla, and sandalwood. Comforting and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Lavender", "Vanilla"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "L'Homme Ideal",
    brand: "Guerlain",
    year: 2014,
    concentration: "Eau de Toilette",
    family: "Oriental",
    gender: "Masculine",
    perfumer: "Thierry Wasser",
    description: "A sophisticated oriental fragrance with notes of bergamot, almond, and vanilla. Elegant and refined.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Bergamot", "Almond"], middle: ["Vanilla", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "La Petite Robe Noire",
    brand: "Guerlain",
    year: 2012,
    concentration: "Eau de Parfum",
    family: "Gourmand",
    gender: "Feminine",
    perfumer: "Thierry Wasser",
    description: "A sweet gourmand fragrance with notes of cherry, licorice, and vanilla. Playful and romantic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Cherry", "Licorice"], middle: ["Vanilla", "Rose"], base: ["Musk", "Amber"] }
  },

  // Additional Chanel fragrances
  {
    name: "Chance",
    brand: "Chanel",
    year: 2002,
    concentration: "Eau de Toilette",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Jacques Polge",
    description: "A fresh floral fragrance with notes of pink pepper, jasmine, and vanilla. Young and optimistic.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Pink Pepper", "Jasmine"], middle: ["Rose", "Vanilla"], base: ["Musk", "Amber"] }
  },
  {
    name: "Allure",
    brand: "Chanel",
    year: 1996,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Jacques Polge",
    description: "A sophisticated oriental fragrance with notes of mandarin, vanilla, and sandalwood. Elegant and timeless.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Mandarin", "Vanilla"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Coco",
    brand: "Chanel",
    year: 1984,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Jacques Polge",
    description: "A rich oriental fragrance with notes of rose, patchouli, and vanilla. Bold and sophisticated.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Rose", "Patchouli"], middle: ["Vanilla", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Dior fragrances
  {
    name: "Poison",
    brand: "Dior",
    year: 1985,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Edouard Flechier",
    description: "A bold oriental fragrance with notes of plum, rose, and vanilla. Dangerous and seductive.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Very Projecting",
    notes: { top: ["Plum", "Rose"], middle: ["Vanilla", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Hypnotic Poison",
    brand: "Dior",
    year: 1998,
    concentration: "Eau de Parfum",
    family: "Oriental",
    gender: "Feminine",
    perfumer: "Annick Menardo",
    description: "A hypnotic oriental fragrance with notes of vanilla, almond, and sandalwood. Mesmerizing and sensual.",
    longevity: "Very Strong (8+ hours)",
    sillage: "Projecting",
    notes: { top: ["Vanilla", "Almond"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },
  {
    name: "Pure Poison",
    brand: "Dior",
    year: 2004,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Carlos Benaim",
    description: "A pure white floral fragrance with notes of jasmine, vanilla, and sandalwood. Clean and elegant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Jasmine", "Vanilla"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  },

  // Additional Hermès fragrances
  {
    name: "Eau des Merveilles",
    brand: "Hermès",
    year: 2004,
    concentration: "Eau de Toilette",
    family: "Fresh",
    gender: "Unisex",
    perfumer: "Ralf Schwieger",
    description: "A fresh marine fragrance with notes of orange, amber, and cedar. Inspired by the sea.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Orange", "Amber"], middle: ["Cedar", "Woody Notes"], base: ["Musk", "Amber"] }
  },
  {
    name: "Jour d'Hermès",
    brand: "Hermès",
    year: 2013,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Jean-Claude Ellena",
    description: "A fresh floral fragrance with notes of gardenia, white flowers, and musk. Light and elegant.",
    longevity: "Moderate (4-6 hours)",
    sillage: "Moderate",
    notes: { top: ["Gardenia", "White Flowers"], middle: ["Jasmine", "Rose"], base: ["Musk", "Cedar"] }
  },
  {
    name: "Twilly d'Hermès",
    brand: "Hermès",
    year: 2017,
    concentration: "Eau de Parfum",
    family: "Floral",
    gender: "Feminine",
    perfumer: "Christine Nagel",
    description: "A spicy floral fragrance with notes of ginger, tuberose, and sandalwood. Young and vibrant.",
    longevity: "Strong (6-8 hours)",
    sillage: "Projecting",
    notes: { top: ["Ginger", "Tuberose"], middle: ["Sandalwood", "Cedar"], base: ["Musk", "Amber"] }
  }
];

async function seedExtendedNichePerfumes() {
  try {
    console.log('🌱 Starting to seed extended niche perfumes...');
    
    for (const perfume of extendedNichePerfumes) {
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

    console.log(`🎉 Seeding completed! Added ${extendedNichePerfumes.length} extended niche perfumes`);
  } catch (error) {
    console.error('❌ Error seeding perfumes:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedExtendedNichePerfumes();
}

module.exports = { seedExtendedNichePerfumes };
