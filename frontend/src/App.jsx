import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { FilterProvider } from './contexts/FilterContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CitizenPWAGuard from './components/CitizenPWAGuard';
import PWAGuard from './components/PWAGuard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import MapView from './pages/MapView';
import Connexion from './pages/Connexion';
import GestionIncidentsPro from './pages/GestionIncidentsPro';
import AdminDashboard from './pages/AdminDashboard';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import DeclarerIncident from './pages/DeclarerIncident';
import MesIncidents from './pages/MesIncidents';
import MaCarte from './pages/MaCarte';
import TestConnectivity from './pages/TestConnectivity';
import Welcome from './pages/Welcome';
import AppBootstrap from './components/AppBootstrap';
import { ToastContainer } from './components/Toast';

/**
 * Composant principal de l'application
 * Gère le routage entre les différentes pages et les contexts globaux
 */
function App() {
  // Détecter l'installation PWA et rafraîchir automatiquement
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('✅ PWA installée ! Rafraîchissement automatique...');
      // Petite attente pour laisser l'installation se terminer
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
  return (
    <Router>
      <AuthProvider>
        <PWAGuard>
          <FilterProvider>
            <AppProvider>
              <Layout>
                <Routes>
                  {/* Route de bienvenue - Affichée uniquement à la première installation */}
                  <Route path="/welcome" element={<Welcome />} />

                  {/* Routes citoyens - Protégées par AppBootstrap */}
                  <Route path="/" element={<AppBootstrap><Home /></AppBootstrap>} />
                  <Route path="/tableau-de-bord" element={<AppBootstrap><Dashboard /></AppBootstrap>} />
                  <Route path="/incidents" element={<AppBootstrap><Incidents /></AppBootstrap>} />
                  <Route path="/declarer-incident" element={<AppBootstrap><DeclarerIncident /></AppBootstrap>} />
                  <Route path="/mes-incidents" element={<AppBootstrap><MesIncidents /></AppBootstrap>} />
                  <Route path="/ma-carte" element={<AppBootstrap><MaCarte /></AppBootstrap>} />
                  <Route path="/carte" element={<AppBootstrap><MapView /></AppBootstrap>} />
                  <Route path="/test-connectivite" element={<TestConnectivity />} />

                  {/* Connexion - Bloquée sur PWA (citoyens anonymes) */}
                  <Route path="/connexion" element={
                    <CitizenPWAGuard>
                      <Connexion />
                    </CitizenPWAGuard>
                  } />

                  {/* Routes protégées - Professionnel (Bloquées sur PWA) */}
                  <Route
                    path="/pro"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="PROFESSIONNEL">
                          <GestionIncidentsPro />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />
                  <Route
                    path="/professionnel/dashboard"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="PROFESSIONNEL">
                          <GestionIncidentsPro />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />
                  <Route
                    path="/professionnel/incidents"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="PROFESSIONNEL">
                          <GestionIncidentsPro />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />

                  {/* Routes protégées - Administrateur (Bloquées sur PWA) */}
                  <Route
                    path="/admin"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminDashboard />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="ADMIN">
                          <AdminDashboard />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />
                  <Route
                    path="/admin/utilisateurs"
                    element={
                      <CitizenPWAGuard>
                        <ProtectedRoute requiredRole="ADMIN">
                          <GestionUtilisateurs />
                        </ProtectedRoute>
                      </CitizenPWAGuard>
                    }
                  />
                </Routes>
              </Layout>
            </AppProvider>
          </FilterProvider>
        </PWAGuard>
      </AuthProvider>
      <ToastContainer />
    </Router>
  );
}

export default App;
