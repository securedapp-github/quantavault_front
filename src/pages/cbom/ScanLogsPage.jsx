import React, { useState } from 'react';
import { RefreshCw, Activity, Database, CheckCircle2, Clock, Eye, X, ShieldAlert, Cpu, FileText, User } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export function ScanLogsPage({ scanHistory = [], loading, onRefresh }) {
  const [selectedLog, setSelectedLog] = useState(null);

  const formatDuration = (ms) => {
    if (!ms && ms !== 0) return 'N/A';
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms}ms`;
  };

  return (
    <Card style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)' }}>
            Scan History
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary, #94a3b8)' }}>

          </p>
        </div>
        <Button variant="secondary" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh Logs
        </Button>
      </div>

      {/* Simplified Clean Table */}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scan ID
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Assets
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Duration
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scanned At
              </th>
              <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {scanHistory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b' }}>
                  <Activity size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                  No scan history logged yet in database. Run a codebase scan to create permanent audit logs.
                </td>
              </tr>
            ) : (
              scanHistory.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  style={{
                    borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.05))',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* 1. Scan ID */}
                  <td style={{ padding: '14px 16px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace', fontSize: '13px' }}>
                    {log.id}
                  </td>

                  {/* 2. Total Assets */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--color-text-primary, #f8fafc)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}>
                      {log.totalAssets || 0} Assets
                    </span>
                  </td>

                  {/* 3. Duration */}
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} color="#64748b" />
                      {formatDuration(log.durationMs)}
                    </span>
                  </td>

                  {/* 4. Status */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: log.status === 'SUCCESS' || log.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: log.status === 'SUCCESS' || log.status === 'COMPLETED' ? '#10b981' : '#ef4444'
                    }}>
                      {log.status || 'COMPLETED'}
                    </span>
                  </td>

                  {/* 5. Scanned At */}
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>
                    {new Date(log.scannedAt || log.createdAt).toLocaleString()}
                  </td>

                  {/* 6. Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      style={{
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid rgba(99, 102, 241, 0.25)',
                        color: '#818cf8',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Eye size={13} /> View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Clickable Scan Audit Detail Modal ── */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-bg-secondary, #0f172a)',
            border: '1px solid var(--color-border, rgba(255,255,255,0.12))',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary, #6366f1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CBOM SCAN AUDIT DETAIL
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)' }}>
                  Scan #{selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary, #94a3b8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Top Overview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{selectedLog.targetName || 'Default Target'}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Target Type</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>{selectedLog.targetType || 'REPO'}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>PQC Readiness Score</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#6366f1', marginTop: '4px' }}>{selectedLog.pqcScore ?? 100}/100</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>User Account</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginTop: '4px' }}>User ID: #{selectedLog.userId || 1}</div>
                </div>
              </div>

              {/* Target Location */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Target Location / Path</div>
                <code style={{ fontSize: '12px', color: '#818cf8', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {selectedLog.targetLocation || 'sample_target'}
                </code>
              </div>

              {/* Files Scanned & Risk Severity Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

                {/* Files Breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>Files Ingestion Metrics</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Total Files Discovered:</span>
                    <strong style={{ color: '#f8fafc' }}>{selectedLog.totalFiles ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                    <span style={{ color: '#94a3b8' }}>Source Code Scanned:</span>
                    <strong style={{ color: '#818cf8' }}>{selectedLog.scannedFiles ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#94a3b8' }}>Execution Duration:</span>
                    <strong style={{ color: '#f8fafc' }}>{formatDuration(selectedLog.durationMs)}</strong>
                  </div>
                </div>

                {/* Risk Breakdown */}
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>Discovered Asset Severities</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>
                      <span>Critical</span>
                      <span>{selectedLog.criticalCount ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>
                      <span>High</span>
                      <span>{selectedLog.highCount ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', fontSize: '12px', fontWeight: 600 }}>
                      <span>Medium</span>
                      <span>{selectedLog.mediumCount ?? 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '12px', fontWeight: 600 }}>
                      <span>Safe / PQC</span>
                      <span>{selectedLog.safeCount ?? 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Timestamp footer */}
              <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                Recorded on: {new Date(selectedLog.scannedAt || selectedLog.createdAt).toLocaleString()}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border, rgba(255,255,255,0.08))',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close Details
              </Button>
            </div>

          </div>
        </div>
      )}

    </Card>
  );
}

export default ScanLogsPage;
