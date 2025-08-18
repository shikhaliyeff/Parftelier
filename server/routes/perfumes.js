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

    // Build search query
    let query = `
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
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

    query += ` GROUP BY p.id`;

    // Add sorting
    const validSortFields = ['name', 'brand', 'year', 'family'];
    const validOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sort) && validOrders.includes(order.toLowerCase())) {
      query += ` ORDER BY p.${sort} ${order.toUpperCase()}`;
    } else {
      query += ` ORDER BY p.name ASC`;
    }

    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

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
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: total > parseInt(offset) + perfumes.length
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
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE p.id = $1
      GROUP BY p.id`,
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
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      GROUP BY p.id
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
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE p.brand ILIKE $1
      GROUP BY p.id
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
        json_agg(
          json_build_object(
            'name', n.name,
            'category', n.category,
            'family', n.family
          )
        ) as notes
      FROM perfumes p
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes n ON pn.note_id = n.id
      WHERE p.family ILIKE $1
      GROUP BY p.id
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
