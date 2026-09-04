import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { SeverityBadge, TypeBadge } from './Badge';

export function AssetTable({ assets = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredAssets = assets.filter((a) => {
    const name = a.name || a.file || '';
    const algorithm = a.algorithm || '';
    const location = a.location || a.file || '';
    const details = a.details || a.recommendation || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      algorithm.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      details.toLowerCase().includes(searchTerm.toLowerCase());

    const assetType = a.asset_type || a.type || 'ALGORITHM';
    const matchesType = filterType === 'ALL' || assetType === filterType;
    const riskLevel = a.risk_level || a.riskLevel || 'SAFE';
    const matchesRisk = filterRisk === 'ALL' || riskLevel === filterRisk;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div>
      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Search Box */}
        <div style={{ position: 'relative', flex: '0 0 240px' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted, #94a3b8)' }} />
          <input
            style={{
              width: '100%',
              background: 'var(--color-bg-tertiary, rgba(255,255,255,0.05))',
              border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              borderRadius: '50px',
              padding: '8px 12px 8px 34px',
              color: 'var(--color-text-primary, #f8fafc)',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <select
          style={{
            background: 'var(--color-bg-tertiary, rgba(255,255,255,0.05))',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            borderRadius: '50px',
            padding: '8px 16px',
            color: 'var(--color-text-primary, #f8fafc)',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="ALGORITHM">Algorithm</option>
          <option value="CERTIFICATE">Certificate</option>
          <option value="PROTOCOL">Protocol</option>
          <option value="KEYSTORE">KeyStore / Secret</option>
          <option value="LIBRARY">Library</option>
          <option value="SECRET">Secret</option>
          <option value="KEY_MATERIAL">Key Material</option>
        </select>

        {/* Risk Filter */}
        <select
          style={{
            background: 'var(--color-bg-tertiary, rgba(255,255,255,0.05))',
            border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
            borderRadius: '50px',
            padding: '8px 16px',
            color: 'var(--color-text-primary, #f8fafc)',
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="SAFE">Safe</option>
        </select>
      </div>

      {/* Table Card Container */}
      <div className="table-card" style={{ background: 'var(--color-bg-secondary, #0f172a)', border: '1px solid var(--color-border, rgba(255,255,255,0.1))', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="table-card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
          <h3 className="table-card-title" style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary, #f8fafc)' }}>
            Cryptographic Assets ({filteredAssets.length})
          </h3>
        </div>

        {/* Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Asset Name & Location</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Severity</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Symbol Graph Call-Site Context</th>
                <th style={{ width: '40px', textAlign: 'center', padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted, #94a3b8)' }}>
                    No cryptographic assets match the selected search criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isExpanded = !!expandedRows[asset.id];
                  const riskLevel = asset.risk_level || asset.riskLevel || 'SAFE';
                  const assetType = asset.asset_type || asset.type || 'ALGORITHM';
                  const location = asset.location || asset.file || 'src';
                  const line = asset.line_number || asset.line || 1;
                  const keySize = asset.key_size || asset.keySize || 0;
                  const pqcReplacement = asset.pqc_replacement || asset.recommendation || 'NIST ML-DSA-65 (FIPS 204)';

                  return (
                    <React.Fragment key={asset.id}>
                      <tr
                        onClick={() => toggleRow(asset.id)}
                        style={{
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.05))',
                          background: isExpanded ? 'var(--color-bg-tertiary, rgba(255,255,255,0.05))' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary, #f8fafc)', fontSize: '0.9rem' }}>
                            {asset.name || asset.file}
                          </div>
                          <div style={{ color: '#818cf8', fontSize: '0.75rem', fontFamily: 'monospace', marginTop: '3px' }}>
                            {location}:{line}
                          </div>
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <TypeBadge type={assetType} />
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          <SeverityBadge level={riskLevel} />
                        </td>

                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.85rem', maxWidth: '380px', lineHeight: '1.4' }}>
                          {asset.risk_rationale || asset.details || asset.recommendation || 'Discovered via static analysis'}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${asset.id}-expanded`}>
                          <td colSpan="5" style={{ padding: 0, borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
                            <div style={{
                              padding: '20px 24px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderTop: '1px dashed var(--color-border, rgba(255,255,255,0.1))',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                            }}>
                              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    Algorithm & Key Size
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                                    {asset.algorithm} {keySize > 0 ? `(${keySize}-bit)` : ''}
                                  </span>
                                </div>

                                <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

                                <div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    PQC Target Replacement
                                  </span>
                                  <span style={{ fontWeight: 700, color: '#a855f7', fontSize: '0.9rem' }}>
                                    {pqcReplacement}
                                  </span>
                                </div>

                                <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)' }} />

                                <div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    Compliance & Standards
                                  </span>
                                  <span style={{ fontWeight: 600, color: '#10b981', fontSize: '0.85rem' }}>
                                    NIST SP 800-131A & CNSA 2.0 PQC Standard
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                  Symbol Graph Context & Risk Rationale
                                </span>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                                  {asset.risk_rationale || 'Component evaluated for post-quantum vulnerability against Shor\'s and Grover\'s quantum cryptanalysis algorithms.'}
                                </p>
                              </div>

                              {asset.details && (
                                <div>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                                    Consumer Call Site & Source Code Details
                                  </span>
                                  <div style={{
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    color: '#818cf8',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                  }}>
                                    {location}:{line} → {asset.details}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssetTable;
