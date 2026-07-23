const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Optional: verify admin (checks if user has admin role)
// For now, we'll use a simple check — you can enhance this with a role column
function verifyAdmin(req, res, next) {
  // First verify the token
  verifyToken(req, res, (err) => {
    if (err) return;
    // For now, all authenticated users can access admin features
    // In production, check req.user.role === 'admin'
    next();
  });
}

module.exports = { generateToken, verifyToken, verifyAdmin };
