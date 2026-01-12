import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  PlayCircle,
  StopCircle,
  Ban,
  ArrowRight,
  X
} from 'lucide-react';

/**
 * Dashboard Professionnel
 * Affiche uniquement les incidents VALIDE_PUBLIE du secteur et type du professionnel
 */
const ProfessionnelDashboard = () => {
  const { user } = useAuth();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de traitement
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isTraitementModalOpen, setIsTraitementModalOpen] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState('');
  const [descriptionTraitement, setDescriptionTraitement] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  /**
   * Charge les incidents du professionnel
   * Filtre automatique : VALIDE_PUBLIE + secteur + typeIncident
   */
  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.professionnel.getMesIncidents({
        statut: 'VALIDE_PUBLIE',
        page: 0,
        size: 50
      });

      // Si la réponse est paginée
      const incidentsList = response.content || response;
      setIncidents(incidentsList);
    } catch (err) {
      console.error('Erreur chargement incidents:', err);
      setError(err.message || 'Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvre le modal de traitement
   */
  const openTraitementModal = (incident) => {
    setSelectedIncident(incident);
    setNouveauStatut('');
    setDescriptionTraitement('');
    setIsTraitementModalOpen(true);
  };

  /**
   * Ferme le modal
   */
  const closeTraitementModal = () => {
    setIsTraitementModalOpen(false);
    setSelectedIncident(null);
    setNouveauStatut('');
    setDescriptionTraitement('');
  };

  /**
   * Soumet le changement de statut
   */
  const handleSubmitTraitement = async (e) => {
    e.preventDefault();

    if (!nouveauStatut) {
      alert('⚠️ Veuillez sélectionner un statut !');
      return;
    }

    try {
      switch (nouveauStatut) {
        case 'PRIS_EN_COMPTE':
          await api.professionnel.prendreEnCompte(selectedIncident.id);
          alert('✅ Incident pris en compte !');
          break;

        case 'EN_COURS':
          await api.professionnel.demarrerTraitement(selectedIncident.id);
          alert('✅ Traitement démarré !');
          break;

        case 'TRAITE':
          if (!descriptionTraitement.trim()) {
            alert('⚠️ La description du traitement est obligatoire !');
            return;
          }
          await api.professionnel.traiterIncident(selectedIncident.id, descriptionTraitement);
          alert('✅ Incident traité avec succès !');
          break;

        case 'BLOQUE':
          if (!descriptionTraitement.trim()) {
            alert('⚠️ Le motif de blocage est obligatoire !');
            return;
          }
          await api.professionnel.bloquerIncident(selectedIncident.id, descriptionTraitement);
          alert('⚠️ Incident bloqué');
          break;

        default:
          alert('⚠️ Statut non reconnu');
          return;
      }

      closeTraitementModal();
      loadIncidents(); // Recharger la liste
    } catch (err) {
      console.error('Erreur traitement:', err);
      alert('❌ Erreur : ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px'
    }}>
      {/* En-tête moderne */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)'
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
            <Briefcase style={{ width: '32px', height: '32px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{
              color: '#ffffff',
              fontSize: '2rem',
              fontWeight: '700',
              margin: 0
            }}>
              Mes Incidents
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '8px 0 0 0',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span>👋 Bienvenue {user?.prenom} {user?.nom}</span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                🏢 Secteur : {user?.secteurAffectate || 'N/A'}
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}>
                🔧 Spécialité : {user?.typeIncident || 'N/A'}
              </span>
            </p>
          </div>
        </div>
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

      {/* Liste des incidents ou état vide */}
      {incidents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 24px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '24px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <CheckCircle style={{ width: '48px', height: '48px', color: '#16a34a' }} />
          </div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 12px 0'
          }}>
            Aucun incident disponible
          </h3>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            margin: 0
          }}>
            Aucun incident validé ne correspond à votre secteur et spécialité.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          {/* Header de la liste */}
          <div style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                📋 Incidents à traiter
                <span style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  {incidents.length}
                </span>
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '0.875rem',
                margin: '6px 0 0 0'
              }}>
                Ces incidents sont dans votre secteur et correspondent à votre spécialité
              </p>
            </div>
          </div>

          {/* Liste des incident cards */}
          <div style={{ padding: '16px' }}>
            {incidents.map((incident, index) => (
              <div
                key={incident.id}
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: index < incidents.length - 1 ? '16px' : 0,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    {/* ID et badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: '#6366f1',
                        fontFamily: 'monospace'
                      }}>
                        #{incident.id}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                        color: '#1d4ed8',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {incident.statut}
                      </span>
                      {incident.typeIncident && (
                        <span style={{
                          padding: '4px 12px',
                          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                          color: '#7c3aed',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          🔧 {incident.typeIncident}
                        </span>
                      )}
                    </div>

                    {/* Type */}
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      {incident.typeIncident}
                    </h3>

                    {/* Description */}
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      margin: '0 0 16px 0'
                    }}>
                      {incident.description}
                    </p>

                    {/* Infos grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>🏢 Secteur:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          {incident.secteur?.nom || 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>🗺️ Province:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          {incident.province?.nom || 'N/A'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>📅 Date:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          {formatDate(incident.dateCreation)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#94a3b8' }}>📍 Adresse:</span>
                        <span style={{ fontWeight: '600', color: '#334155' }}>
                          {incident.adresse || 'Non précisée'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton traiter */}
                  <button
                    onClick={() => openTraitementModal(incident)}
                    style={{
                      padding: '14px 24px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                    }}
                  >
                    <PlayCircle style={{ width: '20px', height: '20px' }} />
                    Traiter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de traitement */}
      {isTraitementModalOpen && (
        <TraitementModal
          incident={selectedIncident}
          nouveauStatut={nouveauStatut}
          description={descriptionTraitement}
          onStatutChange={setNouveauStatut}
          onDescriptionChange={setDescriptionTraitement}
          onSubmit={handleSubmitTraitement}
          onClose={closeTraitementModal}
        />
      )}
    </div>
  );
};

