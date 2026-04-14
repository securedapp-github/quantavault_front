import React from 'react';
import { useQuantum } from '../context/QuantumContext';
import './Loader.css';

const GlobalLoader = () => {
    const { loading } = useQuantum();

    if (!loading) return null;

    return (
        <div className="global-loader-overlay">
            <div className="loader-container">
                <div className="loader-spinner"></div>
            </div>
            <div className="loader-text">Loading...</div>
        </div>
    );
};

export default GlobalLoader;
