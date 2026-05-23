import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHabits, createHabit, updateHabit, deleteHabit, toggleHabit, getHabitStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Layout from './Layout';
import './Habits.css';

const COLORS = ['#4a7c3f','#6aab5a','#3d6e8a','#c47c2b','#8a3d6e','#6e3d3d','#3d5a8a'];
const emptyForm = { name: '', description: '', color: '#4a7c3f', frequency: 'daily' };

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try {
      const res = await getHabits();
      setHabits(res.data);
    } catch { logout(); navigate('/login'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await updateHabit(editingId, form);
        setHabits(habits.map(h => h.id === editingId ? { ...h, ...res.data } : h));
      } else {
        const res = await createHabit(form);
        setHabits([res.data, ...habits]);
      }
      setForm(emptyForm); setEditingId(null); setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleToggle = async (habit) => {
    try {
      const res = await toggleHabit(habit.id);
      setHabits(habits.map(h => {
        if (h.id !== habit.id) return h;
        const completedToday = res.data.completedToday;
        const streak = completedToday ? h.streak + 1 : Math.max(0, h.streak - 1);
        return { ...h, completedToday, streak };
      }));
    } catch { alert('Error al registrar hábito'); }
  };

  const handleEdit = (habit) => {
    setForm({ name: habit.name, description: habit.description || '', color: habit.color, frequency: habit.frequency });
    setEditingId(habit.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este hábito?')) return;
    await deleteHabit(id);
    setHabits(habits.filter(h => h.id !== id));
    if (selectedHabit?.id === id) setSelectedHabit(null);
  };

  const handleSelectHabit = async (habit) => {
    setSelectedHabit(habit);
    const res = await getHabitStats(habit.id);
    setStats(res.data.map(d => ({
      day: new Date(d.date).toLocaleDateString('es-MX', { weekday: 'short' }),
      completado: d.completed ? 1 : 0,
    })));
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1 className="section-title">Hábitos</h1>
          <p className="section-sub">
            {completedToday}/{totalHabits} completados hoy
            {totalHabits > 0 && <span className="progress-inline"> · {Math.round((completedToday / totalHabits) * 100)}%</span>}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
          + Nuevo hábito
        </button>
      </div>

      {/* Barra de progreso */}
      {totalHabits > 0 && (
        <div className="progress-bar-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(completedToday / totalHabits) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Stats panel */}
      {selectedHabit && (
        <div className="stats-panel">
          <div className="stats-header">
            <div className="stats-dot" style={{ background: selectedHabit.color }} />
            <h2 className="stats-title">{selectedHabit.name} — últimos 7 días</h2>
            <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setSelectedHabit(null)}>✕</button>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={stats} barSize={28}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [v ? 'Completado ✓' : 'No completado', '']}
              />
              <Bar dataKey="completado" radius={[6, 6, 0, 0]}>
                {stats.map((entry, i) => (
                  <Cell key={i} fill={entry.completado ? selectedHabit.color : '#2a2a2a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">{editingId ? 'Editar hábito' : 'Nuevo hábito'}</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="field"><label>Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Ej: Leer 30 minutos" required />
              </div>
              <div className="field"><label>Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Opcional..." rows={2} />
              </div>
              <div className="form-row">
                <div className="field"><label>Frecuencia</label>
                  <select value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})}>
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
                <div className="field"><label>Color</label>
                  <div className="color-picker">
                    {COLORS.map(c => (
                      <button key={c} type="button" className={`color-dot ${form.color === c ? 'selected' : ''}`}
                        style={{ background: c }} onClick={() => setForm({...form, color: c})} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear hábito'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? <div className="empty-state">Cargando...</div>
        : habits.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">○</div><p>No tienes hábitos aún</p></div>
        ) : (
          <div className="item-list">
            {habits.map(habit => (
              <div key={habit.id} className={`item-card ${habit.completedToday ? 'completed' : ''}`}>
                <button className="habit-check" style={{ '--hcolor': habit.color }} onClick={() => handleToggle(habit)}>
                  {habit.completedToday ? '✓' : ''}
                </button>
                <div className="item-body" onClick={() => handleSelectHabit(habit)} style={{ cursor: 'pointer' }}>
                  <div className="item-title">{habit.name}</div>
                  {habit.description && <div className="item-desc">{habit.description}</div>}
                  <div className="item-meta">
                    <span style={{ fontSize: 12, fontWeight: 500, color: habit.color }}>🔥 {habit.streak} día{habit.streak !== 1 ? 's' : ''} de racha</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{habit.totalCompletions} completados en total</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>{habit.frequency === 'daily' ? 'Diario' : 'Semanal'}</span>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(habit)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleDelete(habit.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </Layout>
  );
}
