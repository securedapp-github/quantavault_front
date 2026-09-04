import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/cbomClient';

export function useCbomScan() {
  const [scans, setScans] = useState([]);
  const [targets, setTargets] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const loadScansAndTargets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [scansData, targetsData] = await Promise.all([
        api.getScans().catch(() => []),
        api.getTargets().catch(() => []),
      ]);

      setScans(scansData || []);
      setTargets(targetsData || []);
      
      // Select most recent scan if available
      if (scansData && scansData.length > 0) {
        const detail = await api.getScanDetail(scansData[0].id || scansData[0].scan_id);
        setCurrentScan(detail);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectScan = async (scanId) => {
    try {
      setLoading(true);
      const detail = await api.getScanDetail(scanId);
      setCurrentScan(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modern Browser Folder Upload Scan
  const startFolderUploadScan = async (files, folderName = 'Uploaded Project', tlsTargets = []) => {
    try {
      setScanning(true);
      setError(null);

      const formData = new FormData();
      formData.append('folder_name', folderName);
      formData.append('targetName', folderName);
      formData.append('targetLocation', folderName);
      if (tlsTargets && tlsTargets.length > 0) {
        formData.append('tls_targets', tlsTargets.join(','));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relPath = file.webkitRelativePath || file.name;
        formData.append('files', file, relPath);
      }

      const detail = await api.uploadFolderScan(formData);
      setCurrentScan(detail);
      await loadScansAndTargets();
      return detail;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setScanning(false);
    }
  };

  // Direct Path Scan (Fallback)
  const startLocalScan = async (targetPath, name = 'Local Codebase', tlsTargets = []) => {
    try {
      setScanning(true);
      setError(null);

      // Trigger direct scan
      const detail = await api.triggerScan(targetPath);
      setCurrentScan(detail);
      await loadScansAndTargets();
      return detail;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    loadScansAndTargets();
  }, [loadScansAndTargets]);

  return {
    scans,
    targets,
    currentScan,
    loading,
    scanning,
    error,
    selectScan,
    startFolderUploadScan,
    startLocalScan,
    reload: loadScansAndTargets,
    setError,
  };
}

export default useCbomScan;
