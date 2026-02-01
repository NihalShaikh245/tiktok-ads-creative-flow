const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API proxy endpoints (if needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Simple terms and privacy pages
app.get('/terms', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terms of Service - AdsCreativeFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .container { background: #f9f9f9; padding: 20px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Terms of Service</h1>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using AdsCreativeFlow, you accept and agree to be bound by these Terms of Service.</p>
        
        <h2>2. Description of Service</h2>
        <p>AdsCreativeFlow is a web application that integrates with TikTok's APIs to provide ad creation and management services.</p>
        
        <h2>3. TikTok Integration</h2>
        <p>Our service uses TikTok's OAuth 2.0 for authentication and TikTok Ads API for ad creation. By using our service, you also agree to TikTok's Terms of Service.</p>
        
        <h2>4. User Responsibilities</h2>
        <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
        
        <h2>5. Limitation of Liability</h2>
        <p>AdsCreativeFlow is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use of our service.</p>
        
        <h2>6. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>
        
        <h2>7. Contact Information</h2>
        <p>For questions about these Terms, please contact us through the application.</p>
      </div>
    </body>
    </html>
  `);
});

app.get('/privacy', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Privacy Policy - AdsCreativeFlow</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #333; }
        .container { background: #f9f9f9; padding: 20px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Privacy Policy</h1>
        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you use our service, including through TikTok OAuth authentication.</p>
        
        <h2>2. TikTok Data Collection</h2>
        <p>Through TikTok OAuth, we may access:</p>
        <ul>
          <li>Basic profile information (user ID, display name)</li>
          <li>Advertising permissions for ad creation</li>
        </ul>
        
        <h2>3. How We Use Information</h2>
        <p>We use the information to:</p>
        <ul>
          <li>Authenticate users via TikTok</li>
          <li>Create and manage TikTok ads</li>
          <li>Improve our service</li>
          <li>Communicate with users</li>
        </ul>
        
        <h2>4. Data Storage and Security</h2>
        <p>We store minimal data necessary for service operation. Access tokens are stored securely and follow TikTok's security guidelines.</p>
        
        <h2>5. Third-Party Services</h2>
        <p>Our service integrates with TikTok APIs. Your use of TikTok is subject to their Privacy Policy.</p>
        
        <h2>6. Your Rights</h2>
        <p>You can disconnect your TikTok account at any time, which will remove your access to our service.</p>
        
        <h2>7. Changes to Privacy Policy</h2>
        <p>We may update this policy. Continued use of the service constitutes acceptance of the updated policy.</p>
        
        <h2>8. Contact Us</h2>
        <p>For privacy-related questions, contact us through the application.</p>
      </div>
    </body>
    </html>
  `);
});

// The "catchall" handler: for any request that doesn't match above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});