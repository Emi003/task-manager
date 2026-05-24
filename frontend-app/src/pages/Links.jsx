import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLinks, createLink, deleteLink } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';
import './Links.css';

const emptyForm = { title: '', url: '', description: '' };

export default function Links() {
  const [links, setLinks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchLinks(); }, []);

  const fetchLinks = async () => {
    try {
      const res = await getLinks();
      setLinks(res.data);
    } catch { logout(); navigate('/login'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createLink(form);
      setLinks([res.data, ...links]);
      setForm(emptyForm); setShowForm(false);
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este link?')) return;
    await deleteLink(id);
    setLinks(links.filter(l => l.id !== id));
  };

  // Obtiene el dominio del URL para mostrarlo
  const getDomain = (url) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return url; }
  };

  return (
    <Layout>
      <div className="section-header">
        <div>
          <h1 className="section-title">Links importantes</h1>
          <p className="section-sub">{links.length} link{links.length !== 1 ? 's' : ''} guardados</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Agregar link
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2 className="modal-title">Nuevo link</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="field"><label>Nombre *</label>
                <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Ej: Documentación React" required />
              </div>
              <div className="field"><label>URL *</label>
                <input type="url" value={form.url} onChange={(e) => setForm({...form, url: e.target.value})} placeholder="https://..." required />
              </div>
              <div className="field"><label>Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="¿Para qué sirve este link?" rows={2} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="empty-state">Cargando...</div>
        : links.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <p>No tienes links guardados aún</p>
          </div>
        ) : (
          <div className="links-grid">
            {links.map(link => (
              <div key={link.id} className="link-card">
                <div className="link-top">
                  <div className="link-domain">{getDomain(link.url)}</div>
                  <button className="btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleDelete(link.id)}>✕</button>
                </div>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-title">
                  {link.title} ↗
                </a>
                {link.description && <p className="link-desc">{link.description}</p>}
                <div className="link-url">{link.url.length > 45 ? link.url.slice(0, 45) + '...' : link.url}</div>
              </div>
            ))}
          </div>
        )}
    </Layout>
  );
}
