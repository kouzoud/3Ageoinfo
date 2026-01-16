-- Correction du type de la colonne geometry dans la table provinces
-- Exécuter ce script pour corriger l'erreur de migration Hibernate

-- Supprimer la colonne geometry existante et la recréer avec le bon type
ALTER TABLE provinces
    DROP COLUMN IF EXISTS geometry CASCADE;

ALTER TABLE provinces
    ADD COLUMN geometry geometry(MultiPolygon, 4326);

-- Optionnel: Créer un index spatial pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_provinces_geometry
    ON provinces USING GIST (geometry);

-- Vérification
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'provinces' AND column_name = 'geometry';
