import React from 'react';
import { TABLE_LAYOUTS } from '../utils/constants';
import './Table.css';

const Table = ({ columns, data, onRowClick, mobileLayout = TABLE_LAYOUTS.CARDS }) => {
    const [expandedRows, setExpandedRows] = React.useState({});

    const handleRowClick = (rowIndex, row) => {
        // If regular row click handler exists, call it
        if (onRowClick) {
            onRowClick(row);
            return;
        }

        // Otherwise, toggle expansion for mobile cards
        setExpandedRows(prev => ({
            ...prev,
            [rowIndex]: !prev[rowIndex]
        }));
    };

    return (
        <div className={`table-container mobile-layout-${mobileLayout}`}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => handleRowClick(rowIndex, row)}
                            className={`${onRowClick ? 'clickable' : 'expandable'} ${expandedRows[rowIndex] ? 'expanded' : ''}`}
                        >
                            {columns.map((column, colIndex) => (
                                <td key={colIndex} data-label={column.header}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
