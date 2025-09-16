import { useState, useEffect, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BaseLayout from './BaseLayout';
import { SecureAuth, CSRFProtection } from './SecureAuth';
import { API_BASE } from '../config';

interface AuthenticatedLayoutProps {
    userId: string;
    name: string;
    onLogout: () => void;
}

interface UnauthenticatedLayoutProps {
    userId: string;
    name: string;
    onLogout: () => void;
    onUserLogin: (userId: string, name: string, jwt?: string) => void;
}

interface LayoutProps {
    children: (props: AuthenticatedLayoutProps | UnauthenticatedLayoutProps) => ReactNode;
}

// Add CSRF token to all axios requests
axios.interceptors.request.use((config) => {
    const token = CSRFProtection.getToken();
    if (token) {
        config.headers['X-CSRF-Token'] = token;
    }
    return config;
});

// Handle 401 responses by clearing auth
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            SecureAuth.clearAuth();
            CSRFProtection.clearToken();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default function Layout({ children }: LayoutProps) {
    const [userId, setUserId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);
    const location = useLocation();

    // Initialize auth state on mount
    useEffect(() => {
        const authData = SecureAuth.getAuth();
        if (authData) {
            setUserId(authData.userId);
            setName(authData.name);
            // Generate CSRF token for authenticated users
            CSRFProtection.generateToken();
        } else {
            // Clear any stale CSRF tokens
            CSRFProtection.clearToken();
        }
        setIsInitialized(true);
    }, []);

    // Verify user exists in backend and update activity timestamp
    useEffect(() => {
        if (userId && !name) {
            axios.get(`${API_BASE}/users/${userId}`)
                .then(res => {
                    const userName = res.data.name;
                    setName(userName);
                    SecureAuth.setAuth(userId, userName);
                })
                .catch(() => {
                    // If user doesn't exist, clear the stored auth
                    handleLogout();
                });
        } else if (userId && name) {
            // Update timestamp for active sessions
            SecureAuth.updateTimestamp();
        }
    }, [userId, name]);

    // Auto-logout on session timeout - check more frequently
    useEffect(() => {
        if (!userId) return;

        const checkSession = () => {
            if (!SecureAuth.isSessionValid()) {
                console.log('Session expired, logging out');
                handleLogout();
            }
        };

        // Check session every 2 minutes (more frequent than before)
        const interval = setInterval(checkSession, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [userId]);

    // Enhanced security: Clear auth on tab close/refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            // Update timestamp on page unload to track activity
            if (userId) {
                SecureAuth.updateTimestamp();
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) return;
            
            // When user returns to tab, verify session is still valid
            if (userId && !SecureAuth.isSessionValid()) {
                handleLogout();
            } else if (userId) {
                // Update activity timestamp
                SecureAuth.updateTimestamp();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userId]);

    // Security: Lock session after prolonged inactivity
    useEffect(() => {
        if (!userId) return;

        let inactivityTimer: NodeJS.Timeout;

        const resetInactivityTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                console.log('Session locked due to inactivity');
                handleLogout();
            }, 30 * 60 * 1000); // 30 minutes of inactivity
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });

        resetInactivityTimer(); // Start the timer

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetInactivityTimer, true);
            });
        };
    }, [userId]);

    const handleUserLogin = (newUserId: string, newName: string, jwt?: string) => {
        setUserId(newUserId);
        setName(newName);
        SecureAuth.setAuth(newUserId, newName, jwt);
        // Generate CSRF token for new session
        CSRFProtection.generateToken();
        
        console.log('User logged in securely:', { userId: newUserId, name: newName });
    };

    const handleLogout = () => {
        console.log('Logging out user');
        setUserId(null);
        setName('');
        SecureAuth.clearAuth();
        CSRFProtection.clearToken();
        
        // Optional: Call logout endpoint to invalidate server session
        // axios.post(`${API_BASE}/auth/logout`).catch(() => {});
    };

    // Don't render anything until initialization is complete
    if (!isInitialized) {
        return null;
    }

    // Security check: Ensure HTTPS in production
    if (typeof window !== 'undefined' && 
        import.meta.env.PROD && 
        window.location.protocol !== 'https:') {
        window.location.href = window.location.href.replace('http:', 'https:');
        return null;
    }

    // If not authenticated and trying to access protected routes
    const publicRoutes = ['/', '/login', '/forgot-password', '/reset-password'];
    if (!userId && !publicRoutes.includes(location.pathname)) {
        return <Navigate to="/" replace />;
    }

    // If authenticated and on login page, redirect to dashboard
    if (userId && ['/', '/login'].includes(location.pathname)) {
        return <Navigate to="/dashboard" replace />;
    }

    // For login page
    if (!userId) {
        return (
            <>
                {children({ 
                    userId: '', 
                    name: '', 
                    onLogout: handleLogout,
                    onUserLogin: handleUserLogin 
                } as UnauthenticatedLayoutProps)}
            </>
        );
    }

    // For protected routes
    return (
        <BaseLayout name={name} onLogout={handleLogout}>
            {children({ 
                userId, 
                name, 
                onLogout: handleLogout 
            } as AuthenticatedLayoutProps)}
        </BaseLayout>
    );
} 