-- Requête SQL pour vérifier les incidents dans la base de données
-- Copier et exécuter dans pgAdmin ou DBeaver

-- 1. Compter les incidents par statut
SELECT statut, COUNT(*) as nombre 
FROM incidents 
GROUP BY statut 
ORDER BY nombre DESC;

-- 2. Voir quelques exemples d'incidents TRAITE
SELECT id, titre, statut, province, date_declaration
FROM incidents
WHERE statut = 'TRAITE'
LIMIT 5;

-- 3. Vérifier tous les statuts disponibles
SELECT DISTINCT statut 
FROM incidents 
ORDER BY statut;
