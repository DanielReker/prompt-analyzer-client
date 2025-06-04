import React, { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';

interface GoogleSignInProps {
  onSuccess: (userData: {
    email: string;
    name: string;
    googleId: string;
  }) => void;
  onError: (error: string) => void;
}

interface GoogleUser {
  email: string;
  name: string;
  sub: string; // Google ID
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccounts {
  id: {
    initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
    renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
  };
}

declare global {
  interface Window {
    google: {
      accounts: GoogleAccounts;
    };
  }
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({ 
  onSuccess, 
  onError
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: "outline",
              size: "large",
              text: "signin_with",
              shape: "rectangular",
              width: "300",
            }
          );
        }
      }
    };

    const handleCredentialResponse = (response: GoogleCredentialResponse) => {
      try {
        const decoded: GoogleUser = jwtDecode(response.credential);
        
        onSuccess({
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
        });
      } catch (error) {
        console.error('Failed to decode Google credential:', error);
        onError('Failed to process Google sign-in');
      }
    };

    // Wait for Google script to load
    const checkGoogleLoaded = () => {
      if (window.google) {
        initializeGoogleSignIn();
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };

    checkGoogleLoaded();
  }, [onSuccess, onError]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
      <div ref={googleButtonRef}></div>
    </div>
  );
};

export default GoogleSignIn; 