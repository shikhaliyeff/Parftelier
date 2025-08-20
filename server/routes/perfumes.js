const express = require('express');
const router = express.Router();
const { getMany, getOne } = require('../utils/database');
const aiService = require('../services/aiService');

// Search perfumes
router.get('/search', async (req, res) => {
  try {
    const { 
      q, 
      brand, 
      family, 
      gender, 
      limit = 20, 
      offset = 0,
      sort = 'name',
      order = 'asc'
    } = req.query;

    // Validate parameters
    const validLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100); // Between 1 and 100
    const validOffset = Math.max(parseInt(offset) || 0, 0); // Non-negative
    const validSort = ['name', 'brand', 'year', 'family'].includes(sort) ? sort : 'name';
    const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'asc';

    // Build search query
    let query = `
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', n.name,
              'category', n.category,
              'family', n.family
            )
          ) FROM perfume_notes pn2 
           INNER JOIN notes n ON pn2.note_id = n.id 
           WHERE pn2.perfume_id = p.id),
          '[]'::json
        ) as notes
      FROM perfumes p
    `;

    const whereConditions = [];
    const queryParams = [];

    // Add search conditions
    if (q) {
      whereConditions.push(`(p.name ILIKE $${queryParams.length + 1} OR p.brand ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${q}%`);
    }

    if (brand) {
      whereConditions.push(`p.brand ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${brand}%`);
    }

    if (family) {
      whereConditions.push(`p.family ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${family}%`);
    }

    if (gender) {
      whereConditions.push(`p.gender = $${queryParams.length + 1}`);
      queryParams.push(gender);
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }



    // Add sorting
    query += ` ORDER BY p.${validSort} ${validOrder.toUpperCase()}`;

    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(validLimit, validOffset);

    const perfumes = await getMany(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM perfumes p
    `;

    if (whereConditions.length > 0) {
      countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    const countResult = await getOne(countQuery, queryParams.slice(0, -2));
    const total = countResult ? countResult.total : 0;

    res.json({
      perfumes,
      pagination: {
        total,
        limit: validLimit,
        offset: validOffset,
        has_more: total > validOffset + perfumes.length
      }
    });

  } catch (error) {
    console.error('Error searching perfumes:', error);
    res.status(500).json({ error: 'Failed to search perfumes' });
  }
});

// Get perfume by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const perfume = await getOne(
      `SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', n.name,
              'category', n.category,
              'family', n.family
            )
          ) FROM perfume_notes pn2 
           INNER JOIN notes n ON pn2.note_id = n.id 
           WHERE pn2.perfume_id = p.id),
          '[]'::json
        ) as notes
      FROM perfumes p
      WHERE p.id = $1`,
      [id]
    );

    if (!perfume) {
      return res.status(404).json({ error: 'Perfume not found' });
    }

    // Generate AI summary
    const summary = await aiService.generatePerfumeSummary(perfume);

    res.json({
      perfume: {
        ...perfume,
        summary
      }
    });

  } catch (error) {
    console.error('Error getting perfume:', error);
    res.status(500).json({ error: 'Failed to get perfume' });
  }
});

// Get popular perfumes
router.get('/popular/list', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const perfumes = await getMany(
      `SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', n.name,
              'category', n.category,
              'family', n.family
            )
          ) FROM perfume_notes pn2 
           INNER JOIN notes n ON pn2.note_id = n.id 
           WHERE pn2.perfume_id = p.id),
          '[]'::json
        ) as notes
      FROM perfumes p
      ORDER BY p.name
      LIMIT $1`,
      [parseInt(limit)]
    );

    res.json({ perfumes });

  } catch (error) {
    console.error('Error getting popular perfumes:', error);
    res.status(500).json({ error: 'Failed to get popular perfumes' });
  }
});

// Get perfumes by brand
router.get('/brand/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const perfumes = await getMany(
      `SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', n.name,
              'category', n.category,
              'family', n.family
            )
          ) FROM perfume_notes pn2 
           INNER JOIN notes n ON pn2.note_id = n.id 
           WHERE pn2.perfume_id = p.id),
          '[]'::json
        ) as notes
      FROM perfumes p
      WHERE p.brand ILIKE $1
      ORDER BY p.name
      LIMIT $2 OFFSET $3`,
      [`%${brand}%`, parseInt(limit), parseInt(offset)]
    );

    res.json({ perfumes });

  } catch (error) {
    console.error('Error getting perfumes by brand:', error);
    res.status(500).json({ error: 'Failed to get perfumes by brand' });
  }
});

// Get perfumes by family
router.get('/family/:family', async (req, res) => {
  try {
    const { family } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const perfumes = await getMany(
      `SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'name', n.name,
              'category', n.category,
              'family', n.family
            )
          ) FROM perfume_notes pn2 
           INNER JOIN notes n ON pn2.note_id = n.id 
           WHERE pn2.perfume_id = p.id),
          '[]'::json
        ) as notes
      FROM perfumes p
      WHERE p.family ILIKE $1
      ORDER BY p.name
      LIMIT $2 OFFSET $3`,
      [`%${family}%`, parseInt(limit), parseInt(offset)]
    );

    res.json({ perfumes });

  } catch (error) {
    console.error('Error getting perfumes by family:', error);
    res.status(500).json({ error: 'Failed to get perfumes by family' });
  }
});

// Get all brands
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await getMany(
      'SELECT DISTINCT brand FROM perfumes ORDER BY brand'
    );

    res.json({ 
      brands: brands.map(b => b.brand) 
    });

  } catch (error) {
    console.error('Error getting brands:', error);
    res.status(500).json({ error: 'Failed to get brands' });
  }
});

// Get all families
router.get('/families/list', async (req, res) => {
  try {
    const families = await getMany(
      'SELECT DISTINCT family FROM perfumes WHERE family IS NOT NULL ORDER BY family'
    );

    res.json({ 
      families: families.map(f => f.family) 
    });

  } catch (error) {
    console.error('Error getting families:', error);
    res.status(500).json({ error: 'Failed to get families' });
  }
});

// Get perfumes by note
router.get('/notes/:note', async (req, res) => {
  try {
    const { note } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const perfumes = await getMany(
      `SELECT DISTINCT
        p.*,
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      INNER JOIN perfume_notes pn ON p.id = pn.perfume_id
      INNER JOIN notes n ON pn.note_id = n.id
      WHERE n.name ILIKE $1
      GROUP BY p.id
      ORDER BY p.name
      LIMIT $2 OFFSET $3`,
      [`%${note}%`, parseInt(limit), parseInt(offset)]
    );

    res.json({ perfumes });

  } catch (error) {
    console.error('Error getting perfumes by note:', error);
    res.status(500).json({ error: 'Failed to get perfumes by note' });
  }
});

module.exports = router;
