-- Migration SQL pour supprimer le champ "titre" de la table incidents
-- Base de données: PostgreSQL avec PostGIS
-- ATTENTION: Cette opération est IRREVERSIBLE

-- ============================================
-- MIGRATION: Suppression de la colonne "titre"
-- ============================================

BEGIN;

-- Vérifier l'existence de la colonne et la supprimer si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'incidents' 
          AND column_name = 'titre'
    ) THEN
        -- Supprimer la colonne
        ALTER TABLE incidents DROP COLUMN titre;
        RAISE NOTICE '✅ Colonne "titre" supprimée avec succès de la table incidents';
    ELSE
        RAISE NOTICE 'ℹ️  Colonne "titre" n''existe pas (déjà supprimée ou jamais créée)';
    END IF;
END $$;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Afficher les colonnes restantes de la table incidents
SELECT 'Colonnes de la table incidents après migration:' AS info;
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'incidents'
ORDER BY ordinal_position;

-- Vérifier que "titre" n'existe plus
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'incidents' 
              AND column_name = 'titre'
        ) 
        THEN '✅ Migration réussie: colonne "titre" absente'
        ELSE '❌ Erreur: colonne "titre" toujours présente'
    END AS verification;

COMMIT;

-- ============================================
-- INSTRUCTIONS D'EXÉCUTION
-- ============================================

-- 1. Ouvrir pgAdmin 4
-- 2. Se connecter à la base de données "geoinfo_db"
-- 3. Ouvrir l'outil Query Tool (F5 ou clic droit sur la base)
-- 4. Copier-coller tout ce script
-- 5. Exécuter avec F5 ou cliquer sur "Execute/Refresh"
-- 6. Vérifier que le message de succès s'affiche
-- 7. Vérifier la liste des colonnes dans la section "Vérification"

-- ============================================
-- ROLLBACK (si nécessaire)
-- ============================================

-- Si vous devez annuler cette migration (à utiliser AVANT le COMMIT) :
-- ROLLBACK;

-- Pour recréer la colonne (PERTE DE DONNÉES) :
-- ALTER TABLE incidents ADD COLUMN titre VARCHAR(200);
