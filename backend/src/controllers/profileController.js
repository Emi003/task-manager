const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];

    // Si quiere cambiar contraseña
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Ingresa tu contraseña actual' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(401).json({ message: 'Contraseña actual incorrecta' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres' });

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET name = ?, password = ? WHERE id = ?', [name, hashed, req.user.id]);
    } else {
      await pool.query('UPDATE users SET name = ? WHERE id = ?', [name, req.user.id]);
    }

    const [updated] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Perfil actualizado', user: updated[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = { getProfile, updateProfile };
