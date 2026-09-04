import React, { useState, useRef } from 'react';
import { Folder, RefreshCw, X, ArrowRight, ShieldCheck, Globe, UploadCloud, CheckCircle2, AlertCircle, FileCode, Server, ShieldAlert } from 'lucide-react';
import { validateUploadFiles, sanitizeRelativePath } from '../../utils/cbomSecurityValidator';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function IngestionModal({ isOpen, onClose, onStartScan, scanning }) {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [tlsTargets, setTlsTargets] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [useServerPath, setUseServerPath] = useState(false);
  const [serverPath, setServerPath] = useState('sample_target');
  const [localError, setLocalError] = useState(null);
  const [securityStats, setSecurityStats] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const processFiles = (rawFileList) => {
    setLocalError(null);
    setSecurityStats(null);

    const validation = validateUploadFiles(rawFileList);

    if (validation.error) {
      setLocalError(validation.error);
      setSelectedFolder(null);
      return;
    }

    const { validFiles, skippedFiles, blockedFiles, totalBytes } = validation;

    let folderName = 'Uploaded Project';
    if (validFiles[0]?.webkitRelativePath) {
      folderName = validFiles[0].webkitRelativePath.split('/')[0] || 'Uploaded Project';
    }

    setSelectedFolder({
      name: folderName,
      files: validFiles,
      count: validFiles.length,
      skippedCount: skippedFiles.length,
      blockedCount: blockedFiles.length,
      sizeStr: formatBytes(totalBytes),
    });

    setSecurityStats({
      totalScanned: rawFileList.length,
      valid: validFiles.length,
      skipped: skippedFiles.length,
      blocked: blockedFiles.length,
      blockedList: blockedFiles.slice(0, 3)
    });

    if (!targetName) {
      setTargetName(folderName);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const tlsList = tlsTargets.split(',').map(t => t.trim()).filter(Boolean);

    try {
      if (useServerPath) {
        if (!serverPath.trim()) return;
        await onStartScan({
          targetType: 'REPO',
          targetLocation: sanitizeRelativePath(serverPath.trim()),
          targetName: targetName.trim() || serverPath.trim(),
          tlsTargets: tlsList
        });
      } else {
        if (!selectedFolder || selectedFolder.files.length === 0) {
          setLocalError('Please select a project folder to scan.');
          return;
        }
        await onStartScan({
          files: selectedFolder.files,
          targetType: 'REPO',
          targetLocation: selectedFolder.name,
          targetName: targetName.trim() || selectedFolder.name,
          tlsTargets: tlsList
        });
      }
      onClose();
    } catch (err) {
      setLocalError(err.message || 'Scan failed');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 'min(660px, 95vw)',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
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
            <h2 style={{ fontSize: '19px', fontWeight: '700', margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Folder style={{ color: '#38bdf8', width: '22px', height: '22px' }} />
              Scan Project Codebase
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Protected Ingestion: Whitelisted source code & configs only (Max 100 MB / 5,000 files)
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
          }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {localError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="file"
              ref={fileInputRef}
              webkitdirectory="true"
              directory="true"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />

            {!useServerPath ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  <Folder style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                  Select Project Folder <span style={{ color: '#ef4444' }}>*</span>
                </label>

                {!selectedFolder ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${isDragging ? '#38bdf8' : 'rgba(255, 255, 255, 0.2)'}`,
                      backgroundColor: isDragging ? 'rgba(56, 189, 248, 0.08)' : '#1e293b',
                      borderRadius: '12px',
                      padding: '32px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(56, 189, 248, 0.12)',
                      color: '#38bdf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto',
                    }}>
                      <UploadCloud size={24} />
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginBottom: '4px' }}>
                      Click to Browse or Drag & Drop Project Folder
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Protected in-memory analysis of source code, certs, and config files
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                      🛡️ Executables (<code>.exe</code>, <code>.dll</code>, <code>.so</code>) and dependency builds are automatically filtered out
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                          color: '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <FileCode size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {selectedFolder.name}
                            <span style={{ fontSize: '11px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '2px 8px', borderRadius: '50px', fontWeight: '600' }}>
                              Pre-Check Verified
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            <strong>{selectedFolder.count}</strong> valid source files ({selectedFolder.sizeStr})
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Change Folder
                      </button>
                    </div>

                    {/* Pre-Check Security Shield Breakdown */}
                    {securityStats && (
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ {securityStats.valid} Source Files Accepted</span>
                        {securityStats.skipped > 0 && <span>• {securityStats.skipped} build/non-code files excluded</span>}
                        {securityStats.blocked > 0 && (
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>
                            • 🚫 {securityStats.blocked} executable/binary files blocked
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  <Server style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                  Server Testbed Directory Path <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={serverPath}
                  onChange={(e) => setServerPath(e.target.value)}
                  placeholder="e.g. sample_target"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Target Display Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                <ShieldCheck style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                Target Project Name (Optional)
              </label>
              <input
                type="text"
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Payment Gateway Microservice"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Optional TLS Targets */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                <Globe style={{ width: '15px', height: '15px', color: '#38bdf8' }} />
                Live TLS / Network Endpoints (Optional)
              </label>
              <input
                type="text"
                value={tlsTargets}
                onChange={(e) => setTlsTargets(e.target.value)}
                placeholder="e.g. api.domain.com:443, db.internal:8443"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Toggle Server Path Mode */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setUseServerPath(!useServerPath)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {useServerPath ? '← Back to Browser Folder Selection' : '⚙️ Or scan server testbed path (e.g. sample_target)'}
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={scanning || (!useServerPath && !selectedFolder) || (useServerPath && !serverPath.trim())}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: scanning || (!useServerPath && !selectedFolder) || (useServerPath && !serverPath.trim()) ? '#334155' : '#6366f1',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: scanning || (!useServerPath && !selectedFolder) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                {scanning ? (
                  <>
                    <RefreshCw className="spin" style={{ width: '16px', height: '16px' }} />
                    Scanning Codebase...
                  </>
                ) : (
                  <>
                    Start PQC Scan
                    <ArrowRight style={{ width: '16px', height: '16px' }} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default IngestionModal;
