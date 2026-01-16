import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIsPWA } from '../hooks/useIsPWA';

/**
 * Composant de navigation principal de l'application
 * S'adapte selon l'état d'authentification et le rôle de l'utilisateur
 * Version responsive avec menu hamburger pour mobile
 * IMPORTANT: Les liens citoyens ne sont visibles qu'en mode PWA
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isPWA = useIsPWA(); // Détection PWA/Mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /**
   * Vérifie si un lien est actif
   */
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  /**
   * Gère la déconnexion
   */
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  /**
   * Toggle le menu mobile
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Ferme le menu quand on clique sur un lien
   */
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isPWA ? "/tableau-de-bord" : "/"} className="navbar-brand" onClick={closeMenu}>
          <div className="brand-icon">
            <img
              src="/cityalert-logo.jpg"
              alt="CityAlert Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
          </div>
          <span className="brand-text">CityAlert</span>
        </Link>

        {/* Bouton hamburger pour mobile - masqué en mode PWA */}
        {!isPWA && (
          <button
            className="navbar-toggle"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}

        {/* Menu de navigation */}
        <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
          {isPWA ? (
            /* 📱 MODE PWA - Navbar du haut masquée, navigation via BottomNavBar */
            null
          ) : (
            /* 🖥️ MODE DESKTOP - NAVIGATION COMPLÈTE */
            <>
              {/* Liens publics - toujours visibles */}
              <li>
                <Link to="/" className={isActive('/')} onClick={closeMenu}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/tableau-de-bord" className={isActive('/tableau-de-bord')} onClick={closeMenu}>
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link to="/incidents" className={isActive('/incidents')} onClick={closeMenu}>
                  Incidents
                </Link>
              </li>
              <li>
                <Link to="/carte" className={isActive('/carte')} onClick={closeMenu}>
                  Carte SIG
                </Link>
              </li>

              {/* Liens spécifiques selon l'authentification */}
              {isAuthenticated() ? (
                <>
                  {/* Liens Admin */}
                  {(user?.role === 'admin' || user?.role === 'ADMIN') && (
                    <li>
                      <Link
                        to="/admin"
                        className={`${isActive('/admin')} nav-admin-link`}
                        onClick={closeMenu}
                      >
                        <User size={18} />
                        <span>Administration</span>
                      </Link>
                    </li>
                  )}

                  {/* Lien Professionnel */}
                  {(user?.role === 'professionnel' || user?.role === 'PROFESSIONNEL') && (
                    <li>
                      <Link to="/pro" className={isActive('/pro')} onClick={closeMenu}>
                        <Briefcase size={18} />
                        <span>Mes Incidents</span>
                      </Link>
                    </li>
                  )}

                  {/* Infos utilisateur et déconnexion */}
                  <li className="nav-user-info">
                    <User size={18} />
                    <span>{user?.prenom} {user?.nom}</span>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="nav-logout-btn">
                      <LogOut size={18} />
                      <span>Déconnexion</span>
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/connexion"
                    className={`${isActive('/connexion')} nav-connexion-link`}
                    onClick={closeMenu}
                  >
                    Connexion
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Overlay pour fermer le menu sur mobile */}
        {isMenuOpen && (
          <div className="navbar-overlay" onClick={closeMenu} />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
