import React, { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const handleSplit = () => {
    if (!code.trim()) {
      showToast("Please input some code first!");
      return;
    }
    const result = splitText(code, settings);
    setChunks(result);
    showToast(`Successfully split into ${result.length} chunks`);
    setIsSidebarOpen(false); 
  };

  // --- NEW: SAVE WORKSPACE ---
  const handleSaveWorkspace = async () => {
    if (!code.trim()) return showToast("Nothing to save!");
    const name = prompt("Enter a name for this workspace:", "Project " + new Date().toLocaleDateString());
    if (!name) return;

    try {
      await API.post('/sessions', {
        name,
        rawCode: code,
        settings,
        stats
      });
      showToast("Workspace saved to cloud!");
    } catch (err) {
      showToast("Failed to save workspace");
    }
  };

  // --- NEW: LOAD WORKSPACE ---
  const handleLoadSession = (session) => {
    setCode(session.rawCode);
    setSettings(session.settings);
    setChunks([]); // Clear output to encourage fresh split
    showToast(`Loaded: ${session.name}`);
  };

  // Prevent redirecting while checking if user is already logged in
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
  onLoadSession={handleLoadSession} // ADDED
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
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
    </Router>
  );
}

export default App;