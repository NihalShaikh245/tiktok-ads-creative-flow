import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MusicSelection from './MusicSelection';
import tiktokApi from '../services/tiktokApi';
import { 
  validateCampaignName, 
  validateAdText 
} from '../utils/helpers';
import { AD_OBJECTIVES, CTA_OPTIONS } from '../utils/constants';

const AdCreationForm = ({ accessToken, onError }) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    campaignName: '',
    objective: AD_OBJECTIVES.TRAFFIC,
    adText: '',
    cta: CTA_OPTIONS[0].value,
    musicOption: 'existing',
    musicId: '',
    customMusicFile: null,
    customMusicName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advertiserInfo, setAdvertiserInfo] = useState(null);

  // Fetch advertiser info on component mount
  useEffect(() => {
    const fetchAdvertiserInfo = async () => {
      try {
        setLoading(true);
        // Note: This would require additional API calls to get advertiser info
        // For now, we'll simulate with a placeholder
        setAdvertiserInfo({
          advertiser_id: '123456789',
          advertiser_name: 'Demo Advertiser'
        });
      } catch (error) {
        console.error('Failed to fetch advertiser info:', error);
        onError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchAdvertiserInfo();
    }
  }, [accessToken, onError]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle music selection changes
  const handleMusicSelectionChange = (musicData) => {
    setFormData(prev => ({
      ...prev,
      ...musicData
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Campaign name validation
    const campaignNameError = validateCampaignName(formData.campaignName);
    if (campaignNameError) newErrors.campaignName = campaignNameError;

    // Ad text validation
    const adTextError = validateAdText(formData.adText);
    if (adTextError) newErrors.adText = adTextError;

    // Objective validation
    if (!formData.objective) {
      newErrors.objective = 'Please select an objective';
    }

    // CTA validation
    if (!formData.cta) {
      newErrors.cta = 'Please select a call to action';
    }

    // Music validation based on option
    if (formData.musicOption === 'existing' && !formData.musicId) {
      newErrors.musicId = 'Music ID is required';
    }

    // Objective-specific music validation
    if (formData.objective === AD_OBJECTIVES.CONVERSIONS && formData.musicOption === 'none') {
      newErrors.musicOption = 'Music is required for Conversions objective';
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare ad data
      const adData = {
        advertiser_id: advertiserInfo?.advertiser_id,
        campaign_name: formData.campaignName.trim(),
        objective: formData.objective,
        ad_text: formData.adText.trim(),
        call_to_action: formData.cta,
        music_info: null
      };

      // Add music info based on selection
      if (formData.musicOption === 'existing' && formData.musicId) {
        // Validate music ID with TikTok API
        const musicInfo = await tiktokApi.getMusicInfo(formData.musicId);
        adData.music_info = {
          music_id: formData.musicId,
          music_title: musicInfo.title,
          music_author: musicInfo.author
        };
      } else if (formData.musicOption === 'upload' && formData.customMusicName) {
        // For uploaded music, we would typically get an ID from upload API
        // For this assignment, we'll simulate it
        adData.music_info = {
          music_id: `custom_${Date.now()}`,
          music_title: formData.customMusicName,
          music_author: 'Custom Upload'
        };
      }
      // If no music and objective is TRAFFIC, that's valid

      // Submit ad to TikTok API
      const result = await tiktokApi.createAd(adData);
      
      // Show success message
      alert(`✅ Ad created successfully!\nAd ID: ${result.ad_id}`);
      
      // Reset form
      setFormData({
        campaignName: '',
        objective: AD_OBJECTIVES.TRAFFIC,
        adText: '',
        cta: CTA_OPTIONS[0].value,
        musicOption: 'existing',
        musicId: '',
        customMusicFile: null,
        customMusicName: ''
      });
      
      // Navigate to success page or refresh
      navigate('/?success=true');

    } catch (error) {
      console.error('Failed to create ad:', error);
      onError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <form onSubmit={handleSubmit}>
        {/* Advertiser Info */}
        {advertiserInfo && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Advertiser Account
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {advertiserInfo.advertiser_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {advertiserInfo.advertiser_id}
            </Typography>
          </Box>
        )}

        {/* Campaign Name */}
        <TextField
          fullWidth
          label="Campaign Name"
          name="campaignName"
          value={formData.campaignName}
          onChange={handleInputChange}
          error={!!errors.campaignName}
          helperText={errors.campaignName || "Minimum 3 characters"}
          margin="normal"
          required
          disabled={submitting}
        />

        {/* Objective */}
        <FormControl fullWidth margin="normal" error={!!errors.objective} disabled={submitting}>
          <InputLabel>Objective *</InputLabel>
          <Select
            name="objective"
            value={formData.objective}
            onChange={handleInputChange}
            label="Objective *"
          >
            <MenuItem value={AD_OBJECTIVES.TRAFFIC}>Traffic</MenuItem>
            <MenuItem value={AD_OBJECTIVES.CONVERSIONS}>Conversions</MenuItem>
          </Select>
          {errors.objective && (
            <Typography variant="caption" color="error">
              {errors.objective}
            </Typography>
          )}
        </FormControl>

        {/* Ad Text */}
        <TextField
          fullWidth
          label="Ad Text"
          name="adText"
          value={formData.adText}
          onChange={handleInputChange}
          error={!!errors.adText}
          helperText={errors.adText || `Max 100 characters (${formData.adText.length}/100)`}
          margin="normal"
          multiline
          rows={3}
          required
          disabled={submitting}
        />

        {/* Call to Action */}
        <FormControl fullWidth margin="normal" error={!!errors.cta} disabled={submitting}>
          <InputLabel>Call to Action (CTA) *</InputLabel>
          <Select
            name="cta"
            value={formData.cta}
            onChange={handleInputChange}
            label="Call to Action (CTA) *"
          >
            {CTA_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.cta && (
            <Typography variant="caption" color="error">
              {errors.cta}
            </Typography>
          )}
        </FormControl>

        {/* Music Selection */}
        <MusicSelection
          formData={formData}
          errors={errors}
          onChange={handleMusicSelectionChange}
          disabled={submitting}
          objective={formData.objective}
          onError={onError}
        />

        {/* Submit Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            sx={{ minWidth: 120 }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Creating...
              </>
            ) : (
              'Create Ad'
            )}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default AdCreationForm;