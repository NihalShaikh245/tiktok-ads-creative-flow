import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const SuccessMessage = ({ adId, campaignName }) => {
  const navigate = useNavigate();

  const handleCreateAnother = () => {
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
      <Alert 
        severity="success" 
        icon={<CheckCircleIcon fontSize="large" />}
        sx={{ 
          mb: 4,
          py: 3,
          borderRadius: 2,
          textAlign: 'left'
        }}
      >
        <AlertTitle>
          <Typography variant="h6" component="div">
            Ad Created Successfully!
          </Typography>
        </AlertTitle>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Campaign:</strong> {campaignName}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Ad ID:</strong> {adId}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your ad has been submitted to TikTok Ads and is being processed.
            You can track its status in your TikTok Ads Manager.
          </Typography>
        </Box>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={handleCreateAnother}
          size="large"
        >
          Create Another Ad
        </Button>
        <Button
          variant="outlined"
          onClick={() => window.open('https://ads.tiktok.com/', '_blank')}
          size="large"
        >
          Go to Ads Manager
        </Button>
      </Box>
    </Box>
  );
};

export default SuccessMessage;