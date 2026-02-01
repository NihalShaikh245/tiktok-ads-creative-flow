import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SubmissionError from './SubmissionError';
import SubmissionSuccess from './SubmissionSuccess';
import MusicSelection from './MusicSelection';
import adSubmissionService from '../services/adSubmissionService';
import tiktokApi from '../services/tiktokApi';
import validationService from '../services/validationService';
import { 
  validateCampaignName, 
  validateAdText 
} from '../utils/helpers';
import { AD_OBJECTIVES, CTA_OPTIONS } from '../utils/constants';

// Import form components
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const AdCreationForm = ({ accessToken, onError, onSuccess }) => {
  const navigate = useNavigate();
  
  // Form states
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
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [fieldTouched, setFieldTouched] = useState({});

  // Fetch advertiser info
  useEffect(() => {
    const fetchAdvertiserInfo = async () => {
      try {
        setLoading(true);
        const info = await tiktokApi.getAdvertiserInfo();
        setAdvertiserInfo(info);
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

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate immediately
    validateField(name, value);
  };

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'campaignName':
        error = validateCampaignName(value);
        break;
      case 'adText':
        error = validateAdText(value);
        break;
      case 'objective':
        if (!value) error = 'Please select an objective';
        break;
      case 'cta':
        if (!value) error = 'Please select a call to action';
        break;
      case 'musicId':
        if (formData.musicOption === 'existing' && !value) {
          error = 'Music ID is required';
        }
        break;
      case 'customMusicName':
        if (formData.musicOption === 'upload' && !value) {
          error = 'Music name is required';
        }
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return !error;
  };

  // Handle music selection changes
  const handleMusicSelectionChange = (musicData) => {
    setFormData(prev => ({
      ...prev,
      ...musicData
    }));

    // Clear music-related errors
    setErrors(prev => ({
      ...prev,
      musicOption: '',
      musicId: '',
      customMusicName: ''
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach(field => {
      if (field !== 'customMusicFile') { // Skip file validation
        const isFieldValid = validateField(field, formData[field]);
        if (!isFieldValid) {
          isValid = false;
        }
      }
    });

    // Additional validation for music based on objective
    if (formData.objective === AD_OBJECTIVES.CONVERSIONS && formData.musicOption === 'none') {
      newErrors.musicOption = 'Music is required for Conversions objective';
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData);
    const touchedState = {};
    allFields.forEach(field => {
      touchedState[field] = true;
    });
    setFieldTouched(touchedState);

    // Validate form
    if (!validateForm()) {
      onError('Please fix the errors in the form before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmissionError(null);

      console.log('Submitting ad with data:', formData);

      // Submit ad
      const result = await adSubmissionService.submitAd(formData, advertiserInfo?.advertiser_id);

      // Create submission result
      const submissionData = {
        adId: result.ad_id || `AD_${Date.now()}`,
        campaignName: formData.campaignName,
        objective: formData.objective,
        submittedAt: new Date().toISOString(),
        estimatedReviewTime: '1-24 hours'
      };

      setSubmissionResult(submissionData);

      // Notify parent
      if (onSuccess) {
        onSuccess(submissionData.campaignName, submissionData.adId);
      }

      // Reset form after successful submission
      setTimeout(() => {
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
        setErrors({});
        setFieldTouched({});
      }, 1000);

    } catch (error) {
      console.error('Ad submission failed:', error);
      setSubmissionError(error);
      onError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle retry submission
  const handleRetry = () => {
    setSubmissionError(null);
    handleSubmit(new Event('submit'));
  };

  // Handle create another ad
  const handleCreateAnother = () => {
    setSubmissionResult(null);
    setSubmissionError(null);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show success state
  if (submissionResult) {
    return (
      <SubmissionSuccess
        submissionData={submissionResult}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, position: 'relative' }}>
      {/* Submission Error Display */}
      {submissionError && (
        <SubmissionError
          error={submissionError}
          onRetry={handleRetry}
          onClose={() => setSubmissionError(null)}
          formData={formData}
        />
      )}

      {/* Form Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Create New Ad Creative
        </Typography>
        {advertiserInfo && (
          <Typography variant="body2" color="text.secondary">
            Advertiser: <strong>{advertiserInfo.advertiser_name}</strong>
          </Typography>
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        {/* Campaign Name */}
        <TextField
          fullWidth
          label="Campaign Name"
          name="campaignName"
          value={formData.campaignName}
          onChange={handleInputChange}
          error={!!errors.campaignName && fieldTouched.campaignName}
          helperText={
            errors.campaignName && fieldTouched.campaignName 
              ? errors.campaignName 
              : "Minimum 3 characters"
          }
          margin="normal"
          required
          disabled={submitting}
          onBlur={() => setFieldTouched(prev => ({ ...prev, campaignName: true }))}
        />

        {/* Objective */}
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!errors.objective && fieldTouched.objective}
          disabled={submitting}
        >
          <InputLabel>Objective *</InputLabel>
          <Select
            name="objective"
            value={formData.objective}
            onChange={handleInputChange}
            label="Objective *"
            onBlur={() => setFieldTouched(prev => ({ ...prev, objective: true }))}
          >
            <MenuItem value={AD_OBJECTIVES.TRAFFIC}>Traffic</MenuItem>
            <MenuItem value={AD_OBJECTIVES.CONVERSIONS}>Conversions</MenuItem>
          </Select>
          {errors.objective && fieldTouched.objective && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {errors.objective}
            </Typography>
          )}
        </FormControl>

        {/* Ad Text with character counter */}
        <Box sx={{ mt: 2, mb: 1 }}>
          <TextField
            fullWidth
            label="Ad Text"
            name="adText"
            value={formData.adText}
            onChange={handleInputChange}
            error={!!errors.adText && fieldTouched.adText}
            helperText={
              errors.adText && fieldTouched.adText 
                ? errors.adText 
                : `${formData.adText.length}/100 characters`
            }
            multiline
            rows={3}
            required
            disabled={submitting}
            onBlur={() => setFieldTouched(prev => ({ ...prev, adText: true }))}
          />
          <Typography 
            variant="caption" 
            align="right" 
            sx={{ 
              display: 'block',
              mt: 0.5,
              color: formData.adText.length > 100 ? 'error.main' : 'text.secondary'
            }}
          >
            {100 - formData.adText.length} characters remaining
          </Typography>
        </Box>

        {/* Call to Action */}
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!errors.cta && fieldTouched.cta}
          disabled={submitting}
        >
          <InputLabel>Call to Action (CTA) *</InputLabel>
          <Select
            name="cta"
            value={formData.cta}
            onChange={handleInputChange}
            label="Call to Action (CTA) *"
            onBlur={() => setFieldTouched(prev => ({ ...prev, cta: true }))}
          >
            {CTA_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors.cta && fieldTouched.cta && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
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

        {/* Form Submission Summary */}
        {Object.keys(fieldTouched).length > 0 && (
          <Alert 
            severity={Object.keys(errors).filter(k => errors[k]).length > 0 ? "warning" : "info"}
            sx={{ mt: 3 }}
          >
            <Typography variant="body2">
              {Object.keys(errors).filter(k => errors[k]).length > 0
                ? `Please fix ${Object.keys(errors).filter(k => errors[k]).length} error(s) before submitting.`
                : 'All required fields are filled. Ready to submit.'
              }
            </Typography>
          </Alert>
        )}

        {/* Submit Button */}
        <Box sx={{ 
          mt: 4, 
          pt: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="caption" color="text.secondary">
            * Required fields
          </Typography>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={submitting}
            sx={{ minWidth: 150 }}
          >
            {submitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Submitting...
              </>
            ) : (
              'Create Ad'
            )}
          </Button>
        </Box>
      </form>

      {/* Submission Progress Indicator */}
      {submitting && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2
        }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Creating your ad...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a few moments
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AdCreationForm;