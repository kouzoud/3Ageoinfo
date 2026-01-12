import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { showToast } from '../components/Toast';

/**
 * Page de bienvenue avec récupération par email
 * Permet au citoyen de :
 * 1. Entrer son email pour récupérer ses incidents
 * 2. Skip pour mode anonyme (UUID)
 */
const Welcome = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isValidEmail, setIsValidEmail] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validation email
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        setIsValidEmail(validateEmail(value));
    };

    // Générer UUID v4
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Récupérer avec email
    const handleRecoverWithEmail = async () => {
        if (!isValidEmail) return;

        setLoading(true);
        try {
            // Récupérer les incidents de cet email
            const response = await fetch(`http://localhost:8085/api/incidents/by-email/${encodeURIComponent(email)}`);

            if (!response.ok) {
                throw new Error('Erreur serveur');
            }

            const incidents = await response.json();
            const count = incidents.length;

            // Générer un UUID pour éviter que useFirstTimeUser force le retour à Welcome
            const uuid = generateUUID();

            // Sauvegarder l'email ET le UUID dans localStorage
            localStorage.setItem('citizenEmail', email);
            localStorage.setItem('citizen_device_id', uuid);
            localStorage.setItem('welcome_shown', 'true');

            // Message selon le cas
            if (count > 0) {
                // Email existant avec incidents
                showToast(
                    `Bienvenue ! ${count} incident${count > 1 ? 's' : ''} récupéré${count > 1 ? 's' : ''} avec succès`,
                    'success',
                    5000
                );
            } else {
                // Email nouveau (pas d'incidents)
                showToast(
                    `Email enregistré ! Vos futurs incidents seront liés à ${email}`,
                    'success',
                    5000
                );
            }

            // Rediriger vers la page d'accueil
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 100);
        } catch (error) {
            console.error('Erreur récupération:', error);
            showToast(
                'Erreur de connexion au serveur. Veuillez réessayer.',
                'error',
                4000
            );
        } finally {
            setLoading(false);
        }
    };

    // Skip → Mode anonyme
    const handleSkip = () => {
        const uuid = generateUUID();
        localStorage.setItem('citizen_device_id', uuid);
        localStorage.setItem('welcome_shown', 'true');

        console.log('🔑 Mode anonyme - UUID généré:', uuid);

        navigate('/', { replace: true });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 50%, rgba(51, 65, 85, 1) 100%)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Fond animé */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
                animation: 'pulse 8s ease-in-out infinite',
                pointerEvents: 'none'
            }} />

            {/* Contenu principal */}
            <div style={{
                maxWidth: '500px',
                width: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                {/* En-tête */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        <Sparkles size={40} style={{ color: 'white' }} />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'rgba(255, 255, 255, 0.95)',
                        marginBottom: '1rem',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                        Bienvenue sur CityAlert
                    </h1>
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'rgba(226, 232, 240, 0.8)',
                        lineHeight: '1.6'
                    }}>
                        Signalez et suivez les incidents de votre ville en toute simplicité
                    </p>
                </div>

                {/* Card principale */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'rgba(255, 255, 255, 0.95)',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        Comment souhaitez-vous continuer ?
                    </h2>

                    {/* Option Email */}
                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '2px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem'
                        }}>
                            <Mail size={24} style={{ color: '#60a5fa' }} />
                            <h3 style={{
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: 'rgba(255, 255, 255, 0.95)',
                                margin: 0
                            }}>
                                📧 Récupérer mes incidents
                            </h3>
                        </div>
                        <p style={{
                            fontSize: '0.875rem',
                            color: 'rgba(226, 232, 240, 0.7)',
                            marginBottom: '1rem',
                            lineHeight: '1.5'
                        }}>
                            Entrez votre email pour retrouver vos incidents sur n'importe quel appareil
                        </p>

                        <input
                            type="email"
                            placeholder="votre.email@example.com"
                            value={email}
                            onChange={handleEmailChange}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: '8px',
                                border: `2px solid ${isValidEmail ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}`,
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontSize: '0.9375rem',
                                outline: 'none',
                                marginBottom: '1rem',
                                transition: 'all 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = isValidEmail ? '#10b981' : 'rgba(148, 163, 184, 0.3)'}
                        />

                        <button
                            onClick={handleRecoverWithEmail}
                            disabled={!isValidEmail || loading}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 1.5rem',
                                background: isValidEmail ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(148, 163, 184, 0.2)',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: isValidEmail ? 'white' : 'rgba(148, 163, 184, 0.5)',
                                cursor: isValidEmail && !loading ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease',
                                opacity: loading ? 0.6 : 1
                            }}
                        >
                            {loading ? 'Récupération...' : 'Récupérer'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </div>

                    {/* Séparateur */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        margin: '1.5rem 0'
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }} />
                        <span style={{ color: 'rgba(148, 163, 184, 0.5)', fontSize: '0.875rem' }}>OU</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(148, 163, 184, 0.2)' }} />
                    </div>

                    {/* Option Skip */}
                    <button
                        onClick={handleSkip}
                        style={{
                            width: '100%',
                            padding: '0.875rem 1.5rem',
                            background: 'rgba(148, 163, 184, 0.1)',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.9375rem',
                            fontWeight: '500',
                            color: 'rgba(226, 232, 240, 0.8)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(148, 163, 184, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                        }}
                    >
                        ⏭️ Passer (Mode anonyme)
                    </button>

                    {/* Info */}
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(96, 165, 250, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        color: 'rgba(147, 197, 253, 0.9)',
                        lineHeight: '1.5'
                    }}>
                        <strong>💡 À savoir :</strong> L'email vous permet de retrouver vos incidents sur n'importe quel appareil. Le mode anonyme utilise un identifiant local unique à ce navigateur.
                    </div>
                </div>
            </div>

            {/* Animations CSS */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default Welcome;
