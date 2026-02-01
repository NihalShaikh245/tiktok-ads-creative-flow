import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Last Updated: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using AdsCreativeFlow, you accept and agree to be bound by these Terms of Service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Description of Service
          </Typography>
          <Typography variant="body1" paragraph>
            AdsCreativeFlow is a web application that integrates with TikTok's APIs to provide ad creation and management services.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. TikTok Integration
          </Typography>
          <Typography variant="body1" paragraph>
            Our service uses TikTok's OAuth 2.0 for authentication and TikTok Ads API for ad creation. By using our service, you also agree to TikTok's Terms of Service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. User Responsibilities
          </Typography>
          <Typography variant="body1" paragraph>
            You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            AdsCreativeFlow is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Contact Information
          </Typography>
          <Typography variant="body1">
            For questions about these Terms, please contact us through the application.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Terms;