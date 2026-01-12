-- =====================================================
-- DONNÉES DE TEST - VILLES RÉGIONALES DU MAROC
-- 80 incidents répartis sur 8 villes
-- Tanger, Fès, Ouarzazate, Agadir, Oujda, Laâyoune, Nador, Guelmim
-- =====================================================

-- =====================================
-- TANGER - Nord (12 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Corniche défaillant', 'Éclairage public', 'Longue section de corniche sans éclairage nocturne. Zone touristique prioritaire.', 35.7595, -5.8340, 'Corniche', 'Corniche de Tanger', 'Tanger', 'VALIDE', 3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-5.8340, 35.7595), 4326)),
('Fuite eau Boulevard Pasteur', 'Fuite d''eau', 'Fuite visible au niveau du trottoir, créant des flaques.', 35.7671, -5.8037, 'Centre', 'Boulevard Pasteur', 'Tanger', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '9 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-5.8037, 35.7671), 4326)),
('Nid poule Route Tétouan', 'Route endommagée', 'Plusieurs nids de poule dangereux sur route nationale.', 35.7889, -5.7923, 'Route Tétouan', 'Route nationale N1', 'Tanger', 'PRIS_EN_COMPTE', 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-5.7923, 35.7889), 4326)),
('Arbre penché Avenue FAR', 'Espaces verts', 'Arbre menaçant de tomber après tempête de vent.', 35.7734, -5.8112, 'Centre', 'Avenue des FAR', 'Tanger', 'VALIDE', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-5.8112, 35.7734), 4326)),
('Caniveau débordant Malabata', 'Assainissement', 'Caniveau saturé lors des fortes pluies.', 35.7823, -5.7656, 'Malabata', 'Route de Malabata', 'Tanger', 'TRAITE', 4, NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-5.7656, 35.7823), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Déchets Plage municipale', 'Déchets non collectés', 'Déchets non ramassés sur la plage touristique.', 35.7712, -5.8234, 'Plage', 'Plage municipale', 'Tanger', 'VALIDE', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-5.8234, 35.7712), 4326)),
('Poteau électrique incliné', 'Panne électrique', 'Poteau électrique dangereusement incliné après accident.', 35.7598, -5.8178, 'Médina', 'Rue de la Kasbah', 'Tanger', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-5.8178, 35.7598), 4326)),
('Chaussée affaissée Ibn Batouta', 'Route endommagée', 'Affaissement important près du centre commercial.', 35.7456, -5.8289, 'Ibn Batouta', 'Boulevard Ibn Batouta', 'Tanger', 'REDIGE', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-5.8289, 35.7456), 4326)),
('Fontaine hors service', 'Fuite d''eau', 'Fontaine publique ne fonctionne plus depuis une semaine.', 35.7689, -5.8098, 'Place 9 Avril', 'Grand Socco', 'Tanger', 'VALIDE', 4, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-5.8098, 35.7689), 4326)),
('Panneau publicitaire dangereux', 'Incident sécurité', 'Grand panneau mal fixé risquant de tomber.', 35.7623, -5.8201, 'Port', 'Zone portuaire', 'Tanger', 'PRIS_EN_COMPTE', 3, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '8 hours', ST_SetSRID(ST_MakePoint(-5.8201, 35.7623), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Stade défaillant', 'Éclairage public', 'Éclairage extérieur du stade complètement hors service.', 35.7512, -5.8345, 'Stade', 'Stade Ibn Batouta', 'Tanger', 'VALIDE', 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-5.8345, 35.7512), 4326)),
('Signalisation effacée', 'Signalisation défectueuse', 'Marquage au sol complètement effacé sur carrefour.', 35.7601, -5.8156, 'Centre', 'Place de France', 'Tanger', 'REDIGE', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-5.8156, 35.7601), 4326));

COMMIT;

