console.log("=== DEBUG: Test de récupération des incidents ===");

// Tester l'endpoint directement
fetch('http://localhost:8085/api/incidents')
    .then(response => response.json())
    .then(data => {
        console.log("✅ Nombre total d'incidents reçus:", data.length);

        // Afficher un exemple d'incident
        if (data.length > 0) {
            console.log("📋 Exemple d'incident (premier):", JSON.stringify(data[0], null, 2));
        }

        // Compter les statuts
        const statusCount = {};
        data.forEach(incident => {
            const statut = incident.statut;
            statusCount[statut] = (statusCount[statut] || 0) + 1;
        });

        console.log("\n📊 Répartition par statut:");
        Object.entries(statusCount).forEach(([statut, count]) => {
            console.log(`  ${statut}: ${count}`);
        });

        // Vérifier spécifiquement TRAITE
        const traites = data.filter(i => i.statut === 'TRAITE');
        console.log(`\n✅ Incidents avec statut==='TRAITE': ${traites.length}`);

        if (traites.length > 0) {
            console.log("   Exemples:", traites.slice(0, 3).map(i => ({ id: i.id, titre: i.titre, statut: i.statut })));
        }

        // Tester d'autres variantes
        const traiteUpper = data.filter(i => i.statut === 'TRAITE');
        const traiteLower = data.filter(i => i.statut === 'traite');
        const traiteCapital = data.filter(i => i.statut === 'Traite');

        console.log(`\n🔍 Tests de casse:`);
        console.log(`   'TRAITE' (majuscules): ${traiteUpper.length}`);
        console.log(`   'traite' (minuscules): ${traiteLower.length}`);
        console.log(`   'Traite' (capitale): ${traiteCapital.length}`);
    })
    .catch(error => {
        console.error("❌ Erreur:", error);
    });
