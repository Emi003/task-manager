const pool = require('../config/db');

const calculateStreak = (logs) => {
  if (!logs.length) return 0;
  const dates = logs.map(l => new Date(l.completed_date).toISOString().split('T')[0]).sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i - 1]) - new Date(dates[i])) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

const getHabits = async (req, res) => {
  try {
    const [habits] = await pool.query(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const today = new Date().toISOString().split('T')[0];
    const habitsWithStats = await Promise.all(habits.map(async (habit) => {
      const [logs] = await pool.query(
        'SELECT completed_date FROM habit_logs WHERE habit_id = ? ORDER BY completed_date DESC',
        [habit.id]
      );
      const [todayLog] = await pool.query(
        'SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?',
        [habit.id, today]
      );
      return { ...habit, streak: calculateStreak(logs), completedToday: todayLog.length > 0, totalCompletions: logs.length };
    }));
    res.json(habitsWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener hábitos' });
  }
};

const createHabit = async (req, res) => {
  const { name, description, color, frequency } = req.body;
  if (!name) return res.status(400).json({ message: 'El nombre es requerido' });
  try {
    const [result] = await pool.query(
      'INSERT INTO habits (user_id, name, description, color, frequency) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, description || null, color || '#4a7c3f', frequency || 'daily']
    );
    const [newHabit] = await pool.query('SELECT * FROM habits WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...newHabit[0], streak: 0, completedToday: false, totalCompletions: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear hábito' });
  }
};

const updateHabit = async (req, res) => {
  const { name, description, color, frequency } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM habits WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing.length) return res.status(404).json({ message: 'Hábito no encontrado' });
    await pool.query(
      `UPDATE habits SET name = COALESCE(?, name), description = COALESCE(?, description),
       color = COALESCE(?, color), frequency = COALESCE(?, frequency) WHERE id = ? AND user_id = ?`,
      [name, description, color, frequency, req.params.id, req.user.id]
    );
    const [updated] = await pool.query('SELECT * FROM habits WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar hábito' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM habits WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Hábito no encontrado' });
    res.json({ message: 'Hábito eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar hábito' });
  }
};

const toggleToday = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [existing] = await pool.query('SELECT id FROM habits WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing.length) return res.status(404).json({ message: 'Hábito no encontrado' });
    const [log] = await pool.query('SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?', [req.params.id, today]);
    if (log.length > 0) {
      await pool.query('DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?', [req.params.id, today]);
      res.json({ completedToday: false });
    } else {
      await pool.query('INSERT INTO habit_logs (habit_id, user_id, completed_date) VALUES (?, ?, ?)', [req.params.id, req.user.id, today]);
      res.json({ completedToday: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar hábito' });
  }
};

const getStats = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM habits WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!existing.length) return res.status(404).json({ message: 'Hábito no encontrado' });
    const [logs] = await pool.query(
      `SELECT completed_date FROM habit_logs WHERE habit_id = ? AND completed_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) ORDER BY completed_date ASC`,
      [req.params.id]
    );
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const completed = logs.some(l => new Date(l.completed_date).toISOString().split('T')[0] === d);
      days.push({ date: d, completed });
    }
    res.json(days);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, toggleToday, getStats };
