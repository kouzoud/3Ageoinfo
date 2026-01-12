import { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MapPin,
    Copy,
    Check,
    RefreshCw,
    Loader2,
    Info,
    Eye,
    Filter,
    X,
    Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCitizenDeviceId } from '../hooks/useCitizenDeviceId';
import PWAGuard from '../components/PWAGuard';
import { publicAPI } from '../services/api';

/**
 * Page "Mes Incidents" - Suivi citoyen anonyme
 * Affiche tous les incidents déclarés par l'appareil du citoyen
 * Utilise l'UUID stocké localement pour récupérer les incidents
 * RESTRICTION: Accessible uniquement en mode PWA (standalone app)
 */
const MesIncidents = () => {
    const { deviceId, isLoading: deviceIdLoading } = useCitizenDeviceId();
    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // 🔍 États de filtrage (sélections temporaires)
    const [tempFilterStatus, setTempFilterStatus] = useState('TOUS');
    const [tempFilterType, setTempFilterType] = useState('TOUS');
    const [tempFilterSecteur, setTempFilterSecteur] = useState('TOUS');
    const [showFilters, setShowFilters] = useState(false);

    // 🔍 Filtres appliqués (après clic sur "Rechercher")
    const [appliedFilters, setAppliedFilters] = useState({
        status: 'TOUS',
        type: 'TOUS',
        secteur: 'TOUS'
    });

    // Liste des secteurs (extraite des incidents)
    const [secteurs, setSecteurs] = useState([]);

    // Récupérer les incidents du citoyen
    const fetchMyIncidents = async () => {
        try {
            setError('');

            // Priorité 1 : Récupérer par email si disponible
            const email = localStorage.getItem('citizenEmail');

            if (email) {
                console.log('📧 Récupération par email:', email);
                const data = await publicAPI.getIncidentsByEmail(email);
                setIncidents(data);
                console.log(`✅ ${data.length} incidents récupérés par email`);
            }
            // Priorité 2 : Récupérer par deviceId (mode anonyme)
            else if (deviceId) {
                console.log('🔑 Récupération par UUID:', deviceId);
                const data = await publicAPI.getIncidentsByDeviceId(deviceId);
                setIncidents(data);
                console.log(`✅ ${data.length} incidents récupérés par UUID`);
            }

            // Extraire les secteurs uniques
            const uniqueSecteurs = [...new Set(incidents.map(inc => inc.secteurNom).filter(Boolean))];
            setSecteurs(uniqueSecteurs.sort());
        } catch (err) {
            console.error('Erreur récupération incidents:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const email = localStorage.getItem('citizenEmail');
        // Déclencher si email OU deviceId existe
        if (email || deviceId) {
            fetchMyIncidents();
        }
    }, [deviceId]);

    // Copier l'UUID dans le presse-papiers
    const copyUUID = async () => {
        try {
            await navigator.clipboard.writeText(deviceId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Erreur copie UUID:', err);
        }
    };

    // Rafraîchir la liste
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchMyIncidents();
    };

    // Rendu du badge de statut
    const renderStatutBadge = (statut) => {
        const statusConfig = {
            REDIGE: { color: '#6b7280', icon: Clock, label: 'En attente de validation' },
            VALIDE: { color: '#10b981', icon: CheckCircle2, label: 'Validé et publié' },
            REJETE: { color: '#ef4444', icon: XCircle, label: 'Rejeté' },
            PRIS_EN_COMPTE: { color: '#3b82f6', icon: FileText, label: 'Pris en compte' },
            EN_COURS_DE_TRAITEMENT: { color: '#f59e0b', icon: RefreshCw, label: 'En cours de traitement' },
            TRAITE: { color: '#059669', icon: CheckCircle2, label: 'Traité' },
            BLOQUE: { color: '#dc2626', icon: AlertCircle, label: 'Bloqué' },
            REDIRIGE: { color: '#8b5cf6', icon: RefreshCw, label: 'Redirigé' }
        };

        const config = statusConfig[statut] || statusConfig.REDIGE;
        const Icon = config.icon;

        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                background: `linear-gradient(135deg, ${config.color}25, ${config.color}30)`,
                border: `1.5px solid ${config.color}70`,
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: config.color,
                boxShadow: `0 2px 12px ${config.color}20, 0 0 20px ${config.color}10`,
                backdropFilter: 'blur(4px)'
            }}>
                <Icon size={14} />
                {config.label}
            </div>
        );
    };

    // Formater la date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return 'Hier';
        if (diffDays < 7) return `Il y a ${diffDays} jours`;

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // 🔍 Fonction de filtrage (utilise les filtres appliqués)
    const getFilteredIncidents = () => {
        return incidents.filter(incident => {
            // Filtre par statut
            if (appliedFilters.status !== 'TOUS' && incident.statut !== appliedFilters.status) {
                return false;
            }

            // Filtre par type
            if (appliedFilters.type !== 'TOUS' && incident.typeIncident !== appliedFilters.type) {
                return false;
            }

            // Filtre par secteur
            if (appliedFilters.secteur !== 'TOUS' && incident.secteurNom !== appliedFilters.secteur) {
                return false;
            }

            return true;
        });
    };

    // Appliquer les filtres (au clic sur "Rechercher")
    const handleSearch = () => {
        setAppliedFilters({
            status: tempFilterStatus,
            type: tempFilterType,
            secteur: tempFilterSecteur
        });
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
        setTempFilterStatus('TOUS');
        setTempFilterType('TOUS');
        setTempFilterSecteur('TOUS');
        setAppliedFilters({
            status: 'TOUS',
            type: 'TOUS',
            secteur: 'TOUS'
        });
    };

    // Compter les filtres actifs
    const activeFiltersCount = Object.values(appliedFilters).filter(f => f !== 'TOUS').length;

    const filteredIncidents = getFilteredIncidents();

    // Loading state
    if (deviceIdLoading || (isLoading && !isRefreshing)) {
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '900px' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '4rem 1rem',
                        textAlign: 'center'
                    }}>
                        <Loader2 size={48} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: 'var(--text-secondary)' }}>Chargement de vos incidents...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PWAGuard>
            <div className="page">
                <div className="container" style={{ maxWidth: '900px' }}>
                    {/* En-tête */}
                    <div className="page-header" style={{ marginBottom: '2rem' }}>
                        <h1 className="page-title">
                            📋 Mes Incidents ({incidents.length})
                        </h1>
                        <p className="page-description">
                            Consultez l'état de tous vos signalements en temps réel
                        </p>

                        {/* Section UUID supprimée - Email recovery est maintenant la méthode principale */}


                        {/* Bouton rafraîchir */}
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.625rem 1.25rem',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%)',
                                    border: '1.5px solid rgba(96, 165, 250, 0.4)',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    cursor: isRefreshing ? 'not-allowed' : 'pointer',
                                    opacity: isRefreshing ? 0.6 : 1,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 2px 12px rgba(59, 130, 246, 0.2)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isRefreshing) {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.35)';
                                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.6)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(59, 130, 246, 0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)';
                                }}
                            >
                                <RefreshCw
                                    size={16}
                                    style={{
                                        animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
                                    }}
                                />
                                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                            </button>
                        </div>
                    </div>

                    {/* 🔍 Bouton Filtres (Mobile-Friendly) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem 1.25rem',
                                background: showFilters
                                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(96, 165, 250, 0.15) 100%)'
                                    : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)',
                                border: showFilters
                                    ? '2px solid rgba(96, 165, 250, 0.5)'
                                    : '1.5px solid rgba(96, 165, 250, 0.25)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: 'rgba(255, 255, 255, 0.95)',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: showFilters
                                    ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = showFilters
                                    ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Filter size={20} />
                                <span>Filtrer mes incidents</span>
                                {activeFiltersCount > 0 && (
                                    <span style={{
                                        padding: '0.25rem 0.6rem',
                                        background: '#3b82f6',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700'
                                    }}>
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </div>
                            <div style={{
                                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s'
                            }}>
                                ▼
                            </div>
                        </button>

                        {/* Panel de filtres */}
                        {showFilters && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1.25rem',
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(51, 65, 85, 0.7) 100%)',
                                border: '1.5px solid rgba(96, 165, 250, 0.3)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                {/* Filtre par statut */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgba(147, 197, 253, 0.95)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        📊 Statut
                                    </label>
                                    <select
                                        value={tempFilterStatus}
                                        onChange={(e) => setTempFilterStatus(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.7)',
                                            border: '1.5px solid rgba(96, 165, 250, 0.3)',
                                            borderRadius: '8px',
                                            color: 'rgba(255, 255, 255, 0.95)',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="TOUS">📊 Tous les statuts</option>
                                        <option value="REDIGE">⏳ En attente</option>
                                        <option value="VALIDE">✅ Validé</option>
                                        <option value="REJETE">❌ Rejeté</option>
                                        <option value="PRIS_EN_COMPTE">📝 Pris en compte</option>
                                        <option value="EN_COURS_DE_TRAITEMENT">🔄 En cours</option>
                                        <option value="TRAITE">✅ Traité</option>
                                    </select>
                                </div>

                                {/* Filtre par type */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgba(147, 197, 253, 0.95)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        🏷️ Type d'incident
                                    </label>
                                    <select
                                        value={tempFilterType}
                                        onChange={(e) => setTempFilterType(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.7)',
                                            border: '1.5px solid rgba(96, 165, 250, 0.3)',
                                            borderRadius: '8px',
                                            color: 'rgba(255, 255, 255, 0.95)',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="TOUS">🏷️ Tous les types</option>
                                        <option value="Voirie">🛳️ Voirie</option>
                                        <option value="Éclairage public">💡 Éclairage public</option>
                                        <option value="Assainissement">💧 Assainissement</option>
                                        <option value="Espaces verts">🌳 Espaces verts</option>
                                        <option value="Propreté">🧹 Propreté</option>
                                        <option value="Sécurité">🛡️ Sécurité</option>
                                        <option value="Transport">🚌 Transport</option>
                                        <option value="Autre">❓ Autre</option>
                                    </select>
                                </div>

                                {/* Filtre par secteur */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: 'rgba(147, 197, 253, 0.95)',
                                        marginBottom: '0.5rem'
                                    }}>
                                        🏛️ Secteur
                                    </label>
                                    <select
                                        value={tempFilterSecteur}
                                        onChange={(e) => setTempFilterSecteur(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(15, 23, 42, 0.7)',
                                            border: '1.5px solid rgba(96, 165, 250, 0.3)',
                                            borderRadius: '8px',
                                            color: 'rgba(255, 255, 255, 0.95)',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="TOUS">🏛️ Tous les secteurs</option>
                                        {secteurs.map(secteur => (
                                            <option key={secteur} value={secteur}>{secteur}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Boutons Action */}
                                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                                    {/* Bouton Rechercher */}
                                    <button
                                        onClick={handleSearch}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            padding: '0.875rem',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '0.9375rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.6)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
                                        }}
                                    >
                                        <Search size={18} />
                                        Rechercher
                                    </button>

                                    {/* Bouton réinitialiser */}
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={resetFilters}
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                padding: '0.875rem',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                fontSize: '0.9375rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.6)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.4)';
                                            }}
                                        >
                                            <X size={18} />
                                            Réinitialiser
                                        </button>
                                    )}
                                </div>

                                {/* Résultats */}
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(96, 165, 250, 0.3)',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    color: 'rgba(147, 197, 253, 0.95)',
                                    textAlign: 'center',
                                    fontWeight: '600'
                                }}>
                                    📊 {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} trouvé{filteredIncidents.length !== 1 ? 's' : ''}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message d'erreur */}
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Liste des incidents */}
                    {filteredIncidents.length === 0 ? (
                        <div className="card" style={{
                            padding: '3rem',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%)',
                            border: '1px solid rgba(96, 165, 250, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <AlertCircle size={64} style={{ color: 'rgba(156, 163, 175, 0.6)', marginBottom: '1rem' }} />
                            <h3 style={{ marginBottom: '0.75rem', color: 'rgba(255, 255, 255, 0.9)', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
                                Aucun incident déclaré
                            </h3>
                            <p style={{ color: 'rgba(226, 232, 240, 0.75)', marginBottom: '1.5rem' }}>
                                Vous n'avez pas encore signalé d'incident avec cet appareil.
                            </p>
                            <Link
                                to="/declarer-incident"
                                className="btn btn-primary"
                                style={{ display: 'inline-block' }}
                            >
                                Déclarer mon premier incident
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {filteredIncidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className="card"
                                    style={{
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(51, 65, 85, 0.7) 100%)',
                                        border: '1px solid rgba(96, 165, 250, 0.25)',
                                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.12), 0 2px 8px rgba(0, 0, 0, 0.1)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.25), 0 4px 16px rgba(96, 165, 250, 0.2)';
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.12), 0 2px 8px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.25)';
                                    }}
                                >
                                    {/* En-tête de l'incident */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '1rem',
                                        gap: '1rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        <div style={{ flex: 1, minWidth: '200px' }}>
                                            <h3 style={{
                                                fontSize: '1.125rem',
                                                fontWeight: '700',
                                                marginBottom: '0.5rem',
                                                color: 'rgba(255, 255, 255, 0.95)',
                                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                                            }}>
                                                {incident.typeIncident}
                                            </h3>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                fontSize: '0.875rem',
                                                color: 'rgba(226, 232, 240, 0.8)',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <FileText size={14} />
                                                    {incident.typeIncident}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Clock size={14} />
                                                    {formatDate(incident.dateDeclaration)}
                                                </span>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <MapPin size={14} />
                                                    {incident.secteurNom || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        {renderStatutBadge(incident.statut)}
                                    </div>

                                    {/* Description */}
                                    {incident.description && (
                                        <p style={{
                                            color: 'rgba(226, 232, 240, 0.85)',
                                            fontSize: '0.9375rem',
                                            lineHeight: '1.6',
                                            marginBottom: '1rem'
                                        }}>
                                            {incident.description.length > 200
                                                ? `${incident.description.substring(0, 200)}...`
                                                : incident.description
                                            }
                                        </p>
                                    )}

                                    {/* Photo */}
                                    {incident.photoUrl && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <img
                                                src={incident.photoUrl}
                                                alt="Photo incident"
                                                style={{
                                                    width: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'cover',
                                                    borderRadius: '12px',
                                                    border: '2px solid rgba(96, 165, 250, 0.3)',
                                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.15)'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Motif de rejet si applicable */}
                                    {incident.statut === 'REJETE' && incident.motifRejet && (
                                        <div style={{
                                            padding: '0.875rem',
                                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                            border: '1.5px solid rgba(239, 68, 68, 0.4)',
                                            borderRadius: '8px',
                                            marginBottom: '1rem',
                                            boxShadow: '0 2px 12px rgba(239, 68, 68, 0.15)'
                                        }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'rgba(254, 202, 202, 0.95)',
                                                margin: 0
                                            }}>
                                                <strong>Motif du rejet :</strong> {incident.motifRejet}
                                            </p>
                                        </div>
                                    )}

                                    {/* Description du traitement si applicable */}
                                    {incident.descriptionTraitement && (
                                        <div style={{
                                            padding: '0.875rem',
                                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                            border: '1.5px solid rgba(16, 185, 129, 0.4)',
                                            borderRadius: '8px',
                                            marginBottom: '1rem',
                                            boxShadow: '0 2px 12px rgba(16, 185, 129, 0.15)'
                                        }}>
                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'rgba(167, 243, 208, 0.95)',
                                                margin: 0
                                            }}>
                                                <strong>Retour du professionnel :</strong> {incident.descriptionTraitement}
                                            </p>
                                        </div>
                                    )}

                                    {/* Bouton voir sur la carte */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Link
                                            to={`/carte?incident=${incident.id}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.625rem 1.25rem',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                                color: 'white',
                                                borderRadius: '10px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.5)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                                            }}
                                        >
                                            <Eye size={16} />
                                            Voir sur la carte
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer informatif */}
                    <div className="card" style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.08) 100%)',
                        border: '1.5px solid rgba(96, 165, 250, 0.25)',
                        boxShadow: '0 2px 12px rgba(59, 130, 246, 0.12)',
                        backdropFilter: 'blur(6px)'
                    }}>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'rgba(191, 219, 254, 0.9)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                        }}>
                            <Info size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                            <span>
                                <strong>Confidentialité garantie :</strong> Vos incidents sont suivis de manière anonyme.
                                Aucune donnée personnelle n'est collectée. Votre identifiant unique est stocké uniquement
                                sur votre appareil.
                            </span>
                        </p>
                    </div>
                </div>

                {/* Animation CSS pour le spin */}
                <style>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
            </div>
        </PWAGuard>
    );
};

export default MesIncidents;
