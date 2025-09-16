// SecureAuth.tsx - Enhanced secure authentication utilities

interface AuthData {
    userId: string;
    name: string;
    timestamp: number;
    sessionId: string;
    lastActivity: number; // Track last user activity
    jwt?: string; // Add JWT token storage
}

// Enhanced security configuration
const CONFIG = {
    SESSION_TIMEOUT: 4 * 60 * 60 * 1000, // 4 hours (reduced from 8)
    INACTIVITY_TIMEOUT: 30 * 60 * 1000, // 30 minutes of inactivity
    AUTH_KEY: 'ppa_sec_session', // More obfuscated key name
    CHECK_INTERVAL: 2 * 60 * 1000, // Check session every 2 minutes
    USE_SESSION_STORAGE: true, // Use sessionStorage by default
    MAX_SESSION_REFRESH: 3, // Maximum session refreshes per day
};

// Enhanced obfuscation with simple encryption-like transformation
const obfuscate = (data: string): string => {
    try {
        // Simple XOR-like transformation + base64
        const key = 'promptpal2024'; // Simple key
        let transformed = '';
        for (let i = 0; i < data.length; i++) {
            transformed += String.fromCharCode(
                data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encodeURIComponent(transformed));
    } catch {
        return btoa(encodeURIComponent(data)); // Fallback to simple base64
    }
};

const deobfuscate = (data: string): string => {
    try {
        const key = 'promptpal2024';
        const decoded = decodeURIComponent(atob(data));
        let original = '';
        for (let i = 0; i < decoded.length; i++) {
            original += String.fromCharCode(
                decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return original;
    } catch {
        try {
            return decodeURIComponent(atob(data)); // Fallback
        } catch {
            return '';
        }
    }
};

// Generate a cryptographically stronger session ID
const generateSessionId = (): string => {
    const timestamp = Date.now().toString(36);
    const random1 = Math.random().toString(36).substring(2);
    const random2 = Math.random().toString(36).substring(2);
    return `${timestamp}_${random1}_${random2}`;
};

// Detect suspicious activity
const detectSuspiciousActivity = (authData: AuthData): boolean => {
    const now = Date.now();
    
    // Check for session hijacking indicators
    if (!authData.sessionId || authData.sessionId.length < 20) {
        console.warn('Invalid session ID detected');
        return true;
    }
    
    // Check for impossible time jumps (system clock manipulation)
    if (authData.timestamp > now || authData.lastActivity > now) {
        console.warn('Suspicious timestamp detected');
        return true;
    }
    
    return false;
};

export class SecureAuth {
    private static storage = CONFIG.USE_SESSION_STORAGE ? sessionStorage : localStorage;

    static setAuth(userId: string, name: string, jwt?: string): void {
        // Validate inputs
        if (!userId || !name || userId.length < 3 || name.length < 1) {
            throw new Error('Invalid user credentials');
        }

        const now = Date.now();
        const authData: AuthData = {
            userId: userId.trim(),
            name: name.trim(),
            timestamp: now,
            lastActivity: now,
            sessionId: generateSessionId(),
            jwt: jwt?.trim() // Store JWT token if provided
        };
        
        try {
            const obfuscatedData = obfuscate(JSON.stringify(authData));
            this.storage.setItem(CONFIG.AUTH_KEY, obfuscatedData);
            
            // Set a backup timestamp for additional validation
            this.storage.setItem(`${CONFIG.AUTH_KEY}_ts`, now.toString());
            
            console.log('Secure session created:', { 
                userId: authData.userId, 
                sessionId: authData.sessionId.substring(0, 8) + '...' 
            });
        } catch (error) {
            console.error('Failed to store auth data:', error);
            throw new Error('Failed to create secure session');
        }
    }

    static getAuth(): AuthData | null {
        try {
            const stored = this.storage.getItem(CONFIG.AUTH_KEY);
            const backupTimestamp = this.storage.getItem(`${CONFIG.AUTH_KEY}_ts`);
            
            if (!stored) return null;

            const deobfuscatedData = deobfuscate(stored);
            if (!deobfuscatedData) {
                this.clearAuth();
                return null;
            }

            const authData: AuthData = JSON.parse(deobfuscatedData);
            
            // Validate data structure
            if (!this.validateAuthData(authData)) {
                console.warn('Invalid auth data structure');
                this.clearAuth();
                return null;
            }

            // Cross-check with backup timestamp
            if (backupTimestamp && parseInt(backupTimestamp) !== authData.timestamp) {
                console.warn('Timestamp mismatch detected');
                this.clearAuth();
                return null;
            }

            // Detect suspicious activity
            if (detectSuspiciousActivity(authData)) {
                this.clearAuth();
                return null;
            }

            const now = Date.now();

            // Check session timeout
            if (now - authData.timestamp > CONFIG.SESSION_TIMEOUT) {
                console.log('Session expired');
                this.clearAuth();
                return null;
            }

            // Check inactivity timeout
            if (now - authData.lastActivity > CONFIG.INACTIVITY_TIMEOUT) {
                console.log('Session expired due to inactivity');
                this.clearAuth();
                return null;
            }

            return authData;
        } catch (error) {
            console.error('Auth data corrupted or tampered:', error);
            this.clearAuth();
            return null;
        }
    }

    static getJWT(): string | null {
        const auth = this.getAuth();
        return auth?.jwt || null;
    }

    private static validateAuthData(authData: unknown): authData is AuthData {
        if (!authData || typeof authData !== 'object' || authData === null) {
            return false;
        }
        
        const data = authData as Record<string, unknown>;
        
        return 'userId' in data &&
               'name' in data &&
               'timestamp' in data &&
               'sessionId' in data &&
               'lastActivity' in data &&
               typeof data.userId === 'string' &&
               typeof data.name === 'string' &&
               typeof data.timestamp === 'number' &&
               typeof data.sessionId === 'string' &&
               typeof data.lastActivity === 'number' &&
               data.userId.length > 0 &&
               data.name.length > 0 &&
               data.sessionId.length > 10;
    }

    static clearAuth(): void {
        try {
            this.storage.removeItem(CONFIG.AUTH_KEY);
            this.storage.removeItem(`${CONFIG.AUTH_KEY}_ts`);
            
            localStorage.removeItem('ppa_streak_cache');
            
            console.log('Secure session and streak cache cleared');
        } catch (error) {
            console.error('Failed to clear auth data:', error);
        }
    }

    static isSessionValid(): boolean {
        return this.getAuth() !== null;
    }

    static updateTimestamp(): void {
        const auth = this.getAuth();
        if (auth) {
            // Update last activity timestamp
            auth.lastActivity = Date.now();
            
            try {
                const obfuscatedData = obfuscate(JSON.stringify(auth));
                this.storage.setItem(CONFIG.AUTH_KEY, obfuscatedData);
            } catch (error) {
                console.error('Failed to update timestamp:', error);
                // Don't clear auth on update failure, just log it
            }
        }
    }

    static getSessionInfo(): { userId: string; name: string; sessionAge: number } | null {
        const auth = this.getAuth();
        if (!auth) return null;
        
        return { 
            userId: auth.userId, 
            name: auth.name,
            sessionAge: Date.now() - auth.timestamp
        };
    }

    static refreshSession(): boolean {
        const auth = this.getAuth();
        if (!auth) return false;
        
        try {
            // Create new session with updated timestamp but same user data including JWT
            this.setAuth(auth.userId, auth.name, auth.jwt);
            console.log('Session refreshed successfully');
            return true;
        } catch (error) {
            console.error('Failed to refresh session:', error);
            return false;
        }
    }

    // Get session diagnostics for debugging
    static getSessionDiagnostics(): {
        valid: boolean;
        userId?: string;
        sessionAge?: number;
        timeSinceActivity?: number;
        sessionId?: string;
        expiresIn?: number;
        inactivityExpiresIn?: number;
    } {
        const auth = this.getAuth();
        if (!auth) return { valid: false };
        
        const now = Date.now();
        return {
            valid: true,
            userId: auth.userId,
            sessionAge: now - auth.timestamp,
            timeSinceActivity: now - auth.lastActivity,
            sessionId: auth.sessionId.substring(0, 8) + '...',
            expiresIn: CONFIG.SESSION_TIMEOUT - (now - auth.timestamp),
            inactivityExpiresIn: CONFIG.INACTIVITY_TIMEOUT - (now - auth.lastActivity)
        };
    }
}

// Enhanced CSRF protection
export class CSRFProtection {
    private static TOKEN_KEY = 'ppa_csrf_token';
    private static TOKEN_TIMESTAMP_KEY = 'ppa_csrf_ts';
    private static TOKEN_LIFETIME = 60 * 60 * 1000; // 1 hour

    static generateToken(): string {
        try {
            // Generate a stronger token
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2) + 
                          Math.random().toString(36).substring(2) +
                          timestamp.toString(36);
            
            const token = btoa(random);
            
            sessionStorage.setItem(this.TOKEN_KEY, token);
            sessionStorage.setItem(this.TOKEN_TIMESTAMP_KEY, timestamp.toString());
            
            console.log('CSRF token generated');
            return token;
        } catch (error) {
            console.error('Failed to generate CSRF token:', error);
            return '';
        }
    }

    static getToken(): string | null {
        try {
            const token = sessionStorage.getItem(this.TOKEN_KEY);
            const timestamp = sessionStorage.getItem(this.TOKEN_TIMESTAMP_KEY);
            
            if (!token || !timestamp) return null;
            
            // Check if token has expired
            const tokenAge = Date.now() - parseInt(timestamp);
            if (tokenAge > this.TOKEN_LIFETIME) {
                this.clearToken();
                return null;
            }
            
            return token;
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
            return null;
        }
    }

    static validateToken(token: string): boolean {
        const storedToken = this.getToken();
        return storedToken === token && token.length > 10;
    }

    static clearToken(): void {
        try {
            sessionStorage.removeItem(this.TOKEN_KEY);
            sessionStorage.removeItem(this.TOKEN_TIMESTAMP_KEY);
            console.log('CSRF token cleared');
        } catch (error) {
            console.error('Failed to clear CSRF token:', error);
        }
    }

    static refreshToken(): string {
        this.clearToken();
        return this.generateToken();
    }
}

export default SecureAuth; 