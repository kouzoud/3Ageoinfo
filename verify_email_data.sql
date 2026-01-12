-- Vérifier les incidents avec citizen_email
SELECT 
    id,
    type_incident,
    citizen_email,
    device_id,
    date_declaration
FROM incidents
WHERE citizen_email IS NOT NULL
ORDER BY date_declaration DESC
LIMIT 10;

-- Compter les incidents par email
SELECT 
    citizen_email,
    COUNT(*) as nombre_incidents
FROM incidents
WHERE citizen_email IS NOT NULL
GROUP BY citizen_email
ORDER BY nombre_incidents DESC;

-- Vérifier tous les incidents récents (pour debug)
SELECT 
    id,
    type_incident,
    citizen_email,
    device_id,
    date_declaration
FROM incidents
ORDER BY date_declaration DESC
LIMIT 20;
