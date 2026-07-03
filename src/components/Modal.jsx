import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'medium', hideClose = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={hideClose ? undefined : onClose}>
            <div
                className={`modal modal--${size}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    {!hideClose && <button className="modal-close" onClick={onClose}>×</button>}
                </div>
                <div className="modal-content">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
