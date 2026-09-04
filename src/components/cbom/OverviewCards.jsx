import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
import Card from '../Card';

export function OverviewCards({ metrics }) {
  const cards = [
    {
      title: 'CRITICAL VULNERABILITIES',
      value: metrics.critical,
      subtitle: 'SHA-1 / MD5 / Deprecated TLS',
      icon: ShieldAlert,
      color: '#ef4444'
    },
    {
      title: 'HIGH RISK (PQC VULNERABLE)',
      value: metrics.high,
      subtitle: 'RSA-2048 / ECDSA P-256',
      icon: AlertTriangle,
      color: '#f59e0b'
    },
    {
      title: 'QUANTUM SAFE ASSETS',
      value: metrics.safe,
      subtitle: 'AES-256 / SHA-384 / PQC',
      icon: ShieldCheck,
      color: '#10b981'
    },
    {
      title: 'TOTAL CRYPTO ASSETS',
      value: metrics.total,
      subtitle: 'Discovered in Inventory',
      icon: Layers,
      color: '#6366f1'
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Card key={i} style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary, #94a3b8)', letterSpacing: '0.05em' }}>{card.title}</span>
              <Icon size={18} style={{ color: card.color }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary, #f8fafc)', lineHeight: 1.1 }}>{card.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted, #64748b)', marginTop: '6px' }}>{card.subtitle}</div>
          </Card>
        );
      })}
    </div>
  );
}

export default OverviewCards;
