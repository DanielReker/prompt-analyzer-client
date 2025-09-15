import { useEffect } from 'react';
import { getSecurityConfig } from '../security.config';

const SecurityHeaders: React.FC = () => {
    useEffect(() => {
        const config = getSecurityConfig();
        
        // Set CSP meta tag if enabled, but exclude directives that don't work in meta tags
        if (config.CSP.ENABLED) {
            const allowedDirectives = Object.entries(config.CSP.DIRECTIVES)
                .filter(([directive]) => {
                    // These directives are ignored when set via meta tags
                    const ignoredDirectives = [
                        'frame-ancestors',
                        'report-uri',
                        'report-to',
                        'sandbox'
                    ];
                    return !ignoredDirectives.includes(directive);
                })
                .map(([directive, sources]) => {
                    const sourceArray = Array.isArray(sources) ? sources : [String(sources)];
                    return `${directive} ${sourceArray.join(' ')}`;
                });

            if (allowedDirectives.length > 0) {
                const cspContent = allowedDirectives.join('; ');
                
                let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]') as HTMLMetaElement;
                if (!cspMeta) {
                    cspMeta = document.createElement('meta');
                    cspMeta.httpEquiv = 'Content-Security-Policy';
                    document.head.appendChild(cspMeta);
                }
                cspMeta.content = cspContent;
            }
        }
        
        // Only set security meta tags that are effective when set via meta tags
        const effectiveMetaTags = [
            { httpEquiv: 'X-Content-Type-Options', content: config.HEADERS.X_CONTENT_TYPE_OPTIONS },
            { name: 'referrer', content: config.HEADERS.REFERRER_POLICY },
        ];
        
        effectiveMetaTags.forEach(({ httpEquiv, name, content }) => {
            const selector = httpEquiv ? `meta[http-equiv="${httpEquiv}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;
            
            if (!meta) {
                meta = document.createElement('meta');
                if (httpEquiv) meta.httpEquiv = httpEquiv;
                if (name) meta.name = name;
                document.head.appendChild(meta);
            }
            meta.content = content;
        });
        
        // Log a note about headers that should be set by the server
        if (import.meta.env.DEV) {
            console.info('🔒 Security Note: The following headers should be set by your server/proxy:');
            console.info('   - X-Frame-Options:', config.HEADERS.X_FRAME_OPTIONS);
            console.info('   - X-XSS-Protection:', config.HEADERS.X_XSS_PROTECTION);
            console.info('   - Permissions-Policy:', config.HEADERS.PERMISSIONS_POLICY);
            console.info('   - CSP frame-ancestors directive');
            console.info('   For production deployment, configure these in your web server/reverse proxy.');
        }
        
        // Enforce HTTPS in production
        if (config.HTTPS.ENFORCE_IN_PRODUCTION && 
            import.meta.env.PROD && 
            window.location.protocol !== 'https:') {
            console.warn('Redirecting to HTTPS for security');
            window.location.href = window.location.href.replace('http:', 'https:');
        }
        
        // Remove X-Powered-By if present (server should handle this, but just in case)
        const poweredBy = document.querySelector('meta[name="generator"]');
        if (poweredBy) {
            poweredBy.remove();
        }
        
    }, []);
    
    return null; // This component doesn't render anything visible
};

export default SecurityHeaders; 