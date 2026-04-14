import React from 'react';
import Button from './Button';
import './EmptyState.css';

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => {
    return (
        <div className="empty-state">
            {icon && <div className="empty-state-icon">{icon}</div>}
            <h3 className="empty-state-title">{title}</h3>
            {description && <p className="empty-state-description">{description}</p>}
            {actionLabel && onAction && (
                <Button onClick={onAction}>{actionLabel}</Button>
            )}
        </div>
    );
};

export default EmptyState;
