import { useEffect, useState } from 'react'; // ADDED
import API from '../utils/api'; // ADDED
import { FaCut, FaMagic, FaSlidersH, FaTimes, FaHistory, FaTrashAlt, FaFolderOpen, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; // ADDED

const Sidebar = ({ settings, setSettings, onSplit, isOpen, onClose, onLoadSession }) => {
  const { logout, user, setUser, token } = useAuth(); // ADDED setUser
  const [sessions, setSessions] = useState([]);

  const handleSavePreset = async () => {
    const name = prompt("Enter a name for this preset (e.g., Bug Fixer):");
    if (!name) return;

    try {
      const { data } = await API.put('/auth/presets', {
        name,
        prefix: settings.customPrefix,
        suffix: settings.customSuffix
      });
      // Update the user context so the UI refreshes
      setUser({ ...user, presets: data });
      localStorage.setItem('user', JSON.stringify({ ...user, presets: data }));
    } catch (err) {
      alert("Failed to save preset");
    }
  };

  const deletePreset = async (id, e) => {
    e.stopPropagation();
    try {
      const { data } = await API.delete(`/auth/presets/${id}`);
      setUser({ ...user, presets: data });
      localStorage.setItem('user', JSON.stringify({ ...user, presets: data }));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // 1. Fetch saved workspaces
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await API.get('/sessions');
        setSessions(data);
      } catch (err) { console.error("Failed to load history"); }
    };
    if (user) fetchSessions();
  }, [user]);

  const deleteSession = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this workspace?")) return;
    try {
      await API.delete(`/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  // --- RESTORED: AI CONTEXT AUTO-FILL ---
  const applyPreset = () => {
    setSettings({
      ...settings,
      useContext: true,
      customPrefix: '// PART {i} OF {total}\n// I am sending you part {i} of a large file. Do not answer yet.',
      customSuffix: '// END OF PART {i}\n// Await the next part.'
    });
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleSplitClick = () => {
    onSplit();
    if (window.innerWidth < 768 && onClose) onClose();
  };

  return (
    <aside 
      className={`sidebar-container ${isOpen ? 'open' : ''}`}
      style={{ 
        width: '320px', 
        background: 'var(--sidebar-bg)', 
        color: 'var(--sidebar-text)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--sidebar-border)',
        flexShrink: 0
      }}
    >
      
      {/* Brand Header */}
      <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
            <div style={{ background: 'var(--accent)', padding: '6px', borderRadius: '6px', display: 'flex' }}>
              <FaCut size={18} color="white" />
            </div>
            CodeChunker
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '4px', marginLeft: '46px' }}>
            Pro AI Context Tool
          </div>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          style={{ 
            display: 'none', // Hidden on desktop via CSS, but we use inline for now
            background: 'transparent',
            color: 'white',
            border: '1px solid #333'
          }}
          className="mobile-close-btn" // We will target this in media query if needed, or just let layout handle it
        >
           <FaTimes />
        </button>
      </div>

      {/* Settings Form */}
      <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
        
        <div className="form-group">
          <label className="form-label"><FaSlidersH style={{ marginRight: 6 }}/> Split Strategy</label>
          <div style={{ display: 'flex', background: '#1F2937', borderRadius: '8px', padding: '4px', border: '1px solid #374151' }}>
            <button 
              style={{ 
                flex: 1, 
                background: settings.mode === 'lines' ? 'var(--accent)' : 'transparent',
                color: settings.mode === 'lines' ? 'white' : '#9CA3AF',
                fontSize: '0.8rem',
                borderRadius: '6px',
                padding: '8px'
              }}
              onClick={() => setSettings({...settings, mode: 'lines'})}
            >
              Fixed Lines
            </button>
            <button 
              style={{ 
                flex: 1, 
                background: settings.mode === 'parts' ? 'var(--accent)' : 'transparent',
                color: settings.mode === 'parts' ? 'white' : '#9CA3AF',
                fontSize: '0.8rem',
                borderRadius: '6px',
                padding: '8px'
              }}
              onClick={() => setSettings({...settings, mode: 'parts'})}
            >
              Equal Parts
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            {settings.mode === 'lines' ? 'Lines per Chunk' : 'Number of Parts'}
          </label>
          <div style={{ position: 'relative' }}>
            <input 
              type="number" 
              value={settings.mode === 'lines' ? settings.lineCount : settings.partCount}
              onChange={(e) => setSettings({
                ...settings, 
                [settings.mode === 'lines' ? 'lineCount' : 'partCount']: e.target.value
              })}
              style={{ paddingRight: '40px', fontSize: '1rem', fontWeight: '500' }}
            />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280', fontSize: '0.8rem' }}>
              {settings.mode === 'lines' ? 'LNs' : 'PTs'}
            </span>
          </div>
        </div>

                <div style={{ height: '1px', background: '#1F2937', margin: '32px 0' }}></div>

        {/* WORKSPACES HISTORY */}
        <div className="form-group">
          <label className="form-label"><FaHistory style={{ marginRight: 6 }}/> Recent Workspaces</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
            {sessions.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#666', padding: '10px', textAlign: 'center' }}>No saved workspaces.</div>
            ) : (
              sessions.map(s => (
                <div 
                  key={s._id} 
                  onClick={() => onLoadSession(s)}
                  style={{ 
                    padding: '10px', background: '#1F2937', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                  className="history-item-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFolderOpen size={12} color="var(--pm-orange)" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{s.name}</span>
                  </div>
                  <button onClick={(e) => deleteSession(s._id, e)} style={{ background: 'none', padding: 4, color: '#666' }}>
                    <FaTrashAlt size={10} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label className="form-label" style={{ marginBottom: 0, color: '#E5E7EB' }}>
              <FaMagic style={{ marginRight: 6, color: '#A78BFA' }}/> AI Context Wrapper
            </label>
            <button 
              onClick={handleSavePreset} 
              title="Save current as preset" 
              style={{ fontSize: '0.7rem', color: '#A78BFA', background: 'rgba(167, 139, 250, 0.1)', padding: '4px 8px' }}
            >
              + Save Preset
            </button>
          </div>

          {/* SAVED PRESETS LIST */}
          {user?.presets?.length > 0 && (
            <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.presets.map(p => (
                <div 
                  key={p._id} 
                  style={{ display: 'flex', alignItems: 'center', background: '#1F2937', borderRadius: '4px', overflow: 'hidden', border: '1px solid #374151' }}
                >
                  <button 
                    onClick={() => setSettings({ ...settings, useContext: true, customPrefix: p.prefix, customSuffix: p.suffix })}
                    style={{ padding: '4px 8px', fontSize: '0.7rem', color: 'white', background: 'transparent' }}
                  >
                    {p.name}
                  </button>
                  <button 
                    onClick={(e) => deletePreset(p._id, e)}
                    style={{ padding: '4px 6px', fontSize: '0.6rem', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', marginBottom: '16px', color: '#D1D5DB' }}>
            <input 
              type="checkbox" 
              checked={settings.useContext}
              onChange={(e) => setSettings({...settings, useContext: e.target.checked})}
              style={{ width: 'auto', accentColor: 'var(--accent)' }}
            />
            <span>Enable Prefix/Suffix</span>
          </label>

          {settings.useContext && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px', borderLeft: '2px solid #374151' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>Header (Prefix)</span>
                <input 
                  type="text" 
                  value={settings.customPrefix}
                  onChange={(e) => setSettings({...settings, customPrefix: e.target.value})}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '4px', display: 'block' }}>Footer (Suffix)</span>
                <input 
                  type="text" 
                  value={settings.customSuffix}
                  onChange={(e) => setSettings({...settings, customSuffix: e.target.value})}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--sidebar-border)', background: '#0F1523', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="btn-primary" onClick={handleSplitClick} style={{ width: '100%' }}>
          SPLIT CODE NOW
        </button>
        <button onClick={logout} style={{ background: 'none', color: '#666', fontSize: '0.75rem', justifyContent: 'center' }}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;