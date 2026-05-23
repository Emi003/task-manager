import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await login(form);
      saveAuth(res.data.token, res.data.user);
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">TASKR</div>
        <h1 className="auth-title">Bienvenido de vuelta</h1>
        <p className="auth-sub">Tareas y hábitos en un solo lugar</p>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="tu@email.com" required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input name="password" type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button className="btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión →'}
          </button>
        </form>
        <p className="auth-footer">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </div>
    </div>
  );
}
