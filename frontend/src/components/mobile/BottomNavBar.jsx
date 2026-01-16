import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Barre de navigation mobile en bas de l'écran
 * Visible uniquement sur les petits écrans
 */
const BottomNavBar = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // Vérifie si un lien est actif
    const isActive = (path) => location.pathname === path;

    // Vérifie si l'utilisateur peut déclarer un incident
    const canDeclare = !isAuthenticated() ||
        (user?.role !== 'ADMIN' && user?.role !== 'PROFESSIONNEL' &&
            user?.role !== 'admin' && user?.role !== 'professionnel');

    return (
        <nav className="bottom-nav-bar">
            {/* Mes Incidents */}
            <Link
                to="/mes-incidents"
                className={`bottom-nav-item ${isActive('/mes-incidents') ? 'active' : ''}`}
            >
                <AlertCircle size={22} />
                <span>Mes Incidents</span>
            </Link>

            {/* Signaler - Bouton central principal */}
            {canDeclare && (
                <Link
                    to="/declarer-incident"
                    className={`bottom-nav-item bottom-nav-primary ${isActive('/declarer-incident') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-primary-icon">
                        <Plus size={26} />
                    </div>
                    <span>Signaler</span>
                </Link>
            )}

            {/* Ma Carte - Incidents du citoyen uniquement */}
            <Link
                to="/ma-carte"
                className={`bottom-nav-item ${isActive('/ma-carte') ? 'active' : ''}`}
            >
                <MapPin size={22} />
                <span>Ma Carte</span>
            </Link>
        </nav>
    );
};

export default BottomNavBar;
