import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import OAuthButton from './components/OAuthButton';
import AuthCallback from './components/AuthCallback';
import AdCreationForm from './components/AdCreationForm';
import ErrorDisplay from './components/ErrorDisplay';
import SubmissionSuccess from './components/SubmissionSuccess';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import tiktokAuth from './services/tiktokAuth';
import { errorHandler } from './utils/errorHandlers';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adCreationSuccess, setAdCreationSuccess] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  const location = useLocation();

  // ----- Global Error Handler -----
  useEffect(() => {
    errorHandler.onError((error, context) => {
      console.log('Global error handler triggered:', error, context);
      setGlobalError(error);
    });

    errorHandler.clearOldErrorLogs(7);

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      errorHandler.handleError(event.reason, { source: 'unhandled_promise' });
    });

    window.addEventListener('error', (event) => {
      console.error('Window error:', event.error);
      errorHandler.handleError(event.error, { source: 'window_error' });
    });

    return () => {
      window.removeEventListener('unhandledrejection', () => {});
      window.removeEventListener('error', () => {});
    };
  }, []);

  // ----- Check Existing Token -----
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        if (tiktokAuth.isTokenValid()) {
          const token = tiktokAuth.getAccessToken();
          setAccessToken(token);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        errorHandler.handleError(error, { operation: 'auth_check' });
        tiktokAuth.clearTokens();
      } finally {
        setLoading(false);
      }
    };
    checkExistingAuth();
  }, []);

  // ----- Check for last submission via URL query -----
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      const lastSubmission = localStorage.getItem('last_ad_submission');
      if (lastSubmission) {
        try {
          setAdCreationSuccess(JSON.parse(lastSubmission));
        } catch (error) {
          console.error('Failed to parse last submission:', error);
        }
      }
    }
  }, [location]);

  // ----- Handlers -----
  const handleOAuthSuccess = useCallback((token) => {
    setAccessToken(token);
    setError(null);
    setGlobalError(null);
  }, []);

  const handleError = useCallback((errorMessage) => {
    const errorObj = typeof errorMessage === 'string' 
      ? new Error(errorMessage) 
      : errorMessage;
    setError(errorObj);
    errorHandler.handleError(errorObj, { source: 'ui_error' });
  }, []);

  const handleAdCreationSuccess = useCallback((campaignName, adId) => {
    const submissionData = {
      adId,
      campaignName,
      submittedAt: new Date().toISOString(),
      estimatedReviewTime: '1-24 hours'
    };
    localStorage.setItem('last_ad_submission', JSON.stringify(submissionData));
    setAdCreationSuccess(submissionData);
    setError(null);
    setGlobalError(null);
  }, []);

  const handleLogout = () => {
    tiktokAuth.clearTokens();
    setAccessToken(null);
    setUserInfo(null);
    setError(null);
    setGlobalError(null);
    setAdCreationSuccess(null);
  };

  const clearError = () => {
    setError(null);
    setGlobalError(null);
  };

  const clearSuccess = () => {
    setAdCreationSuccess(null);
    localStorage.removeItem('last_ad_submission');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>TikTok Ads Creative Flow</h1>
          {accessToken && !adCreationSuccess && (
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              Disconnect Account
            </button>
          )}
        </div>
      </header>

      <main className="App-main">
        {/* Global Error Display */}
        {globalError && (
          <ErrorDisplay 
            message={globalError.userMessage || globalError.message}
            onClose={clearError}
            severity="error"
            details={globalError.suggestions?.join(' • ')}
          />
        )}

        {/* Local Error Display */}
        {error && !globalError && (
          <ErrorDisplay 
            message={error.message}
            onClose={clearError}
          />
        )}

        <Routes>
          {/* Home Route */}
          <Route path="/" element={
            <div className="container">
              {!accessToken ? (
                <div className="auth-section">
                  <h2>Connect Your TikTok Ads Account</h2>
                  <p className="section-description">
                    Connect your TikTok account to create ads. This requires OAuth authorization.
                  </p>
                  <OAuthButton 
                    onSuccess={handleOAuthSuccess}
                    onError={handleError}
                  />
                  <div className="oauth-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      <li>A TikTok account with Ads access</li>
                      <li>TikTok Developer App with OAuth configured</li>
                      <li>Required scopes: user.info.basic, advertising.music</li>
                    </ul>
                  </div>
                </div>
              ) : adCreationSuccess ? (
                <SubmissionSuccess
                  submissionData={adCreationSuccess}
                  onCreateAnother={clearSuccess}
                />
              ) : (
                <div className="ad-creation-section">
                  <div className="connection-status">
                    <div className="status-indicator connected"></div>
                    <span>TikTok Account Connected</span>
                  </div>
                  <h2>Create New Ad Creative</h2>
                  <AdCreationForm 
                    accessToken={accessToken}
                    onError={handleError}
                    onSuccess={handleAdCreationSuccess}
                  />
                </div>
              )}
            </div>
          } />

          {/* OAuth Callback */}
          <Route path="/auth/callback" element={
            <AuthCallback 
              onSuccess={handleOAuthSuccess}
              onError={handleError}
            />
          } />

          {/* Terms & Privacy */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>

      <footer className="App-footer">
        <p>TikTok Ads Creative Flow - Frontend Assignment</p>
        <p className="footer-note">
          Note: This application uses real TikTok OAuth and requires a configured TikTok Developer App.
        </p>
        <div className="footer-links">
          <a href="/terms" className="footer-link">Terms of Service</a>
          <span className="footer-separator">•</span>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}

// Wrap App with Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
