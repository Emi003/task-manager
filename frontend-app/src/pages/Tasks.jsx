import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import './Tasks.css';

const STATUSES = { pending: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };
const PRIORITIES = { low: 'Baja', medium: 'Media', high: 'Alta' };
const PRIORITY_COLOR = { low: '#4a9eff', medium: '#f39c12', high: '#ff4757' };
const emptyForm = { title: '', description: '', priority: 'medium', due_date: '', status: 'pending', link: '' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch { logout(); navigate('/login'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await updateTask(editingId, form);
        setTasks(tasks.map(t => t.id === editingId ? res.data : t));
      } else {
        const res = await createTask(form);
        setTasks([res.data, ...tasks]);
      }
      setForm(emptyForm); setEditingId(null); setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status,
      link: task.link || ''
    });
    setEditingId(task.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    await deleteTask(id);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusToggle = async (task) => {
    const next = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'pending';
    const res = await updateTask(task.id, { status: next });
    setTasks(tasks.map(t => t.id === task.id ? res.data : t));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1 className="section-title">Tareas</h1>
          <p className="section-sub">{filtered.length} tarea{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
          + Nueva tarea
        </button>
      </div>

      <div className="filter-bar">
        {['all', 'pending', 'in_progress', 'done'].map(s => (
          <button key={s} className={`filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'Todas' : STATUSES[s]}
            <span className="filter-count">{counts[s]}</span>
          </button>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">{editingId ? 'Editar tarea' : 'Nueva tarea'}</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="field"><label>Título *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="¿Qué hay que hacer?" required />
              </div>
              <div className="field"><label>Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Detalles opcionales..." rows={2} />
              </div>
              <div className="field"><label>Link de referencia</label>
                <input type="url" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} placeholder="https://... (opcional)" />
              </div>
              <div className="form-row">
                <div className="field"><label>Prioridad</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <div className="field"><label>Estado</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                    <option value="pending">Pendiente</option>
                    <option value="in_progress">En progreso</option>
                    <option value="done">Listo</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Fecha límite</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({...form, due_date: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear tarea'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="empty-state">Cargando...</div>
        : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">○</div><p>No hay tareas aquí</p></div>
        ) : (
          <div className="item-list">
            {filtered.map(task => (
              <div key={task.id} className={`item-card ${task.status === 'done' ? 'done' : ''}`}>
                <div className="item-left">
                  <button className="status-dot" style={{ '--dot-color': task.status === 'done' ? 'var(--done)' : task.status === 'in_progress' ? 'var(--progress)' : 'var(--border)' }}
                    onClick={() => handleStatusToggle(task)} />
                  <div className="item-body">
                    <div className="item-title">{task.title}</div>
                    {task.description && <div className="item-desc">{task.description}</div>}
                    <div className="item-meta">
                      <span style={{ fontSize: 11, color: PRIORITY_COLOR[task.priority] }}>● {PRIORITIES[task.priority]}</span>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{STATUSES[task.status]}</span>
                      {task.due_date && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(task.due_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>}
                      {task.link && <a href={task.link} target="_blank" rel="noopener noreferrer" className="link-pill">ver referencia ↗</a>}
                    </div>
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(task)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleDelete(task.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </Layout>
  );
}