/**
 * Modal de traitement d'incident
 */
const TraitementModal = ({
  incident,
  nouveauStatut,
  description,
  onStatutChange,
  onDescriptionChange,
  onSubmit,
  onClose
}) => {
  const needsDescription = nouveauStatut === 'TRAITE' || nouveauStatut === 'BLOQUE';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Traiter l'incident #{incident?.id}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Détails de l'incident */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{incident?.typeIncident}</h4>
            <p className="text-sm text-gray-600 mb-3">{incident?.description}</p>
            <div className="text-sm text-gray-500">
              Secteur : {incident?.secteur?.nom} | Type : {incident?.typeIncident}
            </div>
          </div>

          {/* Sélection du nouveau statut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau statut <span className="text-red-500">*</span>
            </label>
            <select
              value={nouveauStatut}
              onChange={(e) => onStatutChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">-- Sélectionnez un statut --</option>
              <option value="PRIS_EN_COMPTE">✅ Pris en compte</option>
              <option value="EN_COURS">🔄 En cours de traitement</option>
              <option value="TRAITE">✔️ Traité (terminé)</option>
              <option value="BLOQUE">🚫 Bloqué</option>
            </select>
          </div>

          {/* Description (obligatoire pour TRAITE et BLOQUE) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {nouveauStatut === 'TRAITE' && 'Description du traitement'}
              {nouveauStatut === 'BLOQUE' && 'Motif de blocage'}
              {!needsDescription && 'Commentaire (optionnel)'}
              {needsDescription && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="4"
              placeholder={
                nouveauStatut === 'TRAITE'
                  ? 'Décrivez les actions effectuées pour résoudre cet incident...'
                  : nouveauStatut === 'BLOQUE'
                    ? 'Expliquez pourquoi cet incident est bloqué...'
                    : 'Ajoutez un commentaire...'
              }
              required={needsDescription}
            />
            {needsDescription && (
              <p className="text-sm text-gray-500 mt-1">
                Ce champ est obligatoire pour ce statut
              </p>
            )}
          </div>

          {/* Guide des statuts */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              📘 Guide des statuts :
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Pris en compte :</strong> Vous avez vu l'incident et allez le traiter</li>
              <li><strong>En cours :</strong> Vous êtes en train de résoudre le problème</li>
              <li><strong>Traité :</strong> Le problème est résolu (description obligatoire)</li>
              <li><strong>Bloqué :</strong> Impossible de traiter pour l'instant (motif obligatoire)</li>
            </ul>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionnelDashboard;
