package ma.ehtp.geoinfo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration CORS pour permettre les requêtes depuis le frontend
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173", // Vite dev server
                        "http://localhost:5174", // Vite dev server alternatif
                        "http://localhost:3000", // React dev server
                        "https://*.netlify.app", // Netlify deployments
                        "https://*.ngrok-free.app", // Ngrok tunnel
                        "https://*.ngrok.app", // Ngrok tunnel (nouveau format)
                        "https://*.ngrok.io" // Ngrok tunnel (ancien format)
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
