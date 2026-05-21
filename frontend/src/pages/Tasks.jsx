import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Tasks.css';

const STATUSES = { pending: 'Pendiente', in_progress: 'En progreso', done: 'Listo' };
const PRIORITIES = { low: 'Baja', medium: 'Media', high: 'Alta' };
const PRIORITY_COLOR = { low: '#4a9eff', medium: '#f39c12', high: '#ff4757' };

const emptyForm = { title: '', description: '', priority: 'medium', due_date: '', status: 'pending' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch { logout(); navigate('/login'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status,
    });
    setEditingId(task.id);
    setShowForm(true);
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
    <div className="tasks-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">TASKR</div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {['all', 'pending', 'in_progress', 'done'].map(s => (
            <button key={s} className={`nav-item ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
              <span className="nav-label">{s === 'all' ? 'Todas' : STATUSES[s]}</span>
              <span className="nav-count">{counts[s]}</span>
            </button>
          ))}
        </nav>

        <button className="btn-ghost logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          Cerrar sesión
        </button>

        <div className="sidebar-signature">
          <span className="sig-line">crafted by</span>
          <span className="sig-name">Emiliano M.</span>
          <span className="sig-line">© 2025</span>
        </div>
      </aside>

      {/* Main */}
      <main className="tasks-main">
        <div className="tasks-header">
          <div>
            <h1 className="tasks-title">{filter === 'all' ? 'Todas las tareas' : STATUSES[filter]}</h1>
            <p className="tasks-count">{filtered.length} tarea{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            + Nueva tarea
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal">
              <h2 className="modal-title">{editingId ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <form onSubmit={handleSubmit} className="task-form">
                <div className="field">
                  <label>Título *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="¿Qué hay que hacer?" required />
                </div>
                <div className="field">
                  <label>Descripción</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="Detalles opcionales..." rows={3} />
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>Prioridad</label>
                    <select name="priority" value={form.priority} onChange={handleChange}>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Estado</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="done">Listo</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Fecha límite</label>
                  <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary">{editingId ? 'Guardar cambios' : 'Crear tarea'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task list */}
        {loading ? (
          <div className="empty-state">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <p>No hay tareas aquí</p>
          </div>
        ) : (
          <div className="task-list">
            {filtered.map(task => (
              <div key={task.id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
                <div className="task-left">
                  <button className="status-dot" style={{ '--dot-color': task.status === 'done' ? 'var(--done)' : task.status === 'in_progress' ? 'var(--progress)' : 'var(--border)' }} onClick={() => handleStatusToggle(task)} title="Cambiar estado" />
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                    <div className="task-meta">
                      <span className="priority-badge" style={{ color: PRIORITY_COLOR[task.priority] }}>
                        ● {PRIORITIES[task.priority]}
                      </span>
                      <span className="status-badge">{STATUSES[task.status]}</span>
                      {task.due_date && (
                        <span className="due-date">
                          📅 {new Date(task.due_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleEdit(task)}>Editar</button>
                  <button className="btn-danger" onClick={() => handleDelete(task.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
