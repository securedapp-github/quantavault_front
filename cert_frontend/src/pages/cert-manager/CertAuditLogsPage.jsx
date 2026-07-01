import React, { useState, useRef } from 'react';
import { Filter, Check, X, Activity, FileText } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { STATUS, TABLE_LAYOUTS } from '../../utils/constants';
import { formatDate } from '../../utils/dateFormatter';
import { truncateName } from '../../utils/validation';
import { useCert } from '../../context/CertContext';
import './CertAuditLogsPage.css';
import '../cert-shared.css';

const CertAuditLogsPage = () => {
    const { auditLogs, loading } = useCert();
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);

    // Time Range State
    const [timeRange, setTimeRange] = useState('30d');
    const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

    // Filter States
    const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
    const [filterAction, setFilterAction] = useState('All');

    const [isPerformedByDropdownOpen, setIsPerformedByDropdownOpen] = useState(false);
    const [filterPerformedBy, setFilterPerformedBy] = useState('All');

    const [isResultDropdownOpen, setIsResultDropdownOpen] = useState(false);
    const [filterResult, setFilterResult] = useState('All');

    const timeOptions = [
        { label: 'Last 24 hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
        { label: 'Last 7 days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
        { label: 'Last 30 days', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
    ];

    const nowRef = useRef(Date.now());
    const now = nowRef.current;
    const selectedOption = timeOptions.find(o => o.value === timeRange) || timeOptions[2];

    const filteredLogs = auditLogs.filter(log => {
        // Time Filter
        const matchesTime = new Date(log.createdAt).getTime() > (now - selectedOption.ms);

        // Action Filter
        const matchesAction = filterAction === 'All' || log.action === filterAction;

        // Performed By Filter
        const matchesPerformedBy = filterPerformedBy === 'All' || log.performedBy === filterPerformedBy;

        // Result Filter
        const matchesResult = filterResult === 'All' ||
            (filterResult === 'Success' && log.result === STATUS.SUCCESS) ||
            (filterResult === 'Failed' && log.result === STATUS.FAILURE);

        return matchesTime && matchesAction && matchesPerformedBy && matchesResult;
    });

    const totalOps = auditLogs.length;
    const successfulOps = auditLogs.filter(log => log.result === STATUS.SUCCESS).length;
    const deniedOps = auditLogs.filter(log => log.result === STATUS.FAILURE).length;
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
            key: 'createdAt',
            render: (row) => formatDate(row.createdAt)
        },
        {
            header: 'Action',
            key: 'action',
            render: (row) => (
                <span style={{
                    fontFamily: 'monospace',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 600
                }} title={row.action}>
                    {row.action.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            header: 'Performed By',
            key: 'performedBy',
            render: (row) => <span title={row.performedBy}>{truncateName(row.performedBy)}</span>
        },
        {
            header: 'Details',
            key: 'details',
            render: (row) => {
                if (!row.details) return <span style={{ color: 'var(--color-text-muted)' }}>-</span>;
                try {
                    const parsed = JSON.parse(row.details);
                    const formatted = Object.entries(parsed)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ');
                    return <span title={formatted}>{truncateMid(formatted, 45)}</span>;
                } catch {
                    return <span title={row.details}>{truncateMid(row.details, 45)}</span>;
                }
            }
        },
        {
            header: 'Source IP',
            key: 'sourceIP',
            render: (row) => <span>{row.sourceIP}</span>
        },
        {
            header: 'Result',
            key: 'result',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={row.result}>
                    {row.result === STATUS.SUCCESS ? (
                        <>
                            <Check size={14} color="var(--color-success)" />
                            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Success</span>
                        </>
                    ) : (
                        <>
                            <X size={14} color="var(--color-danger)" />
                            <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>Failed</span>
                        </>
                    )}
                </div>
            )
        }
    ];

    const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));
    const uniquePerformers = Array.from(new Set(auditLogs.map(l => l.performedBy)));

    return (
        <div className="page audit-logs-page">
            <PageHeader
                title="Certificate Audit Logs"
                subtitle="Complete visibility into certificate and key lifecycle events"
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
                {loading ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                        Loading audit logs...
                    </div>
                ) : (
                    <>
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
                                    <span className="stat-label">Failed / Denied</span>
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

                        {/* Filters Section */}
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

                                    {/* Action Filter */}
                                    <div className="filter-group">
                                        <span className="filter-label">Action</span>
                                        <div className="time-filter-dropdown" style={{ width: '100%', zIndex: isActionDropdownOpen ? 100 : 50 }}>
                                            <button
                                                className="filter-select"
                                                style={{ width: '100%' }}
                                                onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)}
                                            >
                                                <span className="filter-value">{filterAction === 'All' ? 'All Actions' : filterAction.replace(/_/g, ' ')}</span>
                                                <span style={{ fontSize: '10px' }}>▼</span>
                                            </button>
                                            {isActionDropdownOpen && (
                                                <>
                                                    <div className="dropdown-backdrop" onClick={() => setIsActionDropdownOpen(false)} />
                                                    <div className="dropdown-menu" style={{ width: '100%' }}>
                                                        <div
                                                            className={`dropdown-item ${filterAction === 'All' ? 'selected' : ''}`}
                                                            onClick={() => { setFilterAction('All'); setIsActionDropdownOpen(false); }}
                                                        >
                                                            All Actions
                                                            {filterAction === 'All' && <Check size={14} className="check-icon" />}
                                                        </div>
                                                        {uniqueActions.map(action => (
                                                            <div
                                                                key={action}
                                                                className={`dropdown-item ${filterAction === action ? 'selected' : ''}`}
                                                                onClick={() => { setFilterAction(action); setIsActionDropdownOpen(false); }}
                                                            >
                                                                {action.replace(/_/g, ' ')}
                                                                {filterAction === action && <Check size={14} className="check-icon" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Performed By Filter */}
                                    <div className="filter-group">
                                        <span className="filter-label">Performed By</span>
                                        <div className="time-filter-dropdown" style={{ width: '100%', zIndex: isPerformedByDropdownOpen ? 100 : 50 }}>
                                            <button
                                                className="filter-select"
                                                style={{ width: '100%' }}
                                                onClick={() => setIsPerformedByDropdownOpen(!isPerformedByDropdownOpen)}
                                            >
                                                <span className="filter-value">{filterPerformedBy === 'All' ? 'All Users' : truncateName(filterPerformedBy)}</span>
                                                <span style={{ fontSize: '10px' }}>▼</span>
                                            </button>
                                            {isPerformedByDropdownOpen && (
                                                <>
                                                    <div className="dropdown-backdrop" onClick={() => setIsPerformedByDropdownOpen(false)} />
                                                    <div className="dropdown-menu" style={{ width: '100%' }}>
                                                        <div
                                                            className={`dropdown-item ${filterPerformedBy === 'All' ? 'selected' : ''}`}
                                                            onClick={() => { setFilterPerformedBy('All'); setIsPerformedByDropdownOpen(false); }}
                                                        >
                                                            All Users
                                                            {filterPerformedBy === 'All' && <Check size={14} className="check-icon" />}
                                                        </div>
                                                        {uniquePerformers.map(email => (
                                                            <div
                                                                key={email}
                                                                className={`dropdown-item ${filterPerformedBy === email ? 'selected' : ''}`}
                                                                onClick={() => { setFilterPerformedBy(email); setIsPerformedByDropdownOpen(false); }}
                                                            >
                                                                {truncateName(email)}
                                                                {filterPerformedBy === email && <Check size={14} className="check-icon" />}
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
                                                <span className="filter-value">{filterResult === 'All' ? 'All Results' : filterResult}</span>
                                                <span style={{ fontSize: '10px' }}>▼</span>
                                            </button>
                                            {isResultDropdownOpen && (
                                                <>
                                                    <div className="dropdown-backdrop" onClick={() => setIsResultDropdownOpen(false)} />
                                                    <div className="dropdown-menu" style={{ width: '100%' }}>
                                                        {['All', 'Success', 'Failed'].map(opt => (
                                                            <div
                                                                key={opt}
                                                                className={`dropdown-item ${filterResult === opt ? 'selected' : ''}`}
                                                                onClick={() => { setFilterResult(opt); setIsResultDropdownOpen(false); }}
                                                            >
                                                                {opt === 'All' ? 'All Results' : opt}
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
                                Recent Activity ({filteredLogs.length})
                            </div>
                            {filteredLogs.length === 0 ? (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                    No audit logs found matching active filters.
                                </div>
                            ) : (
                                <Table columns={columns} data={filteredLogs} mobileLayout={TABLE_LAYOUTS.CARDS} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CertAuditLogsPage;
