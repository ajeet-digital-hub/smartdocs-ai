const express = require('express');
const db = require('../db');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require auth
router.use(verifyAdmin);

// ─── GET /api/admin/services ───
router.get('/services', async (req, res) => {
  try {
    const { page = 1, limit = 50, status, category } = req.query;
    let sql = 'SELECT s.*, c.name AS categoryName FROM services s LEFT JOIN categories c ON s.categoryId = c.id WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND s.categoryId = ?';
      params.push(category);
    }

    const countSql = sql.replace('SELECT s.*, c.name AS categoryName', 'SELECT COUNT(*) AS total');
    const [countRows] = await db.query(countSql, params);
    const total = countRows[0].total;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    sql += ' ORDER BY s.sortOrder ASC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await db.query(sql, params);
    const services = rows.map((row) => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags || [],
      popular: Boolean(row.popular),
      trending: Boolean(row.trending),
      new: Boolean(row.new),
      isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
      isFeatured: Boolean(row.isFeatured),
    }));

    res.json({ ok: true, services, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('ADMIN GET SERVICES ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to fetch services.' });
  }
});

// ─── POST /api/admin/services ───
router.post('/services', async (req, res) => {
  try {
    const {
      id, name, slug, shortDescription, fullDescription, description,
      categoryId, category, icon, image, route, status,
      isActive, isFeatured, isTrending, isPopular, isNew,
      tags, sortOrder
    } = req.body;

    if (!name) {
      return res.status(400).json({ ok: false, error: 'Service name is required.' });
    }

    const serviceId = id || slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const serviceSlug = slug || serviceId;
    const serviceRoute = route || `/dashboard/tools/${serviceSlug}`;

    await db.query(
      `INSERT INTO services (id, name, slug, shortDescription, fullDescription, description, categoryId, category, icon, image, route, status, isActive, isFeatured, trending, popular, new, tags, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), slug=VALUES(slug), shortDescription=VALUES(shortDescription),
         fullDescription=VALUES(fullDescription), description=VALUES(description),
         categoryId=VALUES(categoryId), category=VALUES(category), icon=VALUES(icon),
         image=VALUES(image), route=VALUES(route), status=VALUES(status),
         isActive=VALUES(isActive), isFeatured=VALUES(isFeatured),
         trending=VALUES(trending), popular=VALUES(popular),
         new=VALUES(new), tags=VALUES(tags), sortOrder=VALUES(sortOrder)`,
      [
        serviceId, name, serviceSlug, shortDescription || description?.substring(0, 200),
        fullDescription || description, description || shortDescription,
        categoryId || null, category, icon || '🔧', image || null,
        serviceRoute, status || 'active',
        isActive !== undefined ? isActive : true, isFeatured || false,
        isTrending || false, isPopular || false, isNew || false,
        JSON.stringify(tags || []), sortOrder || 0
      ]
    );

    res.status(201).json({ ok: true, message: 'Service saved successfully.', id: serviceId });
  } catch (err) {
    console.error('ADMIN CREATE SERVICE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to save service.' });
  }
});

// ─── PUT /api/admin/services/:id ───
router.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [existing] = await db.query('SELECT id FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Service not found.' });
    }

    const fields = [];
    const values = [];

    const allowedFields = [
      'name', 'slug', 'shortDescription', 'fullDescription', 'description',
      'categoryId', 'category', 'icon', 'image', 'route', 'status',
      'isActive', 'isFeatured', 'trending', 'popular', 'new', 'sortOrder'
    ];

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }

    if (updates.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(updates.tags));
    }

    if (fields.length === 0) {
      return res.status(400).json({ ok: false, error: 'No fields to update.' });
    }

    values.push(id);
    await db.query(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`, values);

    res.json({ ok: true, message: 'Service updated successfully.' });
  } catch (err) {
    console.error('ADMIN UPDATE SERVICE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to update service.' });
  }
});

// ─── DELETE /api/admin/services/:id ───
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM services WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ ok: false, error: 'Service not found.' });
    }

    // Clean up related records
    await db.query('DELETE FROM user_favorites WHERE serviceId = ?', [id]);
    await db.query('DELETE FROM recently_used_services WHERE serviceId = ?', [id]);
    await db.query('DELETE FROM services WHERE id = ?', [id]);

    res.json({ ok: true, message: 'Service deleted successfully.' });
  } catch (err) {
    console.error('ADMIN DELETE SERVICE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Unable to delete service.' });
  }
});

module.exports = router;
