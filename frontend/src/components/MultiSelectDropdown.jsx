import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * Composant Dropdown Multi-Sélection avec Checkboxes
 * Permet de sélectionner plusieurs options dans une liste déroulante
 */
const MultiSelectDropdown = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    placeholder = "Sélectionner...",
    maxHeight = "300px"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fermer le dropdown en cliquant à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleOption = (value) => {
        const newSelected = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];

        onChange(newSelected);
    };

    const handleSelectAll = () => {
        onChange(options.map(opt => opt.value));
    };

    const handleClearAll = () => {
        onChange([]);
    };

    // Récupérer les labels des valeurs sélectionnées
    const getSelectedLabels = () => {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === options.length) return "Tous";
        if (selectedValues.length === 1) {
            const option = options.find(opt => opt.value === selectedValues[0]);
            return option?.label || placeholder;
        }
        return `${selectedValues.length} sélectionnés`;
    };

    const styles = {
        container: {
            position: 'relative',
            minWidth: '200px'
        },
        button: {
            width: '100%',
            padding: '10px 14px',
            background: '#fff',
            border: '2px solid #e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '0.95rem',
            color: selectedValues.length > 0 ? '#1e293b' : '#94a3b8',
            transition: 'all 0.2s ease',
            outline: 'none'
        },
        buttonOpen: {
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        },
        dropdown: {
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 90000,  // Augmenté pour passer au-dessus de la carte (1000)
            maxHeight,
            overflowY: 'auto',
            animation: 'slideDown 0.2s ease'
        },
        actions: {
            padding: '10px 12px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            gap: '8px'
        },
        actionButton: {
            flex: 1,
            padding: '6px 10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: '#fff',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            fontWeight: '500',
            color: '#64748b'
        },
        option: {
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
            fontSize: '0.9rem'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            border: '2px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease'
        },
        checkboxChecked: {
            background: '#3b82f6',
            borderColor: '#3b82f6'
        },
        label: {
            flex: 1,
            color: '#1e293b'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 8px',
            borderRadius: '12px',
            background: '#3b82f6',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginLeft: '6px'
        }
    };

    return (
        <div ref={dropdownRef} style={styles.container}>
            <style>
                {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
            </style>

            {/* Bouton principal */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    ...styles.button,
                    ...(isOpen ? styles.buttonOpen : {})
                }}
                onMouseEnter={(e) => {
                    if (!isOpen) e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                    if (!isOpen) e.currentTarget.style.borderColor = '#e2e8f0';
                }}
            >
                <span style={{ display: 'flex', alignItems: 'center' }}>
                    {getSelectedLabels()}
                    {selectedValues.length > 0 && selectedValues.length < options.length && (
                        <span style={styles.badge}>{selectedValues.length}</span>
                    )}
                </span>
                <ChevronDown
                    size={18}
                    style={{
                        transition: 'transform 0.2s ease',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: '#64748b'
                    }}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={styles.dropdown}>
                    {/* Actions rapides */}
                    <div style={styles.actions}>
                        <button
                            onClick={handleSelectAll}
                            style={styles.actionButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            ✓ Tout
                        </button>
                        <button
                            onClick={handleClearAll}
                            style={styles.actionButton}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            × Aucun
                        </button>
                    </div>

                    {/* Liste des options */}
                    {options.map((option) => {
                        const isSelected = selectedValues.includes(option.value);

                        return (
                            <div
                                key={option.value}
                                onClick={() => handleToggleOption(option.value)}
                                style={styles.option}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fff';
                                }}
                            >
                                <div style={{
                                    ...styles.checkbox,
                                    ...(isSelected ? styles.checkboxChecked : {})
                                }}>
                                    {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
                                </div>
                                <span style={styles.label}>{option.label}</span>
                            </div>
                        );
                    })}

                    {options.length === 0 && (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                            Aucune option disponible
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;
