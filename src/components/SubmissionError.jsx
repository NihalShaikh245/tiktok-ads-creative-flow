import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { AD_OBJECTIVES } from '../utils/constants';

const SubmissionError = ({ error, onRetry, onClose, formData }) => {
  const [expanded, setExpanded] = useState(false);
  const [showingDetails, setShowingDetails] = useState(false);

  // Categorize error type
  const getErrorType = () => {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
      return 'network';
    }
    if (errorMsg.includes('token') || errorMsg.includes('auth') || errorMsg.includes('401') || errorMsg.includes('403')) {
      return 'authentication';
    }
    if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
      return 'validation';
    }
    if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
      return 'rate_limit';
    }
    if (errorMsg.includes('music') || errorMsg.includes('audio')) {
      return 'music';
    }
    if (errorMsg.includes('server') || errorMsg.includes('500')) {
      return 'server';
    }
    return 'general';
  };

  const errorType = getErrorType();

  // Get error severity
  const getSeverity = () => {
    switch (errorType) {
      case 'authentication':
      case 'server':
        return 'error';
      case 'validation':
      case 'music':
        return 'warning';
      case 'network':
      case 'rate_limit':
        return 'info';
      default:
        return 'error';
    }
  };

  // Get error icon
  const getErrorIcon = () => {
    switch (errorType) {
      case 'authentication':
        return <ErrorOutlineIcon />;
      case 'server':
        return <ReportProblemIcon />;
      default:
        return null;
    }
  };

  // Get user-friendly error title
  const getErrorTitle = () => {
    switch (errorType) {
      case 'network':
        return 'Network Connection Issue';
      case 'authentication':
        return 'Authentication Problem';
      case 'validation':
        return 'Validation Failed';
      case 'rate_limit':
        return 'Too Many Requests';
      case 'music':
        return 'Music Configuration Error';
      case 'server':
        return 'Server Error';
      default:
        return 'Submission Failed';
    }
  };

  // Get suggested actions
  const getSuggestedActions = () => {
    const actions = [];

    switch (errorType) {
      case 'network':
        actions.push('Check your internet connection');
        actions.push('Try again in a moment');
        break;
      case 'authentication':
        actions.push('Reconnect your TikTok account');
        actions.push('Check account permissions');
        break;
      case 'validation':
        actions.push('Review all form fields');
        actions.push('Check music selection rules');
        if (formData?.objective === AD_OBJECTIVES.CONVERSIONS) {
          actions.push('Ensure music is selected for Conversions objective');
        }
        break;
      case 'rate_limit':
        actions.push('Wait 1-2 minutes before retrying');
        actions.push('Reduce submission frequency');
        break;
      case 'music':
        actions.push('Verify music ID is correct');
        actions.push('Check if music is available for advertising');
        actions.push('Try a different music selection');
        break;
      case 'server':
        actions.push('Try again in a few minutes');
        actions.push('Contact support if problem persists');
        break;
      default:
        actions.push('Check all inputs');
        actions.push('Try again');
        actions.push('Contact support if issue continues');
    }

    return actions;
  };

  // Get detailed error information
  const getErrorDetails = () => {
    const details = [];
    
    if (error.response?.data?.error) {
      const apiError = error.response.data.error;
      details.push(`API Error Code: ${apiError.code}`);
      details.push(`API Message: ${apiError.message}`);
      if (apiError.details) {
        details.push(`Details: ${JSON.stringify(apiError.details)}`);
      }
    }
    
    if (error.status) {
      details.push(`HTTP Status: ${error.status}`);
    }
    
    if (error.config?.url) {
      details.push(`Endpoint: ${error.config.url}`);
    }
    
    if (error.timestamp) {
      details.push(`Time: ${new Date(error.timestamp).toLocaleString()}`);
    }

    return details;
  };

  const severity = getSeverity();
  const errorTitle = getErrorTitle();
  const suggestedActions = getSuggestedActions();
  const errorDetails = getErrorDetails();
  const hasDetails = errorDetails.length > 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity={severity}
        icon={getErrorIcon()}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onRetry && (
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                color="inherit"
                sx={{ textTransform: 'none' }}
              >
                Retry
              </Button>
            )}
            {hasDetails && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                color="inherit"
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            {onClose && (
              <IconButton
                size="small"
                onClick={onClose}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          borderRadius: 2,
          boxShadow: 1,
          alignItems: 'flex-start',
          '& .MuiAlert-icon': {
            alignItems: 'flex-start',
            mt: 0.5
          }
        }}
      >
        <AlertTitle sx={{ mb: 1 }}>
          {errorTitle}
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {error.message}
        </Typography>

        {/* Suggested Actions */}
        <Box sx={{ mb: hasDetails ? 2 : 0 }}>
          <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
            Suggested Actions:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
            {suggestedActions.map((action, index) => (
              <Box component="li" key={index}>
                <Typography variant="caption" color="text.secondary">
                  {action}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Technical Details */}
        <Collapse in={expanded}>
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: 'background.default', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="caption" fontWeight="medium" display="block" gutterBottom>
              Technical Details:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {errorDetails.map((detail, index) => (
                <Box component="li" key={index}>
                  <Typography variant="caption" color="text.secondary">
                    {detail}
                  </Typography>
                </Box>
              ))}
              {!hasDetails && (
                <Typography variant="caption" color="text.secondary">
                  No additional technical details available.
                </Typography>
              )}
            </Box>
          </Box>
        </Collapse>
      </Alert>

      {/* Context-specific guidance */}
      {errorType === 'music' && formData?.musicOption === 'existing' && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="caption">
            <strong>Music ID Help:</strong> Music IDs can be found in TikTok's Sound Library.
            Ensure the music is marked as available for advertising use.
          </Typography>
        </Alert>
      )}

      {errorType === 'authentication' && (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          <Typography variant="caption">
            <strong>Reauthentication Required:</strong> Click "Disconnect Account" in the header,
            then reconnect with the required permissions.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default SubmissionError;