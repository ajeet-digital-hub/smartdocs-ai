const express = require('express');
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Helper: normalize service row
function normalizeService(row) {
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
    popular: Boolean(row.popular),
    trending: Boolean(row.trending),
    new: Boolean(row.new),
    isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
    isFeatured: Boolean(row.isFeatured),
  };
}

// ─── GET /api/services ───
// Query params: ?category=...&search=...&popular=true&trending=true&new=true&featured=true&categoryId=...
router.get('/', async (req, res) => {
  try {
    const { category, categoryId, search, popular, trending: isTrending, new: isNew, featured, page = 1, limit = 50 } = req.query;

    let sql = 'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.isActive = TRUE';
    const params = [];

    if (category) {
      sql += ' AND s.category = ?';
      params.push(category);
    }

    if (categoryId) {
      sql += ' AND s.categoryId = ?';
      params.push(categoryId);
    }

    if (popular === 'true') {
      sql += ' AND s.popular = TRUE';
    }

    if (isTrending === 'true') {
      sql += ' AND s.trending = TRUE';
    }

    if (isNew === 'true') {
      sql += ' AND s.new = TRUE';
    }

    if (featured === 'true') {
      sql += ' AND s.isFeatured = TRUE';
    }

    if (search) {
      const q = `%${search}%`;
      sql += ' AND (s.name LIKE ? OR s.description LIKE ? OR s.shortDescription LIKE ? OR s.category LIKE ? OR c.name LIKE ? OR s.tags LIKE ?)';
      params.push(q, q, q, q, q, q);
    }

    // Count total
    const countSql = sql.replace('SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient', 'SELECT COUNT(*) AS total');
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    sql += ' ORDER BY s.sortOrder ASC, s.name ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await db.query(sql, params);
    const services = rows.map(normalizeService);

    res.json({ ok: true, services, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error('GET SERVICES ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch services.' });
  }
});

// ─── GET /api/services/categories ───
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT c.*, (SELECT COUNT(*) FROM services s WHERE s.categoryId = c.id AND s.isActive = TRUE) AS count FROM categories c ORDER BY c.sortOrder ASC'
    );
    res.json({ ok: true, categories: rows });
  } catch (err) {
    console.error('GET CATEGORIES ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch categories.' });
  }
});

// ─── GET /api/services/trending ───
router.get('/trending', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.trending = TRUE AND s.isActive = TRUE ORDER BY s.sortOrder ASC LIMIT 20'
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET TRENDING ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch trending services.' });
  }
});

// ─── GET /api/services/popular ───
router.get('/popular', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.popular = TRUE AND s.isActive = TRUE ORDER BY s.sortOrder ASC LIMIT 20'
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET POPULAR ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch popular services.' });
  }
});

// ─── GET /api/services/new ───
router.get('/new', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.new = TRUE AND s.isActive = TRUE ORDER BY s.sortOrder ASC LIMIT 20'
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET NEW ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch new services.' });
  }
});

// ─── GET /api/services/featured ───
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.isFeatured = TRUE AND s.isActive = TRUE ORDER BY s.sortOrder ASC LIMIT 20'
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET FEATURED ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch featured services.' });
  }
});

// ─── GET /api/services/recent ─── (auth required)
router.get('/recent', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient,
              r.lastUsedAt, r.usageCount
       FROM recently_used_services r
       JOIN services s ON r.serviceId = s.id
       LEFT JOIN categories c ON s.categoryId = c.id
       WHERE r.userId = ? AND s.isActive = TRUE
       ORDER BY r.lastUsedAt DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET RECENT ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch recently used services.' });
  }
});

