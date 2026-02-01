import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from 'react-router-dom';
import { AD_OBJECTIVES } from '../utils/constants';

const SubmissionSuccess = ({ submissionData, onCreateAnother }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  const {
    adId,
    campaignName,
    objective,
    submittedAt,
    estimatedReviewTime = '1-24 hours'
  } = submissionData;

  // Format date
  const formattedDate = new Date(submittedAt).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Copy ad ID to clipboard
  const copyAdId = () => {
    navigator.clipboard.writeText(adId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Open TikTok Ads Manager
  const openAdsManager = () => {
    window.open('https://ads.tiktok.com/', '_blank');
  };

  // View ad details (simulated)
  const viewAdDetails = () => {
    // In production, this would navigate to ad details page
    alert(`Ad details for ${adId} would be shown here.`);
  };

  // Check ad status (simulated)
  const checkAdStatus = () => {
    setStatusCheckCount(prev => prev + 1);
    // In production, this would call API to check status
    alert(`Status check requested for ad ${adId}. Check count: ${statusCheckCount + 1}`);
  };

  // Get objective display name
  const getObjectiveDisplayName = (obj) => {
    return obj === AD_OBJECTIVES.TRAFFIC ? 'Traffic' : 'Conversions';
  };

  // Get next steps based on objective
  const getNextSteps = () => {
    const steps = [
      'Your ad is being reviewed by TikTok',
      `Estimated review time: ${estimatedReviewTime}`,
      'You will be notified when the review is complete'
    ];

    if (objective === AD_OBJECTIVES.TRAFFIC) {
      steps.push('Monitor traffic performance in Ads Manager');
    } else if (objective === AD_OBJECTIVES.CONVERSIONS) {
      steps.push('Set up conversion tracking if not already done');
      steps.push('Monitor conversion rates and costs');
    }

    return steps;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      {/* Success Alert */}
      <Alert 
        severity="success" 
        icon={<CheckCircleIcon fontSize="large" />}
        sx={{ 
          mb: 4,
          py: 2,
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        <AlertTitle sx={{ fontSize: '1.25rem', mb: 1 }}>
          Ad Created Successfully!
        </AlertTitle>
        <Typography variant="body1">
          Your ad has been submitted to TikTok and is now being reviewed.
        </Typography>
      </Alert>

      {/* Submission Details Card */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="success" />
            Submission Details
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Left Column */}
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Campaign Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {campaignName}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Ad ID
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontFamily="monospace" 
                    sx={{ 
                      bgcolor: 'grey.100', 
                      p: 1, 
                      borderRadius: 1,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {adId}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={copyAdId}
                    variant="outlined"
                    sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Submitted On
                </Typography>
                <Typography variant="body1">
                  {formattedDate}
                </Typography>
              </Box>
            </Box>

            {/* Right Column */}
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Objective
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {getObjectiveDisplayName(objective)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: 'warning.main',
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="body1" fontWeight="medium">
                    Pending Review
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    onClick={openAdsManager}
                    sx={{ textTransform: 'none' }}
                  >
                    Ads Manager
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<HistoryIcon />}
                    onClick={checkAdStatus}
                    sx={{ textTransform: 'none' }}
                  >
                    Check Status
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Next Steps
          </Typography>
          
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {getNextSteps().map((step, index) => (
              <Box component="li" key={index} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {step}
                </Typography>
              </Box>
            ))}
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Ad review times may vary based on content and current volume.
              You'll receive a notification once your ad is approved or if changes are needed.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 2,
        justifyContent: 'center',
        pt: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onCreateAnother}
          sx={{ minWidth: 200 }}
        >
          Create Another Ad
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          startIcon={<OpenInNewIcon />}
          onClick={() => navigate('/')}
          sx={{ minWidth: 200 }}
        >
          Return to Dashboard
        </Button>
      </Box>

      {/* Status Check Counter */}
      {statusCheckCount > 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            You've checked the status {statusCheckCount} time{statusCheckCount > 1 ? 's' : ''}.
            Status updates are typically available within {estimatedReviewTime}.
          </Typography>
        </Alert>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </Box>
  );
};

export default SubmissionSuccess;