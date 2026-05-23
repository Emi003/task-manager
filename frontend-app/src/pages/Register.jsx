import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await register(form);
      saveAuth(res.data.token, res.data.user);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">TASKR</div>
        <h1 className="auth-title">Crear cuenta</h1>
        <p className="auth-sub">Organiza tus tareas y hábitos</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Nombre</label>
            <input name="name" type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Tu nombre" required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="tu@email.com" required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Mínimo 6 caracteres" minLength={6} required />
          </div>
          <button className="btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
          </button>
        </form>
        <p className="auth-footer">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
