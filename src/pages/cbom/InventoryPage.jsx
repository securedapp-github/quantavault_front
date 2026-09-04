import React from 'react';
import { Database } from 'lucide-react';
import { AssetTable } from '../../components/cbom/AssetTable';
import { CbomEmptyState } from '../../components/cbom/CbomEmptyState';

export function InventoryPage({ currentScan, onOpenIngestion }) {
  const assets = currentScan?.assets || [];

  if (!currentScan || assets.length === 0) {
    return (
      <CbomEmptyState
        icon={Database}
        title="No Cryptographic Inventory Found"
        description="Please initiate a codebase scan to populate the complete inventory of cryptographic algorithms, certificates, keystores, and libraries."
        onAction={onOpenIngestion}
        actionLabel="Scan Codebase Now"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AssetTable assets={assets} />
    </div>
  );
}

export default InventoryPage;
