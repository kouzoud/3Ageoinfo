import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context pour gérer l'état partagé des filtres entre les pages
 * MapView et Incidents avec persistance dans localStorage
 */
const FilterContext = createContext();

/**
 * Provider pour le FilterContext
 * Gère la synchronisation des filtres entre les pages et la persistance
 */
export function FilterProvider({ children }) {
    // État initial des filtres
    const defaultFilters = {
        secteur: '',     // ID du secteur ('' = tous)
        province: '',    // Nom de la province ('' = toutes) - Utiliser nom pour compatibilité MapView
        statut: ''       // Valeur du statut ('' = tous)
    };

    // Clé pour localStorage
    const STORAGE_KEY = 'incident_filters';

    // Charger les filtres depuis localStorage au démarrage
    const loadFiltersFromStorage = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedFilters = JSON.parse(stored);
                console.log('✅ Filtres chargés depuis localStorage:', parsedFilters);
                return parsedFilters;
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors du chargement des filtres:', error);
        }
        return defaultFilters;
    };

    const [filters, setFilters] = useState(loadFiltersFromStorage);

    // Sauvegarder dans localStorage à chaque changement
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
            console.log('💾 Filtres sauvegardés dans localStorage:', filters);

            // Émettre un événement custom pour synchronisation cross-tab
            window.dispatchEvent(new CustomEvent('filtersChanged', {
                detail: filters
            }));
        } catch (error) {
            console.warn('⚠️ Erreur lors de la sauvegarde des filtres:', error);
        }
    }, [filters]);

    // Écouter les changements depuis d'autres onglets
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                try {
                    const newFilters = JSON.parse(event.newValue);
                    console.log('🔄 Filtres synchronisés depuis un autre onglet:', newFilters);
                    setFilters(newFilters);
                } catch (error) {
                    console.warn('⚠️ Erreur lors de la synchronisation cross-tab:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Écouter les événements custom (même onglet, autres composants)
    useEffect(() => {
        const handleFiltersChanged = (event) => {
            console.log('📡 Événement filtersChanged reçu:', event.detail);
        };

        window.addEventListener('filtersChanged', handleFiltersChanged);

        return () => {
            window.removeEventListener('filtersChanged', handleFiltersChanged);
        };
    }, []);

    /**
     * Met à jour les filtres (merge avec l'état existant)
     * @param {Object} newFilters - Objet contenant les filtres à mettre à jour
     */
    const updateFilters = (newFilters) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            console.log('🔧 Mise à jour des filtres:', { prev, newFilters, updated });
            return updated;
        });
    };

    /**
     * Réinitialise tous les filtres à leurs valeurs par défaut
     */
    const resetFilters = () => {
        console.log('🔄 Réinitialisation des filtres');
        setFilters(defaultFilters);
    };

    /**
     * Compte le nombre de filtres actifs (non vides)
     * @returns {number} Nombre de filtres actifs
     */
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.secteur) count++;
        if (filters.province) count++;
        if (filters.statut) count++;
        return count;
    };

    /**
     * Vérifie si des filtres sont actifs
     * @returns {boolean} True si au moins un filtre est actif
     */
    const hasActiveFilters = () => {
        return getActiveFilterCount() > 0;
    };

    const value = {
        filters,
        updateFilters,
        resetFilters,
        getActiveFilterCount,
        hasActiveFilters
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

/**
 * Hook personnalisé pour utiliser le FilterContext
 * @returns {Object} Objet contenant filters, updateFilters, resetFilters, etc.
 */
export const useFilters = () => {
    const context = useContext(FilterContext);

    if (!context) {
        throw new Error('useFilters doit être utilisé à l\'intérieur d\'un FilterProvider');
    }

    return context;
};

export default FilterContext;
