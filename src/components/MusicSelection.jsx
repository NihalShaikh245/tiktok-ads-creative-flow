import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import tiktokApi from '../services/tiktokApi';
import { AD_OBJECTIVES } from '../utils/constants';
import { validateMusicId } from '../utils/helpers';

const MusicSelection = ({ formData, errors, onChange, disabled, objective, onError }) => {
  const [validatingMusic, setValidatingMusic] = useState(false);
  const [musicValidationResult, setMusicValidationResult] = useState(null);

  const handleMusicOptionChange = (e) => {
    const musicOption = e.target.value;
    onChange({
      musicOption,
      musicId: musicOption === 'existing' ? formData.musicId : '',
      customMusicName: musicOption === 'upload' ? formData.customMusicName : '',
      customMusicFile: musicOption === 'upload' ? formData.customMusicFile : null
    });
    setMusicValidationResult(null);
  };

  const handleMusicIdChange = (e) => {
    const musicId = e.target.value;
    onChange({ musicId });
    setMusicValidationResult(null);
  };

  const handleCustomMusicNameChange = (e) => {
    onChange({ customMusicName: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
      if (!validTypes.includes(file.type)) {
        onError('Please upload a valid audio file (MP3, WAV, or M4A)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError('File size must be less than 10MB');
        return;
      }

      onChange({ 
        customMusicFile: file,
        customMusicName: file.name.replace(/\.[^/.]+$/, "") // Remove extension
      });
    }
  };

  const validateMusicWithApi = async () => {
    const musicIdError = validateMusicId(formData.musicId);
    if (musicIdError) {
      onError(musicIdError);
      return;
    }

    try {
      setValidatingMusic(true);
      setMusicValidationResult(null);
      
      const musicInfo = await tiktokApi.getMusicInfo(formData.musicId);
      
      setMusicValidationResult({
        valid: true,
        title: musicInfo.title,
        author: musicInfo.author,
        duration: musicInfo.duration,
        status: musicInfo.status === 2 ? 'Available for ads' : 'Not available'
      });
      
    } catch (error) {
      setMusicValidationResult({
        valid: false,
        message: error.message
      });
    } finally {
      setValidatingMusic(false);
    }
  };

  // Check if no music is allowed for current objective
  const isNoMusicAllowed = objective === AD_OBJECTIVES.TRAFFIC;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Music Selection
      </Typography>

      <FormControl component="fieldset" error={!!errors.musicOption} disabled={disabled}>
        <FormLabel component="legend">Choose Music Option</FormLabel>
        <RadioGroup
          name="musicOption"
          value={formData.musicOption}
          onChange={handleMusicOptionChange}
        >
          {/* Option A: Existing Music ID */}
          <FormControlLabel
            value="existing"
            control={<Radio />}
            label="Use Existing Music ID"
          />
          
          {formData.musicOption === 'existing' && (
            <Box sx={{ ml: 4, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Music ID"
                  value={formData.musicId}
                  onChange={handleMusicIdChange}
                  error={!!errors.musicId}
                  helperText={errors.musicId || "Enter a valid TikTok Music ID"}
                  disabled={disabled || validatingMusic}
                />
                <Button
                  variant="outlined"
                  onClick={validateMusicWithApi}
                  disabled={!formData.musicId || disabled || validatingMusic}
                  startIcon={validatingMusic ? <CircularProgress size={20} /> : <MusicNoteIcon />}
                >
                  Validate
                </Button>
              </Box>

              {musicValidationResult && (
                <Alert 
                  severity={musicValidationResult.valid ? "success" : "error"}
                  sx={{ mt: 2 }}
                >
                  {musicValidationResult.valid ? (
                    <>
                      <strong>Valid Music Found:</strong><br />
                      Title: {musicValidationResult.title}<br />
                      Author: {musicValidationResult.author}<br />
                      Status: {musicValidationResult.status}
                    </>
                  ) : (
                    musicValidationResult.message
                  )}
                </Alert>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Music ID must be from TikTok's music library and available for advertising use.
              </Typography>
            </Box>
          )}

          {/* Option B: Upload Custom Music */}
          <FormControlLabel
            value="upload"
            control={<Radio />}
            label="Upload Custom Music"
          />
          
          {formData.musicOption === 'upload' && (
            <Box sx={{ ml: 4, mt: 1 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={disabled}
                sx={{ mb: 2 }}
              >
                Upload Audio File
                <input
                  type="file"
                  hidden
                  accept="audio/*"
                  onChange={handleFileUpload}
                />
              </Button>

              {formData.customMusicFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  File selected: {formData.customMusicFile.name}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Music Title"
                value={formData.customMusicName}
                onChange={handleCustomMusicNameChange}
                helperText="Enter a name for your custom music"
                disabled={disabled}
              />

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Uploaded music will be processed and assigned a Music ID automatically.
                Maximum file size: 10MB. Supported formats: MP3, WAV, M4A.
              </Typography>
            </Box>
          )}

          {/* Option C: No Music */}
          <FormControlLabel
            value="none"
            control={<Radio />}
            label="No Music"
            disabled={!isNoMusicAllowed}
          />
          
          {!isNoMusicAllowed && formData.musicOption === 'none' && (
            <Alert severity="warning" sx={{ ml: 4, mt: 1 }}>
              Music is required for the Conversions objective. Please select a music option.
            </Alert>
          )}

          {formData.musicOption === 'none' && isNoMusicAllowed && (
            <Alert severity="info" sx={{ ml: 4, mt: 1 }}>
              No music will be added to this ad. This is only allowed for Traffic objective.
            </Alert>
          )}
        </RadioGroup>

        {errors.musicOption && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errors.musicOption}
          </Alert>
        )}
      </FormControl>

      {/* Objective-based guidance */}
      <Alert 
        severity="info" 
        sx={{ mt: 3 }}
        icon={false}
      >
        <Typography variant="subtitle2" gutterBottom>
          Objective-specific rules:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Traffic objective:</strong> Music is optional
          </li>
          <li>
            <strong>Conversions objective:</strong> Music is required
          </li>
        </ul>
      </Alert>
    </Box>
  );
};

export default MusicSelection;