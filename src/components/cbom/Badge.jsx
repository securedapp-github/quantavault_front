import React from 'react';
import './Badge.css';

export function SeverityBadge({ level }) {
  const norm = (level || 'SAFE').toUpperCase();
  let variantClass = 'badge-severity-info';
  if (norm === 'CRITICAL') variantClass = 'badge-severity-critical';
  else if (norm === 'HIGH') variantClass = 'badge-severity-high';
  else if (norm === 'MEDIUM') variantClass = 'badge-severity-medium';
  else if (norm === 'SAFE' || norm === 'LOW' || norm === 'ACTIVE') variantClass = 'badge-severity-safe';

  return <span className={`badge-severity ${variantClass}`}>{level || 'SAFE'}</span>;
}

export function TypeBadge({ type }) {
  const norm = (type || 'DEFAULT').toUpperCase();
  let variantClass = 'badge-type-default';
  if (norm === 'ALGORITHM') variantClass = 'badge-type-algorithm';
  else if (norm === 'CERTIFICATE') variantClass = 'badge-type-certificate';
  else if (norm === 'PROTOCOL') variantClass = 'badge-type-protocol';
  else if (norm === 'KEYSTORE' || norm === 'KEY_MATERIAL' || norm === 'SECRET') variantClass = 'badge-type-keystore';
  else if (norm === 'LIBRARY') variantClass = 'badge-type-library';

  return <span className={`badge-type ${variantClass}`}>{type || 'Asset'}</span>;
}

const Badge = ({ children, variant = 'default', shape = 'oval' }) => {
  if (shape === 'rectangular') {
    return <span className={`badge-type badge-type-${variant}`}>{children}</span>;
  }
  return <span className={`badge-severity badge-severity-${variant}`}>{children}</span>;
};

export default Badge;
