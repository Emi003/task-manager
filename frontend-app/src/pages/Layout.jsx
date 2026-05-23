import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
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
          <div className="nav-section-label">SECCIONES</div>
          <button
            className={`nav-item ${location.pathname === '/tasks' ? 'active' : ''}`}
            onClick={() => navigate('/tasks')}
          >
            <span className="nav-icon">◻</span>
            <span>Tareas</span>
          </button>
          <button
            className={`nav-item ${location.pathname === '/habits' ? 'active' : ''}`}
            onClick={() => navigate('/habits')}
          >
            <span className="nav-icon">◈</span>
            <span>Hábitos</span>
          </button>
        </nav>

        <button className="btn-ghost logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>

        <div className="sidebar-signature">
          <span className="sig-line">crafted by</span>
          <span className="sig-name">Emiliano M.</span>
          <span className="sig-line">© 2025</span>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
