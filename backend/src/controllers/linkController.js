const pool = require('../config/db');

const getLinks = async (req, res) => {
  try {
    const [links] = await pool.query(
      'SELECT * FROM links WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(links);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener links' });
  }
};

const createLink = async (req, res) => {
  const { title, url, description } = req.body;
  if (!title || !url) return res.status(400).json({ message: 'Título y URL son requeridos' });
  try {
    const [result] = await pool.query(
      'INSERT INTO links (user_id, title, url, description) VALUES (?, ?, ?, ?)',
      [req.user.id, title, url, description || null]
    );
    const [newLink] = await pool.query('SELECT * FROM links WHERE id = ?', [result.insertId]);
    res.status(201).json(newLink[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear link' });
  }
};

const deleteLink = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM links WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Link no encontrado' });
    res.json({ message: 'Link eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar link' });
  }
};

module.exports = { getLinks, createLink, deleteLink };