// ─── GET /api/services/favorites ─── (auth required)
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient,
              f.createdAt AS favoritedAt
       FROM user_favorites f
       JOIN services s ON f.serviceId = s.id
       LEFT JOIN categories c ON s.categoryId = c.id
       WHERE f.userId = ? AND s.isActive = TRUE
       ORDER BY f.createdAt DESC`,
      [req.user.id]
    );
    res.json({ ok: true, services: rows.map(normalizeService) });
  } catch (err) {
    console.error('GET FAVORITES ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch favorite services.' });
  }
});

// ─── GET /api/services/search ───
router.get('/search', async (req, res) => {
  try {
    const { q, category, categoryId, popular, trending: isTrending, new: isNew } = req.query;

    if (!q && !category && !categoryId) {
      return res.status(400).json({ ok: false, error: 'Search query or filter required.' });
    }

    let sql = 'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE s.isActive = TRUE';
    const params = [];

    if (q) {
      const query = `%${q}%`;
      sql += ' AND (s.name LIKE ? OR s.description LIKE ? OR s.shortDescription LIKE ? OR s.category LIKE ? OR c.name LIKE ? OR s.tags LIKE ?)';
      params.push(query, query, query, query, query, query);
    }

    if (category) {
      sql += ' AND s.category = ?';
      params.push(category);
    }

    if (categoryId) {
      sql += ' AND s.categoryId = ?';
      params.push(categoryId);
    }

    if (popular === 'true') {
      sql += ' AND s.popular = TRUE';
    }

    if (isTrending === 'true') {
      sql += ' AND s.trending = TRUE';
    }

    if (isNew === 'true') {
      sql += ' AND s.new = TRUE';
    }

    sql += ' ORDER BY s.sortOrder ASC LIMIT 50';

    const [rows] = await db.query(sql, params);
    res.json({ ok: true, services: rows.map(normalizeService), total: rows.length });
  } catch (err) {
    console.error('SEARCH SERVICES ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to search services.' });
  }
});

// ─── GET /api/services/:slug ─── (get service by slug)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query(
      'SELECT s.*, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor, c.gradient AS categoryGradient FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE (s.id = ? OR s.slug = ?) AND s.isActive = TRUE',
      [slug, slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Service not found.' });
    }

    res.json({ ok: true, service: normalizeService(rows[0]) });
  } catch (err) {
    console.error('GET SERVICE BY SLUG ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch service details.' });
  }
});

// ─── POST /api/services/:id/favorite ─── (auth required)
router.post('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if service exists
    const [services] = await db.query('SELECT id FROM services WHERE id = ?', [id]);
    if (services.length === 0) {
      return res.status(404).json({ ok: false, error: 'Service not found.' });
    }

    // Check if already favorited
    const [existing] = await db.query(
      'SELECT id FROM user_favorites WHERE userId = ? AND serviceId = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ ok: false, error: 'Service already in favorites.' });
    }

    await db.query(
      'INSERT INTO user_favorites (userId, serviceId) VALUES (?, ?)',
      [userId, id]
    );

    res.status(201).json({ ok: true, message: 'Added to favorites.' });
  } catch (err) {
    console.error('ADD FAVORITE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to add favorite.' });
  }
});

// ─── DELETE /api/services/:id/favorite ─── (auth required)
router.delete('/:id/favorite', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'DELETE FROM user_favorites WHERE userId = ? AND serviceId = ?',
      [userId, id]
    );

    res.json({ ok: true, message: 'Removed from favorites.' });
  } catch (err) {
    console.error('REMOVE FAVORITE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to remove favorite.' });
  }
});

// ─── POST /api/services/:id/launch ─── (track launch / recently used)
router.post('/:id/launch', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Update usage count on service
    await db.query('UPDATE services SET usageCount = usageCount + 1 WHERE id = ?', [id]);

    // Upsert into recently_used_services
    const [existing] = await db.query(
      'SELECT id, usageCount FROM recently_used_services WHERE userId = ? AND serviceId = ?',
      [userId, id]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE recently_used_services SET lastUsedAt = NOW(), usageCount = usageCount + 1 WHERE id = ?',
        [existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO recently_used_services (userId, serviceId, usageCount) VALUES (?, ?, 1)',
        [userId, id]
      );
    }

    res.json({ ok: true, message: 'Launch tracked.' });
  } catch (err) {
    console.error('LAUNCH TRACK ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to track launch.' });
  }
});

module.exports = router;