-- =====================================
-- FÈS - Patrimoine (12 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Médina insuffisant', 'Éclairage public', 'Ruelles de la Médina historique très sombres la nuit.', 34.0629, -4.9770, 'Fès el-Bali', 'Médina de Fès', 'Fès', 'VALIDE', 3, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-4.9770, 34.0629), 4326)),
('Fuite ancienne fontaine', 'Fuite d''eau', 'Fontaine historique avec fuite continue nécessitant restauration.', 34.0656, -4.9745, 'Médina', 'Place Seffarine', 'Fès', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-4.9745, 34.0656), 4326)),
('Route Ville Nouvelle dégradée', 'Route endommagée', 'Revêtement très abîmé en plein centre-ville.', 34.0372, -5.0003, 'Ville Nouvelle', 'Avenue Hassan II', 'Fès', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '13 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-5.0003, 34.0372), 4326)),
('Palmiers malades Boulevard', 'Espaces verts', 'Plusieurs palmiers atteints par des parasites.', 34.0289, -5.0067, 'Ville Nouvelle', 'Boulevard Allal Ben Abdellah', 'Fès', 'VALIDE', 2, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-5.0067, 34.0289), 4326)),
('Égouts anciens bouchés', 'Assainissement', 'Système d''égout ancien se bouche fréquemment.', 34.0598, -4.9812, 'Médina', 'Talaa Kebira', 'Fès', 'BLOQUE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-4.9812, 34.0598), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Déchets souks non collectés', 'Déchets non collectés', 'Déchets artisanaux s''accumulent dans les souks.', 34.0612, -4.9789, 'Souk', 'Souk des artisans', 'Fès', 'VALIDE', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-4.9789, 34.0612), 4326)),
('Câbles anarchiques Bab Boujloud', 'Panne électrique', 'Câbles électriques en désordre total.', 34.0623, -4.9812, 'Bab Boujloud', 'Place Bab Boujloud', 'Fès', 'REDIGE', 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-4.9812, 34.0623), 4326)),
('Nid poule Route Sefrou', 'Route endommagée', 'Nids de poule dangereux sur route provinciale.', 34.0156, -4.9934, 'Route Sefrou', 'Route P5011', 'Fès', 'VALIDE', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', ST_SetSRID(ST_MakePoint(-4.9934, 34.0156), 4326)),
('Mur dégradé Jardins Jnan Sbil', 'Autre', 'Mur d''enceinte du jardin public fissuré.', 34.0578, -4.9889, 'Jnan Sbil', 'Jardins Jnan Sbil', 'Fès', 'VALIDE', 2, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-4.9889, 34.0578), 4326)),
('Feu signalisation Ain Kadous', 'Panne électrique', 'Feu tricolore hors service sur carrefour important.', 34.0234, -5.0112, 'Ain Kadous', 'Avenue Lalla Asmae', 'Fès', 'PRIS_EN_COMPTE', 5, NOW() - INTERVAL '20 hours', NOW() - INTERVAL '14 hours', ST_SetSRID(ST_MakePoint(-5.0112, 34.0234), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Trottoir dangereux Batha', 'Route endommagée', 'Trottoir cassé dangereux pour piétons.', 34.0645, -4.9823, 'Batha', 'Place Batha', 'Fès', 'REDIGE', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-4.9823, 34.0645), 4326)),
('Mobilier urbain cassé', 'Autre', 'Bancs publics vandalisés près de la gare.', 34.0412, -5.0089, 'Gare', 'Avenue de la Gare', 'Fès', 'VALIDE', 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-5.0089, 34.0412), 4326));

COMMIT;

