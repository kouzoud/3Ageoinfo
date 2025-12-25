/**
 * Service API centralisé avec configuration Axios
 * Intégration complète Backend Spring Boot <-> Frontend React
 */

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

/**
 * Gestion centralisée du token d'authentification
 */
class AuthManager {
  static getToken() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token;
      } catch (e) {
        console.warn('Token invalide dans localStorage');
        this.clearToken();
        return null;
      }
    }
    return null;
  }

  static setToken(token, userData = null) {
    if (userData) {
      localStorage.setItem('user', JSON.stringify({ token, ...userData }));
    } else {
      localStorage.setItem('token', token);
    }
  }

  static clearToken() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  static isAuthenticated() {
    const token = this.getToken();
    return token !== null;
  }

  static getUser() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Configuration Axios centralisée
 */
class ApiClient {
  constructor() {
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  createAxiosInstance() {
    // Créer une instance Axios si disponible, sinon utiliser fetch
    if (typeof window !== 'undefined' && window.axios) {
      return window.axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
    }
    return null;
  }

  setupInterceptors() {
    if (!this.client) return;

    // Intercepteur de requête - Ajouter le token
    this.client.interceptors.request.use(
      (config) => {
        const token = AuthManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🚀 Fetch Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse - Gérer les erreurs
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error);

        if (error.response?.status === 401) {
          AuthManager.clearToken();
          window.location.href = '/connexion';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        if (error.response?.status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }

        throw error;
      }
    );
  }

  async request(config) {
    if (this.client) {
      const response = await this.client.request(config);
      return response.data;
    } else {
      // Fallback avec fetch si Axios n'est pas disponible
      return this.fetchRequest(config);
    }
  }

  async fetchRequest({ method = 'GET', url, data, headers = {} }) {
    const token = AuthManager.getToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      method,
      headers: { ...defaultHeaders, ...headers },
      credentials: 'include'
    };

    if (data) {
      if (data instanceof FormData) {
        delete config.headers['Content-Type']; // Laisser le navigateur définir le boundary
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    console.log(`🚀 Fetch Request: ${method} ${fullUrl}`);

    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      if (response.status === 401) {
        AuthManager.clearToken();
        window.location.href = '/connexion';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }

      const errorText = await response.text();
      throw new Error(errorText || `Erreur HTTP: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  }
}

// Instance globale du client API
const apiClient = new ApiClient();

/**
 * Endpoints de test et santé
 */
export const healthAPI = {
  // Test de santé du backend
  health: () => apiClient.request({ method: 'GET', url: '/health' }),

  // Test de connectivité
  testConnection: () => apiClient.request({ method: 'GET', url: '/test/connection' })
};

/**
 * Service pour la gestion des incidents
 */
export const incidentsAPI = {
  // Récupère tous les incidents
  getAll: () => apiClient.request({ method: 'GET', url: '/incidents' }),

  // Récupère un incident par ID
  getById: (id) => apiClient.request({ method: 'GET', url: `/incidents/${id}` }),

  // Met à jour un incident
  update: (id, data) => apiClient.request({
    method: 'PUT',
    url: `/incidents/${id}`,
    data
  }),

  // Supprime un incident
  delete: (id) => apiClient.request({ method: 'DELETE', url: `/incidents/${id}` })
};

/**
 * Service pour les citoyens (déclaration d'incidents)
 */
export const citoyensAPI = {
  // Déclare un nouvel incident avec photo
  declarerIncident: async (incidentData, photo = null) => {
    const formData = new FormData();

    // Ajouter les données JSON
    formData.append('data', new Blob([JSON.stringify(incidentData)], {
      type: 'application/json'
    }));

    // Ajouter la photo si elle existe
    if (photo) {
      formData.append('photo', photo);
    }

    return apiClient.request({
      method: 'POST',
      url: '/citoyens/incidents',
      data: formData,
      headers: {} // Laisser le navigateur définir Content-Type pour FormData
    });
  },

  // Récupère les incidents par deviceId (UUID citoyen)
  getIncidentsByDeviceId: (deviceId) =>
    apiClient.request({ method: 'GET', url: `/citoyens/incidents/device/${deviceId}` })
};

/**
 * Service pour la gestion des secteurs
 */
export const secteursAPI = {
  getAll: () => apiClient.request({ method: 'GET', url: '/secteurs' }),
  getById: (id) => apiClient.request({ method: 'GET', url: `/secteurs/${id}` })
};

/**
 * Service pour la gestion des provinces
 */
export const provincesAPI = {
  /**
   * Récupère toutes les provinces au format GeoJSON pour affichage sur carte
   * @returns {Promise<Object>} GeoJSON FeatureCollection des provinces
   */
  getGeoJSON: () => apiClient.fetchRequest({
    method: 'GET',
    url: '/provinces/geojson'
  })
};

/**
 * Service pour les endpoints publics (sans authentification)
 * Utilisé par la PWA pour les citoyens anonymes
 */
export const publicAPI = {
  /**
   * Déclare un incident de manière anonyme (PWA uniquement)
   * @param {Object} incidentData - Données de l'incident incluant deviceId
   * @param {File} photo - Photo obligatoire
   * @returns {Promise<Object>} Incident créé
   */
  declarerIncidentAnonymous: async (incidentData, photo) => {
    const formData = new FormData();

    // Ajouter les données de l'incident en JSON
    formData.append('incident', new Blob([JSON.stringify(incidentData)], {
      type: 'application/json'
    }));

    // Ajouter la photo
    if (photo) {
      formData.append('photo', photo);
    }

    return apiClient.fetchRequest({
      method: 'POST',
      url: '/public/incidents',
      data: formData,
      headers: {} // Laisser le navigateur gérer le Content-Type
    });
  },

  /**
   * Récupère les incidents par deviceId (UUID)
   * @param {string} deviceId - UUID de l'appareil citoyen
   * @returns {Promise<Array>} Liste des incidents
   */
  getIncidentsByDeviceId: async (deviceId) => {
    return apiClient.fetchRequest({
      method: 'GET',
      url: `/public/incidents/${deviceId}`
    });
  },

  /**
   * Récupère les secteurs (endpoint public)
   * @returns {Promise<Array>} Liste des secteurs
   */
  getSecteurs: async () => {
    return apiClient.fetchRequest({
      method: 'GET',
      url: '/secteurs'
    });
  },

  /**
   * Récupère un compte par UUID (pour changement d'appareil)
   * @param {string} uuid - UUID de l'appareil à récupérer
   * @returns {Promise<Object>} Détails du compte et incidents
   */
  recoverAccount: async (uuid) => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/citoyens/recover-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Trop de tentatives. Réessayez dans 1 heure.');
      }
      if (response.status === 404) {
        throw new Error('❌ Identifiant invalide. Aucun incident trouvé.');
      }
      throw new Error('Erreur lors de la récupération du compte');
    }

    return response.json();
  }
};

/**
 * Service d'authentification
 */
export const authAPI = {
  // Connexion utilisateur avec le nouveau système JWT
  login: async (credentials) => {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/auth/login',
        data: credentials
      });

      // Stocker les informations d'authentification
      AuthManager.setToken(response.token, response.utilisateur);

      if (response.utilisateur && response.utilisateur.role) {
        localStorage.setItem('role', response.utilisateur.role);
      }

      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error('Identifiants incorrects');
    }
  },

  // Déconnexion
  logout: () => {
    AuthManager.clearToken();
    localStorage.removeItem('role');
    window.location.href = '/connexion';
  },

  // Récupère l'utilisateur actuel
  getCurrentUser: () => AuthManager.getUser(),

  // Vérifie si l'utilisateur est authentifié
  isAuthenticated: () => AuthManager.isAuthenticated(),

  // Récupère le rôle de l'utilisateur
  getUserRole: () => localStorage.getItem('role'),

  // Vérifie les permissions
  isAdmin: () => localStorage.getItem('role') === 'ADMIN',
  isProfessionnel: () => localStorage.getItem('role') === 'PROFESSIONNEL',
  isCitoyen: () => localStorage.getItem('role') === 'CITOYEN'
};

// Export du client API et du gestionnaire d'authentification
export { AuthManager, ApiClient };

/**
 * Service pour les fonctionnalités ADMINISTRATEUR
 */
export const adminAPI = {
  // Gestion des incidents
  getIncidentsEnAttente: () => apiClient.request({ method: 'GET', url: '/admin/incidents/en-attente' }),
  validerIncident: (id) => apiClient.request({ method: 'PUT', url: `/admin/incidents/${id}/valider` }),
  rejeterIncident: (id, motif) => apiClient.request({
    method: 'PUT',
    url: `/admin/incidents/${id}/rejeter`,
    data: { motifRejet: motif }
  }),

  // Affectation
  affecterIncident: (incidentId, professionnelId) => apiClient.request({
    method: 'POST',
    url: `/admin/incidents/${incidentId}/affecter/${professionnelId}`
  }),

  // Gestion des professionnels
  getAllProfessionnels: () => apiClient.request({ method: 'GET', url: '/admin/professionnels' }),
  createProfessionnel: (data) => apiClient.request({
    method: 'POST',
    url: '/admin/professionnels',
    data
  }),
  deleteProfessionnel: (id) => apiClient.request({
    method: 'DELETE',
    url: `/admin/professionnels/${id}`
  })
};

/**
 * Service pour les fonctionnalités PROFESSIONNEL
 */
export const professionnelAPI = {
  // Gestion des incidents
  getMesIncidents: () => apiClient.request({ method: 'GET', url: '/professionnel/incidents' }),

  // Changement de statut
  prendreEnCompte: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/prendre-en-compte`
  }),
  demarrerTraitement: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/demarrer-traitement`
  }),
  traiterIncident: (id, description) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/traiter`,
    data: { descriptionTraitement: description }
  })
};

/**
 * Service pour la gestion des statistiques
 */
export const statistiquesAPI = {
  // Récupère les statistiques globales
  getStatistiques: () => apiClient.request({ method: 'GET', url: '/statistiques' })
};

/**
 * Export global de tous les services API
 */
const api = {
  incidents: incidentsAPI,
  secteurs: secteursAPI,
  citoyens: citoyensAPI,
  admin: adminAPI,
  professionnel: professionnelAPI,
  statistiques: statistiquesAPI
};

export default api;

// Export nommé de l'objet api pour compatibilité
export { api };