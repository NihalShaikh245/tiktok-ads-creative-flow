import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OAuthButton from './components/OAuthButton';
import AdCreationForm from './components/AdCreationForm';
import ErrorDisplay from './components/ErrorDisplay';
import './App.css';

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);

  const handleOAuthSuccess = (token) => {
    setAccessToken(token);
    setError(null);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>TikTok Ads Creative Flow</h1>
        </header>
        
        <main className="App-main">
          {error && (
            <ErrorDisplay 
              message={error} 
              onClose={clearError}
            />
          )}
          
          <Routes>
            <Route path="/" element={
              <div className="container">
                {!accessToken ? (
                  <div className="auth-section">
                    <h2>Connect Your TikTok Ads Account</h2>
                    <OAuthButton 
                      onSuccess={handleOAuthSuccess}
                      onError={handleError}
                    />
                  </div>
                ) : (
                  <div className="ad-creation-section">
                    <h2>Create New Ad Creative</h2>
                    <AdCreationForm 
                      accessToken={accessToken}
                      onError={handleError}
                    />
                  </div>
                )}
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;