-- =====================================
-- OUARZAZATE - Sud (10 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Avenue Mohammed V', 'Éclairage public', 'Plusieurs lampadaires éteints sur l''avenue principale.', 30.9335, -6.9370, 'Centre', 'Avenue Mohammed V', 'Ouarzazate', 'VALIDE', 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-6.9370, 30.9335), 4326)),
('Fuite système irrigation', 'Fuite d''eau', 'Fuite importante sur canalisation d''irrigation.', 30.9289, -6.8934, 'Palmeraie', 'Zone de la palmeraie', 'Ouarzazate', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-6.8934, 30.9289), 4326)),
('Route Kasbah dégradée', 'Route endommagée', 'Route menant à la Kasbah très dégradée.', 30.9245, -6.9123, 'Kasbah', 'Route de Taourirt', 'Ouarzazate', 'VALIDE', 1, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', ST_SetSRID(ST_MakePoint(-6.9123, 30.9245), 4326)),
('Palmiers secs zone touristique', 'Espaces verts', 'Palmiers non arrosés dans zone touristique.', 30.9312, -6.9401, 'Zone touristique', 'Boulevard Moulay Rachid', 'Ouarzazate', 'VALIDE', 2, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', ST_SetSRID(ST_MakePoint(-6.9401, 30.9312), 4326)),
('Sable envahit route', 'Route endommagée', 'Route ensablée nécessitant dégagement urgent.', 30.9456, -6.9567, 'Route désert', 'Route de Zagora', 'Ouarzazate', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-6.9567, 30.9456), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Déchets marché hebdomadaire', 'Déchets non collectés', 'Déchets non ramassés après le marché hebdomadaire.', 30.9301, -6.9345, 'Marché', 'Place du marché', 'Ouarzazate', 'VALIDE', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-6.9345, 30.9301), 4326)),
('Panneau routier renversé', 'Signalisation défectueuse', 'Panneau de signalisation renversé par vent de sable.', 30.9123, -6.8812, 'Route nationale', 'Route N9', 'Ouarzazate', 'REDIGE', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-6.8812, 30.9123), 4326)),
('Érosion berge oued', 'Autre', 'Érosion importante des berges de l''oued.', 30.9178, -6.9234, 'Oued', 'Berges de l''oued', 'Ouarzazate', 'VALIDE', 2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', ST_SetSRID(ST_MakePoint(-6.9234, 30.9178), 4326)),
('Câble électrique bas', 'Panne électrique', 'Câble électrique pend dangereusement bas.', 30.9267, -6.9289, 'Quartier administratif', 'Rue de l''Hôpital', 'Ouarzazate', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-6.9289, 30.9267), 4326)),
('Fissure grande chaussée', 'Route endommagée', 'Grande fissure longitudinale sur chaussée.', 30.9389, -6.9445, 'Centre', 'Boulevard Prince Héritier', 'Ouarzazate', 'VALIDE', 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-6.9445, 30.9389), 4326));

COMMIT;

-- =====================================
-- AGADIR - Côte Sud (10 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Promenade plage', 'Éclairage public', 'Lampadaires éteints sur la promenade touristique.', 30.4278, -9.5981, 'Front de mer', 'Promenade Beach', 'Agadir', 'VALIDE', 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-9.5981, 30.4278), 4326)),
('Fuite arrosage jardins', 'Fuite d''eau', 'Système d''arrosage automatique en fuite continue.', 30.4213, -9.5987, 'Vallée Oiseaux', 'Vallée des Oiseaux', 'Agadir', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-9.5987, 30.4213), 4326)),
('Route Marina endommagée', 'Route endommagée', 'Chaussée abîmée près de la marina touristique.', 30.4189, -9.6112, 'Marina', 'Marina d''Agadir', 'Agadir', 'PRIS_EN_COMPTE', 1, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-9.6112, 30.4189), 4326)),
('Palmiers secs Corniche', 'Espaces verts', 'Palmiers non arrosés et complètement desséchés.', 30.4312, -9.6045, 'Corniche', 'Boulevard du 20 Août', 'Agadir', 'VALIDE', 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', ST_SetSRID(ST_MakePoint(-9.6045, 30.4312), 4326)),
('Sable envahit chaussée', 'Route endommagée', 'Sable du désert envahissant la route côtière.', 30.3989, -9.5445, 'Route Inezgane', 'Route N1', 'Agadir', 'REDIGE', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-9.5445, 30.3989), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Poubelles plage saturées', 'Déchets non collectés', 'Containers à déchets débordent en haute saison.', 30.4289, -9.6034, 'Plage', 'Plage d''Agadir', 'Agadir', 'VALIDE', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-9.6034, 30.4289), 4326)),
('Panneau touristique vandalisé', 'Autre', 'Panneau indicateur touristique arraché et vandalisé.', 30.4167, -9.5923, 'Centre', 'Boulevard Hassan II', 'Agadir', 'REDIGE', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-9.5923, 30.4167), 4326)),
('Fuite piscine publique', 'Fuite d''eau', 'Piscine municipale perd beaucoup d''eau.', 30.4256, -9.5834, 'Nouvelle Talborjt', 'Complexe sportif', 'Agadir', 'VALIDE', 4, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-9.5834, 30.4256), 4326)),
('Nid poule Boulevard Fondation', 'Route endommagée', 'Plusieurs nids de poule sur boulevard principal.', 30.4223, -9.5978, 'Centre', 'Boulevard du Fondation', 'Agadir', 'VALIDE', 1, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-9.5978, 30.4223), 4326)),
('Éclairage parking défaillant', 'Éclairage public', 'Parking public complètement dans le noir.', 30.4201, -9.6001, 'Souk El Had', 'Parking Souk El Had', 'Agadir', 'PRIS_EN_COMPTE', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-9.6001, 30.4201), 4326));

