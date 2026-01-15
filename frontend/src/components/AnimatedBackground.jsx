import { useEffect, useRef, useState } from 'react';

/**
 * NebulaWaveBackground - Fond animé avec effet de nébuleuse et ondes interconnectées
 * 
 * Features:
 * - Particules avec connexions dynamiques (lignes entre particules proches)
 * - Effet de vague ondulante
 * - Interaction au survol de la souris (particules attirées)
 * - Particules avec trails (traînées lumineuses)
 * - Effet de pulsation des couleurs
 * - Performance optimisée avec pooling
 */
const NebulaWaveBackground = ({
    enableConnections = true,
    enableMouseInteraction = true,
    enableTrails = true,
    particleCount = null,
    connectionDistance = 120
}) => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const animationFrameRef = useRef(null);
    const mouseRef = useRef({ x: null, y: null });
    const timeRef = useRef(0);
    const [isVisible, setIsVisible] = useState(true);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Détecter prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Détecter la visibilité de la page
    useEffect(() => {
        const handleVisibilityChange = () => setIsVisible(!document.hidden);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Tracking de la souris
    useEffect(() => {
        if (!enableMouseInteraction) return;

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: null, y: null };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [enableMouseInteraction]);

    // Animation principale
    useEffect(() => {
        if (prefersReducedMotion || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const isMobile = window.innerWidth < 768;
        const numParticles = particleCount ?? (isMobile ? 30 : 60);

        class Particle {
            constructor() {
                this.reset();
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.history = [];
            }

            reset() {
                this.baseX = Math.random() * canvas.width;
                this.baseY = Math.random() * canvas.height;
                this.x = this.baseX;
                this.y = this.baseY;
                this.size = Math.random() * 2.5 + 1.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.density = Math.random() * 30 + 20;
                this.hue = Math.random() * 60 + 180; // 180-240 (bleu-cyan-violet)
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulseOffset = Math.random() * Math.PI * 2;
                this.history = [];
            }

            update(time) {
                // Effet de vague sinusoïdale
                const waveX = Math.sin((this.baseY + time * 50) / 100) * 15;
                const waveY = Math.cos((this.baseX + time * 50) / 100) * 15;

                // Mouvement de base
                this.baseX += this.speedX;
                this.baseY += this.speedY;

                // Rebond sur les bords
                if (this.baseX < 0 || this.baseX > canvas.width) this.speedX *= -1;
                if (this.baseY < 0 || this.baseY > canvas.height) this.speedY *= -1;

                this.baseX = Math.max(0, Math.min(canvas.width, this.baseX));
                this.baseY = Math.max(0, Math.min(canvas.height, this.baseY));

                // Interaction souris
                let mouseInfluenceX = 0;
                let mouseInfluenceY = 0;
                if (mouseRef.current.x !== null && enableMouseInteraction) {
                    const dx = mouseRef.current.x - this.baseX;
                    const dy = mouseRef.current.y - this.baseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const maxDistance = 150;

                    if (distance < maxDistance) {
                        const force = (maxDistance - distance) / maxDistance;
                        mouseInfluenceX = (dx / distance) * force * 20;
                        mouseInfluenceY = (dy / distance) * force * 20;
                    }
                }

                // Position finale avec toutes les influences
                this.x = this.baseX + waveX + mouseInfluenceX;
                this.y = this.baseY + waveY + mouseInfluenceY;

                // Historique pour le trail
                if (enableTrails) {
                    this.history.push({ x: this.x, y: this.y });
                    if (this.history.length > 8) this.history.shift();
                }
            }

            draw(time) {
                // Trail (traînée)
                if (enableTrails && this.history.length > 1) {
                    ctx.beginPath();
                    for (let i = 0; i < this.history.length - 1; i++) {
                        const alpha = (i / this.history.length) * 0.15;
                        ctx.strokeStyle = `hsla(${this.hue}, 70%, 60%, ${alpha})`;
                        ctx.lineWidth = this.size * 0.5;
                        ctx.moveTo(this.history[i].x, this.history[i].y);
                        ctx.lineTo(this.history[i + 1].x, this.history[i + 1].y);
                        ctx.stroke();
                    }
                }

                // Pulsation de la taille et luminosité
                const pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
                const currentSize = this.size + pulse * 0.8;
                const brightness = 50 + pulse * 10;

                // Particule principale avec gradient radial
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentSize * 2);
                gradient.addColorStop(0, `hsla(${this.hue}, 80%, ${brightness}%, 0.8)`);
                gradient.addColorStop(0.5, `hsla(${this.hue}, 70%, ${brightness - 10}%, 0.4)`);
                gradient.addColorStop(1, `hsla(${this.hue}, 60%, ${brightness - 20}%, 0)`);

                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize * 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();

                // Noyau central plus lumineux
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 90%, ${brightness + 10}%, 0.9)`;
                ctx.fill();
            }

            drawConnection(other, time) {
                const dx = this.x - other.x;
                const dy = this.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.4; // Augmenté de 0.25 à 0.4
                    const avgHue = (this.hue + other.hue) / 2;

                    // Ligne avec gradient
                    const gradient = ctx.createLinearGradient(this.x, this.y, other.x, other.y);
                    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${opacity})`);
                    gradient.addColorStop(0.5, `hsla(${avgHue}, 70%, 60%, ${opacity * 1.2})`);
                    gradient.addColorStop(1, `hsla(${other.hue}, 70%, 60%, ${opacity})`);

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        }

        // Initialiser les particules
        particlesRef.current = Array.from({ length: numParticles }, () => new Particle());

        // Animation
        const animate = () => {
            if (!isVisible) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            timeRef.current += 0.016;

            // Fade out au lieu de clear pour créer un effet de traînée
            ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;

            // Détecter et dessiner les triangles formés par 3 particules connectées
            if (enableConnections) {
                const triangles = [];

                // Trouver tous les triangles
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const dist_ij = Math.sqrt(
                            Math.pow(particles[i].x - particles[j].x, 2) +
                            Math.pow(particles[i].y - particles[j].y, 2)
                        );

                        if (dist_ij < connectionDistance) {
                            for (let k = j + 1; k < particles.length; k++) {
                                const dist_ik = Math.sqrt(
                                    Math.pow(particles[i].x - particles[k].x, 2) +
                                    Math.pow(particles[i].y - particles[k].y, 2)
                                );
                                const dist_jk = Math.sqrt(
                                    Math.pow(particles[j].x - particles[k].x, 2) +
                                    Math.pow(particles[j].y - particles[k].y, 2)
                                );

                                if (dist_ik < connectionDistance && dist_jk < connectionDistance) {
                                    triangles.push({
                                        p1: particles[i],
                                        p2: particles[j],
                                        p3: particles[k],
                                        avgDist: (dist_ij + dist_ik + dist_jk) / 3
                                    });
                                }
                            }
                        }
                    }
                }

                // Dessiner les triangles avec un effet subtil
                triangles.forEach(triangle => {
                    const opacity = (1 - triangle.avgDist / connectionDistance) * 0.08;
                    const avgHue = (triangle.p1.hue + triangle.p2.hue + triangle.p3.hue) / 3;

                    ctx.beginPath();
                    ctx.moveTo(triangle.p1.x, triangle.p1.y);
                    ctx.lineTo(triangle.p2.x, triangle.p2.y);
                    ctx.lineTo(triangle.p3.x, triangle.p3.y);
                    ctx.closePath();

                    ctx.fillStyle = `hsla(${avgHue}, 70%, 60%, ${opacity})`;
                    ctx.fill();
                });
            }

            // Dessiner les connexions
            if (enableConnections) {
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        particles[i].drawConnection(particles[j], timeRef.current);
                    }
                }
            }

            // Mettre à jour et dessiner les particules
            particles.forEach(particle => {
                particle.update(timeRef.current);
                particle.draw(timeRef.current);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [prefersReducedMotion, isVisible, particleCount, connectionDistance, enableConnections, enableMouseInteraction, enableTrails]);

    if (prefersReducedMotion) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #030712 0%, #0c1e3d 50%, #1e1b4b 100%)',
                zIndex: -1
            }} />
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: 'radial-gradient(ellipse at center, #0a1628 0%, #030712 100%)',
            overflow: 'hidden'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
                aria-hidden="true"
            />
        </div>
    );
};

export default NebulaWaveBackground;