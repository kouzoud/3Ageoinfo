import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Map,
  RefreshCw,
  X,
  List,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { incidentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';
import {
  SECTEURS,
  PROVINCES_MAP,
  STATUTS_INCIDENTS
} from '../data/constants';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

/**
 * Fonctions utilitaires
 */
const getStatut = (statutValue) => {
  return STATUTS_INCIDENTS.find(statut => statut.value === statutValue) ||
    { value: statutValue, label: statutValue, color: '#6b7280' };
};

const getSecteurInfo = (secteurId) => {
  const secteur = SECTEURS.find(s => s.id === secteurId);
  return secteur || { nom: 'Inconnu', color: '#6b7280' };
};

const getProvinceNom = (provinceId) => {
  const province = PROVINCES_MAP.find(p => p.id === provinceId);
  return province ? province.nom : null;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: fr });
  } catch {
    return 'N/A';
  }
};

/**
 * Page Liste des Incidents - Design Professionnel
 */
const Incidents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Utiliser le context partagé pour les filtres
  const { filters, updateFilters, resetFilters: resetGlobalFilters } = useFilters();

  // État local pour multi-sélection - TEMPORAIRE (avant de cliquer sur Chercher)
  const [tempSelectedSecteurs, setTempSelectedSecteurs] = useState([]);
  const [tempSelectedProvinces, setTempSelectedProvinces] = useState([]);
  const [tempSelectedStatuts, setTempSelectedStatuts] = useState([]);

  // État APPLIQUÉ (après avoir cliqué sur Chercher)
  const [appliedSecteurs, setAppliedSecteurs] = useState([]);
  const [appliedProvinces, setAppliedProvinces] = useState([]);
  const [appliedStatuts, setAppliedStatuts] = useState([]);

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' ou 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('dateDeclaration');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    },
    header: {
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      borderRadius: '20px',
      padding: '28px 32px',
      marginBottom: '24px',
      boxShadow: '0 10px 40px rgba(30, 58, 138, 0.25)',
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
    statsBar: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap'
    },
    statBadge: {
      background: 'rgba(255, 255, 255, 0.15)',
      padding: '8px 16px',
      borderRadius: '10px',
      color: '#fff',
      fontSize: '0.85rem',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    searchBar: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '16px 20px',
      marginBottom: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 44px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    filtersContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      position: 'relative',
      zIndex: 100
    },
    filterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginTop: '16px'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      border: '2px solid #e2e8f0',
      fontSize: '0.9rem',
      outline: 'none',
      background: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    tableContainer: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.18)'
    },
    tableHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '14px 16px',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: '#f8fafc',
      borderBottom: '2px solid #e2e8f0'
    },
    td: {
      padding: '16px',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'middle'
    },
    row: {
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    pagination: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 20px',
      borderTop: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '12px'
    },
    pageBtn: {
      padding: '8px 14px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      background: '#fff',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    card: {
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    sectorBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    actionBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: '600',
      transition: 'all 0.2s ease'
    }
  };

  const statusColors = {
    'REDIGE': { bg: '#f3f4f6', color: '#6b7280', icon: Clock },
    'PRISE_EN_COMPTE': { bg: '#ede9fe', color: '#7c3aed', icon: Eye },
    'VALIDE': { bg: '#dbeafe', color: '#2563eb', icon: CheckCircle },
    'EN_COURS_DE_TRAITEMENT': { bg: '#fef3c7', color: '#d97706', icon: Clock },
    'TRAITE': { bg: '#d1fae5', color: '#059669', icon: CheckCircle },
    'REJETE': { bg: '#fee2e2', color: '#dc2626', icon: XCircle },
    'BLOQUE': { bg: '#fee2e2', color: '#991b1b', icon: AlertCircle }
  };

  // Fetch incidents
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentsAPI.getAll();
      setIncidents(data);
    } catch (err) {
      console.error("Erreur:", err);
      setError("Impossible de charger les incidents. Vérifiez que le backend est démarré.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted incidents
  const processedIncidents = useMemo(() => {
    let result = [...incidents];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.description?.toLowerCase().includes(query) ||
        String(i.id).includes(query)
      );
    }

    // Secteur filter (multi-sélection) - utiliser les filtres APPLIQUÉS
    if (appliedSecteurs.length > 0) {
      result = result.filter(i => appliedSecteurs.includes(i.secteurId));
    }

    // Province filter (multi-sélection)
    if (appliedProvinces.length > 0) {
      result = result.filter(i => appliedProvinces.includes(i.province));
    }

    // Status filter (multi-sélection)
    if (appliedStatuts.length > 0) {
      result = result.filter(i => appliedStatuts.includes(i.statut));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'dateDeclaration') {
        valA = new Date(valA || 0);
        valB = new Date(valB || 0);
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return result;
  }, [incidents, searchQuery, appliedSecteurs, appliedProvinces, appliedStatuts, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedIncidents.length / itemsPerPage);
  const paginatedIncidents = processedIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = processedIncidents.length;
    const valides = processedIncidents.filter(i => i.statut === 'VALIDE' || i.statut === 'TRAITE').length;
    const enCours = processedIncidents.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length;
    // Autres = tous les incidents qui ne sont ni VALIDE/TRAITE ni EN_COURS
    const autres = total - valides - enCours;

    return { total, valides, enCours, autres };
  }, [processedIncidents]);



  // Fonction pour appliquer les filtres manuellement
  const handleSearch = () => {
    // Copier les sélections temporaires vers les appliquées
    setAppliedSecteurs(tempSelectedSecteurs);
    setAppliedProvinces(tempSelectedProvinces);
    setAppliedStatuts(tempSelectedStatuts);
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    // Réinitialiser les sélections temporaires
    setTempSelectedSecteurs([]);
    setTempSelectedProvinces([]);
    setTempSelectedStatuts([]);

    // Réinitialiser aussi les filtres appliqués
    setAppliedSecteurs([]);
    setAppliedProvinces([]);
    setAppliedStatuts([]);

    // Réinitialiser aussi la recherche locale
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Export CSV
  // Modal handlers
  const openActionModal = (incident, action) => {
    setSelectedIncident(incident);
    setModalAction(action);
    setMotif('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
    setModalAction(null);
    setMotif('');
  };

  const openDetailModal = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleSubmitAction = async () => {
    if (modalAction === 'rejeter' && !motif.trim()) {
      alert('⚠️ Le motif de rejet est obligatoire !');
      return;
    }

    setSubmitting(true);
    try {
      if (modalAction === 'valider') {
        await adminAPI.validerIncident(selectedIncident.id);
        alert('✅ Incident validé avec succès !');
      } else {
        await adminAPI.rejeterIncident(selectedIncident.id, motif);
        alert('✅ Incident rejeté !');
      }
      await fetchIncidents();
      closeModal();
    } catch (err) {
      alert('❌ Erreur : ' + err.message);
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
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <p style={{ color: '#64748b' }}>Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Erreur de connexion</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={fetchIncidents}
            style={{
              ...styles.actionBtn,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff'
            }}
          >
            <RefreshCw size={16} /> Réessayer
          </button>
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
            <List size={28} />
          </div>
          <div>
            <h1 style={styles.title}>Liste des Incidents</h1>
            <p style={styles.subtitle}>
              {processedIncidents.length} incident(s) trouvé(s)
            </p>
          </div>
        </div>
        <div style={styles.statsBar}>
          <div style={styles.statBadge}>
            <CheckCircle size={16} />
            {stats.valides} traités
          </div>
          <div style={styles.statBadge}>
            <Clock size={16} />
            {stats.enCours} en cours
          </div>
          <div style={styles.statBadge}>
            <AlertCircle size={16} />
            {stats.autres} autres
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={styles.searchBar}>
        <div style={{ position: 'relative', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }} />
            <input
              type="text"
              placeholder="Rechercher un incident par description ou ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={styles.searchInput}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...styles.actionBtn,
              background: showFilters ? '#3b82f6' : '#f1f5f9',
              color: showFilters ? '#fff' : '#64748b'
            }}
          >
            <Filter size={18} />
            Filtres
            <ChevronDown size={16} style={{
              transform: showFilters ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s'
            }} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={styles.filtersContainer}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: '600' }}>
              🎛️ Filtres Avancés
            </h3>
            <button
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Réinitialiser
            </button>
          </div>
          <div style={styles.filterGrid}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#64748b',
                marginBottom: '6px',
                fontWeight: '500'
              }}>
                Secteur
              </label>
              <MultiSelectDropdown
                label="Secteur"
                options={SECTEURS.map(s => ({ value: s.id, label: s.nom }))}
                selectedValues={tempSelectedSecteurs}
                onChange={setTempSelectedSecteurs}
                placeholder="Tous les secteurs"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#64748b',
                marginBottom: '6px',
                fontWeight: '500'
              }}>
                Province
              </label>
              <MultiSelectDropdown
                label="Province"
                options={PROVINCES_MAP.map(p => ({ value: p.nom, label: p.nom }))}
                selectedValues={tempSelectedProvinces}
                onChange={setTempSelectedProvinces}
                placeholder="Toutes les provinces"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                color: '#64748b',
                marginBottom: '6px',
                fontWeight: '500'
              }}>
                Statut
              </label>
              <MultiSelectDropdown
                label="Statut"
                options={STATUTS_INCIDENTS.map(s => ({ value: s.value, label: s.label }))}
                selectedValues={tempSelectedStatuts}
                onChange={setTempSelectedStatuts}
                placeholder="Tous les statuts"
              />
            </div>

            {/* Bouton Chercher */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleSearch}
                style={{
                  ...styles.actionBtn,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  width: '100%'
                }}
              >
                🔍 Chercher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={styles.tableContainer}>
        {/* Table Header */}
        <div style={styles.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Afficher
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.85rem'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
              par page
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                ...styles.pageBtn,
                background: viewMode === 'table' ? '#3b82f6' : '#fff',
                color: viewMode === 'table' ? '#fff' : '#64748b',
                borderColor: viewMode === 'table' ? '#3b82f6' : '#e2e8f0'
              }}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                ...styles.pageBtn,
                background: viewMode === 'cards' ? '#3b82f6' : '#fff',
                color: viewMode === 'cards' ? '#fff' : '#64748b',
                borderColor: viewMode === 'cards' ? '#3b82f6' : '#e2e8f0'
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={fetchIncidents}
              style={{ ...styles.pageBtn, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {paginatedIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <AlertCircle size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#64748b', marginBottom: '8px' }}>Aucun incident trouvé</h3>
            <p style={{ color: '#94a3b8' }}>Modifiez vos critères de recherche</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Type / Description</th>
                  <th style={styles.th}>Secteur</th>
                  <th style={styles.th}>Province</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Date</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Localisation</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIncidents.map((incident, idx) => {
                  const secteur = getSecteurInfo(incident.secteurId);
                  const statusStyle = statusColors[incident.statut] || statusColors.REDIGE;
                  const StatusIcon = statusStyle.icon;

                  return (
                    <tr
                      key={incident.id}
                      style={{
                        ...styles.row,
                        background: idx % 2 === 0 ? '#fff' : '#fafafa'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#fff' : '#fafafa'}
                      onClick={() => openDetailModal(incident)}
                    >
                      <td style={styles.td}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            {incident.typeIncident || 'Incident'}
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#64748b',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {incident.description}
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.sectorBadge,
                          background: `${secteur.color}20`,
                          color: secteur.color
                        }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: secteur.color
                          }} />
                          {secteur.nom}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                          <MapPin size={14} />
                          {incident.province || (
                            <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Non renseigné</span>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: statusStyle.bg,
                          color: statusStyle.color
                        }}>
                          <StatusIcon size={12} />
                          {getStatut(incident.statut).label}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                          <Calendar size={14} />
                          {formatDate(incident.dateDeclaration)}
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            // Navigate to map with incident (zoom to level 18)
                            navigate(`/carte?incident=${incident.id}`);
                          }}
                          style={{
                            ...styles.actionBtn,
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: '#fff',
                            padding: '8px 14px',
                            fontSize: '0.8rem',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                          }}
                        >
                          <Map size={14} />
                          Voir sur carte
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div style={{
            padding: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {paginatedIncidents.map((incident) => {
              const secteur = getSecteurInfo(incident.secteurId);
              const statusStyle = statusColors[incident.statut] || statusColors.REDIGE;
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={incident.id}
                  style={styles.card}
                  onClick={() => openDetailModal(incident)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                      background: statusStyle.bg,
                      color: statusStyle.color
                    }}>
                      <StatusIcon size={12} />
                      {getStatut(incident.statut).label}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '1rem' }}>
                    {incident.typeIncident || 'Incident'}
                  </h4>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    margin: '0 0 16px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {incident.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <span style={{
                      ...styles.sectorBadge,
                      background: `${secteur.color}20`,
                      color: secteur.color
                    }}>
                      {secteur.nom}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {formatDate(incident.dateDeclaration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Page {currentPage} sur {totalPages} · {processedIncidents.length} résultat(s)
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...styles.pageBtn,
                      background: currentPage === page ? '#3b82f6' : '#fff',
                      color: currentPage === page ? '#fff' : '#64748b',
                      borderColor: currentPage === page ? '#3b82f6' : '#e2e8f0'
                    }}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.pageBtn,
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && (
        <div style={{
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
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: modalAction === 'valider' ? '#059669' : '#dc2626'
              }}>
                {modalAction === 'valider' ? <CheckCircle size={24} /> : <XCircle size={24} />}
                {modalAction === 'valider' ? 'Valider l\'incident' : 'Rejeter l\'incident'}
              </h3>
              <button
                onClick={closeModal}
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
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                  Incident #{selectedIncident?.id}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>
                  {selectedIncident?.description}
                </p>
              </div>

              {modalAction === 'rejeter' && (
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Motif de rejet <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    placeholder="Expliquez la raison du rejet..."
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
                    onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              )}

              {modalAction === 'valider' && (
                <div style={{
                  background: '#d1fae5',
                  borderRadius: '10px',
                  padding: '14px',
                  border: '1px solid #86efac'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#166534' }}>
                    ✅ L'incident sera validé et publié. Les professionnels pourront le consulter.
                  </p>
                </div>
              )}
            </div>
            <div style={{
              padding: '16px 24px 24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeModal}
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
                onClick={handleSubmitAction}
                disabled={submitting}
                style={{
                  ...styles.actionBtn,
                  background: modalAction === 'valider'
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'En cours...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedIncident && (
        <div style={{
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
        }} onClick={() => setShowDetailModal(false)}>
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{
                  background: '#eff6ff',
                  color: '#2563eb',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}>
                  Incident #{selectedIncident.id}
                </span>
              </div>
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

              {/* Photo de l'incident */}
              {selectedIncident.photoUrl && (
                <div style={{
                  marginBottom: '20px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}>
                  <img
                    src={selectedIncident.photoUrl}
                    alt="Photo de l'incident"
                    style={{
                      width: '100%',
                      maxHeight: '350px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Secteur</label>
                  <span style={{
                    ...styles.sectorBadge,
                    background: `${getSecteurInfo(selectedIncident.secteurId).color}20`,
                    color: getSecteurInfo(selectedIncident.secteurId).color
                  }}>
                    {getSecteurInfo(selectedIncident.secteurId).nom}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Statut</label>
                  <span style={{
                    ...styles.statusBadge,
                    background: (statusColors[selectedIncident.statut] || statusColors.REDIGE).bg,
                    color: (statusColors[selectedIncident.statut] || statusColors.REDIGE).color
                  }}>
                    {getStatut(selectedIncident.statut).label}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Province</label>
                  <span style={{ color: '#1e293b' }}>
                    {selectedIncident.province || 'Non renseigné'}
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Date</label>
                  <span style={{ color: '#1e293b' }}>
                    {formatDate(selectedIncident.dateDeclaration)}
                  </span>
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

export default Incidents;