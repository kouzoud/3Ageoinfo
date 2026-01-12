import { useEffect, useState } from 'react';
import { isPWAMode } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, ExternalLink } from 'lucide-react';

/**
 * Composant de garde pour la PWA
 * Bloque l'accès aux professionnels et administrateurs dans l'app installée
 * Affiche un message de redirection vers le navigateur
 */
const PWAGuard = ({ children }) => {
    const { user, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        // Vérifier si on est en mode PWA ET que l'utilisateur est pro/admin
        if (isPWAMode() && user && (user.role === 'PROFESSIONNEL' || user.role === 'ADMIN')) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }
    }, [user]);

    const handleOpenInBrowser = () => {
        // Ouvrir le site dans le navigateur par défaut
        window.open(window.location.origin, '_blank');
        // Déconnecter de la PWA
        logout();
    };

    if (showWarning) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
            }}>
                {/* Icône d'alerte */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '2rem',
                    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3)'
                }}>
                    <AlertTriangle size={50} color="#fff" />
                </div>

                {/* Message principal */}
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#dc2626',
                    marginBottom: '1rem'
                }}>
                    ⚠️ Accès Restreint
                </h1>

                <p style={{
                    fontSize: '1.1rem',
                    color: '#991b1b',
                    marginBottom: '0.5rem',
                    maxWidth: '500px'
                }}>
                    L'application installée est réservée aux <strong>citoyens</strong> uniquement.
                </p>

                <p style={{
                    fontSize: '1rem',
                    color: '#7f1d1d',
                    marginBottom: '2rem',
                    maxWidth: '500px'
                }}>
                    Pour accéder en tant que <strong>{user.role}</strong>, veuillez utiliser le navigateur web.
                </p>

                {/* Informations */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    maxWidth: '500px',
                    border: '2px solid #fecaca',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '1rem'
                    }}>
                        💡 Pourquoi cette restriction ?
                    </h3>
                    <ul style={{
                        textAlign: 'left',
                        color: '#475569',
                        fontSize: '0.9rem',
                        lineHeight: '1.8',
                        paddingLeft: '1.5rem'
                    }}>
                        <li>L'app mobile est optimisée pour la déclaration rapide d'incidents par les citoyens</li>
                        <li>L'interface professionnelle nécessite un écran plus large et des fonctionnalités avancées</li>
                        <li>Cette séparation garantit une meilleure expérience utilisateur pour chaque rôle</li>
                    </ul>
                </div>

                {/* Boutons d'action */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={handleOpenInBrowser}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 2rem',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }}
                    >
                        <ExternalLink size={20} />
                        Ouvrir dans le Navigateur
                    </button>

                    <button
                        onClick={() => logout()}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '1rem 2rem',
                            background: '#fff',
                            color: '#64748b',
                            border: '2px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#fff';
                        }}
                    >
                        Me Déconnecter
                    </button>
                </div>

                {/* Note de bas de page */}
                <p style={{
                    marginTop: '3rem',
                    fontSize: '0.85rem',
                    color: '#94a3b8'
                }}>
                    Mode actuel: <strong>Application Installée (PWA)</strong>
                </p>
            </div>
        );
    }

    // Si tout est OK, afficher le contenu normalement
    return children;
};

export default PWAGuard;
