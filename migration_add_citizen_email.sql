-- Migration : Ajout de la colonne citizen_email à la table incidents
-- Date : 2026-01-09
-- Objectif : Permettre la récupération d'incidents par email

-- Ajouter la colonne citizen_email (optionnelle, max 255 caractères)
ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS citizen_email VARCHAR(255);

-- Créer un index pour améliorer les performances de recherche par email
CREATE INDEX IF NOT EXISTS idx_incidents_citizen_email 
ON incidents(citizen_email);

-- Vérifier l'ajout
SELECT 
    column_name, 
    data_type, 
    character_maximum_length, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents' AND column_name = 'citizen_email';
