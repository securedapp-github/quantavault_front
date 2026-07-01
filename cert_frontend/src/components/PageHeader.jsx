import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, subtitle, action }) => {
    return (
        <div className="page-header">
            <div className="page-header-content">
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="page-header-action">{action}</div>}
        </div>
    );
};

export default PageHeader;
