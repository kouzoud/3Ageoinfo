import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, RefreshCw, AlertCircle, Eye, Navigation, Clock, CheckCircle2, XCircle, Loader2, Layers, Target, ChevronDown, ChevronUp } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useCitizenDeviceId } from '../hooks/useCitizenDeviceId';
import { publicAPI } from '../services/api';
import PWAGuard from '../components/PWAGuard';

// Création d'icônes personnalisées pour les incidents
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 18px;
        color: white;
        cursor: pointer;
        position: relative;
      ">
        ${symbol}
        <div style="
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${color};
        "></div>
      </div>
    `,
    className: 'custom-incident-marker',
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46]
  });
};

// Icônes par statut d'incident
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

// Composant pour ajuster la vue de la carte
const MapUpdater = ({ incidents, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents
          .filter(inc => inc.latitude && inc.longitude)
          .map(incident => [parseFloat(incident.latitude), parseFloat(incident.longitude)])
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [incidents, userLocation, map]);

  return null;
};

// Formater le statut pour l'affichage
const formatStatut = (statut) => {
  const statutMap = {
    'REDIGE': { label: 'Rédigé', color: '#6b7280', icon: Clock },
    'PRISE_EN_COMPTE': { label: 'Pris en compte', color: '#6366f1', icon: Eye },
    'VALIDE': { label: 'Validé', color: '#3b82f6', icon: CheckCircle2 },
    'EN_COURS_DE_TRAITEMENT': { label: 'En cours', color: '#f59e0b', icon: Loader2 },
    'TRAITE': { label: 'Traité', color: '#10b981', icon: CheckCircle2 },
    'REJETE': { label: 'Rejeté', color: '#ef4444', icon: XCircle },
    'BLOQUE': { label: 'Bloqué', color: '#dc2626', icon: AlertCircle }
  };
  return statutMap[statut] || { label: statut, color: '#6b7280', icon: Clock };
};

/**
 * Page Ma Carte - Visualisation géographique des incidents du citoyen
 * Affiche uniquement les incidents déclarés par le citoyen actuel
 */
const MaCarte = () => {
  const { deviceId, isLoading: deviceIdLoading } = useCitizenDeviceId();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedBaseLayer, setSelectedBaseLayer] = useState('streets');
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const markerRefs = useRef({});
  const mapRef = useRef(null);

  // Récupérer la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.log('Géolocalisation non disponible:', err.message);
        }
      );
    }
  }, []);

  // Récupérer les incidents du citoyen
  const fetchMyIncidents = async () => {
    try {
      setError(null);
      const email = localStorage.getItem('citizenEmail');

      let data = [];
      if (email) {
        console.log('📧 Récupération carte par email:', email);
        data = await publicAPI.getIncidentsByEmail(email);
      } else if (deviceId) {
        console.log('🔑 Récupération carte par UUID:', deviceId);
        data = await publicAPI.getIncidentsByDeviceId(deviceId);
      }

      // Filtrer les incidents avec coordonnées valides
      const incidentsWithCoords = data.filter(
        inc => inc.latitude && inc.longitude && 
               !isNaN(parseFloat(inc.latitude)) && 
               !isNaN(parseFloat(inc.longitude))
      );

      setIncidents(incidentsWithCoords);
      console.log(`✅ ${incidentsWithCoords.length} incidents avec coordonnées`);
    } catch (err) {
      console.error('Erreur récupération incidents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('citizenEmail');
    if (email || deviceId) {
      fetchMyIncidents();
    } else if (!deviceIdLoading) {
      setLoading(false);
    }
  }, [deviceId, deviceIdLoading]);

  // Rafraîchir les incidents
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMyIncidents();
  };

  // Centre par défaut (Maroc)
  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [31.7917, -7.0926];

  // Options de fond de carte
  const baseLayers = {
    streets: {
      name: 'Plan',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap'
    },
    satellite: {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    terrain: {
      name: 'Terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap'
    }
  };

  // Centrer sur la position de l'utilisateur
  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
    }
  };

  // Centrer sur un incident spécifique
  const focusOnIncident = (incident) => {
    if (mapRef.current) {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      mapRef.current.setView([lat, lng], 17, { animate: true });
      setSelectedIncident(incident.id);
      setTimeout(() => {
        if (markerRefs.current[incident.id]) {
          markerRefs.current[incident.id].openPopup();
        }
      }, 500);
    }
  };

  // Statistiques des incidents
  const stats = {
    total: incidents.length,
    enCours: incidents.filter(i => ['REDIGE', 'PRISE_EN_COMPTE', 'VALIDE', 'EN_COURS_DE_TRAITEMENT'].includes(i.statut)).length,
    traites: incidents.filter(i => i.statut === 'TRAITE').length,
    rejetes: incidents.filter(i => ['REJETE', 'BLOQUE'].includes(i.statut)).length
  };

  if (loading || deviceIdLoading) {
    return (
      <PWAGuard>
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} className="spin" style={{ color: 'var(--primary-color)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Chargement de votre carte...</p>
          </div>
        </div>
      </PWAGuard>
    );
  }

  return (
    <PWAGuard>
      <div className="page" style={{ padding: 0, height: 'calc(100vh - 140px)', position: 'relative' }}>
        
        {/* Header professionnel avec stats */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '12px 16px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={20} color="white" />
                </div>
                Ma Carte
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {incidents.length === 0 ? 'Aucun incident' : `${incidents.length} incident${incidents.length > 1 ? 's' : ''} déclaré${incidents.length > 1 ? 's' : ''}`}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Bouton centrer sur moi */}
              {userLocation && (
                <button
                  onClick={centerOnUser}
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    padding: '10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="Ma position"
                >
                  <Target size={18} style={{ color: '#3b82f6' }} />
                </button>
              )}
              
              {/* Bouton rafraîchir */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{
                  background: isRefreshing ? '#f1f5f9' : 'white',
                  border: '1px solid #e2e8f0',
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} style={{ color: '#64748b' }} />
              </button>
            </div>
          </div>

          {/* Mini stats */}
          {incidents.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              overflowX: 'auto',
              paddingBottom: '4px'
            }}>
              <div style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '1rem' }}>{stats.total}</span> Total
              </div>
              <div style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: '20px',
                background: '#fef3c7',
                color: '#92400e',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '1rem' }}>{stats.enCours}</span> En cours
              </div>
              <div style={{
                flex: '0 0 auto',
                padding: '8px 14px',
                borderRadius: '20px',
                background: '#d1fae5',
                color: '#065f46',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '1rem' }}>{stats.traites}</span> Traités
              </div>
            </div>
          )}
        </div>

        {/* Message si aucun incident */}
        {incidents.length === 0 && !error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'white',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            textAlign: 'center',
            maxWidth: '85%',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <MapPin size={36} style={{ color: '#94a3b8' }} />
            </div>
            <h3 style={{ margin: '0 0 0.75rem', color: '#1e293b', fontSize: '1.2rem', fontWeight: '700' }}>
              Aucun incident déclaré
            </h3>
            <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Vos signalements apparaîtront ici sur la carte avec leur statut en temps réel
            </p>
            <a
              href="/declarer-incident"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              <MapPin size={18} />
              Signaler un incident
            </a>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fecaca',
            padding: '14px 18px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}>
            <AlertCircle size={22} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ color: '#dc2626', fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
          </div>
        )}

        {/* Carte */}
        <MapContainer
          center={defaultCenter}
          zoom={incidents.length > 0 ? 12 : 6}
          style={{ height: '100%', width: '100%', paddingTop: incidents.length > 0 ? '130px' : '90px' }}
          zoomControl={false}
          ref={mapRef}
          whenReady={(e) => { mapRef.current = e.target; }}
        >
          <TileLayer
            attribution={baseLayers[selectedBaseLayer].attribution}
            url={baseLayers[selectedBaseLayer].url}
          />

          <MapUpdater incidents={incidents} userLocation={userLocation} />

          {/* Marqueurs des incidents */}
          {incidents.map(incident => {
            const lat = parseFloat(incident.latitude);
            const lng = parseFloat(incident.longitude);
            const statutInfo = formatStatut(incident.statut);
            const StatutIcon = statutInfo.icon;

            return (
              <Marker
                key={incident.id}
                position={[lat, lng]}
                icon={getIncidentIcon(incident.typeIncident, incident.statut)}
                ref={(ref) => { markerRefs.current[incident.id] = ref; }}
              >
                <Popup>
                  <div style={{ minWidth: '220px', padding: '4px' }}>
                    {/* Photo si disponible */}
                    {incident.photoUrl && (
                      <img
                        src={incident.photoUrl}
                        alt="Photo incident"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '10px'
                        }}
                      />
                    )}

                    {/* Type d'incident */}
                    <h3 style={{ margin: '0 0 8px', fontSize: '1rem', color: '#1e293b' }}>
                      {incident.typeIncident}
                    </h3>

                    {/* Statut */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: `${statutInfo.color}15`,
                      color: statutInfo.color,
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      <StatutIcon size={14} />
                      {statutInfo.label}
                    </div>

                    {/* Description */}
                    {incident.description && (
                      <p style={{ 
                        margin: '0 0 10px', 
                        fontSize: '0.85rem', 
                        color: '#475569',
                        lineHeight: '1.4'
                      }}>
                        {incident.description.length > 100 
                          ? incident.description.substring(0, 100) + '...' 
                          : incident.description}
                      </p>
                    )}

                    {/* Date */}
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      {new Date(incident.dateCreation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Bouton navigation */}
                    <button
                      onClick={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                      }}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '8px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Navigation size={14} />
                      Y aller
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Marqueur position utilisateur */}
          {userLocation && (
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={L.divIcon({
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
                  "></div>
                `,
                className: 'user-location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })}
            >
              <Popup>
                <div style={{ textAlign: 'center', padding: '4px' }}>
                  <strong>📍 Votre position</strong>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Sélecteur de fond de carte */}
        <div style={{
          position: 'absolute',
          top: incidents.length > 0 ? '145px' : '105px',
          right: '16px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowLayerSelector(!showLayerSelector)}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={18} style={{ color: '#64748b' }} />
          </button>
          
          {showLayerSelector && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '8px',
              minWidth: '140px',
              border: '1px solid #e2e8f0'
            }}>
              {Object.entries(baseLayers).map(([key, layer]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedBaseLayer(key);
                    setShowLayerSelector(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: 'none',
                    background: selectedBaseLayer === key ? '#eff6ff' : 'transparent',
                    color: selectedBaseLayer === key ? '#1d4ed8' : '#475569',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: selectedBaseLayer === key ? '600' : '500',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {selectedBaseLayer === key && (
                    <CheckCircle2 size={14} />
                  )}
                  {layer.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Légende professionnelle */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '16px',
          background: 'white',
          borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          zIndex: 1000,
          overflow: 'hidden',
          border: '1px solid #f1f5f9',
          maxWidth: legendExpanded ? '200px' : '120px',
          transition: 'all 0.3s ease'
        }}>
          <button
            onClick={() => setLegendExpanded(!legendExpanded)}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: 'none',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>Légende</span>
            {legendExpanded ? <ChevronDown size={14} color="#64748b" /> : <ChevronUp size={14} color="#64748b" />}
          </button>
          
          {legendExpanded && (
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#6b7280',
                  boxShadow: '0 2px 4px rgba(107, 114, 128, 0.3)'
                }}></span>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>Rédigé</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#6366f1',
                  boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                }}></span>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>Pris en compte</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#f59e0b',
                  boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                }}></span>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>En cours</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#10b981',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                }}></span>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>Traité</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: '#ef4444',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                }}></span>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '500' }}>Rejeté</span>
              </div>
            </div>
          )}
        </div>

        {/* Liste des incidents (carrousel en bas) */}
        {incidents.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: legendExpanded ? '220px' : '150px',
            right: '16px',
            zIndex: 1000,
            overflowX: 'auto',
            display: 'flex',
            gap: '10px',
            paddingBottom: '4px',
            transition: 'left 0.3s ease'
          }}>
            {incidents.map(incident => {
              const statutInfo = formatStatut(incident.statut);
              return (
                <button
                  key={incident.id}
                  onClick={() => focusOnIncident(incident)}
                  style={{
                    flex: '0 0 auto',
                    background: selectedIncident === incident.id ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'white',
                    border: selectedIncident === incident.id ? 'none' : '1px solid #e2e8f0',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    minWidth: '140px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: statutInfo.color,
                    flexShrink: 0
                  }}></span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '600', 
                      color: selectedIncident === incident.id ? 'white' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100px'
                    }}>
                      {incident.typeIncident}
                    </div>
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: selectedIncident === incident.id ? 'rgba(255,255,255,0.8)' : '#94a3b8' 
                    }}>
                      {statutInfo.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PWAGuard>
  );
};

export default MaCarte;
