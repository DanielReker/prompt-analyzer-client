import { Box, Paper, Typography, TextField, Button, Alert, Fade, IconButton, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface LoginFormProps {
  onSubmit: (data: { identifier: string; password: string }) => void;
  onRegisterClick: () => void;
  isLoading?: boolean;
  error?: string | null;
  embedded?: boolean;
}

interface FormErrors {
  identifier?: string;
  password?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onRegisterClick, isLoading = false, error = null, embedded = false }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ identifier: boolean; password: boolean }>({
    identifier: false,
    password: false,
  });

  const validateIdentifier = (identifier: string): string | undefined => {
    if (!identifier.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(identifier)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password);
    
    setErrors({
      identifier: identifierError,
      password: passwordError,
    });

    return !identifierError && !passwordError;
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (touched.identifier) {
      setErrors(prev => ({
        ...prev,
        identifier: validateIdentifier(value),
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors(prev => ({
        ...prev,
        password: validatePassword(value),
      }));
    }
  };

  const handleIdentifierBlur = () => {
    setTouched(prev => ({ ...prev, identifier: true }));
    setErrors(prev => ({
      ...prev,
      identifier: validateIdentifier(identifier),
    }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({
      ...prev,
      password: validatePassword(password),
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    setTouched({ identifier: true, password: true });
    if (validateForm()) {
      onSubmit({ identifier: identifier.trim(), password: password.trim() });
    }
  };

  // If embedded, just return the form content without the full layout
  if (embedded) {
    return (
      <Box>
        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem',
                }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <TextField 
          label="Email" 
          fullWidth 
          margin="normal" 
          value={identifier} 
          onChange={(e) => handleIdentifierChange(e.target.value)}
          onBlur={handleIdentifierBlur}
          error={touched.identifier && !!errors.identifier}
          helperText={touched.identifier && errors.identifier}
          disabled={isLoading}
          sx={{ 
            mb: 2,
            '& .MuiFormHelperText-root.Mui-error': {
              fontSize: '0.8rem',
              marginLeft: 0,
            }
          }}
        />
        <TextField 
          label="Password" 
          type={showPassword ? 'text' : 'password'}
          fullWidth 
          margin="normal" 
          value={password} 
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={handlePasswordBlur}
          error={touched.password && !!errors.password}
          helperText={touched.password && errors.password}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 1,
            '& .MuiFormHelperText-root.Mui-error': {
              fontSize: '0.8rem',
              marginLeft: 0,
            }
          }}
        />

        <Button
          fullWidth
          variant="contained" 
          color="warning"
          onClick={handleSubmit}
          disabled={isLoading || !identifier.trim() || !password.trim()}
          sx={{ 
            mt: 2,
            fontWeight: 700, 
            borderRadius: 1, 
            py: 1.2, 
            fontSize: '1.1rem', 
            boxShadow: '0 2px 8px #ffe08288',
            '&:disabled': {
              opacity: 0.6,
            }
          }}
          startIcon={isLoading ? undefined : <EmojiEventsIcon />}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Box>
    );
  }

  // Original full-page layout for non-embedded use
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ p: 5, borderRadius: 4, minWidth: 350, maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff6600', letterSpacing: 1 }}>Prompt Pal</Typography>
        </Box>
        <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2, fontWeight: 700 }}>
          Welcome back! Please login:
        </Typography>

        {error && (
          <Fade in={true}>
            <Alert 
              severity="error" 
              icon={<ErrorIcon />}
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.9rem',
                }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        <TextField 
          label="Email" 
          fullWidth 
          margin="normal" 
          value={identifier} 
          onChange={(e) => handleIdentifierChange(e.target.value)}
          onBlur={handleIdentifierBlur}
          error={touched.identifier && !!errors.identifier}
          helperText={touched.identifier && errors.identifier}
          disabled={isLoading}
          sx={{ 
            mb: 2,
            '& .MuiFormHelperText-root.Mui-error': {
              fontSize: '0.8rem',
              marginLeft: 0,
            }
          }}
        />
        <TextField 
          label="Password" 
          type={showPassword ? 'text' : 'password'}
          fullWidth 
          margin="normal" 
          value={password} 
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={handlePasswordBlur}
          error={touched.password && !!errors.password}
          helperText={touched.password && errors.password}
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 1,
            '& .MuiFormHelperText-root.Mui-error': {
              fontSize: '0.8rem',
              marginLeft: 0,
            }
          }}
        />

        <Button
          fullWidth
          variant="text"
          onClick={() => window.location.href = '/forgot-password'}
          sx={{
            textTransform: 'none',
            color: '#4a5568',
            mb: 2,
            justifyContent: 'flex-end',
            fontSize: '0.9rem'
          }}
        >
          Forgot your password?
        </Button>

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleSubmit}
            disabled={isLoading || !identifier.trim() || !password.trim()}
            sx={{ 
              flex: 1, 
              fontWeight: 700, 
              borderRadius: 1, 
              py: 1.2, 
              fontSize: '1.1rem', 
              boxShadow: '0 2px 8px #ffe08288',
              '&:disabled': {
                opacity: 0.6,
              }
            }}
            startIcon={isLoading ? undefined : <EmojiEventsIcon />}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <Button 
            variant="outlined" 
            color="warning"
            onClick={onRegisterClick}
            disabled={isLoading}
            sx={{ 
              flex: 1, 
              fontWeight: 700, 
              borderRadius: 1, 
              py: 1.2, 
              fontSize: '1.1rem', 
              borderWidth: 2,
              '&:disabled': {
                opacity: 0.6,
              }
            }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm; 