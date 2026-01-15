import { useState, useEffect } from 'react';
import {
  MapPin,
  Camera,
  Upload,
  Send,
  AlertCircle,
  CheckCircle2,
  Info,
  MapIcon,
  FileText,
  Tag,
  ShieldAlert,
  WifiOff,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { publicAPI, secteursAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { useCitizenDeviceId } from '../hooks/useCitizenDeviceId';
import PWAGuard from '../components/PWAGuard';
import { useMemo } from 'react';

// ============================================
// CONSTANTES - Suggestions & Exemples
// ============================================

// Exemples de description par secteur
const DESCRIPTION_EXEMPLES = {
  'Infrastructure': 'Ex: Localisation précise, dimensions du dégât, danger immédiat pour la circulation, fréquentation du lieu...',
  'Environnement': 'Ex: Type de pollution, quantité estimée, impact sur les résidents, présence d\'odeurs...',
  'Sécurité': 'Ex: Nature exacte du danger, visibilité réduite, fréquentation piétonne, risque d\'accident...',
  'Services Publics': 'Ex: Type de dysfonctionnement, depuis quand, nombre de personnes affectées...',
  'Transport': 'Ex: Numéro de ligne concernée, impact sur les usagers, alternative disponible...',
  'Urbanisme': 'Ex: Impact visuel, conformité urbanistique, gêne pour les riverains...',
  'Santé': 'Ex: Niveau d\'urgence, personnes à risque, mesures déjà prises...'
};

// Mapping Secteur → Catégories (pour filtrage intelligent)
const SECTEUR_CATEGORIES = {
  'Infrastructure': ['Voirie', 'Assainissement', 'Éclairage public'],
  'Environnement': ['Espaces verts', 'Propreté'],
  'Sécurité': ['Sécurité', 'Éclairage public'],
  'Services Publics': ['Assainissement', 'Éclairage public'],
  'Transport': ['Transport'],
  'Urbanisme': ['Voirie', 'Espaces verts'],
  'Santé': ['Propreté', 'Espaces verts']
};

// Toutes les catégories disponibles
const ALL_CATEGORIES = ['Voirie', 'Éclairage public', 'Assainissement', 'Espaces verts', 'Propreté', 'Sécurité', 'Transport', 'Autre'];


/**
 * Page de déclaration d'incident
 * Utilise l'API publique pour créer un nouvel incident anonyme
 * RESTRICTION: Accessible uniquement en mode PWA (standalone app)
 */
const DeclarerIncident = () => {
  const { user, isAuthenticated } = useAuth();
  const { isOnline } = useOnlineStatus();
  const { deviceId } = useCitizenDeviceId(); // Identifiant anonyme du citoyen

  // Hook pour la file d'attente hors-ligne
  const submitIncident = async (incidentData, photo) => {
    return publicAPI.declarerIncidentAnonymous(incidentData, photo);
  };
  const {
    queueLength,
    hasQueuedItems,
    addToQueue,
    isSyncing
  } = useOfflineQueue(submitIncident);

  // Vérification du rôle - ADMIN et PROFESSIONNEL ne peuvent pas déclarer
  const isBlocked = isAuthenticated() &&
    (user?.role === 'ADMIN' || user?.role === 'PROFESSIONNEL' ||
      user?.role === 'admin' || user?.role === 'professionnel');

  const [formData, setFormData] = useState({
    description: '',
    typeIncident: '',
    secteurId: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMetadata, setPhotoMetadata] = useState(null); // GPS data captured with photo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [secteurs, setSecteurs] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);

  // Si l'utilisateur est bloqué, afficher un message d'erreur
  if (isBlocked) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '4rem' }}>
          <div className="card" style={{ padding: '3rem' }}>
            <ShieldAlert size={64} style={{ color: 'var(--danger-color)', marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem', color: 'var(--danger-color)' }}>Accès Refusé</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
              En tant que <strong>{user?.role}</strong>, vous n'êtes pas autorisé à déclarer des incidents.
              <br /><br />
              Seuls les <strong>citoyens</strong> peuvent signaler de nouveaux incidents.
            </p>
            <Link
              to={user?.role === 'ADMIN' || user?.role === 'admin' ? '/admin' : '/pro'}
              className="btn btn-primary"
            >
              Retour à mon espace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'description':
        // Description optionnelle - juste vérifier la longueur minimale si remplie
        if (value.trim() && value.length < 20) errors.description = 'La description doit contenir au moins 20 caractères si vous en ajoutez une';
        break;
      case 'typeIncident':
        if (!value) errors.typeIncident = 'Le type d\'incident est obligatoire';
        break;
      case 'secteurId':
        if (!value) errors.secteurId = 'Le secteur est obligatoire';
        break;
      case 'photo':
        if (!value) errors.photo = 'La photo est obligatoire';
        break;
      default:
        break;
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si secteur change, réinitialiser la catégorie
    if (name === 'secteurId' && formData.typeIncident) {
      const secteur = secteurs.find(s => s.id == value);
      const allowedCategories = SECTEUR_CATEGORIES[secteur?.nom] || ALL_CATEGORIES;
      if (!allowedCategories.includes(formData.typeIncident)) {
        setFormData(prev => ({ ...prev, typeIncident: '' }));
      }
    }

    // Validation en temps réel
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      ...fieldError,
      [name]: fieldError[name] || undefined
    }));

    // Effacer les messages globaux
    if (error) setError('');
    if (message) setMessage('');
  };

  // Fonction pour ouvrir la caméra - avec fallback pour HTTP
  const openCamera = async () => {
    try {
      const isSecureContext = window.isSecureContext;
      const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;

      // Si HTTP (non-HTTPS) ou API non supportée, utiliser input file
      if (!isSecureContext || !hasMediaDevices) {
        // Créer un input file temporaire avec capture="camera"
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Ouvre la caméra directement sur mobile

        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // Vérifier la taille
          if (file.size > 5 * 1024 * 1024) {
            setFieldErrors(prev => ({ ...prev, photo: 'La photo ne doit pas dépasser 5 MB' }));
            return;
          }

          // Capturer le GPS au moment de la prise de photo
          try {
            const gpsData = await captureGPSAtPhotoMoment();
            setPhotoMetadata(gpsData);
            console.log('📍 GPS capturé:', gpsData);
          } catch (gpsError) {
            console.error('Erreur GPS:', gpsError);

            // Ne pas bloquer - continuer sans GPS avec valeur par défaut
            alert('⚠️ GPS non disponible\n\nLa localisation ne peut pas être capturée sur HTTP.\n\nVotre photo sera enregistrée mais sans coordonnées GPS précises.');

            // Utiliser coordonnées par défaut (centre du Maroc)
            setPhotoMetadata({
              latitude: 31.7917, // Marrakech (centre approximatif)
              longitude: -7.0926,
              accuracy: 999999, // Précision très faible = GPS non disponible
              timestamp: Date.now()
            });

            setFieldErrors(prev => ({ ...prev, photo: '⚠️ Photo enregistrée sans GPS' }));
          }

          // Stocker la photo
          setPhoto(file);

          // Créer une prévisualisation
          const reader = new FileReader();
          reader.onload = (e) => setPhotoPreview(e.target.result);
          reader.readAsDataURL(file);

          // Effacer les erreurs
          setFieldErrors(prev => ({ ...prev, photo: undefined }));
          if (error) setError('');

          console.log('✅ Photo + GPS capturés via input file');
        };

        // Déclencher le sélecteur de fichier
        input.click();
        return;
      }

      // Code original pour HTTPS (getUserMedia)
      // Vérifier si l'API est supportée
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setFieldErrors(prev => ({ ...prev, photo: 'Votre appareil ne supporte pas la capture photo' }));
        return;
      }

      // Demander l'accès à la caméra (arrière de préférence)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Caméra arrière sur mobile
        audio: false
      });

      // Créer un élément vidéo pour afficher le flux de la caméra
      const video = document.createElement('video');
      video.setAttribute('playsinline', 'true');
      video.setAttribute('autoplay', 'true');
      video.muted = true; // Important pour autoplay sur certains navigateurs

      video.style.cssText = `
        width: 100%;
        height: 70vh;
        max-width: 100vw;
        object-fit: cover;
        background: black;
      `;

      // Créer une interface modale pour la caméra
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: black;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;

      // Indicateur GPS en temps réel (en haut)
      const gpsIndicator = document.createElement('div');
      gpsIndicator.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 10001;
        backdrop-filter: blur(10px);
      `;
      gpsIndicator.innerHTML = '📍 Recherche GPS...';

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        position: absolute;
        bottom: 30px;
        display: flex;
        gap: 20px;
        padding: 20px;
      `;

      const captureBtn = document.createElement('button');
      captureBtn.textContent = '📸 Prendre la photo';
      captureBtn.disabled = false;
      captureBtn.style.cssText = `
        background: #3b82f6;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        opacity: 1;
      `;

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = '✕ Annuler';
      cancelBtn.style.cssText = `
        background: #ef4444;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 50px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
      `;

      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      modal.appendChild(gpsIndicator);
      modal.appendChild(video);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);

      // Attacher le flux vidéo et démarrer immédiatement
      video.srcObject = stream;

      // Attendre que les métadonnées soient chargées
      video.addEventListener('loadedmetadata', () => {
        console.log('🎥 Métadonnées vidéo chargées:', {
          width: video.videoWidth,
          height: video.videoHeight
        });

        // Appliquer les styles après chargement des métadonnées
        video.style.width = '100%';
        video.style.height = '70vh';
        video.style.objectFit = 'cover';
        video.style.display = 'block';
        video.style.visibility = 'visible';
        video.style.opacity = '1';
        video.style.zIndex = '1';
        video.style.transform = 'translateZ(0)';
        video.style.webkitTransform = 'translateZ(0)';
        video.style.backfaceVisibility = 'hidden';

        console.log('✅ Styles vidéo appliqués après métadonnées');
      });

      // Démarrer la vidéo
      video.play().then(() => {
        console.log('📹 Vidéo play() réussie');
      }).catch(err => {
        console.error('Erreur play():', err);
      });

      console.log('📹 Flux caméra attaché, en attente métadonnées');

      // 🎯 SURVEILLANCE GPS EN CONTINU pour meilleure précision
      let currentGPSData = null;
      let gpsWatchId = null;

      if (navigator.geolocation) {
        gpsWatchId = navigator.geolocation.watchPosition(
          (position) => {
            const accuracy = Math.round(position.coords.accuracy);

            // Mettre à jour les données GPS actuelles
            currentGPSData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };

            // Couleur selon la précision
            let color, icon, status;
            if (accuracy <= 20) {
              color = '#10b981'; // Vert - Excellent
              icon = '✅';
              status = 'Excellente';
            } else if (accuracy <= 50) {
              color = '#3b82f6'; // Bleu - Bonne
              icon = '📍';
              status = 'Bonne';
            } else if (accuracy <= 100) {
              color = '#f59e0b'; // Orange - Moyenne
              icon = '⚠️';
              status = 'Moyenne';
            } else {
              color = '#ef4444'; // Rouge - Mauvaise
              icon = '❌';
              status = 'Faible';
            }

            // Mettre à jour l'indicateur GPS
            gpsIndicator.style.background = `rgba(0, 0, 0, 0.85)`;
            gpsIndicator.style.border = `2px solid ${color}`;
            gpsIndicator.innerHTML = `${icon} GPS: ±${accuracy}m (${status})`;

            // Le bouton reste toujours actif, quelle que soit la précision
            console.log(`📍 GPS mis à jour: ±${accuracy}m`, currentGPSData);
          },
          (error) => {
            console.error('Erreur GPS:', error);
            gpsIndicator.style.border = '2px solid #ef4444';
            gpsIndicator.innerHTML = '❌ GPS indisponible';
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0 // Pas de cache
          }
        );
      }

      // Fonction pour arrêter la caméra, GPS et fermer la modal
      const closeCamera = () => {
        stream.getTracks().forEach(track => track.stop());
        if (gpsWatchId !== null) {
          navigator.geolocation.clearWatch(gpsWatchId);
        }
        document.body.removeChild(modal);
      };

      // Bouton annuler
      cancelBtn.onclick = closeCamera;

      // Bouton capturer
      captureBtn.onclick = async () => {
        if (!currentGPSData) {
          alert('⚠️ GPS non disponible. Veuillez réessayer.');
          return;
        }

        // Désactiver le bouton pendant le traitement
        captureBtn.disabled = true;
        captureBtn.textContent = '⏳ Capture en cours...';
        captureBtn.style.opacity = '0.7';

        try {
          console.log('📍 GPS utilisé pour la photo:', currentGPSData);

          // Créer un canvas pour capturer l'image
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          // Convertir en blob
          canvas.toBlob((blob) => {
            if (blob) {
              // Vérifier la taille
              if (blob.size > 5 * 1024 * 1024) {
                setFieldErrors(prev => ({ ...prev, photo: 'La photo ne doit pas dépasser 5 MB' }));
                closeCamera();
                return;
              }

              // Créer un fichier à partir du blob
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
              setPhoto(file);

              // Stocker les métadonnées GPS avec la photo
              setPhotoMetadata(currentGPSData);

              // Créer une prévisualisation
              const reader = new FileReader();
              reader.onload = (e) => setPhotoPreview(e.target.result);
              reader.readAsDataURL(file);

              // Effacer les erreurs
              setFieldErrors(prev => ({ ...prev, photo: undefined }));
              if (error) setError('');

              console.log('✅ Photo + GPS capturés avec succès');
              closeCamera();
            }
          }, 'image/jpeg', 0.9);

        } catch (captureError) {
          console.error('Erreur capture:', captureError);
          setFieldErrors(prev => ({ ...prev, photo: 'Erreur lors de la capture' }));
          closeCamera();
        }
      };

    } catch (err) {
      console.error('Erreur caméra:', err);
      if (err.name === 'NotAllowedError') {
        setFieldErrors(prev => ({ ...prev, photo: 'Accès à la caméra refusé. Veuillez autoriser l\'accès dans les paramètres.' }));
      } else if (err.name === 'NotFoundError') {
        setFieldErrors(prev => ({ ...prev, photo: 'Aucune caméra trouvée sur cet appareil' }));
      } else {
        setFieldErrors(prev => ({ ...prev, photo: 'Impossible d\'accéder à la caméra' }));
      }
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoMetadata(null); // Effacer aussi les données GPS
    // Ajouter une erreur car la photo est obligatoire
    setFieldErrors(prev => ({ ...prev, photo: 'La photo est obligatoire' }));
  };

  // Charger les secteurs depuis l'API
  useEffect(() => {
    const loadSecteurs = async () => {
      try {
        const data = await secteursAPI.getAll();
        console.log('Secteurs chargés depuis l\'API:', data);
        setSecteurs(data);
      } catch (err) {
        console.error('Erreur lors du chargement des secteurs:', err);
        setError('Impossible de charger les secteurs');
      }
    };
    loadSecteurs();
  }, []);

  /**
   * Récupère la position GPS au moment exact de la prise de photo
   * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: number}>}
   */
  const captureGPSAtPhotoMoment = async () => {
    if (!navigator.geolocation) {
      throw new Error('Votre navigateur ne supporte pas la géolocalisation.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now() // Timestamp de la capture
          });
        },
        (geoError) => {
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              reject(new Error('📍 Accès à la localisation refusé. Veuillez autoriser la localisation pour prendre une photo.'));
              break;
            case geoError.POSITION_UNAVAILABLE:
              reject(new Error('📍 Position GPS indisponible. Vérifiez que le GPS est activé.'));
              break;
            case geoError.TIMEOUT:
              reject(new Error('📍 Délai GPS dépassé. Veuillez réessayer.'));
              break;
            default:
              reject(new Error('📍 Erreur GPS inconnue.'));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0 // Pas de cache, position fraîche
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSavedOffline(false);
    setIsSubmitting(true);
    setIsGettingLocation(true);

    try {
      // Validation complète du formulaire
      const allErrors = {};
      Object.keys(formData).forEach(key => {
        if (['description', 'typeIncident', 'secteurId'].includes(key)) {
          const fieldError = validateField(key, formData[key]);
          Object.assign(allErrors, fieldError);
        }
      });

      // Validation de la photo (obligatoire) - GPS optionnel maintenant
      if (!photo) {
        allErrors.photo = 'La photo est obligatoire';
      }
      if (!photoMetadata) {
        allErrors.photo = 'Erreur: métadonnées photo manquantes. Veuillez reprendre la photo.';
      }

      if (Object.keys(allErrors).length > 0) {
        setFieldErrors(allErrors);
        throw new Error('Veuillez corriger les erreurs dans le formulaire');
      }

      // Utiliser les coordonnées GPS capturées au moment de la photo
      const geoData = photoMetadata;
      console.log('📍 Utilisation GPS du moment de la photo:', geoData);

      // Préparer les données pour l'API - avec géolocalisation automatique
      const incidentData = {
        typeIncident: formData.typeIncident,
        description: formData.description,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        accuracy: geoData.accuracy, // Précision GPS en mètres
        secteurId: parseInt(formData.secteurId),
        deviceId: deviceId, // Identifiant anonyme du citoyen (UUID)
        citizenEmail: localStorage.getItem('citizenEmail') || null // Email si disponible
      };

      // Si hors-ligne, sauvegarder dans la file d'attente
      if (!isOnline) {
        await addToQueue(incidentData, photo);
        setSavedOffline(true);
        setMessage('Incident sauvegardé localement. Il sera envoyé automatiquement à la reconnexion.');

        // Réinitialiser le formulaire
        resetForm();
      } else {
        // Envoyer à l'API publique
        const result = await publicAPI.declarerIncidentAnonymous(incidentData, photo);
        setMessage('Incident déclaré avec succès ! ID: ' + result.id);

        // Réinitialiser le formulaire
        resetForm();
      }

    } catch (err) {
      // Si erreur réseau, proposer de sauvegarder hors-ligne
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed')) {
        setError('Connexion impossible. L\'incident a été sauvegardé localement.');
        try {
          const incidentData = {
            typeIncident: formData.typeIncident,
            description: formData.description,
            latitude: null, // Sera récupéré à la synchronisation
            longitude: null,
            secteurId: parseInt(formData.secteurId),
            deviceId: deviceId // Identifiant anonyme du citoyen
          };
          await addToQueue(incidentData, photo);
          setSavedOffline(true);
          resetForm();
        } catch (queueErr) {
          setError('Erreur lors de la sauvegarde locale: ' + queueErr.message);
        }
      } else {
        setError('Erreur lors de la déclaration: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      description: '',
      typeIncident: '',
      secteurId: ''
    });
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoMetadata(null); // Réinitialiser les métadonnées GPS
  };

  return (
    <PWAGuard>
      <div className="page">
        <div className="container" style={{ maxWidth: '600px' }}>
          <div className="page-header">
            <h1 className="page-title">Déclarer un incident</h1>
            <p className="page-description">
              Signalez un incident dans votre ville de manière rapide et efficace
            </p>

            {/* Avertissement mode hors-ligne */}
            {!isOnline && (
              <div style={{
                marginTop: '1rem',
                padding: '12px 16px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <WifiOff size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#b45309' }}>Mode hors-ligne</strong>
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0 }}>
                    Votre déclaration sera sauvegardée et envoyée automatiquement à la reconnexion.
                  </p>
                </div>
              </div>
            )}

            {/* Indicateur d'incidents en attente */}
            {hasQueuedItems && (
              <div style={{
                marginTop: '1rem',
                padding: '12px 16px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Clock size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#1d4ed8' }}>{queueLength} incident(s) en attente</strong>
                  <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: 0 }}>
                    {isSyncing ? 'Synchronisation en cours...' : 'Sera envoyé dès que possible.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card">

            {/* Description */}
            <div className="form-group enhanced">
              <label htmlFor="description" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} />
                Description détaillée (optionnelle)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${fieldErrors.description ? 'error' : formData.description.length >= 20 ? 'success' : ''}`}
                rows="5"
                placeholder={useMemo(() => {
                  const secteur = secteurs.find(s => s.id == formData.secteurId);
                  return secteur ? DESCRIPTION_EXEMPLES[secteur.nom] || '📝 Décrivez l\'incident...' : '📝 Décrivez l\'incident...';
                }, [formData.secteurId, secteurs])}
                maxLength="500"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                {fieldErrors.description && (
                  <span className="form-error-message" style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} />
                    {fieldErrors.description}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                  {formData.description.length}/500
                </span>
              </div>
              <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Info size={12} />
                💡 Optionnelle mais recommandée - Plus vous êtes précis, plus l'intervention sera rapide
              </div>
            </div>

            {/* Secteur */}
            <div className="form-group enhanced">
              <label htmlFor="secteurId" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapIcon size={16} />
                Secteur géographique *
              </label>
              <select
                id="secteurId"
                name="secteurId"
                value={formData.secteurId}
                onChange={handleChange}
                className={`form-select ${fieldErrors.secteurId ? 'error' : formData.secteurId ? 'success' : ''}`}
                required
              >
                <option value="">📍 Choisir votre secteur</option>
                {secteurs.map(secteur => {
                  // Mapper chaque secteur à son emoji approprié
                  const getSecteurEmoji = (nom) => {
                    const emojiMap = {
                      'Infrastructure': '🏗️',
                      'Environnement': '🌿',
                      'Sécurité': '🚨',
                      'Urbanisme': '🏙️',
                      'Transport': '🚌',
                      'Santé': '⚕️',
                      'Services Publics': '💧'
                    };
                    return emojiMap[nom] || '🏘️';
                  };

                  return (
                    <option key={secteur.id} value={secteur.id}>
                      {getSecteurEmoji(secteur.nom)} {secteur.nom}
                    </option>
                  );
                })}
              </select>
              {fieldErrors.secteurId && (
                <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <AlertCircle size={12} />
                  {fieldErrors.secteurId}
                </span>
              )}
              <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Info size={12} />
                Le secteur permet d'orienter votre signalement vers le service compétent
              </div>
            </div>

            {/* Type d'incident */}
            <div className="form-group enhanced">
              <label htmlFor="typeIncident" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} />
                Catégorie d'incident *
              </label>
              <select
                id="typeIncident"
                name="typeIncident"
                value={formData.typeIncident}
                onChange={handleChange}
                className={`form-select ${fieldErrors.typeIncident ? 'error' : formData.typeIncident ? 'success' : ''}`}
                required
              >
                <option value="">🏷️ Sélectionner la catégorie</option>
                {(() => {
                  const secteur = secteurs.find(s => s.id == formData.secteurId);
                  const allowedCategories = secteur ? (SECTEUR_CATEGORIES[secteur.nom] || ALL_CATEGORIES) : ALL_CATEGORIES;

                  const categoryOptions = [
                    { value: 'Voirie', label: '🛣️ Voirie (nids-de-poule, chaussée dégradée)' },
                    { value: 'Éclairage public', label: '💡 Éclairage public (lampadaire défaillant)' },
                    { value: 'Assainissement', label: '🚰 Assainissement (fuite, égout bouché)' },
                    { value: 'Espaces verts', label: '🌳 Espaces verts (arbres dangereux, jardins)' },
                    { value: 'Propreté', label: '🧹 Propreté urbaine (déchets, graffitis)' },
                    { value: 'Sécurité', label: '🛡️ Sécurité publique (signalisation défaillante)' },
                    { value: 'Transport', label: '🚌 Transport public (arrêt endommagé)' },
                    { value: 'Autre', label: '❓ Autre incident urbain' }
                  ];

                  return categoryOptions
                    .filter(cat => allowedCategories.includes(cat.value))
                    .map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>);
                })()}
              </select>
              {fieldErrors.typeIncident && (
                <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <AlertCircle size={12} />
                  {fieldErrors.typeIncident}
                </span>
              )}
              {formData.secteurId && (
                <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Info size={12} />
                  Catégories filtrées selon votre secteur
                </div>
              )}
            </div>

            {/* Province: Déterminée automatiquement par le backend via intersection spatiale GPS */}

            {/* NOTE: Identifiant citoyen généré automatiquement (UUID) - invisible pour l'utilisateur */}

            {/* NOTE: Géolocalisation automatique - capturée lors de l'envoi */}

            {/* Photo - Camera Only */}
            <div className="form-group enhanced" style={{ marginTop: '2rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Camera size={16} />
                Prendre une photo <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
              </label>

              {!photoPreview ? (
                <div
                  style={{
                    border: fieldErrors.photo ? '2px dashed #ef4444' : '2px dashed #cbd5e1',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onClick={openCamera}
                >
                  <div style={{
                    width: '70px',
                    height: '70px',
                    margin: '0 auto 1.25rem',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                  }}>
                    <Camera size={32} color="white" strokeWidth={2.5} />
                  </div>

                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    📷 Prendre une photo
                  </p>

                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginBottom: '0.75rem'
                  }}>
                    Cliquez pour ouvrir la caméra
                  </p>

                  <p style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8'
                  }}>
                    Caméra uniquement · Max 5 MB
                  </p>
                </div>
              ) : (
                <div style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #10b981',
                  backgroundColor: '#f0fdf4'
                }}>
                  <img
                    src={photoPreview}
                    alt="Prévisualisation"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        color: 'white',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <CheckCircle2 size={16} />
                        Photo ajoutée
                      </span>
                      <button
                        type="button"
                        onClick={removePhoto}
                        style={{
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                          backdropFilter: 'blur(4px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dc2626';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        ✕ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {fieldErrors.photo && (
                <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <AlertCircle size={12} />
                  {fieldErrors.photo}
                </span>
              )}
              {/* Affichage des données GPS si photo prise */}
              {photoMetadata && photoPreview && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid #10b981',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: '#065f46', fontWeight: '600' }}>
                    <MapPin size={14} />
                    Localisation capturée avec la photo
                  </div>
                  <div style={{ color: '#047857', lineHeight: '1.5' }}>
                    <div>🌐 <strong>Coordonnées:</strong> {photoMetadata.latitude.toFixed(6)}, {photoMetadata.longitude.toFixed(6)}</div>
                    <div>🎯 <strong>Précision:</strong> ±{Math.round(photoMetadata.accuracy)}m</div>
                    <div>🕒 <strong>Horodatage:</strong> {new Date(photoMetadata.timestamp).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
              )}
              <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Info size={12} />
                📸 La photo ET la localisation GPS sont obligatoires
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            {message && (
              <div className="alert alert-success">
                {message}
              </div>
            )}

            {/* Résumé avant soumission */}
            {formData.typeIncident && formData.secteurId && formData.photo && (
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                borderRadius: '12px',
                border: '2px solid #3b82f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                  <h3 style={{ color: '#1e3a8a', margin: 0, fontSize: '1.1rem' }}>
                    ✅ Bravo! Votre déclaration est prête
                  </h3>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
                  <p><strong>Type:</strong> {formData.typeIncident}</p>
                  <p><strong>Secteur:</strong> {secteurs.find(s => s.id == formData.secteurId)?.nom || 'N/A'}</p>
                  {formData.description && (
                    <p><strong>Description:</strong> {formData.description.substring(0, 100)}{formData.description.length > 100 ? '...' : ''}</p>
                  )}
                  <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} />
                    <strong>Position GPS:</strong> <span style={{ color: 'var(--primary-color)' }}>Capturée automatiquement à l'envoi</span>
                  </p>
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting || !photo || Object.keys(fieldErrors).some(key => fieldErrors[key])}
              className="btn-primary"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                fontSize: '16px',
                fontWeight: '600',
                opacity: isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key]) ? 0.6 : 1
              }}
            >
              {isSubmitting ? (
                isGettingLocation ? (
                  <>
                    <MapPin size={20} className="spin" />
                    Récupération de votre position GPS...
                  </>
                ) : (
                  <>
                    <Upload size={20} className="spin" />
                    Envoi en cours...
                  </>
                )
              ) : (
                <>
                  <Send size={20} />
                  🚀 Envoyer ma déclaration
                </>
              )}
            </button>

            <div className="form-help" style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '1rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              justifyContent: 'center'
            }}>
              <Info size={12} />
              Vous recevrez un numéro de suivi après validation de votre déclaration
            </div>
          </form>
        </div>
      </div>
    </PWAGuard >
  );
};

export default DeclarerIncident;