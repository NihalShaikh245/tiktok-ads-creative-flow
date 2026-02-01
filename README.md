# TikTok Ads Creative Flow

A frontend application for TikTok Ads creative setup flow with real OAuth integration.

## Features
- Real TikTok OAuth integration
- Ad creation form with validation
- Music selection logic (Existing ID, Upload, or No Music)
- Error handling for API failures
- Responsive design

## Tech Stack
- React
- React Router
- Axios for API calls
- Material-UI for components
- Real TikTok Ads API

## Prerequisites
1. Node.js 14+ and npm
2. TikTok Developer Account
3. TikTok Ads App with OAuth configured

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/tiktok-ads-creative-flow.git
cd tiktok-ads-creative-flow

## OAuth Configuration

### 1. TikTok Developer Setup
1. Go to [TikTok Developer Portal](https://developers.tiktok.com/)
2. Create a new App or use existing one
3. Enable "TikTok Login Kit"
4. Configure OAuth settings:
   - **Redirect URI**: `http://localhost:3000/auth/callback`
   - **Web App Domain**: `localhost:3000`
   - **Required Scopes**: `user.info.basic`, `advertising.music`

### 2. Get Credentials
From your TikTok App dashboard, copy:
- **Client Key** (Client ID)
- **Client Secret**

### 3. Configure Environment
Add credentials to `.env` file:
```bash
REACT_APP_TIKTOK_CLIENT_KEY=your_client_key_here
REACT_APP_TIKTOK_CLIENT_SECRET=your_client_secret_here
REACT_APP_TIKTOK_REDIRECT_URI=http://localhost:3000/auth/callback