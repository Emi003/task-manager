import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import './Profile.css';

const api = async (method, path, data) => {
  const token = localStorage.getItem('token');
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const res = await fetch(`${baseURL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.json();
};

export default function Profile() {
  const { user, saveAuth, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [joinDate, setJoinDate] = useState('');

  useEffect(() => {
    api('GET', '/profile').then(data => {
      if (data.created_at) {
        setJoinDate(new Date(data.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }));
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      return setError('Las contraseñas nuevas no coinciden');
    }

    setLoading(true);
    try {
      const res = await api('PUT', '/profile', {
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.message === 'Perfil actualizado') {
        saveAuth(localStorage.getItem('token'), res.user);
        setSuccess('Perfil actualizado correctamente');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setError(res.message || 'Error al actualizar');
      }
    } catch {
      setError('Error del servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Volver</button>
        <h1 className="section-title">Mi perfil</h1>
      </div>

      <div className="profile-layout">
        {/* Card de info */}
        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-email">{user?.email}</div>
          {joinDate && <div className="profile-since">Miembro desde {joinDate}</div>}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="profile-form">
          {success && <div className="profile-success">{success}</div>}
          {error && <div className="profile-error">{error}</div>}

          <div className="form-section">
            <h2 className="form-section-title">Información general</h2>
            <div className="field">
              <label>Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Cambiar contraseña</h2>
            <p className="form-section-sub">Deja en blanco si no quieres cambiarla</p>
            <div className="field">
              <label>Contraseña actual</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="field">
              <label>Nueva contraseña</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="field">
              <label>Confirmar nueva contraseña</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" />
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="btn-danger-full" onClick={() => { logout(); navigate('/login'); }}>
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
