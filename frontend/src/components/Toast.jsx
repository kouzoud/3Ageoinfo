import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

/**
 * Composant Toast Notification Professionnel
 * Affiche des notifications élégantes à la place des alerts natives
 */
const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
        }, 300);
    };

    if (!isVisible) return null;

    const config = {
        success: {
            icon: CheckCircle,
            bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            iconColor: '#fff',
            borderColor: '#059669'
        },
        error: {
            icon: XCircle,
            bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            iconColor: '#fff',
            borderColor: '#dc2626'
        },
        warning: {
            icon: AlertCircle,
            bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            iconColor: '#fff',
            borderColor: '#d97706'
        }
    };

    const { icon: Icon, bgGradient, iconColor, borderColor } = config[type] || config.success;

    return (
        <div
            style={{
                position: 'fixed',
                top: '2rem',
                right: '2rem',
                zIndex: 10000,
                animation: isExiting ? 'slideOutRight 0.3s ease-out' : 'slideInRight 0.3s ease-out',
                minWidth: '350px',
                maxWidth: '500px'
            }}
        >
            <style>
                {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
            </style>

            <div
                style={{
                    background: bgGradient,
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${borderColor}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animation de fond */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        animation: 'shimmer 2s infinite',
                        pointerEvents: 'none'
                    }}
                />

                <style>
                    {`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}
                </style>

                {/* Icône */}
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <Icon size={28} color={iconColor} strokeWidth={2.5} />
                </div>

                {/* Message */}
                <div style={{ flex: 1, color: '#fff' }}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '1rem',
                            fontWeight: '600',
                            lineHeight: '1.5',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                        }}
                    >
                        {message}
                    </p>
                </div>

                {/* Bouton fermer */}
                <button
                    onClick={handleClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <X size={18} color="#fff" />
                </button>

                {/* Barre de progression */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        animation: `shrink ${duration}ms linear`,
                        transformOrigin: 'left'
                    }}
                />

                <style>
                    {`
            @keyframes shrink {
              from { width: 100%; }
              to { width: 0%; }
            }
          `}
                </style>
            </div>
        </div>
    );
};

/**
 * Container de gestion des toasts
 */
export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        // Écouter les événements de toast personnalisés
        const handleToast = (event) => {
            const { message, type, duration } = event.detail;
            const id = Date.now();

            setToasts(prev => [...prev, { id, message, type, duration }]);
        };

        window.addEventListener('showToast', handleToast);
        return () => window.removeEventListener('showToast', handleToast);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <>
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    style={{
                        position: 'fixed',
                        top: `${2 + index * 7}rem`,
                        right: '2rem',
                        zIndex: 10000 + index
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration || 4000}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </>
    );
};

/**
 * Fonction helper pour afficher un toast
 */
export const showToast = (message, type = 'success', duration = 4000) => {
    const event = new CustomEvent('showToast', {
        detail: { message, type, duration }
    });
    window.dispatchEvent(event);
};

export default Toast;
