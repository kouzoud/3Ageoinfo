import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { incidentsAPI, professionnelAPI } from '../services/api';
import { showToast } from '../components/Toast';
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  X,
  ArrowRight,
  Loader2,
  FileText,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Play,
  Pause,
  Check,
  Ban,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SECTEURS } from '../data/constants';

/**
 * Page de Gestion des Incidents pour Professionnels - Design Professionnel
 */
const GestionIncidentsPro = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Statuts disponibles pour les professionnels avec hiérarchie
  const STATUTS_PRO = [
    { value: 'PRIS_EN_COMPTE', label: 'Pris en compte', color: '#6366f1', icon: Eye, description: 'Vous avez vu l\'incident et allez le traiter', ordre: 1 },
    { value: 'EN_COURS_DE_TRAITEMENT', label: 'En cours de traitement', color: '#f59e0b', icon: Play, description: 'Vous êtes en train de résoudre le problème', ordre: 2 },
    { value: 'TRAITE', label: 'Traité', color: '#10b981', icon: Check, description: 'Le problème est résolu (description obligatoire)', ordre: 3 },
    { value: 'BLOQUE', label: 'Bloqué', color: '#ef4444', icon: Ban, description: 'Impossible de traiter pour l\'instant (motif obligatoire)', ordre: 99 },
    { value: 'REDIRIGE', label: 'Redirigé', color: '#8b5cf6', icon: Share2, description: 'Transféré vers un autre service', ordre: 99 }
  ];

  // Fonction pour vérifier si un statut peut être sélectionné
  const isStatusDisabled = (statutValue, currentStatut) => {
    if (!currentStatut) return false;

    // Bloquer si c'est le statut actuel (on ne peut pas resélectionner le même)
    if (statutValue === currentStatut) return true;

    const currentStatutInfo = STATUTS_PRO.find(s => s.value === currentStatut);
    const targetStatutInfo = STATUTS_PRO.find(s => s.value === statutValue);

    if (!currentStatutInfo || !targetStatutInfo) return false;

    // Si le statut actuel est BLOQUE ou REDIRIGE, on peut changer vers n'importe quel statut (sauf lui-même)
    if (currentStatutInfo.ordre === 99) return false;

    // Si le statut cible est BLOQUE ou REDIRIGE, toujours autorisé
    if (targetStatutInfo.ordre === 99) return false;

    // Bloquer les retours en arrière ET les statuts de même niveau
    return targetStatutInfo.ordre <= currentStatutInfo.ordre;
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    },
    header: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      borderRadius: '20px',
      padding: '28px 32px',
      marginBottom: '24px',
      boxShadow: '0 10px 40px rgba(124, 58, 237, 0.25)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '16px'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    headerIcon: {
      width: '56px',
      height: '56px',
      borderRadius: '14px',
      background: 'rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#fff',
      margin: 0
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      margin: '4px 0 0 0',
      fontSize: '0.95rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    searchBar: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      flex: 1,
      minWidth: '200px',
      padding: '12px 16px 12px 44px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    incidentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '20px'
    },
    incidentCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      transition: 'all 0.3s ease'
    },
    cardHeader: {
      padding: '20px',
      borderBottom: '1px solid #f1f5f9',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px'
    },
    cardBody: {
      padding: '20px'
    },
    cardFooter: {
      padding: '16px 20px',
      background: '#f8fafc',
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    actionBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 16px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      background: '#fff',
      borderRadius: '20px',
      maxWidth: '560px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    }
  };

  const statusColors = {
    'REDIGE': { bg: '#f3f4f6', color: '#6b7280' },
    'PRIS_EN_COMPTE': { bg: '#ede9fe', color: '#7c3aed' },
    'VALIDE': { bg: '#dbeafe', color: '#2563eb' },
    'EN_COURS_DE_TRAITEMENT': { bg: '#fef3c7', color: '#d97706' },
    'TRAITE': { bg: '#d1fae5', color: '#059669' },
    'REJETE': { bg: '#fee2e2', color: '#dc2626' },
    'BLOQUE': { bg: '#fee2e2', color: '#991b1b' },
    'REDIRIGE': { bg: '#ede9fe', color: '#7c3aed' }
  };

  // Fetch incidents
  useEffect(() => {
    fetchIncidents();
  }, [user]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer tous les incidents
      const data = await incidentsAPI.getAll();

      // Filtrer par secteur du professionnel ET par statut validé ou suivant
      const secteurProId = user?.secteurId || user?.secteurAffectate || user?.secteur?.id;

      const filteredData = data.filter(i => {
        // Vérifier que l'incident est validé par l'admin ou en cours de traitement
        const isValidStatus =
          i.statut === 'VALIDE' ||
          i.statut === 'PRIS_EN_COMPTE' ||
          i.statut === 'EN_COURS_DE_TRAITEMENT' ||
          i.statut === 'TRAITE' ||
          i.statut === 'BLOQUE' ||
          i.statut === 'REDIRIGE';

        // Si le professionnel a un secteur, filtrer par ce secteur
        // Sinon, montrer tous les incidents validés
        const matchesSector = secteurProId ? i.secteurId === secteurProId : true;

        return isValidStatus && matchesSector;
      });

      setIncidents(filteredData);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les incidents.');
    } finally {
      setLoading(false);
    }
  };

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    let result = [...incidents];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.description?.toLowerCase().includes(query) ||
        String(i.id).includes(query)
      );
    }

    if (statusFilter !== 'tous') {
      result = result.filter(i => i.statut === statusFilter);
    }

    return result;
  }, [incidents, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const enCours = incidents.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length;
    const traites = incidents.filter(i => i.statut === 'TRAITE').length;
    const bloques = incidents.filter(i => i.statut === 'BLOQUE').length;
    const rediriges = incidents.filter(i => i.statut === 'REDIRIGE').length;
    // Autres = VALIDE + PRIS_EN_COMPTE
    const autres = incidents.filter(i =>
      i.statut === 'VALIDE' || i.statut === 'PRIS_EN_COMPTE'
    ).length;

    return { total, enCours, traites, bloques, rediriges, autres };
  }, [incidents]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
    } catch {
      return 'N/A';
    }
  };

  const getSecteurInfo = (secteurId) => {
    const secteur = SECTEURS?.find(s => s.id === secteurId);
    return secteur || { nom: 'Inconnu', color: '#6b7280' };
  };

  const getStatusInfo = (statut) => {
    return statusColors[statut] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const getStatusLabel = (statut) => {
    const labels = {
      'REDIGE': 'Rédigé',
      'PRIS_EN_COMPTE': 'Pris en compte',
      'VALIDE': 'Validé',
      'EN_COURS_DE_TRAITEMENT': 'En cours',
      'TRAITE': 'Traité',
      'REJETE': 'Rejeté',
      'BLOQUE': 'Bloqué',
      'REDIRIGE': 'Redirigé'
    };
    return labels[statut] || statut;
  };

  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus('');
    setStatusComment('');
    setShowStatusModal(true);
  };

  const openDetailModal = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedIncident || !newStatus) {
      showToast('❌ Veuillez sélectionner un statut', 'error', 3000);
      return;
    }

    // Vérifier si un commentaire est requis
    if ((newStatus === 'TRAITE' || newStatus === 'BLOQUE') && !statusComment.trim()) {
      showToast('❌ Un commentaire est obligatoire pour ce statut', 'error', 5000);
      return;
    }

    setSubmitting(true);
    try {
      // Appel API pour mettre à jour le statut
      await professionnelAPI.updateStatus(selectedIncident.id, {
        statut: newStatus,
        commentaire: statusComment
      });

      showToast(`✅ Statut mis à jour avec succès vers "${getStatusLabel(newStatus)}"`, 'success', 5000);
      await fetchIncidents(); // Recharger la liste
      setShowStatusModal(false);
      setSelectedIncident(null);
      setNewStatus('');
      setStatusComment('');
    } catch (err) {
      console.error('Erreur:', err);
      showToast(`❌ Erreur lors de la mise à jour: ${err.message || 'Erreur inconnue'} `, 'error', 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px'
        }}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#7c3aed' }} />
          <p style={{ color: '#64748b' }}>Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Briefcase size={28} />
          </div>
          <div>
            <h1 style={styles.title}>Mes Incidents</h1>
            <p style={styles.subtitle}>
              Bienvenue {user?.prenom} - Gérez vos interventions
            </p>
          </div>
        </div>
        <button
          onClick={fetchIncidents}
          style={{
            ...styles.actionBtn,
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#fff'
          }}
        >
          <RefreshCw size={18} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{stats.total}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total incidents</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <Clock size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{stats.enCours}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>En cours</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CheckCircle size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{stats.traites}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Traités</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <AlertCircle size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{stats.bloques}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Bloqués</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>{stats.autres}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Autres</div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={styles.searchBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Rechercher un incident..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            border: '2px solid #e2e8f0',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer',
            background: '#fff'
          }}
        >
          <option value="tous">Tous les statuts</option>
          <option value="VALIDE">Validé</option>
          <option value="PRISE_EN_COMPTE">Pris en compte</option>
          <option value="EN_COURS_DE_TRAITEMENT">En cours</option>
          <option value="TRAITE">Traité</option>
          <option value="BLOQUE">Bloqué</option>
          <option value="REDIRIGE">Redirigé</option>
        </select>
      </div>

      {/* Incidents Grid */}
      {filteredIncidents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#64748b', marginBottom: '8px' }}>Aucun incident trouvé</h3>
          <p style={{ color: '#94a3b8' }}>Modifiez vos critères de recherche</p>
        </div>
      ) : (
        <div style={styles.incidentsGrid}>
          {filteredIncidents.map((incident) => {
            const secteur = getSecteurInfo(incident.secteurId);
            const statusInfo = getStatusInfo(incident.statut);

            return (
              <div
                key={incident.id}
                style={styles.incidentCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.06)';
                }}
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        #{incident.id}
                      </span>
                      <span style={{
                        ...styles.statusBadge,
                        background: statusInfo.bg,
                        color: statusInfo.color
                      }}>
                        {getStatusLabel(incident.statut)}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: '600' }}>
                      {incident.typeIncident || 'Incident'}
                    </h3>
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: `${secteur.color} 20`,
                    color: secteur.color
                  }}>
                    {secteur.nom}
                  </span>
                </div>

                {/* Card Body */}
                <div style={styles.cardBody}>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {incident.description || 'Aucune description'}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      {incident.province || 'Non renseigné'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {formatDate(incident.dateDeclaration)}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => openDetailModal(incident)}
                    style={{
                      ...styles.actionBtn,
                      background: '#f1f5f9',
                      color: '#64748b'
                    }}
                  >
                    <Eye size={16} />
                    Détails
                  </button>
                  <button
                    onClick={() => openStatusModal(incident)}
                    style={{
                      ...styles.actionBtn,
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    <Settings size={16} />
                    Traiter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedIncident && (
        <div style={styles.modal} onClick={() => setShowStatusModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
                  🔧 Traiter l'incident #{selectedIncident.id}
                </h2>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Incident Summary */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
                  {selectedIncident.typeIncident}
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                  {selectedIncident.description}
                </p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b' }}>
                    <strong>Secteur:</strong> {getSecteurInfo(selectedIncident.secteurId).nom}
                  </span>
                  <span style={{ color: '#64748b' }}>
                    <strong>Type:</strong> {selectedIncident.typeIncident || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Status Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.95rem'
                }}>
                  Nouveau statut <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {STATUTS_PRO.map((statut) => {
                    const Icon = statut.icon;
                    const isSelected = newStatus === statut.value;
                    const isDisabled = isStatusDisabled(statut.value, selectedIncident.statut);

                    return (
                      <div
                        key={statut.value}
                        onClick={() => !isDisabled && setNewStatus(statut.value)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          border: `2px solid ${isSelected ? statut.color : (isDisabled ? '#e2e8f0' : '#e2e8f0')}`,
                          background: isSelected ? `${statut.color}10` : (isDisabled ? '#f8fafc' : '#fff'),
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        {isDisabled && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#ef4444',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600'
                          }}>
                            ⛔ Bloqué
                          </div>
                        )}
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isDisabled ? '#cbd5e1' : statut.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={18} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: isDisabled ? '#94a3b8' : '#1e293b', marginBottom: '2px' }}>
                            {statut.label}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: isDisabled ? '#cbd5e1' : '#64748b' }}>
                            {statut.description}
                          </div>
                        </div>
                        {isSelected && !isDisabled && (
                          <CheckCircle size={20} color={statut.color} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#1e293b',
                  fontSize: '0.95rem'
                }}>
                  Commentaire {(newStatus === 'TRAITE' || newStatus === 'BLOQUE') && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder={
                    newStatus === 'TRAITE'
                      ? 'Décrivez comment le problème a été résolu...'
                      : newStatus === 'BLOQUE'
                        ? 'Expliquez pourquoi l\'incident est bloqué...'
                        : 'Ajoutez un commentaire (optionnel)...'
                  }
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Guide */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#eff6ff',
                borderRadius: '10px',
                border: '1px solid #bfdbfe'
              }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '0.9rem' }}>
                  📋 Guide des statuts :
                </h5>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#1e40af', lineHeight: '1.6' }}>
                  <li><strong>Pris en compte :</strong> Vous avez vu l'incident et allez le traiter</li>
                  <li><strong>En cours :</strong> Vous êtes en train de résoudre le problème</li>
                  <li><strong>Traité :</strong> Le problème est résolu (description obligatoire)</li>
                  <li><strong>Bloqué :</strong> Impossible de traiter pour l'instant (motif obligatoire)</li>
                  <li><strong>Redirigé :</strong> Transféré vers un autre service</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={submitting}
                style={{
                  ...styles.actionBtn,
                  background: '#f1f5f9',
                  color: '#64748b'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={submitting || !newStatus}
                style={{
                  ...styles.actionBtn,
                  background: newStatus ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : '#e2e8f0',
                  color: newStatus ? '#fff' : '#94a3b8',
                  opacity: submitting ? 0.7 : 1,
                  boxShadow: newStatus ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none'
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedIncident && (
        <div style={styles.modal} onClick={() => setShowDetailModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Incident #{selectedIncident.id}
              </span>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>
                {selectedIncident.typeIncident || 'Incident'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Secteur</label>
                  <span style={{ color: '#1e293b', fontWeight: '500' }}>{getSecteurInfo(selectedIncident.secteurId).nom}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Statut</label>
                  <span style={{
                    ...styles.statusBadge,
                    background: getStatusInfo(selectedIncident.statut).bg,
                    color: getStatusInfo(selectedIncident.statut).color
                  }}>
                    {getStatusLabel(selectedIncident.statut)}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Province</label>
                  <span style={{ color: '#1e293b' }}>{selectedIncident.province || 'Non renseigné'}</span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Date</label>
                  <span style={{ color: '#1e293b' }}>{formatDate(selectedIncident.dateDeclaration)}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Description</label>
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '16px',
                  color: '#475569',
                  lineHeight: '1.6'
                }}>
                  {selectedIncident.description || 'Aucune description'}
                </div>
              </div>

              {/* Photo de l'incident */}
              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Photo</label>
                {selectedIncident.photoUrl ? (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '2px solid rgba(96, 165, 250, 0.2)',
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
                  }}>
                    <img
                      src={selectedIncident.photoUrl}
                      alt="Photo de l'incident"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div style={{
                      display: 'none',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontStyle: 'italic'
                    }}>
                      Impossible de charger l'image
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontStyle: 'italic'
                  }}>
                    📷 Aucune photo fournie
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    // Navigate to map with incident (zoom to level 18)
                    navigate(`/ carte ? incident = ${selectedIncident.id} `);
                  }}
                  style={{
                    ...styles.actionBtn,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff'
                  }}
                >
                  <MapPin size={16} />
                  Voir sur carte
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openStatusModal(selectedIncident);
                  }}
                  style={{
                    ...styles.actionBtn,
                    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                    color: '#fff'
                  }}
                >
                  <Settings size={16} />
                  Traiter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
@keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
}
`}</style>
    </div>
  );
};

export default GestionIncidentsPro;