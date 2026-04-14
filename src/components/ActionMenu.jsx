import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal } from 'lucide-react';
import './ActionMenu.css';

const ActionMenu = ({ actions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation();
        if (!isOpen) {
            // Calculate position before opening
            const rect = triggerRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX // Set to right edge of trigger
            });
        }
        setIsOpen(!isOpen);
    };

    // Handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is on trigger (toggle handles that)
            if (triggerRef.current && triggerRef.current.contains(event.target)) {
                return;
            }
            // Check if click is inside menu
            if (menuRef.current && menuRef.current.contains(event.target)) {
                return;
            }
            // Otherwise close
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Also close on scroll to prevent detached floating menu
            window.addEventListener('scroll', () => setIsOpen(false), true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setIsOpen(false), true);
        };
    }, [isOpen]);

    return (
        <div className="action-menu-container">
            <button
                ref={triggerRef}
                className={`action-menu-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen && createPortal(
                <div
                    className="action-menu-dropdown"
                    ref={menuRef}
                    style={{
                        top: `${menuPosition.top}px`,
                        left: `${menuPosition.left}px`,
                        transform: 'translateX(-100%)' // Align right edge with left coordinate (which I set to trigger's right edge effectively)
                    }}
                >
                    {actions.map((action, index) => (
                        <button
                            key={index}
                            className={`action-menu-item ${action.variant || ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {action.icon && <span className="action-icon">{action.icon}</span>}
                            {action.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default ActionMenu;
