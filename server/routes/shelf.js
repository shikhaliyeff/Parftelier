const express = require('express');
const router = express.Router();
const { getMany, insert, update, remove } = require('../utils/database');
const auth = require('../middleware/auth');

// Get user's saved perfumes
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const savedPerfumes = await getMany(
      `SELECT 
        sp.id as shelf_id,
        sp.rating,
        sp.notes as user_notes,
        sp.tags,
        sp.created_at as saved_at,
        p.*,
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM saved_perfumes sp
      INNER JOIN perfumes p ON sp.perfume_id = p.id
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE sp.user_id = $1
      GROUP BY sp.id, p.id
      ORDER BY sp.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await getMany(
      'SELECT COUNT(*) as total FROM saved_perfumes WHERE user_id = $1',
      [userId]
    );
    const total = countResult[0]?.total || 0;

    res.json({
      saved_perfumes: savedPerfumes,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: total > parseInt(offset) + savedPerfumes.length
      }
    });

  } catch (error) {
    console.error('Error getting saved perfumes:', error);
    res.status(500).json({ error: 'Failed to get saved perfumes' });
  }
});

// Add perfume to shelf
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { perfume_id, rating, notes, tags } = req.body;

    if (!perfume_id) {
      return res.status(400).json({ error: 'Perfume ID is required' });
    }

    // Check if perfume exists
    const perfume = await getMany(
      'SELECT id FROM perfumes WHERE id = $1',
      [perfume_id]
    );

    if (perfume.length === 0) {
      return res.status(404).json({ error: 'Perfume not found' });
    }

    // Add to shelf
    const savedPerfume = await insert(
      `INSERT INTO saved_perfumes (user_id, perfume_id, rating, notes, tags)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, perfume_id) 
       DO UPDATE SET 
         rating = EXCLUDED.rating,
         notes = EXCLUDED.notes,
         tags = EXCLUDED.tags
       RETURNING *`,
      [userId, perfume_id, rating || null, notes || null, tags || []]
    );

    res.status(201).json({
      message: 'Perfume added to shelf successfully',
      saved_perfume: savedPerfume
    });

  } catch (error) {
    console.error('Error adding perfume to shelf:', error);
    res.status(500).json({ error: 'Failed to add perfume to shelf' });
  }
});

// Update saved perfume
router.put('/:shelfId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shelfId } = req.params;
    const { rating, notes, tags } = req.body;

    // Check if the saved perfume belongs to the user
    const existingSaved = await getMany(
      'SELECT id FROM saved_perfumes WHERE id = $1 AND user_id = $2',
      [shelfId, userId]
    );

    if (existingSaved.length === 0) {
      return res.status(404).json({ error: 'Saved perfume not found' });
    }

    // Update the saved perfume
    const updatedSaved = await update(
      `UPDATE saved_perfumes 
       SET rating = $1, notes = $2, tags = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [rating, notes, tags, shelfId, userId]
    );

    res.json({
      message: 'Saved perfume updated successfully',
      saved_perfume: updatedSaved
    });

  } catch (error) {
    console.error('Error updating saved perfume:', error);
    res.status(500).json({ error: 'Failed to update saved perfume' });
  }
});

// Remove perfume from shelf
router.delete('/:shelfId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shelfId } = req.params;

    // Check if the saved perfume belongs to the user
    const existingSaved = await getMany(
      'SELECT id FROM saved_perfumes WHERE id = $1 AND user_id = $2',
      [shelfId, userId]
    );

    if (existingSaved.length === 0) {
      return res.status(404).json({ error: 'Saved perfume not found' });
    }

    // Remove from shelf
    await remove(
      'DELETE FROM saved_perfumes WHERE id = $1 AND user_id = $2',
      [shelfId, userId]
    );

    res.json({ message: 'Perfume removed from shelf successfully' });

  } catch (error) {
    console.error('Error removing perfume from shelf:', error);
    res.status(500).json({ error: 'Failed to remove perfume from shelf' });
  }
});

