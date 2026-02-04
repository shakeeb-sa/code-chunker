import React, { useState } from 'react';
import { FaCopy, FaCheck, FaDownload, FaFileArchive, FaFileAlt } from 'react-icons/fa';
import JSZip from 'jszip';

const ChunkOutput = ({ chunks, onToast }) => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!chunks || chunks.length === 0) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    onToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadSingle = (text, index) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chunk-part-${index + 1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    chunks.forEach((chunk, i) => {
      zip.file(`chunk_part_${i + 1}.txt`, chunk);
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-chunks.zip';
    a.click();
    URL.revokeObjectURL(url);
    onToast("ZIP Downloaded!", "success");
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
           <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>Generated Chunks</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{chunks.length} parts ready for AI ingestion.</p>
        </div>
        
        {chunks.length > 1 && (
          <button className="btn-primary" onClick={handleDownloadAll} style={{ width: 'auto', backgroundColor: '#10B981', boxShadow: 'none' }}>
            <FaFileArchive /> Download ZIP
          </button>
        )}
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', 
        gap: '24px' 
      }}>
        {chunks.map((chunk, i) => (
          <div key={i} style={{ 
            background: 'white', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)'
          }}>
            {/* Card Header */}
            <div style={{ 
              background: '#F9FAFB', 
              padding: '12px 16px', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaFileAlt color="#9CA3AF" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Part {i + 1}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleCopy(chunk, i)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                >
                  {copiedIndex === i ? <span style={{color: '#10B981', display:'flex', gap:6, alignItems:'center'}}><FaCheck/> Copied</span> : <span style={{display:'flex', gap:6, alignItems:'center'}}><FaCopy/> Copy</span>}
                </button>
                <button 
                  className="btn-icon light-mode-icon" 
                  onClick={() => handleDownloadSingle(chunk, i)}
                >
                  <FaDownload size={12} />
                </button>
              </div>
            </div>

            {/* Card Content (Code) */}
            <div style={{ 
              padding: '16px', 
              maxHeight: '320px', 
              overflowY: 'auto', 
              background: 'var(--editor-bg)', 
              color: 'var(--editor-fg)' 
            }}>
              <pre style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.8rem', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                lineHeight: 1.6
              }}>
                {chunk}
              </pre>
            </div>
            
            <div style={{ padding: '10px 16px', fontSize: '0.75rem', color: '#6B7280', background: 'white', borderTop: '1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
               <span>Text File</span>
               <span>{chunk.length.toLocaleString()} chars</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChunkOutput;