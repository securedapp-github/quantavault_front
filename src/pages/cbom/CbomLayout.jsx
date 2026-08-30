import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Info, Scan, Database, AlertTriangle, GitPullRequest, Activity } from 'lucide-react';
import { useCbomScan } from '../../hooks/useCbomScan';
import { CbomHeaderActions } from '../../components/cbom/CbomHeaderActions';
import { IngestionModal } from '../../components/cbom/IngestionModal';
import { CycloneDXExportModal } from '../../components/cbom/CycloneDXExportModal';
import PageHeader from '../../components/PageHeader';
import { DashboardPage } from './DashboardPage';
import { InventoryPage } from './InventoryPage';
import { RiskAnalysisPage } from './RiskAnalysisPage';
import { MigrationPlannerPage } from './MigrationPlannerPage';
import { ScanLogsPage } from './ScanLogsPage';
import { api } from '../../utils/cbomClient';

export function CbomLayout() {
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const {
    scans,
    targets,
    currentScan,
    loading,
    scanning,
    error,
    selectScan,
    startFolderUploadScan,
    startLocalScan,
    setError,
    reload
  } = useCbomScan();

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getScanHistory();
      if (Array.isArray(data)) setScanHistory(data);
    } catch (e) {
      console.warn('Scan history fetch:', e.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const headerActionsProps = {
    currentScan,
    scans,
    onSelectScan: selectScan,
    onOpenIngestion: () => setIsIngestionOpen(true),
    onOpenExport: () => setIsExportOpen(true),
    scanning,
  };

  const handleStartScanModal = async (scanPayload) => {
    try {
      if (scanPayload.files && scanPayload.files.length > 0) {
        await startFolderUploadScan(scanPayload.files, scanPayload.targetName, scanPayload.tlsTargets);
      } else {
        await startLocalScan(scanPayload.targetLocation, scanPayload.targetName, scanPayload.tlsTargets);
      }
      setIsIngestionOpen(false);
      fetchHistory();
    } catch (err) {
      console.error('Scan failed:', err);
    }
  };

  return (
    <div>
      {/* Error Banner */}
      {error && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 20px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          color: '#fca5a5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Notice Banner */}
      {currentScan?.summary?.notice && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 20px',
          backgroundColor: 'rgba(0, 168, 255, 0.15)',
          border: '1px solid rgba(0, 168, 255, 0.3)',
          borderRadius: '10px',
          color: 'var(--color-primary, #6366f1)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
        }}>
          <Info style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{currentScan.summary.notice}</span>
        </div>
      )}

      {/* Page Content */}
      {loading && !currentScan ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted, #94a3b8)' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-primary, #6366f1)' }}>
            Initializing CBOM Intelligence Engine...
          </div>
          <div style={{ fontSize: '13px' }}>
            Loading cryptographic asset inventories, risk scores, and PQC migration strategies.
          </div>
        </div>
      ) : (
        <Outlet context={{ currentScan, scanning, headerActionsProps, scanHistory, historyLoading, fetchHistory }} />
      )}

      {/* Modals */}
      <IngestionModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
        onStartScan={handleStartScanModal}
        scanning={scanning}
      />

      <CycloneDXExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentScan={currentScan}
      />
    </div>
  );
}

/* ── Page Wrappers for Routing ── */

export function CbomDashboardWrapper() {
  const { currentScan, headerActionsProps } = useCbomOutletContext();
  const navigate = useNavigate();
  return (
    <div className="page">
      <PageHeader
        title="CBOM Intelligence"
        subtitle="Cryptographic Inventory & Post-Quantum Cryptography (PQC) Risk Assessment"
        action={<CbomHeaderActions {...headerActionsProps} />}
      />
      <div className="page-content" style={{ marginTop: '20px' }}>
        <DashboardPage
          currentScan={currentScan}
          onNavigateToMigration={() => navigate('/cbom/migration')}
          onOpenIngestion={headerActionsProps?.onOpenIngestion}
        />
      </div>
    </div>
  );
}

export function CbomInventoryWrapper() {
  const { currentScan, headerActionsProps } = useCbomOutletContext();
  return (
    <div className="page">
      <PageHeader
        title="Asset Inventory"
        subtitle="Complete inventory of discovered cryptographic algorithms, key lengths, certificates, and libraries"
        action={<CbomHeaderActions {...headerActionsProps} />}
      />
      <div className="page-content" style={{ marginTop: '20px' }}>
        <InventoryPage
          currentScan={currentScan}
          onOpenIngestion={headerActionsProps?.onOpenIngestion}
        />
      </div>
    </div>
  );
}

export function CbomRiskWrapper() {
  const { currentScan, headerActionsProps } = useCbomOutletContext();
  return (
    <div className="page">
      <PageHeader
        title="Risk Analysis"
        subtitle="Quantum vulnerability findings scored against NIST SP 800-131A & CNSA 2.0 standards"
        action={<CbomHeaderActions {...headerActionsProps} />}
      />
      <div className="page-content" style={{ marginTop: '20px' }}>
        <RiskAnalysisPage
          currentScan={currentScan}
          onOpenIngestion={headerActionsProps?.onOpenIngestion}
        />
      </div>
    </div>
  );
}

export function CbomMigrationWrapper() {
  const { currentScan, headerActionsProps } = useCbomOutletContext();
  return (
    <div className="page">
      <PageHeader
        title="PQC Migration Strategy"
        subtitle="NIST PQC standardized replacement algorithms & modernization roadmap"
        action={<CbomHeaderActions {...headerActionsProps} />}
      />
      <div className="page-content" style={{ marginTop: '20px' }}>
        <MigrationPlannerPage currentScan={currentScan} onOpenIngestion={headerActionsProps?.onOpenIngestion} />
      </div>
    </div>
  );
}

export function CbomLogsWrapper() {
  const { headerActionsProps, scanHistory, historyLoading, fetchHistory } = useCbomOutletContext();
  return (
    <div className="page">
      <PageHeader
        title="Scan Audit Logs"
        subtitle="Audit log of cryptographic scans and compliance reports"
        action={<CbomHeaderActions {...headerActionsProps} />}
      />
      <div className="page-content" style={{ marginTop: '20px' }}>
        <ScanLogsPage scanHistory={scanHistory} loading={historyLoading} onRefresh={fetchHistory} />
      </div>
    </div>
  );
}

import { useOutletContext } from 'react-router-dom';
function useCbomOutletContext() {
  return useOutletContext();
}

export default CbomLayout;
