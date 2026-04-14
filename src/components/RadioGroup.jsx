import React from 'react';
import './RadioGroup.css';

const RadioGroup = ({ label, name, options, value, onChange, required = false }) => {
    return (
        <div className="radio-group">
            {label && (
                <label className="radio-group-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}
            <div className="radio-options">
                {options.map((option) => (
                    <label key={option.value} className="radio-option">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={(e) => onChange(e.target.value)}
                            className="radio-input"
                        />
                        <div className="radio-content">
                            <div className="radio-title">{option.label}</div>
                            {option.description && (
                                <div className="radio-description">{option.description}</div>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default RadioGroup;
