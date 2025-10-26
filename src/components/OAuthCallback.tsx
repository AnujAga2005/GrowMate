import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function OAuthCallback() {
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL params
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');

      console.log('🔍 OAuth Callback - Token:', token ? 'Present' : 'Missing', 'Error:', error);

      if (error) {
        // Redirect to login with error message
        console.error('OAuth error:', error);
        window.location.href = '/login?error=' + error;
        return;
      }

      if (token) {
        try {
          // Save token and fetch user data
          await loginWithToken(token);
          console.log('✅ Token saved, redirecting to dashboard');
          
          // Use history API to navigate without full reload
          window.history.pushState({}, '', '/dashboard');
          
          // Trigger a popstate event to force React to re-render
          window.dispatchEvent(new PopStateEvent('popstate'));
          
          // Fallback: Force reload to dashboard if state navigation doesn't work
          setTimeout(() => {
            if (window.location.pathname !== '/dashboard') {
              window.location.href = '/dashboard';
            }
          }, 100);
        } catch (error) {
          console.error('Failed to login with token:', error);
          window.location.href = '/login?error=auth_failed';
        }
      } else {
        // No token, redirect to login
        console.error('No token found in callback');
        window.location.href = '/login';
      }
    };

    handleCallback();
  }, [loginWithToken]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}