import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';

const ErrorDisplay = ({ message, onClose, severity = 'error', details }) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Map form-specific error messages
  const getFormErrorMessage = (msg) => {
    if (msg.includes('campaign_name')) {
      return 'Invalid campaign name. Please check the requirements.';
    }
    if (msg.includes('ad_text')) {
      return 'Ad text validation failed. Maximum 100 characters allowed.';
    }
    if (msg.includes('music_id')) {
      return 'Invalid music ID or music not available for advertising.';
    }
    if (msg.includes('objective')) {
      return 'Invalid objective selected. Please choose Traffic or Conversions.';
    }
    if (msg.includes('advertiser_id')) {
      return 'Advertiser account issue. Please reconnect your TikTok account.';
    }
    if (msg.includes('permission')) {
      return 'Insufficient permissions to create ads. Please check your account settings.';
    }
    return msg;
  };

  const friendlyMessage = getFormErrorMessage(message);

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleClose}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
        sx={{
          mb: 3,
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          alignItems: 'flex-start'
        }}
      >
        <AlertTitle sx={{ m: 0 }}>
          {severity === 'error' ? 'Submission Failed' : 
           severity === 'warning' ? 'Warning' : 'Information'}
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          {friendlyMessage}
        </Typography>
        
        {details && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" component="div">
              <strong>Details:</strong> {details}
            </Typography>
          </Box>
        )}
        
        {/* Show troubleshooting tips for common errors */}
        {message.includes('music') && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" component="div" fontWeight="bold">
              Tips for Music Issues:
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '0.9em' }}>
              <li>Ensure music ID is from TikTok's official music library</li>
              <li>Check if the music is available for advertising use</li>
              <li>Try a different music ID or upload custom music</li>
            </ul>
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

export default ErrorDisplay;