// Get shelf statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get total count
    const totalCount = await getMany(
      'SELECT COUNT(*) as total FROM saved_perfumes WHERE user_id = $1',
      [userId]
    );

    // Get average rating
    const avgRating = await getMany(
      'SELECT AVG(rating) as average FROM saved_perfumes WHERE user_id = $1 AND rating IS NOT NULL',
      [userId]
    );

    // Get top brands
    const topBrands = await getMany(
      `SELECT p.brand, COUNT(*) as count
       FROM saved_perfumes sp
       INNER JOIN perfumes p ON sp.perfume_id = p.id
       WHERE sp.user_id = $1
       GROUP BY p.brand
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    // Get top families
    const topFamilies = await getMany(
      `SELECT p.family, COUNT(*) as count
       FROM saved_perfumes sp
       INNER JOIN perfumes p ON sp.perfume_id = p.id
       WHERE sp.user_id = $1 AND p.family IS NOT NULL
       GROUP BY p.family
       ORDER BY count DESC
       LIMIT 5`,
      [userId]
    );

    // Get recent additions
    const recentAdditions = await getMany(
      `SELECT p.name, p.brand, sp.created_at
       FROM saved_perfumes sp
       INNER JOIN perfumes p ON sp.perfume_id = p.id
       WHERE sp.user_id = $1
       ORDER BY sp.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      stats: {
        total_perfumes: totalCount[0]?.total || 0,
        average_rating: avgRating[0]?.average || 0,
        top_brands: topBrands,
        top_families: topFamilies,
        recent_additions: recentAdditions
      }
    });

  } catch (error) {
    console.error('Error getting shelf stats:', error);
    res.status(500).json({ error: 'Failed to get shelf statistics' });
  }
});

// Search saved perfumes
router.get('/search', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, brand, family, rating, limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        sp.id as shelf_id,
        sp.rating,
        sp.notes as user_notes,
        sp.tags,
        sp.created_at as saved_at,
        p.*,
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM saved_perfumes sp
      INNER JOIN perfumes p ON sp.perfume_id = p.id
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE sp.user_id = $1
    `;

    const queryParams = [userId];
    const conditions = [];

    if (q) {
      conditions.push(`(p.name ILIKE $${queryParams.length + 1} OR p.brand ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${q}%`);
    }

    if (brand) {
      conditions.push(`p.brand ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${brand}%`);
    }

    if (family) {
      conditions.push(`p.family ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${family}%`);
    }

    if (rating) {
      conditions.push(`sp.rating = $${queryParams.length + 1}`);
      queryParams.push(parseInt(rating));
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY sp.id, p.id
      ORDER BY sp.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(parseInt(limit), parseInt(offset));

    const savedPerfumes = await getMany(query, queryParams);

    res.json({
      saved_perfumes: savedPerfumes,
      total: savedPerfumes.length
    });

  } catch (error) {
    console.error('Error searching saved perfumes:', error);
    res.status(500).json({ error: 'Failed to search saved perfumes' });
  }
});

// Get saved perfume by ID
router.get('/:shelfId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { shelfId } = req.params;

    const savedPerfume = await getMany(
      `SELECT 
        sp.id as shelf_id,
        sp.rating,
        sp.notes as user_notes,
        sp.tags,
        sp.created_at as saved_at,
        p.*,
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM saved_perfumes sp
      INNER JOIN perfumes p ON sp.perfume_id = p.id
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE sp.id = $1 AND sp.user_id = $2
      GROUP BY sp.id, p.id`,
      [shelfId, userId]
    );

    if (savedPerfume.length === 0) {
      return res.status(404).json({ error: 'Saved perfume not found' });
    }

    res.json({ saved_perfume: savedPerfume[0] });

  } catch (error) {
    console.error('Error getting saved perfume:', error);
    res.status(500).json({ error: 'Failed to get saved perfume' });
  }
});

module.exports = router;
