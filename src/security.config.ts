// Security configuration for production and development environments

export const SECURITY_CONFIG = {
    // Session management
    SESSION: {
        TIMEOUT: 4 * 60 * 60 * 1000, // 4 hours
        INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes
        CHECK_INTERVAL: 2 * 60 * 1000, // Check every 2 minutes
        USE_SESSION_STORAGE: true, // More secure than localStorage
        MAX_REFRESH_ATTEMPTS: 3,
    },
    
    // CSRF protection
    CSRF: {
        TOKEN_LIFETIME: 60 * 60 * 1000, // 1 hour
        ENABLED: true,
        HEADER_NAME: 'X-CSRF-Token',
    },
    
    // HTTPS enforcement
    HTTPS: {
        ENFORCE_IN_PRODUCTION: true,
        HSTS_MAX_AGE: 31536000, // 1 year
        INCLUDE_SUBDOMAINS: true,
    },
    
    // Content Security Policy
    CSP: {
        ENABLED: true,
        DIRECTIVES: {
            'default-src': ["'self'"],
            'script-src': [
                "'self'", 
                "'unsafe-inline'", 
                'https://apis.google.com',
                'https://accounts.google.com',
                'https://www.google.com'
            ],
            'style-src': [
                "'self'", 
                "'unsafe-inline'", 
                'https://fonts.googleapis.com',
                'https://accounts.google.com'
            ],
            'font-src': ["'self'", 'https://fonts.gstatic.com'],
            'img-src': ["'self'", 'data:', 'https:', 'blob:'],
            'frame-src': [
                "'self'",
                'https://accounts.google.com',
                'https://www.google.com'
            ],
            'connect-src': [
                "'self'", 
                'https://prompt-pal-api.onrender.com',
                'http://localhost:1337', // For development
                'https://accounts.google.com',
                'https://www.googleapis.com'
            ],
            'base-uri': ["'self'"],
            'form-action': ["'self'"],
        }
    },
    
    // Security headers
    HEADERS: {
        X_FRAME_OPTIONS: 'DENY',
        X_CONTENT_TYPE_OPTIONS: 'nosniff',
        X_XSS_PROTECTION: '1; mode=block',
        REFERRER_POLICY: 'strict-origin-when-cross-origin',
        PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=()',
    },
    
    // Rate limiting (client-side tracking)
    RATE_LIMITING: {
        LOGIN_ATTEMPTS: {
            MAX_ATTEMPTS: 5,
            WINDOW_MS: 15 * 60 * 1000, // 15 minutes
            LOCKOUT_MS: 30 * 60 * 1000, // 30 minutes lockout
        },
        API_REQUESTS: {
            MAX_REQUESTS: 100,
            WINDOW_MS: 60 * 1000, // 1 minute
        }
    },
    
    // Input validation
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 8,
        PASSWORD_REQUIRE_SPECIAL: true,
        PASSWORD_REQUIRE_NUMBERS: true,
        USERNAME_MIN_LENGTH: 3,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    
    // Logging and monitoring
    SECURITY_LOGGING: {
        ENABLED: true,
        LOG_FAILED_LOGINS: true,
        LOG_SESSION_EVENTS: true,
        LOG_CSRF_VIOLATIONS: true,
    }
};

// Environment-specific overrides
export const getSecurityConfig = () => {
    const isDevelopment = import.meta.env.MODE === 'development';
    
    if (isDevelopment) {
        return {
            ...SECURITY_CONFIG,
            HTTPS: {
                ...SECURITY_CONFIG.HTTPS,
                ENFORCE_IN_PRODUCTION: false, // Don't enforce HTTPS in dev
            },
            SESSION: {
                ...SECURITY_CONFIG.SESSION,
                TIMEOUT: 8 * 60 * 60 * 1000, // Longer sessions in dev
            },
            RATE_LIMITING: {
                ...SECURITY_CONFIG.RATE_LIMITING,
                LOGIN_ATTEMPTS: {
                    ...SECURITY_CONFIG.RATE_LIMITING.LOGIN_ATTEMPTS,
                    MAX_ATTEMPTS: 10, // More lenient in dev
                }
            }
        };
    }
    
    return SECURITY_CONFIG;
};

export default getSecurityConfig(); 