COMMIT;

-- =====================================
-- OUJDA - Est (10 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Boulevard Mohammed V', 'Éclairage public', 'Plusieurs lampadaires ne fonctionnent plus.', 34.6814, -1.9089, 'Centre', 'Boulevard Mohammed V', 'Oujda', 'VALIDE', 3, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-1.9089, 34.6814), 4326)),
('Fuite eau Place Attarine', 'Fuite d''eau', 'Fuite au niveau de la fontaine publique centrale.', 34.6792, -1.9112, 'Médina', 'Place Attarine', 'Oujda', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-1.9112, 34.6792), 4326)),
('Nid poule Avenue Zerktouni', 'Route endommagée', 'Plusieurs nids de poule très dangereux.', 34.6856, -1.9134, 'Centre', 'Avenue Zerktouni', 'Oujda', 'REDIGE', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-1.9134, 34.6856), 4326)),
('Parc Lalla Aicha sale', 'Espaces verts', 'Parc public avec déchets et herbe non taillée.', 34.6823, -1.9067, 'Centre', 'Parc Lalla Aicha', 'Oujda', 'VALIDE', 2, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-1.9067, 34.6823), 4326)),
('Containers débordent Sidi Maafa', 'Déchets non collectés', 'Déchets non collectés dans quartier résidentiel.', 34.6745, -1.9201, 'Sidi Maafa', 'Quartier Sidi Maafa', 'Oujda', 'VALIDE', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-1.9201, 34.6745), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Trottoir cassé Lazaret', 'Route endommagée', 'Trottoir complètement défoncé sur 20m.', 34.6889, -1.9078, 'Lazaret', 'Boulevard Lazaret', 'Oujda', 'VALIDE', 1, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-1.9078, 34.6889), 4326)),
('Feu signalisation cassé', 'Panne électrique', 'Feu tricolore ne fonctionne plus depuis 2 jours.', 34.6801, -1.9145, 'Centre', 'Carrefour central', 'Oujda', 'PRIS_EN_COMPTE', 5, NOW() - INTERVAL '48 hours', NOW() - INTERVAL '24 hours', ST_SetSRID(ST_MakePoint(-1.9145, 34.6801), 4326)),
('Caniveau bouché Sidi Yahia', 'Assainissement', 'Caniveau complètement obstrué causant odeurs.', 34.6767, -1.9223, 'Sidi Yahia', 'Rue principale', 'Oujda', 'VALIDE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-1.9223, 34.6767), 4326)),
('Arbre mort Boulevard', 'Espaces verts', 'Arbre mort à abattre pour sécurité.', 34.6834, -1.9101, 'Centre', 'Boulevard Hassan Loukili', 'Oujda', 'REDIGE', 2, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-1.9101, 34.6834), 4326)),
('Chaussée bosselée', 'Route endommagée', 'Chaussée très irrégulière avec bosses.', 34.6778, -1.9189, 'Quartier universitaire', 'Avenue de l''Université', 'Oujda', 'VALIDE', 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-1.9189, 34.6778), 4326));

COMMIT;

-- =====================================
-- LAÂYOUNE - Sud (8 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Avenue Mekka', 'Éclairage public', 'Transformateur hors service, quartier dans le noir.', 27.1536, -13.2033, 'Centre', 'Avenue Mekka', 'Laâyoune', 'VALIDE', 3, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-13.2033, 27.1536), 4326)),
('Fuite réseau principal', 'Fuite d''eau', 'Fuite importante sur canalisation principale.', 27.1478, -13.1989, 'Centre', 'Boulevard Hassan II', 'Laâyoune', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-13.1989, 27.1478), 4326)),
('Route ensablée sortie ville', 'Route endommagée', 'Route complètement ensablée par tempête de sable.', 27.1689, -13.2156, 'Sortie nord', 'Route nationale N1', 'Laâyoune', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-13.2156, 27.1689), 4326)),
('Espace vert desséché', 'Espaces verts', 'Jardin public complètement desséché par manque d''eau.', 27.1512, -13.2001, 'Parc', 'Parc municipal', 'Laâyoune', 'VALIDE', 2, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days', ST_SetSRID(ST_MakePoint(-13.2001, 27.1512), 4326)),
('Déchets place publique', 'Déchets non collectés', 'Accumulation de déchets depuis plusieurs jours.', 27.1501, -13.2045, 'Place', 'Place Dcheira', 'Laâyoune', 'VALIDE', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-13.2045, 27.1501), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Panneau arraché par vent', 'Signalisation défectueuse', 'Panneau de circulation arraché par vent fort.', 27.1623, -13.2112, 'Route périphérique', 'Périphérique nord', 'Laâyoune', 'REDIGE', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-13.2112, 27.1623), 4326)),
('Nid poule Avenue FAR', 'Route endommagée', 'Nid de poule profond sur avenue principale.', 27.1489, -13.2067, 'Centre', 'Avenue des FAR', 'Laâyoune', 'VALIDE', 1, NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days', ST_SetSRID(ST_MakePoint(-13.2067, 27.1489), 4326)),
('Câble électrique exposé', 'Panne électrique', 'Câble électrique exposé et dangereux.', 27.1556, -13.2089, 'Quartier administratif', 'Rue de l''Administration', 'Laâyoune', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-13.2089, 27.1556), 4326));

