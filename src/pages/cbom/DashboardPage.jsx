import React from 'react';
import { OverviewCards } from '../../components/cbom/OverviewCards';
import { RiskGauge } from '../../components/cbom/RiskGauge';
import { AssetTable } from '../../components/cbom/AssetTable';
import { useRiskMetrics } from '../../hooks/useRiskMetrics';
import { Cpu, ArrowRight, Container, Globe, KeyRound } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { CbomEmptyState } from '../../components/cbom/CbomEmptyState';

export function DashboardPage({ currentScan, onNavigateToMigration, onOpenIngestion }) {
  if (!currentScan) {
    return (
      <CbomEmptyState
        icon={Cpu}
        title="No Active CBOM Scan Available"
        description="Please initiate a codebase scan to assess cryptographic health, calculate NIST PQC readiness scores, and discover quantum vulnerabilities."
        onAction={onOpenIngestion}
        actionLabel="Scan Codebase Now"
      />
    );
  }

  const assets = currentScan?.assets || [];
  const metrics = useRiskMetrics(assets);
  const sb = metrics.scannerBreakdown || {};

  const scannerBadges = [
    { label: 'Container', count: sb.container || 0, icon: Container, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { label: 'TLS/Network', count: sb.tls || 0, icon: Globe, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { label: 'Secrets', count: sb.secrets || 0, icon: KeyRound, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner & Risk Gauge - Responsive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Banner */}
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 168, 255, 0.15)', color: 'var(--color-primary, #6366f1)', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
              <Cpu size={14} /> ACTIVE TARGET: {currentScan?.summary?.target_directory || currentScan?.targetName || 'sample_target'}
            </div>
            
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '12px', lineHeight: '1.3', color: 'var(--color-text-primary, #f8fafc)' }}>
              Cryptographic Health & Post-Quantum Risk Assessment
            </h2>

            <p style={{ color: 'var(--color-text-secondary, #94a3b8)', marginTop: '10px', fontSize: '0.875rem', lineHeight: '1.5' }}>
              Discovered {metrics.total} cryptographic components across source code, certificates, key stores, and Docker containers. {metrics.critical + metrics.high} assets require immediate PQC migration.
            </p>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={onNavigateToMigration}>
              Launch PQC Migration Planner <ArrowRight size={16} />
            </Button>
          </div>
        </Card>

        {/* Risk Gauge */}
        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RiskGauge score={metrics.score} />
        </Card>

      </div>

      {/* Overview Cards */}
      <OverviewCards metrics={metrics} />

      {/* Scanner Breakdown Badges */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {scannerBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: badge.bg,
                border: `1px solid ${badge.color}33`,
                minWidth: '160px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${badge.color}22`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: `${badge.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={18} style={{ color: badge.color }} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: badge.color, lineHeight: 1.1 }}>
                  {badge.count}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {badge.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Inventory Table */}
      <AssetTable assets={assets} />

    </div>
  );
}

export default DashboardPage;
