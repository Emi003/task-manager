import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };
  const emailUser = user?.email?.split('@')[0];
  const handleNav = (path) => { navigate(path); setSidebarOpen(false); };

  return (
    <div className="app-layout">
      {/* SVG Synthwave background */}
      <div className="synthwave-bg" aria-hidden="true">
        <svg className="sw-bg-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c8ff8a" stopOpacity="1"/>
              <stop offset="30%" stopColor="#6aab5a" stopOpacity="1"/>
              <stop offset="60%" stopColor="#4a7c3f" stopOpacity="1"/>
              <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="glowHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4a7c3f" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#4a7c3f" stopOpacity="0"/>
            </radialGradient>
            <clipPath id="sunClip">
              <circle cx="720" cy="480" r="140"/>
            </clipPath>
            <linearGradient id="groundFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d0d0d" stopOpacity="1"/>
              <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0"/>
            </linearGradient>
          </defs>

          {/* Halo glow */}
          <ellipse cx="720" cy="480" rx="280" ry="280" fill="url(#glowHalo)"/>

          {/* Sun */}
          <circle cx="720" cy="480" r="140" fill="url(#sunGlow)"/>

          {/* Sun horizontal lines */}
          <g clipPath="url(#sunClip)">
            {[...Array(18)].map((_, i) => (
              <rect key={i} x="580" y={352 + i * 16} width="280" height="8" fill="#0d0d0d" opacity="0.55"/>
            ))}
          </g>

          {/* Mountains */}
          <polygon points="0,620 120,480 220,560 320,430 460,580 560,460 660,590 720,500 780,590 880,460 980,580 1120,430 1220,560 1320,480 1440,620 1440,900 0,900" fill="#0d0d0d"/>

          {/* Grid lines horizontal */}
          {[0,1,2,3,4,5,6,7].map((i) => {
            const y = 650 + i * 35;
            const vanishX = 720;
            const spread = 200 + i * 120;
            return <line key={i} x1={vanishX - spread} y1={y} x2={vanishX + spread} y2={y} stroke="#4a7c3f" strokeOpacity="0.35" strokeWidth="1"/>
          })}

          {/* Grid lines vertical (converging) */}
          {[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6].map((i) => (
            <line key={i} x1={720 + i * 20} y1={640} x2={720 + i * 140} y2={900} stroke="#4a7c3f" strokeOpacity="0.35" strokeWidth="1"/>
          ))}

          {/* Ground fade */}
          <rect x="0" y="610" width="1440" height="80" fill="url(#groundFade)"/>
        </svg>
      </div>

      {/* Mobile topbar */}
      <header className="mobile-topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span /><span /><span />
        </button>
        <div className="mobile-brand">TASKR</div>
        <div className="user-avatar small">{user?.name?.[0]?.toUpperCase()}</div>
      </header>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">TASKR</div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{emailUser}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">SECCIONES</div>
          <button className={`nav-item ${location.pathname === '/tasks' ? 'active' : ''}`} onClick={() => handleNav('/tasks')}>
            <span className="nav-icon">◻</span><span>Tareas</span>
          </button>
          <button className={`nav-item ${location.pathname === '/habits' ? 'active' : ''}`} onClick={() => handleNav('/habits')}>
            <span className="nav-icon">◈</span><span>Hábitos</span>
          </button>
        </nav>
        <button className="btn-ghost logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        <div className="sidebar-signature">
          <span className="sig-line">crafted by</span>
          <span className="sig-name">Emiliano M.</span>
          <span className="sig-line">© 2025</span>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
