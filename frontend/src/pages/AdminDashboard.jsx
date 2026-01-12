import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, secteursAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Eye, X, Clock, MapPin, User, Calendar, AlertTriangle, ExternalLink,
  ThumbsUp, ThumbsDown, UserPlus, Edit, Trash2
} from 'lucide-react';
import { showToast } from '../components/Toast';

/**
 * Page d'administration
 * Permet de valider/rejeter les incidents et gérer les utilisateurs
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // États pour les onglets - lire le paramètre URL 'tab' si présent
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl === 'utilisateurs' ? 'utilisateurs' : 'incidents';
  });

  // États pour les incidents
  const [incidentsEnAttente, setIncidentsEnAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les utilisateurs
  const [professionnels, setProfessionnels] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  // États pour les modales
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isRejetModalOpen, setIsRejetModalOpen] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');

  // États pour le modal de détails
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsIncident, setDetailsIncident] = useState(null);

  // États pour le formulaire professionnel
  const [isProfessionnelModalOpen, setIsProfessionnelModalOpen] = useState(false);
  const [editingProfessionnel, setEditingProfessionnel] = useState(null);
  const [professionnelForm, setProfessionnelForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    secteurAffectate: '',
    typeIncident: ''
  });

  // Mettre à jour l'onglet si le paramètre URL change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'utilisateurs') {
      setActiveTab('utilisateurs');
    }
  }, [searchParams]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'incidents') {
        const incidents = await adminAPI.getIncidentsEnAttente();
        setIncidentsEnAttente(incidents);
      } else {
        const [pros, secs] = await Promise.all([
          adminAPI.getAllProfessionnels(),
          secteursAPI.getAll()
        ]);
        setProfessionnels(pros);
        setSecteurs(secs);
      }
    } catch (err) {
      console.error('Erreur de chargement:', err);
      showToast(`❌ Erreur lors du chargement des données: ${err.message || 'Erreur inconnue'}`, 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valider un incident
   */
  const handleValider = async (incidentId) => {
    try {
      await adminAPI.validerIncident(incidentId);
      showToast('✅ Incident validé et publié avec succès !', 'success', 5000);
      await loadData(); // Recharger la liste
    } catch (err) {
      console.error('Erreur validation:', err);
      showToast(`❌ Erreur lors de la validation : ${err.message || 'Erreur inconnue'}`, 'error', 5000);
    }
  };

  /**
   * Ouvrir le modal de rejet
   */
  const openRejetModal = (incident) => {
    console.log('🔴 Ouverture du modal de rejet pour:', incident);
    setSelectedIncident(incident);
    setMotifRejet('');
    setIsRejetModalOpen(true);
  };

  /**
   * Ouvrir le modal de détails d'un incident
   */
  const openDetailsModal = (incident) => {
    console.log('👁️ Ouverture du modal de détails pour:', incident);
    setDetailsIncident(incident);
    setIsDetailsModalOpen(true);
  };

  /**
   * Rejeter un incident
   */
  const handleRejeter = async () => {
    console.log('🔴 handleRejeter appelé', { selectedIncident, motifRejet });

    // Validation du motif
    if (!motifRejet.trim()) {
      showToast('⚠️ Le motif de rejet est obligatoire !', 'warning', 3000);
      return;
    }

    if (motifRejet.trim().length < 10) {
      showToast('⚠️ Le motif de rejet doit contenir au moins 10 caractères !', 'warning', 3000);
      return;
    }

    try {
      console.log('📤 Envoi de la requête de rejet...', {
        incidentId: selectedIncident.id,
        motif: motifRejet
      });

      await adminAPI.rejeterIncident(selectedIncident.id, motifRejet);

      console.log('✅ Incident rejeté avec succès');
      showToast('✅ Incident rejeté avec succès !', 'success', 5000);

      // Fermer le modal et réinitialiser
      setIsRejetModalOpen(false);
      setSelectedIncident(null);
      setMotifRejet('');

      // Recharger les données
      await loadData();
    } catch (err) {
      console.error('❌ Erreur lors du rejet:', err);
      showToast(`❌ Erreur lors du rejet : ${err.message || 'Erreur inconnue'}`, 'error', 5000);
    }
  };

  /**
   * Ouvrir le modal de création/modification de professionnel
   */
  const openProfessionnelModal = async (pro = null) => {
    // Charger les secteurs si pas déjà chargés
    if (secteurs.length === 0) {
      try {
        console.log('📡 Chargement des secteurs...');
        const secs = await secteursAPI.getAll();
        console.log('✅ Secteurs chargés:', secs);
        setSecteurs(secs);
      } catch (err) {
        console.error('❌ Erreur chargement secteurs:', err);
        showToast(`❌ Erreur lors du chargement des secteurs: ${err.message || 'Erreur inconnue'}`, 'error', 5000);
        return;
      }
    }

    if (pro) {
      setEditingProfessionnel(pro);
      setProfessionnelForm({
        nom: pro.nom || '',
        prenom: pro.prenom || '',
        email: pro.email || '',
        motDePasse: '', // Ne pas préremplir le mot de passe
        telephone: pro.telephone || '',
        secteurAffectate: pro.secteurAffectate || pro.secteur?.id || '',
        typeIncident: pro.typeIncident || ''
      });
    } else {
      setEditingProfessionnel(null);
      setProfessionnelForm({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        telephone: '',
        secteurAffectate: '',
        typeIncident: ''
      });
    }
    setIsProfessionnelModalOpen(true);
  };

  /**
   * Sauvegarder un professionnel
   */
  const handleSaveProfessionnel = async (e) => {
    e.preventDefault();

    // Validation
    if (!professionnelForm.nom || !professionnelForm.email) {
      showToast('⚠️ Nom et email sont obligatoires !', 'warning', 3000);
      return;
    }

    if (!editingProfessionnel && !professionnelForm.motDePasse) {
      showToast('⚠️ Le mot de passe est obligatoire pour un nouveau professionnel !', 'warning', 3000);
      return;
    }

    try {
      if (editingProfessionnel) {
        // Modification
        const dataToUpdate = { ...professionnelForm };
        if (!dataToUpdate.motDePasse) {
          delete dataToUpdate.motDePasse; // Ne pas envoyer le mot de passe vide
        }
        await adminAPI.updateProfessionnel(editingProfessionnel.id, dataToUpdate);
        showToast('✅ Professionnel modifié avec succès !', 'success', 5000);
      } else {
        // Création
        console.log('📤 Données envoyées pour création:', JSON.stringify(professionnelForm, null, 2));
        await adminAPI.createProfessionnel(professionnelForm);
        showToast('✅ Professionnel créé avec succès !', 'success', 5000);
      }

      setIsProfessionnelModalOpen(false);
      setEditingProfessionnel(null);
      await loadData();
    } catch (err) {
      console.error('Erreur sauvegarde professionnel:', err);
      showToast(`❌ Erreur lors de la sauvegarde du professionnel : ${err.message || 'Erreur inconnue'}`, 'error', 5000);
    }
  };

  /**
   * Supprimer un professionnel
   */
  const handleDeleteProfessionnel = async (proId) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce professionnel ?')) {
      return;
    }

    try {
      await adminAPI.deleteProfessionnel(proId);
      showToast('✅ Professionnel supprimé avec succès !', 'success', 5000);
      await loadData();
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast(`❌ Erreur : ${err.message || 'Erreur inconnue'}`, 'error', 5000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      {/* En-tête moderne */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(30, 58, 138, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield style={{ width: '32px', height: '32px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: '700',
              margin: 0
            }}>
              Panneau d'Administration
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '4px 0 0 0',
              fontSize: '1rem'
            }}>
              Bienvenue {user?.prenom} {user?.nom} 👋
            </p>
          </div>
        </div>
      </div>

      {/* Onglets stylisés */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '8px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('incidents')}
          style={{
            flex: 1,
            padding: '16px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            background: activeTab === 'incidents'
              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
              : 'transparent',
            color: activeTab === 'incidents' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'incidents'
              ? '0 4px 12px rgba(59, 130, 246, 0.4)'
              : 'none'
          }}
        >
          <AlertCircle style={{ width: '20px', height: '20px' }} />
          Incidents à valider
        </button>
        <button
          onClick={() => setActiveTab('utilisateurs')}
          style={{
            flex: 1,
            padding: '16px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            background: activeTab === 'utilisateurs'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'transparent',
            color: activeTab === 'utilisateurs' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'utilisateurs'
              ? '0 4px 12px rgba(16, 185, 129, 0.4)'
              : 'none'
          }}
        >
          <Users style={{ width: '20px', height: '20px' }} />
          Gestion Utilisateurs
        </button>
      </div>

      {/* Message d'erreur stylisé */}
      {error && (
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          {error}
        </div>
      )}

      {activeTab === 'incidents' && (
        <IncidentsTab
          incidents={incidentsEnAttente}
          onValider={handleValider}
          onRejeter={openRejetModal}
          onDetails={openDetailsModal}
        />
      )}

      {activeTab === 'utilisateurs' && (
        <UtilisateursTab
          professionnels={professionnels}
          secteurs={secteurs}
          onAdd={() => openProfessionnelModal()}
          onEdit={openProfessionnelModal}
          onDelete={handleDeleteProfessionnel}
        />
      )}

      {/* Modal de rejet */}
      {isRejetModalOpen && (
        <RejetModal
          incident={selectedIncident}
          motif={motifRejet}
          onMotifChange={setMotifRejet}
          onConfirm={handleRejeter}
          onClose={() => setIsRejetModalOpen(false)}
        />
      )}

      {/* Modal de détails */}
      {isDetailsModalOpen && (
        <DetailsModal
          incident={detailsIncident}
          onClose={() => setIsDetailsModalOpen(false)}
          onValider={(id) => {
            setIsDetailsModalOpen(false);
            handleValider(id);
          }}
          onRejeter={(incident) => {
            setIsDetailsModalOpen(false);
            openRejetModal(incident);
          }}
        />
      )}

      {/* Modal de professionnel */}
      {isProfessionnelModalOpen && (
        <ProfessionnelModal
          form={professionnelForm}
          secteurs={secteurs}
          isEditing={!!editingProfessionnel}
          onChange={setProfessionnelForm}
          onSubmit={handleSaveProfessionnel}
          onClose={() => setIsProfessionnelModalOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Composant pour l'onglet des incidents - Design Professionnel
 */
const IncidentsTab = ({ incidents, onValider, onRejeter, onDetails }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const styles = {
    container: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    },
    header: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      padding: '24px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: 0
    },
    badge: {
      background: 'rgba(255,255,255,0.2)',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0'
    },
    emptyIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 20px',
      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
    },
    card: {
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    cardId: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '600'
    },
    cardDate: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.85rem',
      color: '#64748b'
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    cardDescription: {
      fontSize: '0.9rem',
      color: '#64748b',
      lineHeight: '1.5',
      marginBottom: '16px',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #f1f5f9'
    },
    sectorBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      background: '#dbeafe',
      color: '#1d4ed8'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px'
    },
    validateBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      transition: 'all 0.2s ease'
    },
    rejectBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      transition: 'all 0.2s ease'
    },
    detailsBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 18px',
      borderRadius: '10px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#fff',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      transition: 'all 0.2s ease'
    },
    listContainer: {
      padding: '24px'
    }
  };

  const getSectorColor = (sectorName) => {
    const colors = {
      'Infrastructure': { bg: '#dbeafe', color: '#1d4ed8' },
      'Environnement': { bg: '#dcfce7', color: '#16a34a' },
      'Sécurité': { bg: '#fee2e2', color: '#dc2626' },
      'Services Publics': { bg: '#fef3c7', color: '#d97706' },
      'Transport': { bg: '#ede9fe', color: '#7c3aed' },
      'Santé': { bg: '#fce7f3', color: '#db2777' }
    };
    return colors[sectorName] || { bg: '#f1f5f9', color: '#475569' };
  };

  if (incidents.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>
          <CheckCircle style={{ width: '40px', height: '40px', color: '#fff' }} />
        </div>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '8px'
        }}>
          🎉 Aucun incident en attente
        </h3>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Tous les incidents ont été traités avec succès !
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* En-tête */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          <AlertCircle style={{ width: '28px', height: '28px' }} />
          Incidents à Valider
          <span style={styles.badge}>{incidents.length}</span>
        </h2>
      </div>

      {/* Liste des incidents */}
      <div style={styles.listContainer}>
        {incidents.map((incident, idx) => {
          const sectorColor = getSectorColor(incident.secteurNom);
          return (
            <div
              key={incident.id}
              style={{
                ...styles.card,
                background: selectedIncident === incident.id ? '#f8fafc' : '#ffffff',
                borderColor: selectedIncident === incident.id ? '#3b82f6' : '#e2e8f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => setSelectedIncident(selectedIncident === incident.id ? null : incident.id)}
            >
              {/* En-tête de la carte */}
              <div style={styles.cardHeader}>
                <span style={styles.cardId}>
                  <AlertCircle size={14} />
                  Incident #{incident.id}
                </span>
                <span style={styles.cardDate}>
                  📅 {formatDate(incident.dateDeclaration)}
                </span>
              </div>

              {/* Type Incident */}
              <h3 style={styles.cardTitle}>{incident.typeIncident}</h3>

              {/* Description */}
              <p style={styles.cardDescription}>
                {incident.description || 'Aucune description fournie'}
              </p>

              {/* Footer avec secteur et actions */}
              <div style={styles.cardFooter}>
                <span style={{
                  ...styles.sectorBadge,
                  background: sectorColor.bg,
                  color: sectorColor.color
                }}>
                  🏢 {incident.secteurNom || 'Secteur non défini'}
                </span>

                <div style={styles.actionButtons}>
                  <button
                    style={styles.detailsBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetails(incident);
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
                    <Eye style={{ width: '16px', height: '16px' }} />
                    Détails
                  </button>
                  <button
                    style={styles.validateBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onValider(incident.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <ThumbsUp style={{ width: '16px', height: '16px' }} />
                    Valider
                  </button>
                  <button
                    style={styles.rejectBtn}
                    onClick={(e) => {
                      console.log('📊 Incident data:', incident);
                      console.log('📊 Secteur:', incident.secteur);
                      console.log('📊 SecteurNom:', incident.secteurNom);
                      e.stopPropagation();
                      onRejeter(incident);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    <ThumbsDown style={{ width: '16px', height: '16px' }} />
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Composant pour l'onglet des utilisateurs - Design Professionnel
 */
const UtilisateursTab = ({ professionnels, secteurs, onAdd, onEdit, onDelete }) => {
  const styles = {
    container: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '16px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
      overflow: 'hidden',
      border: '1px solid #e2e8f0'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: '700',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: 0
    },
    badge: {
      background: 'rgba(255,255,255,0.2)',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '600'
    },
    addButton: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
      fontSize: '0.95rem'
    },
    tableContainer: {
      padding: '0'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      background: '#f8fafc',
      padding: '16px 24px',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '2px solid #e2e8f0'
    },
    td: {
      padding: '20px 24px',
      borderBottom: '1px solid #f1f5f9',
      verticalAlign: 'middle'
    },
    row: {
      transition: 'all 0.2s ease'
    },
    name: {
      fontWeight: '600',
      color: '#1e293b',
      fontSize: '0.95rem'
    },
    email: {
      color: '#64748b',
      fontSize: '0.875rem'
    },
    sectorBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600'
    },
    specialtyBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '500',
      background: '#f1f5f9',
      color: '#475569'
    },
    actionBtn: {
      padding: '8px 12px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '0.85rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      marginRight: '8px'
    },
    editBtn: {
      background: '#eff6ff',
      color: '#3b82f6'
    },
    deleteBtn: {
      background: '#fef2f2',
      color: '#ef4444'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#94a3b8'
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '16px'
    }
  };

  const getSectorColor = (sectorName) => {
    const colors = {
      'Infrastructure': { bg: '#dbeafe', color: '#1d4ed8' },
      'Environnement': { bg: '#dcfce7', color: '#16a34a' },
      'Sécurité': { bg: '#fee2e2', color: '#dc2626' },
      'Urbanisme': { bg: '#fef3c7', color: '#d97706' },
      'Transport': { bg: '#ede9fe', color: '#7c3aed' },
      'Santé': { bg: '#fce7f3', color: '#db2777' }
    };
    return colors[sectorName] || { bg: '#f1f5f9', color: '#475569' };
  };

  return (
    <div style={styles.container}>
      {/* En-tête moderne */}
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>
          <Users style={{ width: '28px', height: '28px' }} />
          Gestion des Professionnels
          <span style={styles.badge}>{professionnels.length}</span>
        </h2>
        <button
          style={styles.addButton}
          onClick={onAdd}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <UserPlus style={{ width: '20px', height: '20px' }} />
          Nouveau Professionnel
        </button>
      </div>

      {/* Tableau ou état vide */}
      {professionnels.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👤</div>
          <h3 style={{ color: '#64748b', marginBottom: '8px' }}>Aucun professionnel</h3>
          <p style={{ color: '#94a3b8' }}>Commencez par ajouter votre premier professionnel</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Professionnel</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Secteur</th>
                <th style={styles.th}>Spécialité</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {professionnels.map((pro, idx) => {
                const secteur = secteurs.find(s => s.id === pro.secteurAffectate) || pro.secteur;
                const sectorColor = getSectorColor(secteur?.nom);
                return (
                  <tr
                    key={pro.id}
                    style={{
                      ...styles.row,
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa'}
                  >
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '1rem'
                        }}>
                          {pro.prenom?.[0]}{pro.nom?.[0]}
                        </div>
                        <div>
                          <div style={styles.name}>{pro.prenom} {pro.nom}</div>
                          <div style={styles.email}>{pro.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                        📞 {pro.telephone || 'N/A'}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.sectorBadge,
                        background: sectorColor.bg,
                        color: sectorColor.color
                      }}>
                        🏢 {secteur?.nom || 'Non assigné'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.specialtyBadge}>
                        🔧 {pro.typeIncident || 'N/A'}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <button
                        style={{ ...styles.actionBtn, ...styles.editBtn }}
                        onClick={() => onEdit(pro)}
                        onMouseEnter={(e) => e.target.style.background = '#dbeafe'}
                        onMouseLeave={(e) => e.target.style.background = '#eff6ff'}
                      >
                        <Edit style={{ width: '16px', height: '16px' }} />
                        Modifier
                      </button>
                      <button
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        onClick={() => onDelete(pro.id)}
                        onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                        onMouseLeave={(e) => e.target.style.background = '#fef2f2'}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * Modal de rejet d'incident - Style Professionnel Inline
 */
const RejetModal = ({ incident, motif, onMotifChange, onConfirm, onClose }) => {
  console.log('🔴 RejetModal ouvert pour incident:', incident);

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    },
    modal: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '500px',
      width: '90%',
      margin: '20px',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      animation: 'slideDown 0.3s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      padding: '24px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      color: '#ffffff',
      fontSize: '1.25rem',
      fontWeight: '700',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      cursor: 'pointer',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    body: {
      padding: '28px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '8px'
    },
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '120px',
      transition: 'all 0.2s ease',
      backgroundColor: '#ffffff',
      color: '#1e293b'
    },
    footer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '20px',
      borderTop: '1px solid #e2e8f0'
    },
    buttonCancel: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      background: '#ffffff',
      color: '#64748b',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    buttonConfirm: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            <XCircle style={{ width: '24px', height: '24px' }} />
            Rejeter l'incident #{incident?.id}
          </h3>
          <button
            onClick={onClose}
            style={modalStyles.closeButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Corps du modal */}
        <div style={modalStyles.body}>
          {/* Résumé de l'incident */}
          <div style={{ marginBottom: '20px', padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
              {incident?.typeIncident || 'Incident'}
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              Secteur: {incident?.secteurNom || 'Non défini'}
            </p>
          </div>

          {/* Champ motif */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Motif de rejet
              <span style={modalStyles.required}>*</span>
            </label>
            <textarea
              value={motif}
              onChange={(e) => onMotifChange(e.target.value)}
              style={modalStyles.textarea}
              placeholder="Expliquez clairement pourquoi cet incident est rejeté. Ce motif sera visible par le citoyen."
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '8px', marginBottom: 0 }}>
              Minimum 10 caractères requis
            </p>
          </div>

          {/* Boutons d'action */}
          <div style={modalStyles.footer}>
            <button
              onClick={onClose}
              style={modalStyles.buttonCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              style={modalStyles.buttonConfirm}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
            >
              <ThumbsDown style={{ width: '18px', height: '18px' }} />
              Confirmer le rejet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de détails complets d'un incident - Style Professionnel Inline
 */
const DetailsModal = ({ incident, onClose, onValider, onRejeter }) => {
  console.log('👁️ DetailsModal ouvert pour incident:', incident);

  if (!incident) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)',
      overflowY: 'auto',
      padding: '20px'
    },
    modal: {
      background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '900px',
      width: '100%',
      margin: '20px auto',
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column'
    },
    header: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      padding: '24px 28px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    closeButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '8px',
      padding: '8px',
      cursor: 'pointer',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    body: {
      padding: '28px',
      overflowY: 'auto',
      flexGrow: 1
    },
    section: {
      marginBottom: '28px',
      padding: '20px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    detailRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '12px'
    },
    detailGroup: {
      marginBottom: '16px'
    },
    label: {
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '6px',
      display: 'block'
    },
    value: {
      fontSize: '0.95rem',
      color: '#1e293b',
      fontWeight: '500'
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600'
    },
    photo: {
      width: '100%',
      borderRadius: '12px',
      maxHeight: '400px',
      objectFit: 'contain',
      border: '1px solid #e2e8f0'
    },
    link: {
      color: '#3b82f6',
      textDecoration: 'none',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s ease'
    },
    actionsSection: {
      background: '#f8fafc',
      padding: '20px',
      borderTop: '2px solid #e2e8f0'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      flexWrap: 'wrap'
    },
    validateBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    rejectBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      color: '#ffffff',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    closeBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      border: '2px solid #e2e8f0',
      background: '#ffffff',
      color: '#64748b',
      fontWeight: '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  const getStatutBadge = (statut) => {
    const statuts = {
      REDIGE: { bg: '#fef3c7', color: '#f59e0b', text: 'En attente' },
      VALIDE: { bg: '#dcfce7', color: '#16a34a', text: 'Validé' },
      REJETE: { bg: '#fee2e2', color: '#dc2626', text: 'Rejeté' }
    };
    const s = statuts[statut] || { bg: '#f1f5f9', color: '#64748b', text: statut };
    return (
      <span style={{ ...modalStyles.badge, background: s.bg, color: s.color }}>
        {s.text}
      </span>
    );
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div style={modalStyles.header}>
          <h2 style={modalStyles.title}>
            <Eye style={{ width: '28px', height: '28px' }} />
            Détails de l'incident #{incident.id}
          </h2>
          <button
            onClick={onClose}
            style={modalStyles.closeButton}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Corps du modal */}
        <div style={modalStyles.body}>
          {/* Photo en premier */}
          {incident.photoUrl && (
            <div style={modalStyles.section}>
              <h3 style={modalStyles.sectionTitle}>
                📷 Photo de l'incident
              </h3>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={incident.photoUrl.startsWith('http')
                    ? incident.photoUrl
                    : `http://localhost:8085${incident.photoUrl}`}
                  alt="Photo de l'incident"
                  style={modalStyles.photo}
                  onError={(e) => {
                    console.error('Erreur chargement image:', incident.photoUrl);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<p style="color: #ef4444;">❌ Image non disponible</p>';
                  }}
                />
              </div>
            </div>
          )}

          {/* Informations principales */}
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>
              📌 Informations principales
            </h3>

            <div style={modalStyles.detailGroup}>
              <label style={modalStyles.label}>Type</label>
              <p style={{ ...modalStyles.value, fontSize: '1.1rem', fontWeight: '700' }}>
                {incident.typeIncident}
              </p>
            </div>

            <div style={modalStyles.detailGroup}>
              <label style={modalStyles.label}>Description</label>
              <p style={modalStyles.value}>
                {incident.description || 'Aucune description fournie'}
              </p>
            </div>

            <div style={modalStyles.detailRow}>
              <div style={modalStyles.detailGroup}>
                <label style={modalStyles.label}>Secteur</label>
                <p style={modalStyles.value}>
                  {incident.secteurNom || incident.secteur?.nom || 'Non renseigné'}
                </p>
              </div>

              <div style={modalStyles.detailGroup}>
                <label style={modalStyles.label}>Statut</label>
                <div>{getStatutBadge(incident.statut)}</div>
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div style={modalStyles.section}>
            <h3 style={modalStyles.sectionTitle}>
              📍 Localisation
            </h3>



            <div style={modalStyles.detailRow}>
              <div style={modalStyles.detailGroup}>
                <label style={modalStyles.label}>Province</label>
                <p style={modalStyles.value}>
                  {incident.province || 'Non spécifiée'}
                </p>
              </div>
            </div>

            {(incident.latitude && incident.longitude) && (
              <>
                <div style={modalStyles.detailRow}>
                  <div style={modalStyles.detailGroup}>
                    <label style={modalStyles.label}>Latitude</label>
                    <p style={{ ...modalStyles.value, fontFamily: 'monospace' }}>
                      {incident.latitude.toFixed(6)}
                    </p>
                  </div>

                  <div style={modalStyles.detailGroup}>
                    <label style={modalStyles.label}>Longitude</label>
                    <p style={{ ...modalStyles.value, fontFamily: 'monospace' }}>
                      {incident.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div style={modalStyles.detailGroup}>
                  <label style={modalStyles.label}>📍 Voir sur Google Maps</label>
                  <a
                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={modalStyles.link}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Ouvrir dans Google Maps →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div style={modalStyles.actionsSection}>
          <h3 style={{ ...modalStyles.sectionTitle, marginBottom: '16px' }}>
            ⚡ Actions rapides
          </h3>
          <div style={modalStyles.actionButtons}>
            <button
              onClick={onClose}
              style={modalStyles.closeBtn}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
            >
              Fermer
            </button>
            <button
              onClick={() => onValider(incident.id)}
              style={modalStyles.validateBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
              }}
            >
              <CheckCircle style={{ width: '18px', height: '18px' }} />
              Valider cet incident
            </button>
            <button
              onClick={() => onRejeter(incident)}
              style={modalStyles.rejectBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
              }}
            >
              <XCircle style={{ width: '18px', height: '18px' }} />
              Rejeter cet incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de création/modification de professionnel - Design Professionnel
 */
const ProfessionnelModal = ({ form, secteurs, isEditing, onChange, onSubmit, onClose }) => {
  const updateField = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      background: '#ffffff',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      animation: 'slideUp 0.3s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px 28px',
      borderRadius: '24px 24px 0 0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      color: '#ffffff',
      fontSize: '1.5rem',
      fontWeight: '700',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    closeBtn: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '12px',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#fff',
      transition: 'all 0.2s ease'
    },
    body: {
      padding: '28px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    fullRow: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '14px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '0.95rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      background: '#fff',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    footer: {
      padding: '20px 28px',
      background: '#f8fafc',
      borderRadius: '0 0 24px 24px',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px'
    },
    cancelBtn: {
      padding: '14px 24px',
      borderRadius: '12px',
      border: '2px solid #e5e7eb',
      background: '#ffffff',
      color: '#6b7280',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '0.95rem'
    },
    submitBtn: {
      padding: '14px 28px',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.2s ease',
      fontSize: '0.95rem'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* En-tête */}
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>
            <UserPlus style={{ width: '24px', height: '24px' }} />
            {isEditing ? 'Modifier le' : 'Nouveau'} Professionnel
          </h3>
          <button
            type="button"
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={onSubmit}>
          <div style={styles.body}>
            {/* Nom / Prénom */}
            <div style={styles.row}>
              <div>
                <label style={styles.label}>
                  👤 Nom<span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => updateField('nom', e.target.value)}
                  style={styles.input}
                  placeholder="Entrez le nom"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={styles.label}>
                  👤 Prénom
                </label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => updateField('prenom', e.target.value)}
                  style={styles.input}
                  placeholder="Entrez le prénom"
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Email / Mot de passe */}
            <div style={styles.row}>
              <div>
                <label style={styles.label}>
                  ✉️ Email<span style={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  style={styles.input}
                  placeholder="email@exemple.com"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={styles.label}>
                  🔒 Mot de passe{!isEditing && <span style={styles.required}>*</span>}
                </label>
                <input
                  type="password"
                  value={form.motDePasse}
                  onChange={(e) => updateField('motDePasse', e.target.value)}
                  style={styles.input}
                  required={!isEditing}
                  placeholder={isEditing ? 'Laisser vide pour ne pas modifier' : '••••••••'}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Téléphone / Secteur */}
            <div style={styles.row}>
              <div>
                <label style={styles.label}>
                  📞 Téléphone<span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => updateField('telephone', e.target.value)}
                  style={styles.input}
                  placeholder="+212 6XX XXX XXX"
                  required
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={styles.label}>
                  🏢 Secteur<span style={styles.required}>*</span>
                </label>
                <select
                  value={form.secteurAffectate}
                  onChange={(e) => updateField('secteurAffectate', parseInt(e.target.value))}
                  style={styles.select}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <option value="">-- Sélectionnez un secteur --</option>
                  {secteurs.map((secteur) => (
                    <option key={secteur.id} value={secteur.id}>
                      {secteur.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type d'incident */}
            <div style={styles.fullRow}>
              <label style={styles.label}>
                🔧 Spécialité / Type d'incident<span style={styles.required}>*</span>
              </label>
              <select
                value={form.typeIncident}
                onChange={(e) => updateField('typeIncident', e.target.value)}
                style={styles.select}
                required
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">-- Sélectionnez une spécialité --</option>
                <option value="EAU">💧 Eau</option>
                <option value="ELECTRICITE">⚡ Électricité</option>
                <option value="ROUTE">🛣️ Route</option>
                <option value="ASSAINISSEMENT">🚿 Assainissement</option>
                <option value="ECLAIRAGE_PUBLIC">💡 Éclairage Public</option>
                <option value="DECHETS">🗑️ Déchets</option>
                <option value="ESPACES_VERTS">🌳 Espaces Verts</option>
                <option value="SECURITE">🛡️ Sécurité</option>
                <option value="AUTRE">📋 Autre</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = '#ffffff'}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              {isEditing ? '✓ Enregistrer les modifications' : '+ Créer le professionnel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
