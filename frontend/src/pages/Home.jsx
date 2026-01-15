import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import { statistiquesAPI } from '../services/api';

/**
 * Page d'accueil - Design professionnel et moderne
 * Améliorations: Glassmorphism, animations, statistiques RÉELLES
 */
const Home = () => {
  const [stats, setStats] = useState({
    totalIncidents: 0,
    resolved: 0,
    resolutionRate: 0,
    avgDelay: 'N/A'
  });
  const [loading, setLoading] = useState(true);

  // Charger les statistiques réelles depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statistiquesAPI.getStatistiques();
        setStats({
          totalIncidents: data.totalIncidents,
          resolved: data.incidentsResolus,
          resolutionRate: data.tauxResolution,
          avgDelay: data.delaiMoyen
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animation des compteurs
  const animateValue = (start, end, duration, setValue) => {
    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    const timer = setInterval(() => {
      current += increment;
      setValue(current);
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  };

  // Intersection Observer pour animations au scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* Background animé avec effet Nebula Wave */}
      <AnimatedBackground
        enableConnections={true}
        enableMouseInteraction={true}
        enableTrails={true}
        connectionDistance={150}
      />

      {/* Hero Section - Design amélioré */}
      <div className="hero-section-v2">
        <div className="hero-content-v2">
          <h1 className="hero-title-v2">
            Gérez les Incidents Urbains{' '}
            <span className="text-gradient">en Temps Réel</span>
          </h1>
          <p className="hero-subtitle-v2">
            Solution collaborative de signalement citoyen avec suivi en temps réel
            et géolocalisation automatique
          </p>
          <div className="hero-buttons-v2">
            <Link to="/tableau-de-bord" className="btn-hero-primary-v2">
              <span>📊</span> Voir le Tableau de Bord
            </Link>
            <Link to="/incidents" className="btn-hero-secondary-v2">
              <span>📋</span> Liste des Incidents
            </Link>
          </div>
        </div>
      </div>

      {/* Section Fonctionnalités - Glassmorphism */}
      <div className="features-section-v2 fade-in-section">
        <div className="container">
          <div className="section-header-v2">
            <h2>Comment ça fonctionne ?</h2>
            <p>Une plateforme collaborative pour améliorer la vie des citoyens</p>
          </div>

          <div className="grid grid-3">
            <div className="feature-card-v2">
              <div className="number-badge">1</div>
              <h3>📱 Déclarez un incident</h3>
              <p>
                Signalez rapidement tout problème urbain via l'application mobile PWA
                avec photo obligatoire et géolocalisation automatique au moment de la capture
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="number-badge">2</div>
              <h3>🔔 Suivi en temps réel</h3>
              <p>
                Consultez l'état de traitement de vos signalements et recevez des
                notifications push à chaque changement de statut
              </p>
            </div>

            <div className="feature-card-v2">
              <div className="number-badge">3</div>
              <h3>✅ Résolution efficace</h3>
              <p>
                Les services municipaux traitent les incidents par priorité et vous
                informent des actions entreprises pour améliorer votre ville
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Statistiques - Nouvelle */}
      <div className="stats-section-v2 fade-in-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalIncidents}</div>
              <div className="stat-label">Incidents signalés</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Incidents résolus</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.resolutionRate}%</div>
              <div className="stat-label">Taux de résolution</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.avgDelay}</div>
              <div className="stat-label">Délai moyen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section CTA - Refonte complète */}
      <div className="cta-section-v2 fade-in-section">
        <div className="cta-background-shapes"></div>
        <div className="container">
          <div className="cta-content-v2">
            <h2>Rejoignez la Communauté 🏙️</h2>
            <p>Plus de 1 000 incidents résolus grâce à l'engagement citoyen</p>
            <div className="cta-buttons">
              <Link to="/tableau-de-bord" className="cta-button-primary">
                📈 Voir les statistiques
              </Link>
              <Link to="/carte" className="cta-button-secondary">
                🗺️ Explorer la carte
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Styles inline pour éviter les conflits */}
      <style>{`
        /* ===== HERO SECTION V2 ===== */
        .hero-section-v2 {
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          position: relative;
        }

        .hero-content-v2 {
          text-align: center;
          max-width: 900px;
          position: relative;
          z-index: 2;
        }

        .hero-title-v2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          color: white;
        }

        .text-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle-v2 {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          font-weight: 400;
          line-height: 1.6;
          color: rgba(255,255,255,0.85);
          max-width: 600px;
          margin: 0 auto 40px;
        }

        .hero-buttons-v2 {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-hero-primary-v2 {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 16px 40px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-hero-primary-v2:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.45);
        }

        .btn-hero-secondary-v2 {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.6);
          color: white;
          padding: 14px 38px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-hero-secondary-v2:hover {
          background: rgba(30, 41, 59, 0.85);
          border-color: rgba(255, 255, 255, 0.8);
        }

        /* ===== FEATURES SECTION V2 ===== */
        .features-section-v2 {
          padding: 100px 24px;
          position: relative;
          z-index: 2;
        }

        .section-header-v2 {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-header-v2 h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
        }

        .section-header-v2 p {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.7);
        }

        .feature-card-v2 {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 40px 32px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .feature-card-v2::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #06b6d4);
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .feature-card-v2:hover {
          transform: translateY(-8px);
          background: rgba(30, 41, 59, 0.75);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.2);
        }

        .feature-card-v2:hover::before {
          transform: scaleX(1);
        }

        .number-badge {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin: 0 auto 24px;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
          position: relative;
        }

        .number-badge::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .feature-card-v2:hover .number-badge::after {
          opacity: 0.5;
        }

        .feature-card-v2 h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 16px;
        }

        .feature-card-v2 p {
          font-size: 1rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.9);
        }

        /* ===== STATS SECTION V2 ===== */
        .stats-section-v2 {
          padding: 80px 24px;
          position: relative;
          z-index: 2;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stat-card {
          text-align: center;
          padding: 40px 32px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(59, 130, 246, 0.15);
        }

        .stat-number {
          font-size: 48px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 16px;
          color: #64748b;
          font-weight: 500;
        }

        /* ===== CTA SECTION V2 ===== */
        .cta-section-v2 {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
          padding: 100px 40px;
          position: relative;
          overflow: hidden;
        }

        .cta-background-shapes::before,
        .cta-background-shapes::after {
          content: '';
          position: absolute;
          border-radius: 50%;
        }

        .cta-background-shapes::before {
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
        }

        .cta-background-shapes::after {
          bottom: -30%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
        }

        .cta-content-v2 {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .cta-content-v2 h2 {
          font-size: clamp(2rem, 4vw, 2.5rem);
          font-weight: 700;
          margin-bottom: 16px;
          color: white;
        }

        .cta-content-v2 p {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 40px;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-button-primary {
          background: white;
          color: #1e3a8a;
          padding: 16px 40px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cta-button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .cta-button-secondary {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 14px 38px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .cta-button-secondary:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.5);
        }

        /* ===== ANIMATIONS ===== */
        .fade-in-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .fade-in-section.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .hero-title-v2 {
            font-size: 2rem;
          }

          .hero-subtitle-v2 {
            font-size: 1rem;
          }

          .feature-card-v2 {
            padding: 32px 24px;
          }

          .number-badge {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .stat-number {
            font-size: 36px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
