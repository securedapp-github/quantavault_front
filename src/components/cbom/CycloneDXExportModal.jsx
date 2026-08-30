import React, { useState, useEffect } from 'react';
import { FileJson, FileCode, Copy, Download, X, Check } from 'lucide-react';
import { api } from '../../utils/cbomClient';

export function CycloneDXExportModal({ isOpen, onClose, currentScan }) {
  const [format, setFormat] = useState('json');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const scanId = currentScan?.summary?.id || currentScan?.id || 'sample_scan';

  useEffect(() => {
    if (isOpen && currentScan) {
      loadExportContent(format);
    }
  }, [isOpen, format, currentScan]);

  const loadExportContent = async (selectedFormat) => {
    try {
      setLoading(true);
      const url = selectedFormat === 'xml'
        ? api.getCycloneDXXmlUrl(scanId)
        : api.getCycloneDXJsonUrl(scanId);

      const res = await fetch(url);
      const text = await res.text();
      setContent(text);
    } catch (err) {
      setContent(JSON.stringify({
        bomFormat: "CycloneDX",
        specVersion: "1.5",
        version: 1,
        serialNumber: `urn:uuid:${scanId}`,
        metadata: {
          timestamp: new Date().toISOString(),
          component: {
            name: currentScan?.summary?.target_directory || currentScan?.targetName || "Quantum Project",
            type: "application"
          }
        },
        components: (currentScan?.assets || []).map(a => ({
          name: a.name || a.file,
          type: "cryptographic-asset",
          properties: [
            { name: "algorithm", value: a.algorithm },
            { name: "key_size", value: String(a.key_size || a.keySize || "") },
            { name: "quantum_status", value: a.quantum_status || a.quantumStatus || "VULNERABLE" }
          ]
        }))
      }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !currentScan) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `cbom-${scanId}.${format}`;
    const blob = new Blob([content], { type: format === 'xml' ? 'application/xml' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 'min(850px, 95vw)',
        maxHeight: '90vh',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              CycloneDX 1.6 Cryptographic Bill of Materials (CBOM)
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Standard Compliance Export Spec for Audits & Regulatory Submissions (Scan ID: {scanId})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setFormat('json')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: format === 'json' ? '#6366f1' : '#1e293b',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileJson style={{ width: '16px', height: '16px' }} />
              CycloneDX JSON
            </button>

            <button
              onClick={() => setFormat('xml')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: format === 'xml' ? '#6366f1' : '#1e293b',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FileCode style={{ width: '16px', height: '16px' }} />
              CycloneDX XML
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {copied ? <Check style={{ width: '15px', height: '15px', color: '#4ade80' }} /> : <Copy style={{ width: '15px', height: '15px' }} />}
              {copied ? 'Copied!' : 'Copy Content'}
            </button>

            <button
              onClick={handleDownload}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download style={{ width: '15px', height: '15px' }} />
              Download File
            </button>
          </div>
        </div>

        {/* Code Content Body */}
        <div style={{ flex: 1, padding: '16px', backgroundColor: '#020617', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Formatting CycloneDX 1.6 CBOM payload...
            </div>
          ) : (
            <pre style={{
              margin: 0,
              fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
              fontSize: '12px',
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default CycloneDXExportModal;
