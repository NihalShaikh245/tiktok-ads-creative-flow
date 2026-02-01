import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import tiktokAuth from '../services/tiktokAuth';

const AuthCallback = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Check for OAuth errors
        if (error) {
          throw new Error(errorDescription || `OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('Authorization code not found in callback URL');
        }

        // Exchange code for token
        const tokenData = await tiktokAuth.handleCallback(code, state);
        
        setStatus('success');
        
        // Notify parent component
        if (onSuccess) {
          onSuccess(tokenData.access_token);
        }

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error.message);
        
        if (onError) {
          onError(error.message);
        }
      }
    };

    handleCallback();
  }, [location, navigate, onSuccess, onError]);

  if (status === 'processing') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '300px',
        padding: '40px'
      }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <h3>Connecting to TikTok...</h3>
        <p>Please wait while we complete the authentication process.</p>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box sx={{ 
        maxWidth: '600px', 
        margin: '40px auto', 
        padding: '20px' 
      }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Authentication Failed</AlertTitle>
          {errorMessage}
        </Alert>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Return to Home
          </button>
        </Box>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box sx={{ 
        maxWidth: '600px', 
        margin: '40px auto', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Successfully Connected!</AlertTitle>
          Your TikTok Ads account has been successfully connected.
        </Alert>
        
        <p>Redirecting you to the ad creation page...</p>
        <CircularProgress size={30} sx={{ mt: 2 }} />
      </Box>
    );
  }

  return null;
};

export default AuthCallback;