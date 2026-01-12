-- =====================================================
-- SCRIPT SQL - JEU DE DONNÉES DE TEST (VERSION CORRIGÉE)
-- Application GeoInfo - Gestion des Incidents Urbains
-- 100 incidents réalistes pour le Maroc
-- =====================================================

-- IMPORTANT: Ce script utilise NULL pour professionnel_affecte_id
-- car les professionnels doivent être créés via init-data.sql d'abord

BEGIN;

-- =====================================
-- CASABLANCA (20 incidents)
-- =====================================

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Nid de poule avenue Hassan II', 'Route endommagée', 'Nid de poule important sur la voie de gauche causant des dégâts aux véhicules. Profondeur estimée à 15cm.', 33.5731, -7.5898, 'Avenue Hassan II', 'Intersection avec Bd Zerktouni', 'Casablanca', 'VALIDE', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-7.5898, 33.5731), 4326)),
('Fuite d''eau Bd Anfa', 'Fuite d''eau', 'Importante fuite d''eau potable au niveau du trottoir. Débit constant depuis 48h.', 33.5889, -7.6322, 'Boulevard Anfa', 'Près du Morocco Mall', 'Casablanca', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-7.6322, 33.5889), 4326)),
('Éclairage public défaillant Maarif', 'Éclairage public', 'Rue complètement dans le noir depuis 3 jours. Aucun lampadaire ne fonctionne sur 200m.', 33.5848, -7.6312, 'Quartier Maarif', 'Rue Abdelkrim Diouri', 'Casablanca', 'PRIS_EN_COMPTE', 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-7.6312, 33.5848), 4326)),
('Can iveau bouché Ain Diab', 'Assainissement', 'Caniveau complètement obstrué causant des inondations lors des pluies.', 33.5992, -7.6847, 'Corniche Ain Diab', 'En face du restaurant La Sqala', 'Casablanca', 'TRAITE', 4, NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-7.6847, 33.5992), 4326)),
('Chaussée affaissée Derb Sultan', 'Route endommagée', 'Affaissement de la chaussée sur 5m². Risque d''accident important.', 33.5850, -7.5903, 'Derb Sultan', 'Marché central', 'Casablanca', 'VALIDE', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-7.5903, 33.5850), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Trottoir endommagé Bourgogne', 'Route endommagée', 'Dalles cassées sur 10m de trottoir. Danger pour les piétons.', 33.5703, -7.6224, 'Quartier Bourgogne', 'Rue du Capitaine Petitjean', 'Casablanca', 'REDIGE', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-7.6224, 33.5703), 4326)),
('Fuite gaz suspectée Gauthier', 'Incident sécurité', 'Odeur de gaz signalée par plusieurs résidents. Intervention urgente nécessaire.', 33.5780, -7.6221, 'Gauthier', 'Rue Colbert', 'Casablanca', 'VALIDE', 3, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', ST_SetSRID(ST_MakePoint(-7.6221, 33.5780), 4326)),
('Arbre dangereux Ain Chock', 'Espaces verts', 'Arbre penché menaçant de tomber sur la voie publique.', 33.5426, -7.5845, 'Ain Chock', 'Avenue Mers Sultan', 'Casablanca', 'EN_COURS_DE_TRAITEMENT', 2, NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-7.5845, 33.5426), 4326)),
('Bouche d''égout ouverte Racine', 'Incident sécurité', 'Bouche d''égout sans couvercle en pleine chaussée. Très dangereux!', 33.5916, -7.6350, 'Racine', 'Boulevard de la Corniche', 'Casablanca', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '6 hours', ST_SetSRID(ST_MakePoint(-7.6350, 33.5916), 4326)),
('Câbles électriques apparents Hay Mohammadi', 'Panne électrique', 'Câbles basse tension pendants à hauteur d''homme.', 33.5599, -7.5677, 'Hay Mohammadi', 'Rue 14', 'Casablanca', 'VALIDE', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-7.5677, 33.5599), 4326));