COMMIT;

-- =====================================
-- NADOR - Nord-Est (9 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Corniche Nador', 'Éclairage public', 'Lampadaires éteints sur toute la corniche.', 35.1681, -2.9334, 'Corniche', 'Corniche de Nador', 'Nador', 'VALIDE', 3, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-2.9334, 35.1681), 4326)),
('Fuite eau Boulevard Hassan II', 'Fuite d''eau', 'Fuite continue créant grande flaque.', 35.1745, -2.9289, 'Centre', 'Boulevard Hassan II', 'Nador', 'EN_COURS_DE_TRAITEMENT', 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-2.9289, 35.1745), 4326)),
('Route port dégradée', 'Route endommagée', 'Route menant au port très abîmée.', 35.1656, -2.9401, 'Port', 'Route du port', 'Nador', 'VALIDE', 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days', ST_SetSRID(ST_MakePoint(-2.9401, 35.1656), 4326)),
('Palmiers plage non entretenus', 'Espaces verts', 'Palmiers de la plage mal entretenus.', 35.1723, -2.9367, 'Plage', 'Plage de Nador', 'Nador', 'VALIDE', 2, NOW() - INTERVAL '12 days', NOW() - INTERVAL '11 days', ST_SetSRID(ST_MakePoint(-2.9367, 35.1723), 4326)),
('Déchets marché poisson', 'Déchets non collectés', 'Déchets du marché aux poissons non ramassés.', 35.1689, -2.9312, 'Marché', 'Marché aux poissons', 'Nador', 'VALIDE', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-2.9312, 35.1689), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Trottoir cassé centre-ville', 'Route endommagée', 'Trottoir défoncé dangereux pour piétons.', 35.1734, -2.9301, 'Centre', 'Avenue Mohammed V', 'Nador', 'REDIGE', 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-2.9301, 35.1734), 4326)),
('Feu tricolore bloqué', 'Panne électrique', 'Feu tricolore bloqué au rouge depuis 12h.', 35.1712, -2.9278, 'Centre', 'Carrefour principal', 'Nador', 'PRIS_EN_COMPTE', 5, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '12 hours', ST_SetSRID(ST_MakePoint(-2.9278, 35.1712), 4326)),
('Caniveau déborde', 'Assainissement', 'Caniveau déborde lors des pluies.', 35.1698, -2.9345, 'Quartier résidentiel', 'Hay Salam', 'Nador', 'VALIDE', 4, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-2.9345, 35.1698), 4326)),
('Signalisation absente', 'Signalisation défectueuse', 'Panneaux de signalisation manquants.', 35.1670, -2.9423, 'Route nationale', 'Route N2', 'Nador', 'REDIGE', 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', ST_SetSRID(ST_MakePoint(-2.9423, 35.1670), 4326));

COMMIT;

-- =====================================
-- GUELMIM - Sud (9 incidents)
-- =====================================

BEGIN;

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Éclairage Avenue Hassan II', 'Éclairage public', 'Plusieurs lampadaires hors service.', 28.9870, -10.0574, 'Centre', 'Avenue Hassan II', 'Guelmim', 'VALIDE', 3, NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days', ST_SetSRID(ST_MakePoint(-10.0574, 28.9870), 4326)),
('Fuite réseau oasis', 'Fuite d''eau', 'Fuite sur réseau d''irrigation de l''oasis.', 28.9823, -10.0512, 'Oasis', 'Oasis de Guelmim', 'Guelmim', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', ST_SetSRID(ST_MakePoint(-10.0512, 28.9823), 4326)),
('Route ensablée désert', 'Route endommagée', 'Route complètement recouverte de sable.', 28.9756, -10.0623, 'Route désert', 'Route de Tan-Tan', 'Guelmim', 'EN_COURS_DE_TRAITEMENT', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', ST_SetSRID(ST_MakePoint(-10.0623, 28.9756), 4326)),
('Palmiers oasis malades', 'Espaces verts', 'Palmiers de l''oasis atteints par maladie.', 28.9812, -10.0489, 'Oasis', 'Palmeraie traditionnelle', 'Guelmim', 'VALIDE', 2, NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', ST_SetSRID(ST_MakePoint(-10.0489, 28.9812), 4326)),
('Déchets souk hebdomadaire', 'Déchets non collectés', 'Déchets du souk non ramassés depuis 3 jours.', 28.9889, -10.0601, 'Souk', 'Place du souk', 'Guelmim', 'VALIDE', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', ST_SetSRID(ST_MakePoint(-10.0601, 28.9889), 4326));

INSERT INTO incidents (titre, type_incident, description, latitude, longitude, nom_local, localisation, province, statut, secteur_id, date_declaration, date_modification, location) VALUES
('Panneau direction manquant', 'Signalisation défectueuse', 'Panneau de direction touristique manquant.', 28.9901, -10.0556, 'Route touristique', 'Route de Sidi Ifni', 'Guelmim', 'REDIGE', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-10.0556, 28.9901), 4326)),
('Nid poule centre-ville', 'Route endommagée', 'Nids de poule multiples en centre-ville.', 28.9856, -10.0589, 'Centre', 'Boulevard Mohammed V', 'Guelmim', 'VALIDE', 1, NOW() - INTERVAL '11 days', NOW() - INTERVAL '10 days', ST_SetSRID(ST_MakePoint(-10.0589, 28.9856), 4326)),
('Poteau électrique penché', 'Panne électrique', 'Poteau électrique incliné dangereux.', 28.9834, -10.0534, 'Quartier administratif', 'Rue de la Province', 'Guelmim', 'PRIS_EN_COMPTE', 4, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', ST_SetSRID(ST_MakePoint(-10.0534, 28.9834), 4326)),
('Fontaine publique cassée', 'Fuite d''eau', 'Fontaine publique vandalisée et en fuite.', 28.9878, -10.0567, 'Place', 'Place centrale', 'Guelmim', 'VALIDE', 4, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', ST_SetSRID(ST_MakePoint(-10.0567, 28.9878), 4326));

COMMIT;

-- =====================================================
-- RÉSUMÉ DU JEU DE DONNÉES RÉGIONAL
-- =====================================================
-- Total: 80 incidents répartis sur 8 villes régionales
-- 
-- Répartition par ville:
-- - Tanger: 12 incidents (Nord)
-- - Fès: 12 incidents (Centre patrimoine)
-- - Ouarzazate: 10 incidents (Sud désert)
-- - Agadir: 10 incidents (Côte sud)
-- - Oujda: 10 incidents (Est frontière)
-- - Laâyoune: 8 incidents (Sahara)
-- - Nador: 9 incidents (Nord-est)
-- - Guelmim: 9 incidents (Sud)
--
-- Répartition par statut:
-- - REDIGE: ~18 incidents (22.5%)
-- - VALIDE: ~40 incidents (50%)
-- - PRIS_EN_COMPTE: ~12 incidents (15%)
-- - EN_COURS_DE_TRAITEMENT: ~6 incidents (7.5%)
-- - TRAITE: ~2 incidents (2.5%)
-- - BLOQUE: ~2 incidents (2.5%)
--
-- Types d'incidents adaptés aux régions:
-- - Routes (dégradation, ensablement): ~28%
-- - Eau (fuites, irrigation): ~20%
-- - Éclairage public: ~18%
-- - Espaces verts (oasis, palmiers): ~15%
-- - Déchets: ~11%
-- - Électricité: ~5%
-- - Assainissement: ~3%
--
-- Coordonnées GPS authentiques pour chaque ville
-- Secteurs utilisés: 1-5 (selon init-data.sql)
-- Prêt pour exécution dans pgAdmin
-- =====================================================
