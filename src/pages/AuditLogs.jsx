import React from 'react';
import { Filter, Check, X, Activity, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Table from '../components/Table';
import Badge from '../components/Badge';
import { useQuantum } from '../context/QuantumContext';
import { STATUS, TABLE_LAYOUTS } from '../utils/constants';
import { formatDate } from '../utils/dateFormatter';
import './AuditLogs.css';

const AuditLogs = () => {
    const { auditLogs, authKeys, pqcKeys } = useQuantum();

    const [isFiltersOpen, setIsFiltersOpen] = React.useState(true);

    // Time Range State
    const [timeRange, setTimeRange] = React.useState('24h');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = React.useState(false);

    // Filter States
    const [isAuthKeyDropdownOpen, setIsAuthKeyDropdownOpen] = React.useState(false);
    const [filterAuthKey, setFilterAuthKey] = React.useState('All');

    const [isPQCKeyDropdownOpen, setIsPQCKeyDropdownOpen] = React.useState(false);
    const [filterPQCKey, setFilterPQCKey] = React.useState('All');

    const [isResultDropdownOpen, setIsResultDropdownOpen] = React.useState(false);
    const [filterResult, setFilterResult] = React.useState('All');

    const timeOptions = [
        { label: 'Last 24 hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
        { label: 'Last 7 days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
        { label: 'Last 30 days', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
    ];

    // Capture current time on mount to avoid impure Date.now() during render
    // eslint-disable-next-line react-hooks/purity
    const nowRef = React.useRef(Date.now());
    const now = nowRef.current;
    const selectedOption = timeOptions.find(o => o.value === timeRange);

    const filteredLogs = auditLogs.filter(log => {
        // Time Filter
        const matchesTime = new Date(log.createdAt).getTime() > (now - selectedOption.ms);

        // Auth Key Filter
        const matchesAuthKey = filterAuthKey === 'All' || log.authKey === filterAuthKey;

        // PQC Key Filter
        const matchesPQCKey = filterPQCKey === 'All' || log.pqcKey === filterPQCKey;

        // Result Filter
        const matchesResult = filterResult === 'All' ||
            (filterResult === 'Success' && log.result === STATUS.SUCCESS) ||
            (filterResult === 'Denied' && log.result !== STATUS.SUCCESS);

        return matchesTime && matchesAuthKey && matchesPQCKey && matchesResult;
    });

    const logs = filteredLogs;

    const totalOps = auditLogs.length;
    const successfulOps = auditLogs.filter(log => log.result === STATUS.SUCCESS).length;
    const deniedOps = auditLogs.filter(log => log.result !== STATUS.SUCCESS).length;
    const successRate = totalOps > 0 ? ((successfulOps / totalOps) * 100).toFixed(1) + '%' : '0.0%';

    const stats = {
        total: totalOps,
        successful: successfulOps,
        denied: deniedOps,
        successRate: successRate
    };

    const truncateMid = (str, maxLength = 35) => {
        if (!str || str.length <= maxLength) return str;
        const half = Math.floor((maxLength - 3) / 2);
        return `${str.slice(0, half)}...${str.slice(str.length - half)}`;
    };

    const columns = [
        {
            header: 'Timestamp',
            key: 'timestamp',
            render: (row) => formatDate(row.timestamp)
        },
        {
            header: 'Operation',
            key: 'operation',
            render: (row) => (
                <span style={{
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px'
                }} title={row.operation}>
                    {truncateMid(row.operation, 35)}
                </span>
            )
        },
        { 
            header: 'Authentication Key', 
            key: 'authKey',
            render: (row) => <span>{row.authKey === '—' ? '-' : row.authKey}</span>
        },
        { 
            header: 'PQC Key', 
            key: 'pqcKey',
            render: (row) => <span>{row.pqcKey === '—' ? '-' : row.pqcKey}</span>
        },
        { 
            header: 'Source IP', 
            key: 'sourceIP',
            render: (row) => <span>{row.sourceIP === '—' ? '-' : row.sourceIP}</span>
        },
        {
            header: 'Result',
            key: 'result',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={row.result}>
                    {row.result === STATUS.SUCCESS ?
                        <Check size={14} color="var(--color-success)" /> :
                        <X size={14} color="var(--color-danger)" />
                    }
                    <span>{truncateMid(row.result, 35)}</span>
                </div>
            )
        }
    ];

    return (
        <div className="page audit-logs-page">
            <PageHeader
                title="Audit Logs"
                subtitle="Complete visibility into cryptographic operations"
                action={
                    <div className="time-filter-dropdown" style={{ zIndex: isTimeDropdownOpen ? 100 : 50 }}>
                        <button
                            className={`dropdown-toggle ${isTimeDropdownOpen ? 'active' : ''}`}
                            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                        >
                            {selectedOption.label}
                            <span className="dropdown-arrow">▼</span>
                        </button>

                        {isTimeDropdownOpen && (
                            <>
                                <div className="dropdown-backdrop" onClick={() => setIsTimeDropdownOpen(false)} />
                                <div className="dropdown-menu">
                                    {timeOptions.map(option => (
                                        <div
                                            key={option.value}
                                            className={`dropdown-item ${timeRange === option.value ? 'selected' : ''}`}
                                            onClick={() => {
                                                setTimeRange(option.value);
                                                setIsTimeDropdownOpen(false);
                                            }}
                                        >
                                            {option.label}
                                            {timeRange === option.value && <Check size={14} className="check-icon" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                }
            />

            <div className="page-content">
                {/* Stats Row */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Total Operations</span>
                            <FileText size={16} color="var(--color-text-secondary)" />
                        </div>
                        <div className="stat-value">{stats.total}</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Successful</span>
                            <div className="stat-indicator success">
                                <Check size={14} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-success)' }}>
                            {stats.successful}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Denied</span>
                            <div className="stat-indicator danger">
                                <X size={14} />
                            </div>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
                            {stats.denied}
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-header">
                            <span className="stat-label">Success Rate</span>
                            <Activity size={16} color="var(--color-text-secondary)" />
                        </div>
                        <div className="stat-value">{stats.successRate}</div>
                    </div>
                </div>

                {/* Filters Row */}
                <div className={`filters-section ${isFiltersOpen ? 'open' : 'closed'}`}>
                    <div className="filters-header" onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Filter size={16} />
                            Filters
                        </div>
                        <span className="filter-toggle-icon" style={{
                            transform: isFiltersOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                            fontSize: '12px'
                        }}>▼</span>
                    </div>
                    {isFiltersOpen && (
                        <div className="filters-grid">

                            {/* Auth Key Filter */}
                            <div className="filter-group">
                                <span className="filter-label">Authentication Key</span>
                                <div className="time-filter-dropdown" style={{ width: '100%', zIndex: isAuthKeyDropdownOpen ? 100 : 50 }}>
                                    <button
                                        className="filter-select"
                                        style={{ width: '100%' }}
                                        onClick={() => setIsAuthKeyDropdownOpen(!isAuthKeyDropdownOpen)}
                                    >
                                        <span className="filter-value">{filterAuthKey === 'All' ? 'All Authentication Keys' : filterAuthKey}</span>
                                        <span style={{ fontSize: '10px' }}>▼</span>
                                    </button>
                                    {isAuthKeyDropdownOpen && (
                                        <>
                                            <div className="dropdown-backdrop" onClick={() => setIsAuthKeyDropdownOpen(false)} />
                                            <div className="dropdown-menu" style={{ width: '100%' }}>
                                                <div
                                                    className={`dropdown-item ${filterAuthKey === 'All' ? 'selected' : ''}`}
                                                    onClick={() => { setFilterAuthKey('All'); setIsAuthKeyDropdownOpen(false); }}
                                                >
                                                    All Authentication Keys
                                                    {filterAuthKey === 'All' && <Check size={14} className="check-icon" />}
                                                </div>
                                                {Array.from(new Set(authKeys.map(k => k.name))).map(name => (
                                                    <div
                                                        key={name}
                                                        className={`dropdown-item ${filterAuthKey === name ? 'selected' : ''}`}
                                                        onClick={() => { setFilterAuthKey(name); setIsAuthKeyDropdownOpen(false); }}
                                                    >
                                                        {name}
                                                        {filterAuthKey === name && <Check size={14} className="check-icon" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* PQC Key Filter */}
                            <div className="filter-group">
                                <span className="filter-label">PQC Key</span>
                                <div className="time-filter-dropdown" style={{ width: '100%', zIndex: isPQCKeyDropdownOpen ? 100 : 50 }}>
                                    <button
                                        className="filter-select"
                                        style={{ width: '100%' }}
                                        onClick={() => setIsPQCKeyDropdownOpen(!isPQCKeyDropdownOpen)}
                                    >
                                        <span className="filter-value">{filterPQCKey === 'All' ? 'All PQC Keys' : filterPQCKey}</span>
                                        <span style={{ fontSize: '10px' }}>▼</span>
                                    </button>
                                    {isPQCKeyDropdownOpen && (
                                        <>
                                            <div className="dropdown-backdrop" onClick={() => setIsPQCKeyDropdownOpen(false)} />
                                            <div className="dropdown-menu" style={{ width: '100%' }}>
                                                <div
                                                    className={`dropdown-item ${filterPQCKey === 'All' ? 'selected' : ''}`}
                                                    onClick={() => { setFilterPQCKey('All'); setIsPQCKeyDropdownOpen(false); }}
                                                >
                                                    All PQC Keys
                                                    {filterPQCKey === 'All' && <Check size={14} className="check-icon" />}
                                                </div>
                                                {Array.from(new Set(pqcKeys.map(k => k.name))).map(name => (
                                                    <div
                                                        key={name}
                                                        className={`dropdown-item ${filterPQCKey === name ? 'selected' : ''}`}
                                                        onClick={() => { setFilterPQCKey(name); setIsPQCKeyDropdownOpen(false); }}
                                                    >
                                                        {name}
                                                        {filterPQCKey === name && <Check size={14} className="check-icon" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Result Filter */}
                            <div className="filter-group">
                                <span className="filter-label">Result</span>
                                <div className="time-filter-dropdown" style={{ width: '100%', zIndex: isResultDropdownOpen ? 100 : 50 }}>
                                    <button
                                        className="filter-select"
                                        style={{ width: '100%' }}
                                        onClick={() => setIsResultDropdownOpen(!isResultDropdownOpen)}
                                    >
                                        <span className="filter-value">{filterResult === 'All' ? 'All results' : filterResult}</span>
                                        <span style={{ fontSize: '10px' }}>▼</span>
                                    </button>
                                    {isResultDropdownOpen && (
                                        <>
                                            <div className="dropdown-backdrop" onClick={() => setIsResultDropdownOpen(false)} />
                                            <div className="dropdown-menu" style={{ width: '100%' }}>
                                                {['All', 'Success', 'Denied'].map(opt => (
                                                    <div
                                                        key={opt}
                                                        className={`dropdown-item ${filterResult === opt ? 'selected' : ''}`}
                                                        onClick={() => { setFilterResult(opt); setIsResultDropdownOpen(false); }}
                                                    >
                                                        {opt === 'All' ? 'All results' : opt}
                                                        {filterResult === opt && <Check size={14} className="check-icon" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Table Section */}
                <div className="recent-activity-section">
                    <div className="recent-activity-header">
                        Recent Activity ({logs.length})
                    </div>
                    {logs.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            No audit logs found. Create keys or rotate them to generate activity.
                        </div>
                    ) : (
                        <Table columns={columns} data={logs} mobileLayout={TABLE_LAYOUTS.CARDS} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