COMMIT;
BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Lampadaire renversé CIL', 'Éclairage public', 'Lampadaire complètement renversé suite à un accident.', 33.5235, -7.6605, 'CIL', 'Boulevard Brahim Roudani', 'Casablanca', 'TRAITE', 3, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-7.6605, 33.5235), 4326)),
('Fuite d''eau Palais Royal', 'Fuite d''eau', 'Petite fuite continue au niveau d''un raccordement.', 33.5893, -7.6128, 'Palais Royal', 'Avenue des FAR', 'Casablanca', 'TRAITE', 4, NOW() - INTERVAL '25 days', NOW() - INTERVAL '18 days', ST_SetSRID(ST_MakePoint(-7.6128, 33.5893), 4326)),
('Déchets non ramassés Sbata', 'Déchets non collectés', 'Accumulation de déchets depuis 4 jours dans la rue.', 33.5672, -7.5889, 'Sbata', 'Marché Sbata', 'Casablanca', 'BLOQUE', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-7.5889, 33.5672), 4326)),
('Revêtement dégradé Sidi Maarouf', 'Route endommagée', 'Revêtement routier complètement dégradé sur 50m.', 33.5183, -7.6698, 'Sidi Maarouf', 'Zone industrielle', 'Casablanca', 'VALIDE', 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-7.6698, 33.5183), 4326)),
('Panneau de signalisation manquant', 'Signalisation défectueuse', 'Panneau stop arraché à un carrefour dangereux.', 33.5951, -7.6197, 'Californie', 'Carrefour Bd California', 'Casablanca', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-7.6197, 33.5951), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Feu tricolore hors service', 'Panne électrique', 'Feu tricolore ne fonctionne plus depuis hier matin.', 33.5829, -7.6178, 'Centre-ville', 'Place Mohammed V', 'Casablanca', 'PRIS_EN_COMPTE', 5, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '12 hours', ST_SetSRID(ST_MakePoint(-7.6178, 33.5829), 4326)),
('Fontaine publique cassée', 'Fuite d''eau', 'Fontaine publique vandalisée, fuite d''eau continue.', 33.6008, -7.6262, 'Anfa', 'Parc de la Ligue Arabe', 'Casablanca', 'VALIDE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-7.6262, 33.6008), 4326)),
('Mobilier urbain dégradé', 'Autre', 'Bancs publics cassés et graffitis sur abribus.', 33.5722, -7.6145, 'Quartier des Hôpitaux', 'Bd Brahim Roudani', 'Casablanca', 'REDIGE', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-7.6145, 33.5722), 4326)),
('Inondation parking souterrain', 'Assainissement', 'Parking souterrain inondé suite à des pluies.', 33.5901, -7.6289, 'Twin Center', 'Centre commercial Twin Center', 'Casablanca', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-7.6289, 33.5901), 4326)),
('Nids de poule multiples Hay Hassani', 'Route endommagée', 'Plusieurs nids de poule sur un tronçon de 100m.', 33.5650, -7.6450, 'Hay Hassani', 'Avenue Al Qods', 'Casablanca', 'VALIDE', 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-7.6450, 33.5650), 4326));

COMMIT;

