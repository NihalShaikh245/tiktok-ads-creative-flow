import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Privacy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us when you use our service, including through TikTok OAuth authentication.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. TikTok Data Collection
          </Typography>
          <Typography variant="body1" paragraph>
            Through TikTok OAuth, we may access:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              Basic profile information (user ID, display name)
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Advertising permissions for ad creation
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            3. How We Use Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information to:
          </Typography>
          <Box component="ul" sx={{ pl: 3 }}>
            <Typography component="li" variant="body1" paragraph>
              Authenticate users via TikTok
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Create and manage TikTok ads
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Improve our service
            </Typography>
            <Typography component="li" variant="body1" paragraph>
              Communicate with users
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            4. Data Storage and Security
          </Typography>
          <Typography variant="body1" paragraph>
            We store minimal data necessary for service operation. Access tokens are stored securely and follow TikTok's security guidelines.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph>
            Our service integrates with TikTok APIs. Your use of TikTok is subject to their Privacy Policy.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You can disconnect your TikTok account at any time, which will remove your access to our service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Changes to Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this policy. Continued use of the service constitutes acceptance of the updated policy.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Us
          </Typography>
          <Typography variant="body1">
            For privacy-related questions, contact us through the application.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy;