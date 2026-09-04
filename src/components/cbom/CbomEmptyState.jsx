import React from 'react';
import { Scan } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

export function CbomEmptyState({
  icon: Icon = Scan,
  title = 'No Scan Data Available',
  description = 'Please initiate a codebase scan to discover cryptographic assets, analyze quantum vulnerabilities, and generate insights.',
  onAction,
  actionLabel = 'Scan Codebase Now',
  style = {}
}) {
  return (
    <Card style={{
      padding: '56px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(99, 102, 241, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        color: 'var(--color-primary, #6366f1)'
      }}>
        <Icon size={32} />
      </div>

      <h3 style={{
        fontSize: '1.3rem',
        fontWeight: 800,
        color: 'var(--color-text-primary, #f8fafc)',
        margin: '0 0 8px 0'
      }}>
        {title}
      </h3>

      <p style={{
        color: 'var(--color-text-secondary, #94a3b8)',
        fontSize: '0.9rem',
        maxWidth: '480px',
        margin: '0 0 24px 0',
        lineHeight: '1.6'
      }}>
        {description}
      </p>

      {onAction && (
        <Button variant="primary" onClick={onAction}>
          <Scan size={16} /> {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export default CbomEmptyState;
