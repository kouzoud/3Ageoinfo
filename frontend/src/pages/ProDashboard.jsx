import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

import './ProDashboard.css';

const ProDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalIncidents: 0,
      incidentsEnCours: 0,
      incidentsResolus: 0,
      incidentsAssignes: 0
    },
    recentIncidents: [],
    monthlyStats: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/professionnel/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError('Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'status-orange';
      case 'VALIDE': return 'status-blue';
      case 'EN_COURS': return 'status-purple';
      case 'RESOLU': return 'status-green';
      case 'REJETE': return 'status-red';
      default: return 'status-gray';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En Attente';
      case 'VALIDE': return 'Validé';
      case 'EN_COURS': return 'En Cours';
      case 'RESOLU': return 'Résolu';
      case 'REJETE': return 'Rejeté';
      default: return statut;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pro-dashboard">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h1>Tableau de Bord Professionnel</h1>
          <p>Bienvenue, {user?.nom} {user?.prenom} - Gérez vos incidents assignés</p>
        </div>
        <button onClick={fetchDashboardData} className="refresh-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Actualiser
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.stats.totalIncidents}</div>
            <div className="stat-label">Total Incidents</div>
          </div>
        </div>

        <div className="stat-card assigned">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" />
              <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.stats.incidentsAssignes}</div>
            <div className="stat-label">Assignés à Moi</div>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.stats.incidentsEnCours}</div>
            <div className="stat-label">En Cours</div>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-number">{dashboardData.stats.incidentsResolus}</div>
            <div className="stat-label">Résolus</div>
          </div>
        </div>
      </div>

      {/* Incidents récents */}
      <div className="recent-incidents">
        <div className="section-header">
          <h2>Incidents Récents Assignés</h2>
          <a href="/professionnel/incidents" className="view-all-btn">
            Voir tout
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="12,5 19,12 12,19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {dashboardData.recentIncidents.length === 0 ? (
          <div className="empty-incidents">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
            </svg>
            <h3>Aucun incident récent</h3>
            <p>Vous n'avez pas d'incidents assignés récemment.</p>
          </div>
        ) : (
          <div className="incidents-list">
            {dashboardData.recentIncidents.map(incident => (
              <div key={incident.id} className="incident-card">
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3>{incident.typeIncident}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(incident.statut)}`}>
                    {getStatusText(incident.statut)}
                  </span>
                </div>
                <p className="incident-description">{incident.description}</p>
                <div className="incident-meta">
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>{incident.citoyen?.nom} {incident.citoyen?.prenom}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{formatDate(incident.dateCreation)}</span>
                  </div>
                  <div className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>{incident.localisation}</span>
                  </div>
                </div>
                <div className="incident-actions">
                  <button className="action-btn primary">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Voir Détails
                  </button>
                  {incident.statut === 'VALIDE' && (
                    <button className="action-btn success">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 11l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Commencer
                    </button>
                  )}
                  {incident.statut === 'EN_COURS' && (
                    <button className="action-btn warning">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Marquer Résolu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Graphique des activités mensuelles */}
      {dashboardData.monthlyStats && dashboardData.monthlyStats.length > 0 && (
        <div className="monthly-chart">
          <div className="section-header">
            <h2>Activité Mensuelle</h2>
          </div>
          <div className="chart-container">
            <div className="chart-grid">
              {dashboardData.monthlyStats.map((stat, index) => (
                <div key={index} className="chart-bar">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${(stat.count / Math.max(...dashboardData.monthlyStats.map(s => s.count))) * 100}%`
                    }}
                  ></div>
                  <div className="bar-label">{stat.month}</div>
                  <div className="bar-value">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="quick-actions">
        <div className="section-header">
          <h2>Actions Rapides</h2>
        </div>
        <div className="actions-grid">
          <a href="/professionnel/incidents" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>Gérer Incidents</h3>
            <p>Voir et traiter tous vos incidents assignés</p>
          </a>

          <a href="/professionnel/profil" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h3>Mon Profil</h3>
            <p>Modifier vos informations personnelles</p>
          </a>

          <a href="/professionnel/historique" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Historique</h3>
            <p>Consulter l'historique de vos interventions</p>
          </a>

          <a href="/professionnel/rapports" className="action-card">
            <div className="action-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Rapports</h3>
            <p>Générer des rapports d'activité</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProDashboard;

