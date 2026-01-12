import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

// CSS pour les marqueurs personnalisés
const markerStyles = `
  .custom-incident-marker {
    transition: transform 0.2s ease, filter 0.2s ease;
  }
  
  .custom-incident-marker:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
    z-index: 1000 !important;
  }
  
  .leaflet-cluster-anim .leaflet-marker-icon, 
  .leaflet-cluster-anim .leaflet-marker-shadow {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  /* Style amélioré pour les petits clusters (2-10 incidents) */
  .marker-cluster-small {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.15)) !important;
    border: 3px solid #3b82f6 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .marker-cluster-small:hover {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-small div {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Style amélioré pour les clusters moyens (11-50 incidents) */
  .marker-cluster-medium {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15)) !important;
    border: 3px solid #f59e0b !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .marker-cluster-medium:hover {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-medium div {
    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Style amélioré pour les grands clusters (50+ incidents) */
  .marker-cluster-large {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15)) !important;
    border: 3px solid #ef4444 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
    animation: pulse 2s infinite !important;
  }
  
  .marker-cluster-large:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    animation: none !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-large div {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Animation de pulsation pour les gros clusters */
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
  
  /* Effet de survol global pour tous les clusters - compatible avec Leaflet */
  .marker-cluster {
    cursor: pointer !important;
  }
  
  /* Permettre les événements de clic sur les clusters */
  .leaflet-marker-icon.marker-cluster {
    pointer-events: auto !important;
  }
  
  /* Désactiver les événements sur les éléments internes pour éviter les conflits */
  .marker-cluster div, .marker-cluster span {
    pointer-events: none !important;
  }
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = markerStyles;
  document.head.appendChild(styleElement);
}
import { incidentsAPI, secteursAPI, provincesAPI } from '../services/api';
import { PROVINCES_MAP, STATUTS_INCIDENTS, getStatut, getProvinceNom } from '../data/constants';
import { useFilters } from '../contexts/FilterContext';

// Création d'icônes personnalisées pour les incidents
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: white;
        cursor: pointer;
        position: relative;
      ">
        ${symbol}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    className: 'custom-incident-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38]
  });
};

// Icônes par type d'incident
const getIncidentIcon = (typeIncident, statut) => {
  const statutColors = {
    'REDIGE': '#6b7280',           // Gris
    'PRISE_EN_COMPTE': '#6366f1',  // Indigo
    'VALIDE': '#3b82f6',           // Bleu
    'EN_COURS_DE_TRAITEMENT': '#f59e0b', // Orange
    'TRAITE': '#10b981',           // Vert
    'REJETE': '#ef4444',           // Rouge
    'BLOQUE': '#dc2626'            // Rouge foncé
  };

  const typeSymbols = {
    'Infrastructure': '🏗️',
    'Voirie': '🛣️',
    'Environnement': '🌱',
    'Sécurité': '🚨',
    'Services Publics': '🏛️',
    'Transport': '🚌',
    'Éclairage public': '💡',
    'Assainissement': '🚰',
    'Espaces verts': '🌳',
    'Propreté': '🧹',
    'Autre': '⚠️',
    'default': '📍'
  };

  const color = statutColors[statut] || '#6b7280';
  const symbol = typeSymbols[typeIncident] || typeSymbols['default'];

  return createCustomIcon(color, symbol);
};

/**
 * Composant pour ajuster la vue de la carte
 */
const MapUpdater = ({ incidents }) => {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents.map(incident => [parseFloat(incident.latitude), parseFloat(incident.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, map]);

  return null;
};

/**
 * Composant pour centrer la carte sur un incident spécifique depuis l'URL
 */
const IncidentFocus = ({ targetIncident, markerRefs }) => {
  const map = useMap();

  useEffect(() => {
    if (targetIncident) {
      const lat = parseFloat(targetIncident.latitude);
      const lng = parseFloat(targetIncident.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Centrer et zoomer FORTEMENT sur l'incident (niveau 18 = très proche)
        map.setView([lat, lng], 18, {
          animate: true,
          duration: 1.5 // Animation plus fluide
        });

        // Ouvrir le popup après un petit délai pour laisser le temps à la carte de se positionner
        setTimeout(() => {
          const markerRef = markerRefs.current[targetIncident.id];
          if (markerRef) {
            markerRef.openPopup();
          }
        }, 800); // Délai augmenté pour l'animation
      }
    }
  }, [targetIncident, map, markerRefs]);

  return null;
};

/**
 * Page Carte - Visualisation géographique des incidents
 * Connectée au backend Spring Boot
 */
const MapView = () => {
  const [searchParams] = useSearchParams();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utiliser le context partagé pour les filtres
  const { filters, updateFilters, resetFilters: resetGlobalFilters } = useFilters();

  // État local temporaire pour les modifications avant application
  const [selectedSecteurs, setSelectedSecteurs] = useState([]);
  const [selectedProvinces, setSelectedProvinces] = useState([]);
  const [selectedStatuts, setSelectedStatuts] = useState([]);

  const [showClusters, setShowClusters] = useState(true);
  const [secteurs, setSecteurs] = useState([]);
  const [targetIncident, setTargetIncident] = useState(null);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [provincesGeoJSON, setProvincesGeoJSON] = useState(null);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('satellite');
  const markerRefs = useRef({});

  // Définition des fonds de carte disponibles
  const baseLayers = {
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    },
    dark: {
      name: 'Dark',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }
  };

  // Lire les paramètres URL pour zoomer sur un incident spécifique
  useEffect(() => {
    const incidentId = searchParams.get('incident'); // Changement: lire 'incident' au lieu de 'id'

    if (incidentId && incidents.length > 0) {
      const incident = incidents.find(i => i.id === parseInt(incidentId));
      if (incident) {
        console.log('🎯 Zoom sur incident #', incidentId);
        setTargetIncident(incident);
      }
    }
  }, [searchParams, incidents]);

  // Fonction locale pour obtenir le nom du secteur
  const getSecteurNom = (secteurId) => {
    const secteur = secteurs.find(s => s.id === secteurId);
    return secteur ? secteur.nom : 'Secteur inconnu';
  };

  /**
   * Calcule les statistiques de la légende dynamiquement
   * Compte les incidents par TYPE réel (pas par secteur)
   */
  const getLegendStats = () => {
    // Compter les incidents par type réel
    const typeCounts = {};
    const typeColors = {}; // Couleur basée sur le secteur

    filteredIncidents.forEach(incident => {
      const type = incident.typeIncident || 'Autre';

      // Incrémenter le compteur
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      // Assigner la couleur selon le secteur (si pas déjà fait)
      if (!typeColors[type]) {
        const secteur = secteurs.find(s => s.id === incident.secteurId);
        typeColors[type] = secteur ? secteur.color : '#6b7280';
      }
    });

    // Convertir en array et trier par count (décroissant)
    return Object.entries(typeCounts)
      .map(([name, count]) => ({
        name,
        count,
        color: typeColors[name]
      }))
      .sort((a, b) => b.count - a.count); // Trier du plus fréquent au moins fréquent
  };

  /**
   * Charge les incidents depuis le backend
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Charger les incidents
        const incidentsData = await incidentsAPI.getAll();
        console.log('Incidents récupérés du backend:', incidentsData);
        console.log('Premier incident:', incidentsData[0]);
        setIncidents(incidentsData);
        setFilteredIncidents(incidentsData);

        // Charger les secteurs
        const secteursData = await secteursAPI.getAll();
        console.log('Secteurs récupérés du backend:', secteursData);
        setSecteurs(secteursData);

        // Charger les provinces au format GeoJSON
        try {
          const provincesData = await provincesAPI.getGeoJSON();
          console.log('Provinces GeoJSON récupérées:', provincesData);

          // Parser le JSON si c'est une string
          const geojson = typeof provincesData === 'string' ? JSON.parse(provincesData) : provincesData;
          setProvincesGeoJSON(geojson);
        } catch (provError) {
          console.warn('Impossible de charger les provinces:', provError);
          // Non bloquant, continuer sans les provinces
        }
      } catch (err) {
        console.error('Erreur de récupération des données:', err);
        setError('Impossible de charger les données. Vérifiez que le backend est démarré.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Initialise les incidents filtrés avec tous les incidents valides au chargement
   */
  useEffect(() => {
    // Au chargement, afficher tous les incidents avec coordonnées valides
    const validIncidents = incidents.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    console.log('Incidents avec coordonnées valides:', validIncidents);
    setFilteredIncidents(validIncidents);
  }, [incidents]); // Ne dépend que des incidents, pas des filtres

  /**
   * Applique les filtres manuellement quand on clique sur "Chercher"
   */
  const handleSearch = () => {
    let filtered = [...incidents];

    // Filtrer d'abord les incidents avec des coordonnées valides
    filtered = filtered.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    // Filtrer par secteurs (si sélectionnés)
    if (selectedSecteurs.length > 0) {
      filtered = filtered.filter(i => selectedSecteurs.includes(i.secteurId));
    }

    // Filtrer par provinces (si sélectionnées)
    if (selectedProvinces.length > 0) {
      filtered = filtered.filter(i => selectedProvinces.includes(i.province));
    }

    // Filtrer par statuts (si sélectionnés)
    if (selectedStatuts.length > 0) {
      filtered = filtered.filter(i => selectedStatuts.includes(i.statut));
    }

    console.log('Multi-filtres appliqués:', { secteurs: selectedSecteurs, provinces: selectedProvinces, statuts: selectedStatuts });
    console.log('Incidents filtrés:', filtered);
    setFilteredIncidents(filtered);
  };

  /**
   * Réinitialise les filtres ET réaffiche tous les incidents
   */
  const resetFilters = () => {
    // Réinitialiser les filtres globaux
    resetGlobalFilters();

    // Réinitialiser aussi les filtres temporaires
    setTempFilters({ secteur: '', province: '', statut: '' });

    // Réafficher tous les incidents avec coordonnées valides
    const validIncidents = incidents.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    setFilteredIncidents(validIncidents);
  };



  /**
   * Formate une date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Centre de la carte (Maroc)
  const centerPosition = [32.0, -6.5];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Carte des Incidents</h1>
          <p className="page-description">
            Visualisation géographique de {filteredIncidents.length} incident(s)
          </p>
        </div>

        {/* Filtres */}
        <div className="card" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Filter size={20} style={{ marginRight: '0.5rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Filtres</h2>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
              />
              <span>Afficher en clusters</span>
            </label>
          </div>

          <div className="grid grid-4">
            <div className="form-group">
              <label className="form-label">Secteur</label>
              <MultiSelectDropdown
                label="Secteur"
                options={secteurs.map(s => ({ value: s.id, label: s.nom }))}
                selectedValues={selectedSecteurs}
                onChange={setSelectedSecteurs}
                placeholder="Tous les secteurs"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Province</label>
              <MultiSelectDropdown
                label="Province"
                options={PROVINCES_MAP.map(p => ({ value: p.nom, label: p.nom }))}
                selectedValues={selectedProvinces}
                onChange={setSelectedProvinces}
                placeholder="Toutes les provinces"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <MultiSelectDropdown
                label="Statut"
                options={STATUTS_INCIDENTS.map(s => ({ value: s.value, label: s.label }))}
                selectedValues={selectedStatuts}
                onChange={setSelectedStatuts}
                placeholder="Tous les statuts"
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                style={{ flex: '1' }}
              >
                🔍 Chercher
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedSecteurs([]);
                  setSelectedProvinces([]);
                  setSelectedStatuts([]);
                  setFilteredIncidents(incidents.filter(incident => {
                    const lat = parseFloat(incident.latitude);
                    const lng = parseFloat(incident.longitude);
                    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                  }));
                }}
                style={{ flex: '1' }}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
          {/* Légende LIVE MONITOR - Version Simplifiée */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            zIndex: 500,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            color: 'white',
            borderRadius: '12px',
            padding: '14px 16px',
            minWidth: '200px',
            maxWidth: '240px',
            maxHeight: '560px',
            overflowY: 'auto',
            overflowX: 'hidden',
            fontSize: '13px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            transition: 'all 0.3s ease'
          }}>
            {/* Header avec indicateur LIVE */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(96, 165, 250, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}></div>
                <span style={{
                  fontWeight: '700',
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>LIVE MONITOR</span>
              </div>
            </div>

            {/* Total incidents avec badge */}
            <div style={{
              marginBottom: '14px',
              padding: '10px 12px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(96, 165, 250, 0.1) 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(96, 165, 250, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'rgba(191, 219, 254, 0.9)' }}>Total incidents</span>
                <span style={{
                  fontWeight: '700',
                  fontSize: '16px',
                  color: '#60a5fa'
                }}>{filteredIncidents.length}</span>
              </div>
            </div>

            {/* Catégories actives avec compteurs */}
            {getLegendStats().length > 0 ? (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'rgba(226, 232, 240, 0.7)',
                  letterSpacing: '0.5px'
                }}>CATÉGORIES</div>
                {getLegendStats().map((category, index) => (
                  <div
                    key={category.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: index < getLegendStats().length - 1 ? '8px' : '0',
                      padding: '6px 8px',
                      background: 'rgba(51, 65, 85, 0.4)',
                      borderRadius: '6px',
                      border: `1px solid ${category.color}30`,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${category.color}15`;
                      e.currentTarget.style.borderColor = `${category.color}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)';
                      e.currentTarget.style.borderColor = `${category.color}30`;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: category.color,
                        borderRadius: '50%',
                        boxShadow: `0 0 6px ${category.color}60`
                      }}></div>
                      <span style={{ fontSize: '12px' }}>{category.name}</span>
                    </div>
                    <span style={{
                      fontWeight: '700',
                      fontSize: '13px',
                      color: category.color,
                      minWidth: '24px',
                      textAlign: 'right'
                    }}>{category.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'rgba(226, 232, 240, 0.6)',
                fontStyle: 'italic'
              }}>
                Aucun incident à afficher
              </div>
            )}

            {/* Bouton toggle pour détails */}
            {getLegendStats().length > 0 && (
              <button
                onClick={() => setLegendExpanded(!legendExpanded)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.08) 100%)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  borderRadius: '6px',
                  color: 'rgba(147, 197, 253, 0.9)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.15) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(96, 165, 250, 0.08) 100%)';
                  e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                }}
              >
                <span>{legendExpanded ? '▲' : '▼'}</span>
                <span>{legendExpanded ? 'Masquer détails' : 'Afficher détails'}</span>
              </button>
            )}

            {/* Section étendue (optionnelle) */}
            {legendExpanded && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(96, 165, 250, 0.2)',
                animation: 'slideDown 0.3s ease'
              }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'rgba(226, 232, 240, 0.7)',
                  letterSpacing: '0.5px'
                }}>FILTRES ACTIFS</div>
                {filters.secteur || filters.province || filters.statut ? (
                  <div style={{ fontSize: '11px', color: 'rgba(226, 232, 240, 0.8)' }}>
                    {filters.secteur && <div>• Secteur: {getSecteurNom(parseInt(filters.secteur))}</div>}
                    {filters.province && <div>• Province: {filters.province}</div>}
                    {filters.statut && <div>• Statut: {filters.statut}</div>}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'rgba(226, 232, 240, 0.5)', fontStyle: 'italic' }}>
                    Aucun filtre appliqué
                  </div>
                )}
              </div>
            )}

            {/* Animation CSS */}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
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
              /* Custom scrollbar for legend */
              div[style*="rgba(30, 41, 59, 0.95)"]::-webkit-scrollbar {
                width: 6px;
              }
              div[style*="rgba(30, 41, 59, 0.95)"]::-webkit-scrollbar-track {
                background: rgba(51, 65, 85, 0.4);
                border-radius: 3px;
              }
              div[style*="rgba(30, 41, 59, 0.95)"]::-webkit-scrollbar-thumb {
                background: rgba(96, 165, 250, 0.5);
                border-radius: 3px;
              }
              div[style*="rgba(30, 41, 59, 0.95)"]::-webkit-scrollbar-thumb:hover {
                background: rgba(96, 165, 250, 0.7);
              }
            `}</style>
          </div>

          {/* Sélecteur de fond de carte - En haut à droite */}
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            zIndex: 500,
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(96, 165, 250, 0.2)',
            minWidth: '180px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              marginBottom: '10px',
              color: 'rgba(226, 232, 240, 0.7)',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>FOND DE CARTE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(baseLayers).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBaseLayer(key)}
                  style={{
                    padding: '8px 12px',
                    background: selectedBaseLayer === key
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(96, 165, 250, 0.2) 100%)'
                      : 'rgba(51, 65, 85, 0.4)',
                    border: selectedBaseLayer === key
                      ? '1px solid rgba(96, 165, 250, 0.6)'
                      : '1px solid rgba(96, 165, 250, 0.2)',
                    borderRadius: '6px',
                    color: selectedBaseLayer === key ? '#60a5fa' : 'rgba(226, 232, 240, 0.8)',
                    fontSize: '12px',
                    fontWeight: selectedBaseLayer === key ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBaseLayer !== key) {
                      e.currentTarget.style.background = 'rgba(51, 65, 85, 0.6)';
                      e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBaseLayer !== key) {
                      e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)';
                      e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.2)';
                    }
                  }}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          </div>

          <MapContainer
            center={centerPosition}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              key={selectedBaseLayer}
              attribution={baseLayers[selectedBaseLayer].attribution}
              url={baseLayers[selectedBaseLayer].url}
            />

            {/* Affichage des frontières de provinces */}
            {provincesGeoJSON && (
              <GeoJSON
                data={provincesGeoJSON}
                style={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.6
                }}
                onEachFeature={(feature, layer) => {
                  // Ajouter un tooltip avec le nom de la province
                  if (feature.properties && feature.properties.nom) {
                    layer.bindTooltip(feature.properties.nom, {
                      permanent: false,
                      direction: 'center',
                      className: 'province-tooltip'
                    });
                  }

                  // Effet de survol
                  layer.on({
                    mouseover: (e) => {
                      e.target.setStyle({
                        fillOpacity: 0.3,
                        weight: 3
                      });
                    },
                    mouseout: (e) => {
                      e.target.setStyle({
                        fillOpacity: 0.1,
                        weight: 2
                      });
                    }
                  });
                }}
              />
            )}

            {!targetIncident && <MapUpdater incidents={filteredIncidents} />}
            <IncidentFocus targetIncident={targetIncident} markerRefs={markerRefs} />

            {showClusters ? (
              <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                maxClusterRadius={80}
                disableClusteringAtZoom={18}
                spiderfyDistanceMultiplier={2}
              >
                {filteredIncidents.map(incident => {
                  const statut = getStatut(incident.statut);

                  // Vérifier que les coordonnées sont valides
                  const lat = parseFloat(incident.latitude);
                  const lng = parseFloat(incident.longitude);

                  if (isNaN(lat) || isNaN(lng)) {
                    console.warn(`Incident ${incident.id} a des coordonnées invalides:`, { lat, lng });
                    return null; // Ne pas afficher ce marqueur
                  }

                  return (
                    <Marker
                      key={incident.id}
                      position={[lat, lng]}
                      icon={getIncidentIcon(incident.typeIncident, incident.statut)}
                      ref={el => markerRefs.current[incident.id] = el}
                    >
                      <Popup maxWidth={320} minWidth={280}>
                        <div style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                          padding: '0',
                          margin: '-15px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                        }}>
                          {/* Header avec gradient */}
                          <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            padding: '16px',
                            borderBottom: '3px solid rgba(255, 255, 255, 0.1)',
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <span style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: '#fff',
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                              }}>
                                #{incident.id}
                              </span>
                              <span style={{
                                background: statut.color === 'success' ? '#10b981' :
                                  statut.color === 'warning' ? '#f59e0b' :
                                    statut.color === 'danger' ? '#ef4444' : '#6b7280',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                              }}>
                                {statut.label}
                              </span>
                            </div>
                            <h3 style={{
                              fontSize: '1.1rem',
                              fontWeight: '700',
                              margin: '0',
                              color: '#fff',
                              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                            }}>
                              {incident.typeIncident}
                            </h3>
                          </div>

                          {/* Corps */}
                          <div style={{ padding: '16px' }}>
                            {/* Type d'incident avec icône */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px',
                              padding: '10px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '8px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}>
                              <span style={{ fontSize: '1.2rem' }}>
                                {incident.typeIncident === 'Voirie' ? '🛣️' :
                                  incident.typeIncident === 'Éclairage public' ? '💡' :
                                    incident.typeIncident === 'Assainissement' ? '🚰' :
                                      incident.typeIncident === 'Espaces verts' ? '🌳' :
                                        incident.typeIncident === 'Propreté' ? '🧹' :
                                          incident.typeIncident === 'Sécurité' ? '🛡️' :
                                            incident.typeIncident === 'Transport' ? '🚌' : '📍'}
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '0.7rem',
                                  color: 'rgba(147, 197, 253, 0.8)',
                                  marginBottom: '2px',
                                  fontWeight: '600'
                                }}>
                                  CATÉGORIE
                                </div>
                                <div style={{
                                  fontSize: '0.9rem',
                                  color: '#fff',
                                  fontWeight: '600'
                                }}>
                                  {incident.typeIncident}
                                </div>
                              </div>
                            </div>

                            {/* Description */}
                            {incident.description && (
                              <div style={{
                                marginBottom: '12px',
                                padding: '10px',
                                background: 'rgba(51, 65, 85, 0.5)',
                                borderRadius: '8px',
                                borderLeft: '3px solid #3b82f6'
                              }}>
                                <div style={{
                                  fontSize: '0.85rem',
                                  color: 'rgba(226, 232, 240, 0.9)',
                                  lineHeight: '1.5',
                                  maxHeight: '60px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical'
                                }}>
                                  {incident.description}
                                </div>
                              </div>
                            )}

                            {/* Infos en grille */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '8px',
                              marginBottom: '12px'
                            }}>
                              {/* Secteur */}
                              <div style={{
                                padding: '8px',
                                background: 'rgba(51, 65, 85, 0.4)',
                                borderRadius: '6px'
                              }}>
                                <div style={{
                                  fontSize: '0.65rem',
                                  color: 'rgba(148, 163, 184, 0.9)',
                                  marginBottom: '4px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Secteur
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  color: '#fff',
                                  fontWeight: '600'
                                }}>
                                  {getSecteurNom(incident.secteurId)}
                                </div>
                              </div>

                              {/* Province */}
                              <div style={{
                                padding: '8px',
                                background: 'rgba(51, 65, 85, 0.4)',
                                borderRadius: '6px'
                              }}>
                                <div style={{
                                  fontSize: '0.65rem',
                                  color: 'rgba(148, 163, 184, 0.9)',
                                  marginBottom: '4px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Province
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  color: '#fff',
                                  fontWeight: '600'
                                }}>
                                  {incident.province || 'N/A'}
                                </div>
                              </div>
                            </div>

                            {/* Date avec icône */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px',
                              background: 'rgba(59, 130, 246, 0.08)',
                              borderRadius: '6px',
                              border: '1px solid rgba(59, 130, 246, 0.15)'
                            }}>
                              <span style={{ fontSize: '0.9rem' }}>📅</span>
                              <div>
                                <div style={{
                                  fontSize: '0.65rem',
                                  color: 'rgba(147, 197, 253, 0.7)',
                                  fontWeight: '600'
                                }}>
                                  DÉCLARÉ LE
                                </div>
                                <div style={{
                                  fontSize: '0.8rem',
                                  color: 'rgba(226, 232, 240, 0.95)',
                                  fontWeight: '500'
                                }}>
                                  {formatDate(incident.dateDeclaration)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            ) : (
              filteredIncidents.map(incident => {
                const statut = getStatut(incident.statut);

                // Vérifier que les coordonnées sont valides
                const lat = parseFloat(incident.latitude);
                const lng = parseFloat(incident.longitude);

                if (isNaN(lat) || isNaN(lng)) {
                  console.warn(`Incident ${incident.id} a des coordonnées invalides:`, { lat, lng });
                  return null; // Ne pas afficher ce marqueur
                }

                return (
                  <Marker
                    key={incident.id}
                    position={[lat, lng]}
                    icon={getIncidentIcon(incident.typeIncident, incident.statut)}
                    ref={el => markerRefs.current[incident.id] = el}
                  >
                    <Popup maxWidth={320} minWidth={280}>
                      <div style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        padding: '0',
                        margin: '-15px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                      }}>
                        {/* Header avec gradient */}
                        <div style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          padding: '16px',
                          borderBottom: '3px solid rgba(255, 255, 255, 0.1)',
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px'
                          }}>
                            <span style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              color: '#fff',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                            }}>
                              #{incident.id}
                            </span>
                            <span style={{
                              background: statut.color === 'success' ? '#10b981' :
                                statut.color === 'warning' ? '#f59e0b' :
                                  statut.color === 'danger' ? '#ef4444' : '#6b7280',
                              color: '#fff',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}>
                              {statut.label}
                            </span>
                          </div>
                          <h3 style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            margin: '0',
                            color: '#fff',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                          }}>
                            {incident.typeIncident}
                          </h3>
                        </div>

                        {/* Corps */}
                        <div style={{ padding: '16px' }}>
                          {/* Type d'incident avec icône */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px',
                            padding: '10px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>
                              {incident.typeIncident === 'Voirie' ? '🛣️' :
                                incident.typeIncident === 'Éclairage public' ? '💡' :
                                  incident.typeIncident === 'Assainissement' ? '🚰' :
                                    incident.typeIncident === 'Espaces verts' ? '🌳' :
                                      incident.typeIncident === 'Propreté' ? '🧹' :
                                        incident.typeIncident === 'Sécurité' ? '🛡️' :
                                          incident.typeIncident === 'Transport' ? '🚌' : '📍'}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '0.7rem',
                                color: 'rgba(147, 197, 253, 0.8)',
                                marginBottom: '2px',
                                fontWeight: '600'
                              }}>
                                CATÉGORIE
                              </div>
                              <div style={{
                                fontSize: '0.9rem',
                                color: '#fff',
                                fontWeight: '600'
                              }}>
                                {incident.typeIncident}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {incident.description && (
                            <div style={{
                              marginBottom: '12px',
                              padding: '10px',
                              background: 'rgba(51, 65, 85, 0.5)',
                              borderRadius: '8px',
                              borderLeft: '3px solid #3b82f6'
                            }}>
                              <div style={{
                                fontSize: '0.85rem',
                                color: 'rgba(226, 232, 240, 0.9)',
                                lineHeight: '1.5',
                                maxHeight: '60px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {incident.description}
                              </div>
                            </div>
                          )}

                          {/* Infos en grille */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            {/* Secteur */}
                            <div style={{
                              padding: '8px',
                              background: 'rgba(51, 65, 85, 0.4)',
                              borderRadius: '6px'
                            }}>
                              <div style={{
                                fontSize: '0.65rem',
                                color: 'rgba(148, 163, 184, 0.9)',
                                marginBottom: '4px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Secteur
                              </div>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#fff',
                                fontWeight: '600'
                              }}>
                                {getSecteurNom(incident.secteurId)}
                              </div>
                            </div>

                            {/* Province */}
                            <div style={{
                              padding: '8px',
                              background: 'rgba(51, 65, 85, 0.4)',
                              borderRadius: '6px'
                            }}>
                              <div style={{
                                fontSize: '0.65rem',
                                color: 'rgba(148, 163, 184, 0.9)',
                                marginBottom: '4px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                Province
                              </div>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#fff',
                                fontWeight: '600'
                              }}>
                                {incident.province || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Date avec icône */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px',
                            background: 'rgba(59, 130, 246, 0.08)',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.15)'
                          }}>
                            <span style={{ fontSize: '0.9rem' }}>📅</span>
                            <div>
                              <div style={{
                                fontSize: '0.65rem',
                                color: 'rgba(147, 197, 253, 0.7)',
                                fontWeight: '600'
                              }}>
                                DÉCLARÉ LE
                              </div>
                              <div style={{
                                fontSize: '0.8rem',
                                color: 'rgba(226, 232, 240, 0.95)',
                                fontWeight: '500'
                              }}>
                                {formatDate(incident.dateDeclaration)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;

