import React, { useRef } from 'react';
import { FaUpload, FaTrashAlt, FaCode } from 'react-icons/fa';

// --- NEW EDITOR IMPORTS ---
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism-tomorrow.css'; // High-end dark theme

const InputArea = ({ code, setCode, stats, onFileLoad }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onFileLoad(e.target.result, file.name);
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ 
      background: 'var(--card-bg)', 
      borderRadius: 'var(--radius)', 
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '500px',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }}>
      {/* Editor Header */}
      <div style={{ 
        padding: '12px 20px', 
        borderBottom: '1px solid var(--border)', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '6px', borderRadius: '6px' }}>
            <FaCode size={14} />
          </div>
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Source Code</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Paste or drop your file</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setCode('')} title="Clear Code">
            <FaTrashAlt /> Clear
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
            <FaUpload /> Upload File
          </button>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden />
      </div>

      {/* Editor Body - Dark Mode style */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', backgroundColor: 'var(--editor-bg)' }}>
        {/* Fake Line Numbers Gutter */}
        <div style={{ 
          width: '40px', 
          borderRight: '1px solid #333', 
          height: '100%', 
          backgroundColor: 'var(--editor-bg)',
          color: '#4B5563',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          paddingTop: '16px',
          textAlign: 'center',
          userSelect: 'none'
        }}>
          1<br/>2<br/>3<br/>4<br/>...
        </div>

        <div style={{ flex: 1, height: '100%', overflowY: 'auto' }} className="custom-scrollbar">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
            padding={20}
            placeholder="// Paste your code here..."
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              minHeight: '100%',
              backgroundColor: 'transparent',
              color: 'var(--editor-fg)',
              lineHeight: '1.6'
            }}
          />
        </div>
      </div>

      {/* Editor Footer / Status Bar */}
      <div style={{ 
        padding: '8px 20px', 
        borderTop: '1px solid var(--border)', 
        background: '#F9FAFB',
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        gap: '24px',
        fontWeight: 500
      }}>
        <span>LN: {stats.lines.toLocaleString()}</span>
        <span>CH: {stats.chars.toLocaleString()}</span>
        <span>TOKENS: ~{stats.tokens.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default InputArea;