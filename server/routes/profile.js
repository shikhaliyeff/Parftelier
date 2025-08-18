const express = require('express');
const router = express.Router();
const { insert, getOne, update } = require('../utils/database');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Create or update user profile
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      preferred_families, 
      preferred_notes, 
      contexts, 
      performance_preferences,
      favorite_perfumes,
      answers 
    } = req.body;

    // Generate fragrance DNA using AI
    let fragranceDNA;
    if (answers) {
      fragranceDNA = await aiService.generateFragranceDNA(answers);
    } else {
      fragranceDNA = {
        families: preferred_families || {},
        notes: preferred_notes || {},
        contexts: contexts || [],
        performance: performance_preferences || {}
      };
    }

    // Check if profile already exists
    const existingProfile = await getOne(
      'SELECT id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await update(
        `UPDATE user_profiles 
         SET fragrance_dna = $1, 
             preferred_families = $2, 
             preferred_notes = $3, 
             contexts = $4, 
             performance_preferences = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6
         RETURNING *`,
        [
          JSON.stringify(fragranceDNA),
          JSON.stringify(preferred_families || {}),
          JSON.stringify(preferred_notes || {}),
          JSON.stringify(contexts || []),
          JSON.stringify(performance_preferences || {}),
          userId
        ]
      );

      res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
    } else {
      // Create new profile
      const newProfile = await insert(
        `INSERT INTO user_profiles 
         (user_id, fragrance_dna, preferred_families, preferred_notes, contexts, performance_preferences)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          JSON.stringify(fragranceDNA),
          JSON.stringify(preferred_families || {}),
          JSON.stringify(preferred_notes || {}),
          JSON.stringify(contexts || []),
          JSON.stringify(performance_preferences || {})
        ]
      );

      res.status(201).json({
        message: 'Profile created successfully',
        profile: newProfile
      });
    }

  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await getOne(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Please complete the onboarding quiz first.' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update specific profile preferences
router.patch('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Get current profile
    const currentProfile = await getOne(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (!currentProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Merge updates with existing data
    const updatedProfile = {
      fragrance_dna: { ...currentProfile.fragrance_dna, ...updates.fragrance_dna },
      preferred_families: { ...currentProfile.preferred_families, ...updates.preferred_families },
      preferred_notes: { ...currentProfile.preferred_notes, ...updates.preferred_notes },
      contexts: updates.contexts || currentProfile.contexts,
      performance_preferences: { ...currentProfile.performance_preferences, ...updates.performance_preferences }
    };

    // Update profile
    const result = await update(
      `UPDATE user_profiles 
       SET fragrance_dna = $1, 
           preferred_families = $2, 
           preferred_notes = $3, 
           contexts = $4, 
           performance_preferences = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`,
      [
        JSON.stringify(updatedProfile.fragrance_dna),
        JSON.stringify(updatedProfile.preferred_families),
        JSON.stringify(updatedProfile.preferred_notes),
        JSON.stringify(updatedProfile.contexts),
        JSON.stringify(updatedProfile.performance_preferences),
        userId
      ]
    );

    res.json({
      message: 'Profile updated successfully',
      profile: result
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get onboarding questions
router.get('/onboarding-questions', (req, res) => {
  const questions = {
    scent_families: {
      question: "Which scent families do you prefer?",
      type: "multi_select",
      options: [
        { value: "citrus", label: "Citrus", description: "Fresh, bright, zesty" },
        { value: "woody", label: "Woody", description: "Warm, earthy, sophisticated" },
        { value: "floral", label: "Floral", description: "Romantic, feminine, delicate" },
        { value: "oriental", label: "Oriental", description: "Spicy, exotic, sensual" },
        { value: "fresh", label: "Fresh", description: "Clean, aquatic, crisp" },
        { value: "leather", label: "Leather", description: "Masculine, bold, luxurious" },
        { value: "chypre", label: "Chypre", description: "Complex, mossy, elegant" },
        { value: "gourmand", label: "Gourmand", description: "Sweet, edible, comforting" }
      ]
    },
    favorite_notes: {
      question: "Which notes do you love?",
      type: "multi_select",
      options: [
        { value: "bergamot", label: "Bergamot", category: "top" },
        { value: "cedar", label: "Cedar", category: "base" },
        { value: "rose", label: "Rose", category: "middle" },
        { value: "vanilla", label: "Vanilla", category: "base" },
        { value: "lavender", label: "Lavender", category: "top" },
        { value: "patchouli", label: "Patchouli", category: "base" },
        { value: "jasmine", label: "Jasmine", category: "middle" },
        { value: "amber", label: "Amber", category: "base" },
        { value: "sandalwood", label: "Sandalwood", category: "base" },
        { value: "musk", label: "Musk", category: "base" }
      ]
    },
    usage_contexts: {
      question: "When do you plan to wear perfume?",
      type: "multi_select",
      options: [
        { value: "office", label: "Office/Work", description: "Professional settings" },
        { value: "evening", label: "Evening/Date", description: "Romantic occasions" },
        { value: "summer", label: "Summer", description: "Hot weather" },
        { value: "winter", label: "Winter", description: "Cold weather" },
        { value: "casual", label: "Casual", description: "Everyday wear" },
        { value: "special", label: "Special Events", description: "Important occasions" }
      ]
    },
    longevity_preference: {
      question: "How long do you want your perfume to last?",
      type: "single_select",
      options: [
        { value: "light", label: "Light (2-4 hours)", description: "Subtle, fresh" },
        { value: "moderate", label: "Moderate (4-6 hours)", description: "Balanced" },
        { value: "strong", label: "Strong (6-8 hours)", description: "Long-lasting" },
        { value: "very_strong", label: "Very Strong (8+ hours)", description: "Intense" }
      ]
    },
    sillage_preference: {
      question: "How much projection do you prefer?",
      type: "single_select",
      options: [
        { value: "discreet", label: "Discreet", description: "Close to skin" },
        { value: "moderate", label: "Moderate", description: "Noticeable but not overwhelming" },
        { value: "projecting", label: "Projecting", description: "Makes a statement" },
        { value: "very_projecting", label: "Very Projecting", description: "Room-filling" }
      ]
    },
    gender_preference: {
      question: "What type of fragrances do you prefer?",
      type: "single_select",
      options: [
        { value: "masculine", label: "Masculine", description: "Traditionally men's fragrances" },
        { value: "feminine", label: "Feminine", description: "Traditionally women's fragrances" },
        { value: "unisex", label: "Unisex", description: "Gender-neutral fragrances" },
        { value: "any", label: "Any", description: "Open to all types" }
      ]
    }
  };

  res.json({ questions });
});

module.exports = router;
