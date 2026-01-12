/**
 * Utilitaire de stockage avec séparation PWA/Browser
 * Gère automatiquement le préfixage du localStorage selon le contexte
 */

/**
 * Détecte si l'application est en mode PWA (standalone)
 * Compatible avec iOS, Android et Desktop PWA
 * @returns {boolean} true si l'app est installée et lancée en standalone
 */
export const isPWAMode = () => {
    // Vérification standard display-mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }

    // Vérification iOS
    if (window.navigator.standalone === true) {
        return true;
    }

    // Vérification Android
    if (document.referrer.includes('android-app://')) {
        return true;
    }

    // Vérification via paramètre URL (pour start_url personnalisé)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('source') === 'pwa') {
        return true;
    }

    return false;
};

/**
 * Retourne le préfixe de stockage selon le mode d'exécution
 * - 'pwa_' pour l'application installée
 * - 'browser_' pour le navigateur web
 * @returns {string} Le préfixe à utiliser
 */
const getStoragePrefix = () => {
    return isPWAMode() ? 'pwa_' : 'browser_';
};

/**
 * Wrapper du localStorage avec préfixage automatique
 * Permet d'isoler les données entre PWA et navigateur
 */
export const storage = {
    /**
     * Stocke une valeur avec le préfixe approprié
     * @param {string} key - Clé de stockage
     * @param {string} value - Valeur à stocker
     */
    setItem: (key, value) => {
        const prefixedKey = `${getStoragePrefix()}${key}`;
        localStorage.setItem(prefixedKey, value);
    },

    /**
     * Récupère une valeur avec le préfixe approprié
     * @param {string} key - Clé de stockage
     * @returns {string|null} La valeur stockée ou null
     */
    getItem: (key) => {
        const prefixedKey = `${getStoragePrefix()}${key}`;
        return localStorage.getItem(prefixedKey);
    },

    /**
     * Supprime une valeur avec le préfixe approprié
     * @param {string} key - Clé de stockage
     */
    removeItem: (key) => {
        const prefixedKey = `${getStoragePrefix()}${key}`;
        localStorage.removeItem(prefixedKey);
    },

    /**
     * Efface toutes les données du contexte actuel (PWA ou Browser)
     * Ne supprime QUE les données avec le préfixe actuel
     */
    clear: () => {
        const prefix = getStoragePrefix();
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    },

    /**
     * Vérifie si une clé existe
     * @param {string} key - Clé à vérifier
     * @returns {boolean} true si la clé existe
     */
    hasItem: (key) => {
        const prefixedKey = `${getStoragePrefix()}${key}`;
        return localStorage.getItem(prefixedKey) !== null;
    }
};

/**
 * Utilitaire pour obtenir le mode actuel (debug)
 * @returns {string} 'PWA' ou 'Browser'
 */
export const getDisplayMode = () => {
    return isPWAMode() ? 'PWA' : 'Browser';
};

/**
 * Migration optionnelle des données localStorage existantes
 * À appeler une seule fois au premier lancement après la mise à jour
 */
export const migrateExistingData = () => {
    // Vérifier si la migration a déjà été effectuée
    if (localStorage.getItem('storage_migrated')) {
        return;
    }

    const prefix = getStoragePrefix();
    const keysToMigrate = ['user', 'token', 'deviceId'];

    keysToMigrate.forEach(key => {
        // Récupérer l'ancienne valeur (sans préfixe)
        const oldValue = localStorage.getItem(key);

        if (oldValue && !localStorage.getItem(`${prefix}${key}`)) {
            // Migrer vers la nouvelle clé préfixée
            localStorage.setItem(`${prefix}${key}`, oldValue);
            console.log(`✅ Migré: ${key} → ${prefix}${key}`);
        }
    });

    // Marquer la migration comme effectuée
    localStorage.setItem('storage_migrated', 'true');
    console.log('✅ Migration du stockage terminée');
};
