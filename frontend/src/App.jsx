import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import ChunkOutput from './components/ChunkOutput';
import Toast from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register'; // ADDED THIS IMPORT
import { getStats, splitText } from './utils/chunker';
import { useAuth } from './context/AuthContext';
import API from './utils/api'; // ADDED
import { FaBars, FaCut, FaHistory } from 'react-icons/fa'; // ADDED FaHistory

function App() {
  const { token, user, loading } = useAuth();
  const [code, setCode] = useState('');
  const [chunks, setChunks] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // RESTORED
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  
  // Palette States
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState([]); 

  const [settings, setSettings] = useState({
    mode: 'lines', 
    lineCount: 1500,
    partCount: 5,
    useContext: false,
    customPrefix: '// Part {i} of {total}',
    customSuffix: ''
  });

  const stats = getStats(code);
  const showToast = (msg) => setToastMsg(msg);

  // Keyboard Shortcuts & Initial Data Fetch
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsPaletteOpen(false);
    };

    const fetchSessions = async () => {
      try {
        const { data } = await API.get('/sessions');
        setSessions(data);
      } catch (err) { console.error(err); }
    };

    if (token) fetchSessions();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [token]);

  const handleSplit = () => {
    if (!code.trim()) {
      showToast("Please input some code first!");
      return;
    }
    
    setIsProcessing(true); // START ANIMATION

    // Brief timeout to let the user "see" the app working
    setTimeout(() => {
      const result = splitText(code, settings);
      setChunks(result);
      setIsProcessing(false); // END ANIMATION
      showToast(`Successfully split into ${result.length} chunks`);
      setIsSidebarOpen(false); 
    }, 600);
  };

  const handleSaveWorkspace = () => {
    if (!code.trim()) return showToast("Nothing to save!");
    setWorkspaceName(`Project ${new Date().toLocaleDateString()}`);
    setIsSaveModalOpen(true);
  };

  const confirmSave = async () => {
    try {
      const { data } = await API.post('/sessions', {
        name: workspaceName,
        rawCode: code,
        settings,
        stats
      });
      setSessions([data, ...sessions]); // Instantly update sidebar/palette
      showToast("Workspace saved to cloud!");
      setIsSaveModalOpen(false);
    } catch (err) {
      showToast("Failed to save workspace");
    }
  };

  const handleLoadSession = (session) => {
    setCode(session.rawCode);
    setSettings(session.settings);
    setChunks([]); 
    showToast(`Loaded: ${session.name}`);
  };

  if (loading) {
    return <div style={{ height: '100vh', background: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading Workspace...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main Dashboard Route */}
        <Route path="/" element={
          token ? (
            <div className="app-layout">
              {/* 1. Mobile Header */}
              <div className="mobile-header">
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                    <FaCut color="var(--accent)" /> CodeChunker
                 </div>
                 <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: '1px solid #333', color: 'white', padding: '8px' }}>
                   <FaBars />
                 </button>
              </div>

              {/* 2. Sidebar */}
              <Sidebar 
                settings={settings} 
                setSettings={setSettings} 
                onSplit={handleSplit} 
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLoadSession={handleLoadSession}
                sessions={sessions}
                setSessions={setSessions}
              />

              {/* 3. Mobile Overlay */}
              <div className={`overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>

                            {/* 4. Main Content */}
              <div className="main-scroll-area">
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username || 'User'}</p>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={handleSaveWorkspace}
                    style={{ borderColor: 'var(--pm-orange)', color: 'var(--pm-orange)', fontWeight: '600' }}
                  >
                    <FaHistory /> Save Workspace
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <InputArea 
                    code={code} 
                    setCode={setCode} 
                    stats={stats} 
                    onFileLoad={(c, n) => { setCode(c); showToast(`Loaded ${n}`); }}
                  />
                  <ChunkOutput chunks={chunks} onToast={showToast} />
                </div>

                <footer style={{ marginTop: 'auto', paddingTop: '40px', paddingBottom: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#999' }}>
                  CodeChunker Pro v2.0 • Cloud Sync Enabled
                </footer>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {/* SAVE WORKSPACE MODAL */}
      {isSaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Save Workspace</h3>
            <p>Store this codebase and settings in your cloud library.</p>
            <div className="form-group">
               <label className="form-label">Project Name</label>
               <input 
                 type="text" 
                 autoFocus
                 value={workspaceName}
                 onChange={(e) => setWorkspaceName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                 style={{ background: '#2B2F3B', color: 'white', padding: '10px' }}
               />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsSaveModalOpen(false)} style={{ fontSize: '0.8rem' }}>Cancel</button>
              <button className="btn-primary" onClick={confirmSave} style={{ width: 'auto' }}>Confirm Save</button>
            </div>
          </div>

                  </div>
      )}

      {/* GLOBAL COMMAND PALETTE */}
      {isPaletteOpen && (
        <div className="palette-overlay" onClick={() => setIsPaletteOpen(false)}>
          <div className="palette-content" onClick={e => e.stopPropagation()}>
            <div className="palette-input-wrapper">
              <FaCut color="var(--pm-orange)" />
              <input 
                className="palette-input" 
                placeholder="Search workspaces..." 
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="palette-results custom-scrollbar">
              {sessions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                <div key={s._id} className="palette-item" onClick={() => { handleLoadSession(s); setIsPaletteOpen(false); }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaHistory size={12} />
                    <span>{s.name}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{s.stats.lines} lines</span>
                </div>
              ))}
              {sessions.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No workspaces found</div>}
            </div>

            <div className="palette-hint">
               <span><b>Enter</b> to open</span>
               <span><b>Esc</b> to close</span>
               <span><b>CTRL K</b> to toggle</span>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </Router>
  );
}

export default App;