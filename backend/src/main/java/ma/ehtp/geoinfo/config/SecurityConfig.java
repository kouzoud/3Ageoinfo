package ma.ehtp.geoinfo.config;

import lombok.RequiredArgsConstructor;
import ma.ehtp.geoinfo.security.JwtAuthenticationFilter;
import ma.ehtp.geoinfo.security.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuration de la sécurité Spring Security avec JWT
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Encodeur de mots de passe BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Provider d'authentification
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Manager d'authentification
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Configuration CORS globale
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                // HTTP - Développement PC
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                // HTTP - Network IPs for mobile access
                "http://192.168.11.113:5173",
                "http://10.5.0.2:5173",
                // HTTPS - Development with SSL certificates (PWA)
                "https://localhost:5173",
                "https://localhost:5174",
                "https://127.0.0.1:5173",
                "https://192.168.11.113:5173",
                "https://10.5.0.2:5173",
                // ngrok HTTPS tunnel
                "https://scenic-freddy.ngrok-free.dev"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Configuration de la chaîne de filtres de sécurité
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Activer CORS avec la configuration définie
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Désactiver CSRF (API stateless avec JWT)
                .csrf(AbstractHttpConfigurer::disable)

                // Politique de session stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configuration des autorisations
                .authorizeHttpRequests(auth -> auth
                        // Endpoints publics
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/debug/**").permitAll() // Debug endpoints
                        .requestMatchers("/api/incidents").permitAll()
                        .requestMatchers("/api/incidents/by-email/**").permitAll() // Email recovery
                        .requestMatchers("/api/incidents/carte").permitAll()
                        .requestMatchers("/api/incidents/stats").permitAll()
                        .requestMatchers("/api/statistiques").permitAll() // Homepage stats
                        .requestMatchers("/api/secteurs/**").permitAll()
                        .requestMatchers("/api/provinces/**").permitAll()

                        // 📷 Fichiers statiques (photos d'incidents)
                        .requestMatchers("/uploads/**").permitAll()

                        // 📱 Endpoints publics PWA pour citoyens anonymes
                        .requestMatchers("/api/public/incidents/**").permitAll()

                        // Swagger/OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // Endpoints citoyens (déclaration)
                        .requestMatchers(HttpMethod.POST, "/api/citoyens/incidents").permitAll()
                        .requestMatchers("/api/citoyens/**").permitAll()

                        // Endpoints admin
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Endpoints professionnels
                        .requestMatchers("/api/professionnel/**").hasRole("PROFESSIONNEL")

                        // Toutes les autres requêtes nécessitent une authentification
                        .anyRequest().authenticated())

                // Ajouter le filtre JWT
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
