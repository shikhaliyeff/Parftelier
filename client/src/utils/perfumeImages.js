// Utility to generate high-quality perfume images
// Prioritizes real Fragrantica images, falls back to premium placeholders

const generatePremiumPerfumeImage = (perfume) => {
  // High-quality perfume photography sources for fallback
  const premiumImages = {
    // Chanel
    'Chanel': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Dior
    'Dior': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Tom Ford
    'Tom Ford': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Jo Malone
    'Jo Malone': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Byredo
    'Byredo': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Maison Margiela
    'Maison Margiela': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Le Labo
    'Le Labo': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Creed
    'Creed': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Frederic Malle
    'Frederic Malle': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Serge Lutens
    'Serge Lutens': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Hermès
    'Hermès': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Guerlain
    'Guerlain': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Yves Saint Laurent
    'Yves Saint Laurent': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Givenchy
    'Givenchy': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Lancôme
    'Lancôme': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Estée Lauder
    'Estée Lauder': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Versace
    'Versace': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Dolce & Gabbana
    'Dolce & Gabbana': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Giorgio Armani
    'Giorgio Armani': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Bvlgari
    'Bvlgari': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Cartier
    'Cartier': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Van Cleef & Arpels
    'Van Cleef & Arpels': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Penhaligon's
    'Penhaligon\'s': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Floris
    'Floris': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Amouage
    'Amouage': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Xerjoff
    'Xerjoff': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Roja Dove
    'Roja Dove': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Parfums de Marly
    'Parfums de Marly': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Initio
    'Initio': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Kilian
    'Kilian': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Maison Francis Kurkdjian
    'Maison Francis Kurkdjian': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Diptyque
    'Diptyque': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // L'Artisan Parfumeur
    'L\'Artisan Parfumeur': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Annick Goutal
    'Annick Goutal': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Serge Lutens
    'Serge Lutens': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    
    // Lutens
    'Lutens': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85'
  };

  return premiumImages[perfume.brand] || premiumImages['Chanel'];
};

// Function to get family-specific premium images
const getFamilySpecificPremiumImage = (perfume) => {
  const familyImages = {
    'Oriental': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Woody': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Fresh': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Floral': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Citrus': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Aromatic': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Chypre': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Gourmand': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Aquatic': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Leather': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Powdery': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Spicy': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Fruity': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Mossy': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Amber': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Musky': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Vanilla': 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Tobacco': 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Incense': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=500&fit=crop&crop=center&auto=format&q=85',
    'Resinous': 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=500&fit=crop&crop=center&auto=format&q=85'
  };

  return familyImages[perfume.family] || familyImages['Oriental'];
};

// Check if an image URL is a real Fragrantica image
const isRealFragranticaImage = (imageUrl) => {
  if (!imageUrl) return false;
  
  // Check if it's a real Fragrantica image (not a placeholder)
  return imageUrl.includes('fragrantica.com') && 
         !imageUrl.includes('unsplash') && 
         !imageUrl.includes('placeholder');
};

export const getPerfumeImage = (perfume) => {
  if (!perfume) return null;
  
  // Priority 1: Use stored image_url if it's a real Fragrantica image
  if (perfume.image_url && isRealFragranticaImage(perfume.image_url)) {
    return perfume.image_url;
  }
  
  // Priority 2: Fall back to premium placeholder images
  return generatePremiumPerfumeImage(perfume);
};

export const getFamilySpecificPerfumeImage = (perfume) => {
  if (!perfume) return null;
  
  // Priority 1: Use stored image_url if it's a real Fragrantica image
  if (perfume.image_url && isRealFragranticaImage(perfume.image_url)) {
    return perfume.image_url;
  }
  
  // Priority 2: Fall back to family-specific premium images
  return getFamilySpecificPremiumImage(perfume);
};

export const getPerfumeGradient = (perfume) => {
  const gradientMap = {
    'Oriental': 'from-amber-400 to-orange-600',
    'Woody': 'from-amber-600 to-brown-800',
    'Fresh': 'from-blue-400 to-cyan-500',
    'Floral': 'from-pink-300 to-rose-500',
    'Citrus': 'from-yellow-400 to-orange-500',
    'Aromatic': 'from-green-500 to-emerald-700',
    'Chypre': 'from-green-600 to-brown-700',
    'Gourmand': 'from-amber-300 to-brown-600',
    'Aquatic': 'from-blue-300 to-cyan-400',
    'Leather': 'from-brown-600 to-gray-800',
    'Powdery': 'from-pink-200 to-purple-400',
    'Spicy': 'from-red-500 to-orange-600',
    'Fruity': 'from-pink-400 to-red-500',
    'Mossy': 'from-green-600 to-brown-600',
    'Amber': 'from-amber-500 to-orange-700',
    'Musky': 'from-gray-500 to-brown-700',
    'Vanilla': 'from-yellow-300 to-amber-500',
    'Tobacco': 'from-brown-700 to-gray-900',
    'Incense': 'from-purple-600 to-gray-800',
    'Resinous': 'from-amber-600 to-brown-800'
  };

  return gradientMap[perfume.family] || 'from-amber-400 to-orange-600';
};
