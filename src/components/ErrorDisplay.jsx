import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const ErrorDisplay = ({
  message,
  onClose,
  severity = 'error',
  details
}) => {
  const [open, setOpen] = React.useState(true);

  // Normalize message (supports string, Error, null)
  const rawMessage =
    typeof message === 'string'
      ? message
      : message?.message || 'An unexpected error occurred';

  const normalizedMessage = rawMessage.toLowerCase();

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  // Map API / form-specific errors to user-friendly messages
  const getFormErrorMessage = (msg) => {
    if (msg.includes('campaign_name')) {
      return 'Invalid campaign name. Please check the naming requirements.';
    }
    if (msg.includes('ad_text')) {
      return 'Ad text validation failed. Maximum 100 characters allowed.';
    }
    if (msg.includes('music_id')) {
      return 'Invalid music ID or the music is not approved for advertising.';
    }
    if (msg.includes('objective')) {
      return 'Invalid objective selected. Please choose Traffic or Conversions.';
    }
    if (msg.includes('advertiser_id')) {
      return 'Advertiser account issue. Please reconnect your TikTok Ads account.';
    }
    if (msg.includes('permission') || msg.includes('scope')) {
      return 'Insufficient permissions to create ads. Please check your account access.';
    }
    return rawMessage;
  };

  const friendlyMessage = getFormErrorMessage(normalizedMessage);

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
          borderRadius: 2,
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          alignItems: 'flex-start'
        }}
      >
        <AlertTitle sx={{ m: 0 }}>
          {severity === 'error'
            ? 'Submission Failed'
            : severity === 'warning'
            ? 'Warning'
            : 'Information'}
        </AlertTitle>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {friendlyMessage}
        </Typography>

        {details && (
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: 'background.default',
              borderRadius: 1
            }}
          >
            <Typography variant="caption" component="div">
              <strong>Details:</strong> {details}
            </Typography>
          </Box>
        )}

        {/* Troubleshooting tips */}
        {normalizedMessage.includes('music') && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="caption"
              component="div"
              fontWeight="bold"
            >
              Tips for Music Issues:
            </Typography>
            <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: '0.9em' }}>
              <li>Use music from TikTok’s official commercial music library</li>
              <li>Ensure the track is approved for advertising use</li>
              <li>Try a different music ID or upload custom music</li>
            </ul>
          </Box>
        )}
      </Alert>
    </Collapse>
  );
};

export default ErrorDisplay;
