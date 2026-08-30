import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Card from '../../components/Card';
import { SeverityBadge, TypeBadge } from '../../components/cbom/Badge';
import { CbomEmptyState } from '../../components/cbom/CbomEmptyState';

export function RiskAnalysisPage({ currentScan, onOpenIngestion }) {
  const assets = currentScan?.assets || [];

  if (!currentScan || assets.length === 0) {
    return (
      <CbomEmptyState
        icon={ShieldAlert}
        title="No Risk Analysis Data Available"
        description="Please initiate a codebase scan to evaluate cryptographic risks against NIST SP 800-131A and NSA CNSA 2.0 quantum deadlines."
        onAction={onOpenIngestion}
        actionLabel="Scan Codebase Now"
      />
    );
  }

  const criticalAssets = assets.filter((a) => (a.risk_level || a.riskLevel) === 'CRITICAL');
  const highAssets = assets.filter((a) => (a.risk_level || a.riskLevel) === 'HIGH');

  if (criticalAssets.length === 0 && highAssets.length === 0) {
    return (
      <Card style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(0, 208, 132, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--color-success, #00D084)'
        }}>
          <CheckCircle2 size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary, #f8fafc)', margin: '0 0 8px 0' }}>
          Zero High / Critical Quantum Risks Detected 🎉
        </h3>
        <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.9rem', maxWidth: '520px', margin: '0', lineHeight: '1.6' }}>
          All cryptographic assets analyzed in this codebase comply with modern post-quantum security baselines.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Critical Section */}
      {criticalAssets.length > 0 && (
        <Card style={{ padding: '24px', borderLeft: '4px solid var(--color-error, #ef4444)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldAlert color="var(--color-error, #ef4444)" size={22} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-error, #ef4444)', margin: 0 }}>
              Critical Risk Findings ({criticalAssets.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {criticalAssets.map((asset) => (
              <div key={asset.id} style={{ background: 'var(--color-bg-tertiary, rgba(255,255,255,0.04))', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{asset.name || asset.file}</span>
                    <TypeBadge type={asset.asset_type || asset.type || 'ALGORITHM'} />
                  </div>
                  <SeverityBadge level={asset.risk_level || asset.riskLevel} />
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary, #94a3b8)', marginTop: '6px', margin: '6px 0 0 0' }}>{asset.details || asset.risk_rationale}</p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted, #64748b)', flexWrap: 'wrap' }}>
                  <span>Location: <code className="code-inline" style={{ color: '#818cf8', fontFamily: 'monospace' }}>{asset.location || asset.file}:{asset.line_number || asset.line || 1}</code></span>
                  <span>Recommended PQC Action: <strong style={{ color: 'var(--color-primary, #6366f1)' }}>{asset.pqc_replacement || asset.recommendation || 'Upgrade to ML-DSA / ML-KEM'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* High Risk Section */}
      {highAssets.length > 0 && (
        <Card style={{ padding: '24px', borderLeft: '4px solid var(--color-warning, #f59e0b)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle color="var(--color-warning, #f59e0b)" size={22} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-warning, #f59e0b)', margin: 0 }}>
              High Risk - Quantum Vulnerable Assets ({highAssets.length})
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {highAssets.map((asset) => (
              <div key={asset.id} style={{ background: 'var(--color-bg-tertiary, rgba(255,255,255,0.04))', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border, rgba(255,255,255,0.1))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>{asset.name || asset.file}</span>
                    <TypeBadge type={asset.asset_type || asset.type || 'ALGORITHM'} />
                  </div>
                  <SeverityBadge level={asset.risk_level || asset.riskLevel} />
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary, #94a3b8)', marginTop: '6px', margin: '6px 0 0 0' }}>{asset.details || asset.risk_rationale}</p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-text-muted, #64748b)', flexWrap: 'wrap' }}>
                  <span>Location: <code className="code-inline" style={{ color: '#818cf8', fontFamily: 'monospace' }}>{asset.location || asset.file}:{asset.line_number || asset.line || 1}</code></span>
                  <span>Target PQC Replacement: <strong style={{ color: 'var(--color-primary, #6366f1)' }}>{asset.pqc_replacement || asset.recommendation || 'Upgrade to ML-DSA / ML-KEM'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
}

export default RiskAnalysisPage;
