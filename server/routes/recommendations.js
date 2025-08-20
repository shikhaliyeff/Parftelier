const express = require('express');
const router = express.Router();
const { getMany, insert, getOne, update } = require('../utils/database');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');

// Get perfume recommendations based on user profile
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, context } = req.query;

    // Get user profile
    const userProfile = await getOne(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (!userProfile) {
      return res.status(404).json({ 
        error: 'User profile not found. Please complete the onboarding quiz first.',
        redirectTo: '/onboarding'
      });
    }

    // Build query to get perfumes
    let query = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            CASE 
              WHEN n.id IS NOT NULL THEN
                json_build_object(
                  'name', n.name,
                  'category', n.category,
                  'family', n.family
                )
              ELSE NULL
            END
          ) FILTER (WHERE n.id IS NOT NULL),
          '[]'::json
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
    `;

    const whereConditions = [];
    const queryParams = [];

    // Add context filter if provided
    if (context) {
      whereConditions.push(`p.family ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${context}%`);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    query += `
      GROUP BY p.id
      ORDER BY p.name
      LIMIT $${queryParams.length + 1}
    `;
    queryParams.push(parseInt(limit) * 3); // Get more than needed for AI to choose from

    const perfumes = await getMany(query, queryParams);

    if (perfumes.length === 0) {
      return res.status(404).json({ error: 'No perfumes found matching your criteria.' });
    }

    // Use AI to generate recommendations or fallback
    let aiRecommendations;
    try {
      aiRecommendations = await aiService.generateRecommendations(
        perfumes,
        userProfile.fragrance_dna,
        parseInt(limit)
      );
    } catch (aiError) {
      console.error('Error generating recommendations:', aiError);
      // Fallback: return top perfumes without AI scoring
      aiRecommendations = perfumes.slice(0, parseInt(limit)).map((perfume, index) => ({
        perfume_id: perfume.id,
        score: 1.0 - (index * 0.1) // Simple scoring based on order
      }));
    }

    // Get full perfume details for recommended perfumes
    const recommendedPerfumes = [];
    for (const rec of aiRecommendations) {
      const perfume = perfumes.find(p => p.id === rec.perfume_id);
      if (perfume) {
        // Generate personalized explanation or fallback
        let explanation;
        try {
          explanation = await aiService.generatePerfumeExplanation(
            perfume,
            userProfile.fragrance_dna
          );
        } catch (aiError) {
          console.error('Error generating explanation:', aiError);
          // Fallback: create simple explanation
          explanation = `This ${perfume.family} fragrance by ${perfume.brand} features notes of ${perfume.notes?.slice(0, 3).map(n => n.name).join(', ')}. Perfect for ${userProfile.fragrance_dna?.contexts?.length > 0 ? userProfile.fragrance_dna.contexts[0] : 'various occasions'}.`;
        }

        recommendedPerfumes.push({
          ...perfume,
          score: rec.score,
          explanation,
          is_saved: false // Will be updated if user has saved this perfume
        });
      }
    }

    // Check which perfumes are already saved by the user
    const savedPerfumeIds = await getMany(
      'SELECT perfume_id FROM saved_perfumes WHERE user_id = $1',
      [userId]
    );

    const savedIds = savedPerfumeIds.map(sp => sp.perfume_id);
    recommendedPerfumes.forEach(perfume => {
      perfume.is_saved = savedIds.includes(perfume.id);
    });

    // Log recommendation session
    const sessionId = `session_${Date.now()}_${userId}`;
    await insert(
      'INSERT INTO recommendation_history (user_id, session_id, recommendations) VALUES ($1, $2, $3)',
      [userId, sessionId, JSON.stringify(recommendedPerfumes)]
    );

    res.json({
      recommendations: recommendedPerfumes,
      session_id: sessionId,
      total_found: recommendedPerfumes.length
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Get recommendations based on specific perfume
router.get('/similar/:perfumeId', auth, async (req, res) => {
  try {
    const { perfumeId } = req.params;
    const { limit = 5 } = req.query;

    // Get the reference perfume
    const referencePerfume = await getOne(
      `SELECT 
        p.*,
        COALESCE(
          json_agg(
            CASE 
              WHEN n.id IS NOT NULL THEN
                json_build_object(
                  'name', n.name,
                  'category', n.category,
                  'family', n.family
                )
              ELSE NULL
            END
          ) FILTER (WHERE n.id IS NOT NULL),
          '[]'::json
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE p.id = $1
      GROUP BY p.id`,
      [perfumeId]
    );

    if (!referencePerfume) {
      return res.status(404).json({ error: 'Perfume not found' });
    }

    // Get similar perfumes based on family and notes
    const similarPerfumes = await getMany(
      `SELECT 
        p.*,
        COALESCE(
          json_agg(
            CASE 
              WHEN n.id IS NOT NULL THEN
                json_build_object(
                  'name', n.name,
                  'category', n.category,
                  'family', n.family
                )
              ELSE NULL
            END
          ) FILTER (WHERE n.id IS NOT NULL),
          '[]'::json
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE p.id != $1 
        AND (p.family = $2 OR p.family ILIKE $3)
      GROUP BY p.id
      ORDER BY p.name
      LIMIT $4`,
      [perfumeId, referencePerfume.family, `%${referencePerfume.family}%`, parseInt(limit) * 2]
    );

    if (similarPerfumes.length === 0) {
      return res.status(404).json({ error: 'No similar perfumes found' });
    }

    // Use AI to rank and explain similarities
    const aiRecommendations = await aiService.generateRecommendations(
      similarPerfumes,
      { families: { [referencePerfume.family]: 1.0 } },
      parseInt(limit)
    );

    const recommendedSimilar = [];
    for (const rec of aiRecommendations) {
      const perfume = similarPerfumes.find(p => p.id === rec.perfume_id);
      if (perfume) {
        const explanation = await aiService.generatePerfumeExplanation(
          perfume,
          { families: { [referencePerfume.family]: 1.0 } }
        );

        recommendedSimilar.push({
          ...perfume,
          score: rec.score,
          explanation,
          similarity_reason: `Similar to ${referencePerfume.name} due to shared ${referencePerfume.family} characteristics`
        });
      }
    }

    res.json({
      reference_perfume: referencePerfume,
      similar_perfumes: recommendedSimilar,
      total_found: recommendedSimilar.length
    });

  } catch (error) {
    console.error('Error getting similar perfumes:', error);
    res.status(500).json({ error: 'Failed to find similar perfumes' });
  }
});

// Submit feedback on recommendations
router.post('/feedback', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { session_id, perfume_id, rating, feedback_type, notes } = req.body;

    if (!session_id || !perfume_id || !feedback_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update recommendation history with feedback
    const history = await getOne(
      'SELECT * FROM recommendation_history WHERE session_id = $1 AND user_id = $2',
      [session_id, userId]
    );

    if (!history) {
      return res.status(404).json({ error: 'Recommendation session not found' });
    }

    const currentFeedback = history.feedback || {};
    currentFeedback[perfume_id] = {
      rating,
      feedback_type, // 'like', 'dislike', 'neutral'
      notes,
      timestamp: new Date().toISOString()
    };

    await update(
      'UPDATE recommendation_history SET feedback = $1 WHERE session_id = $2',
      [JSON.stringify(currentFeedback), session_id]
    );

    // If user liked the perfume, save it to their shelf
    if (feedback_type === 'like' && rating >= 4) {
      await insert(
        'INSERT INTO saved_perfumes (user_id, perfume_id, rating, notes) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, perfume_id) DO UPDATE SET rating = $3, notes = $4',
        [userId, perfume_id, rating, notes]
      );
    }

    // Use AI to refine future recommendations based on feedback
    const refinedWeights = await aiService.refineRecommendationsWithFeedback(
      history.recommendations,
      currentFeedback
    );

    // Update user profile with refined weights
    const userProfile = await getOne(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (userProfile) {
      const updatedDNA = {
        ...userProfile.fragrance_dna,
        refined_weights: refinedWeights
      };

      await update(
        'UPDATE user_profiles SET fragrance_dna = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
        [JSON.stringify(updatedDNA), userId]
      );
    }

    res.json({ 
      message: 'Feedback recorded successfully',
      refined_weights: refinedWeights
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// Get recommendation history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const history = await getMany(
      `SELECT 
        session_id,
        recommendations,
        feedback,
        created_at
      FROM recommendation_history 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    res.json({
      history,
      total: history.length
    });

  } catch (error) {
    console.error('Error getting recommendation history:', error);
    res.status(500).json({ error: 'Failed to get recommendation history' });
  }
});

module.exports = router;
