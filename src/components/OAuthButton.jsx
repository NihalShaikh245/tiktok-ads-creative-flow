import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LoginIcon from '@mui/icons-material/Login';
import tiktokAuth from '../services/tiktokAuth';

const OAuthButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    try {
      setLoading(true);
      const authUrl = tiktokAuth.getAuthorizationUrl();
      window.location.href = authUrl;
    } catch (error) {
      setLoading(false);
      onError(error.message);
    }
  };

  return (
    <div className="oauth-button-container">
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
        onClick={handleConnect}
        disabled={loading}
        fullWidth
        sx={{
          backgroundColor: '#000000',
          '&:hover': {
            backgroundColor: '#333333',
          },
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          textTransform: 'none',
          borderRadius: '8px',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Redirecting to TikTok...' : 'Connect TikTok Ads Account'}
      </Button>
      
      <div className="oauth-info">
        <p className="info-text">
          <small>
            You will be redirected to TikTok to authorize this application.
            Required permissions: Basic user info and advertising music access.
          </small>
        </p>
      </div>
    </div>
  );
};

export default OAuthButton;