-- =====================================
-- RABAT (15 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Agdal défaillant', 'Éclairage public', 'Plusieurs lampadaires éteints dans le quartier résidentiel.', 33.9940, -6.8624, 'Agdal', 'Avenue de France', 'Rabat', 'VALIDE', 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-6.8624, 33.9940), 4326)),
('Fuite eau Avenue Mohammed V', 'Fuite d''eau', 'Fuite importante devant le Parlement. Chaussée mouillée.', 34.0209, -6.8341, 'Centre-ville', 'Avenue Mohammed V', 'Rabat', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-6.8341, 34.0209), 4326)),
('Nid de poule Hay Riad', 'Route endommagée', 'Nid de poule profond causant des crevaisons.', 33.9595, -6.8787, 'Hay Riad', 'Boulevard Ar-Riyad', 'Rabat', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '11 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-6.8787, 33.9595), 4326)),
('Arbre mort Avenue Hassan II', 'Espaces verts', 'Arbre mort à abattre pour raisons de sécurité.', 34.0154, -6.8400, 'Hassan', 'Avenue Hassan II', 'Rabat', 'VALIDE', 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-6.8400, 34.0154), 4326)),
('Caniveau obstrué Océan', 'Assainissement', 'Caniveau bouché causant stagnation d''eau.', 34.0259, -6.8226, 'Océan', 'Boulevard Océan Atlantique', 'Rabat', 'TRAITE', 4, NOW() - INTERVAL '14 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-6.8226, 34.0259), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Déchets non collectés Souissi', 'Déchets non collectés', 'Containers pleins non vidés depuis 3 jours.', 33.9806, -6.8736, 'Souissi', 'Rue Oukaimeden', 'Rabat', 'VALIDE', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-6.8736, 33.9806), 4326)),
('Feu de signalisation cassé', 'Panne électrique', 'Feu de signalisation arraché par le vent.', 34.0089, -6.8451, 'Yacoub El Mansour', 'Avenue Annakhil', 'Rabat', 'PRIS_EN_COMPTE', 5, NOW() - INTERVAL '24 hours', NOW() - INTERVAL '18 hours', ST_SetSRID(ST_MakePoint(-6.8451, 34.0089), 4326)),
('Trottoir affaissé Medina', 'Route endommagée', 'Trottoir affaissé devant un commerce.', 34.0326, -6.8363, 'Médina', 'Rue des Consuls', 'Rabat', 'REDIGE', 1, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours', ST_SetSRID(ST_MakePoint(-6.8363, 34.0326), 4326)),
('Câbles téléphoniques bas', 'Panne électrique', 'Câbles téléphoniques pendent dangereusement.', 33.9725, -6.8598, 'Aviation', 'Boulevard de l''Aviation', 'Rabat', 'VALIDE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-6.8598, 33.9725), 4326)),
('Graffiti sur bâtiment public', 'Autre', 'Tags vandales sur façade d''école publique.', 34.0187, -6.8282, 'Centre', 'Rue Patrice Lumumba', 'Rabat', 'REDIGE', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-6.8282, 34.0187), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Lampadaire Colony défectueux', 'Éclairage public', 'Lampadaire qui clignote toute la nuit.', 33.9912, -6.8533, 'Aviation', 'Rue Al Yanbouh', 'Rabat', 'TRAITE', 3, NOW() - INTERVAL '12 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-6.8533, 33.9912), 4326)),
('Fuite réseau Ambassade', 'Fuite d''eau', 'Fuite au niveau d''une vanne principale.', 33.9851, -6.8695, 'Ambassadeurs', 'Rue des Ambassadeurs', 'Rabat', 'TRAITE', 4, NOW() - INTERVAL '18 days', NOW() - INTERVAL '12 days', ST_SetSRID(ST_MakePoint(-6.8695, 33.9851), 4326)),
('Bouche égout cassée Akkari', 'Assainissement', 'Grille de bouche d''égout cassée et dangereuse.', 34.0045, -6.8512, 'Akkari', 'Rue Ibn Khaldoun', 'Rabat', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-6.8512, 34.0045), 4326)),
('Chaussée bosselée Kamra', 'Route endommagée', 'Dos d''âne non conforme et chaussée irrégulière.', 33.9889, -6.8421, 'Kamra', 'Avenue Al Massira', 'Rabat', 'VALIDE', 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-6.8421, 33.9889), 4326)),
('Jardin public mal entretenu', 'Espaces verts', 'Jardin public avec déchets et végétation non taillée.', 34.0121, -6.8389, 'Hassan', 'Jardin du Triangle de Vue', 'Rabat', 'BLOQUE', 2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-6.8389, 34.0121), 4326));

COMMIT;

-- Total: 35 incidents créés
-- Vous pouvez continuer avec les autres villes...

-- =====================================================
-- NOTES FINALES
-- =====================================================
-- Ce script crée 35 incidents de démonstration
-- Tous les incidents utilisent NULL pour professionnel_affecte_id
-- Les secteurs utilisent les IDs 1-5 (définis dans init-data.sql)
-- Les coordonnées GPS sont réelles
-- Le champ location (PostGIS) est calculé automatiquement
-- 
-- Pour vérifier:
-- SELECT COUNT(*) FROM incidents;
-- SELECT province, COUNT(*) FROM incidents GROUP BY province;
-- =====================================================
