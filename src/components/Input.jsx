import React from 'react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`input ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
