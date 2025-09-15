import { Box, Paper, Typography, TextField, Button, Alert, Fade, IconButton, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { validatePassword as validatePasswordStrength } from '../utils/passwordValidator';

interface RegisterFormProps {
  onSubmit: (data: { email: string; password: string; username: string, name: string, lastname: string }) => void;
  onLoginClick: () => void;
  isLoading?: boolean;
  error?: string | null;
  embedded?: boolean;
}

interface FormErrors {
  name?: string;
  lastname?: string;
  username?: string;
  email?: string;
  password?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onLoginClick, isLoading = false, error = null, embedded = false }) => {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ username: boolean; email: boolean; password: boolean, name: boolean, lastname: boolean }>({
    username: false,
    email: false,
    password: false,
    name: false,
    lastname: false
  });

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Name is required';
    }
    return undefined;
  };
  
  const validateLastname = (lastname: string): string | undefined => {
    if (!lastname.trim()) {
      return 'Last Name is required';
    }
    return undefined;
  };

  const validateUsername = (username: string): string | undefined => {
    if (!username.trim()) {
      return 'Username is required';
    }
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters long';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    
    // Use the comprehensive password validation utility
    const validation = validatePasswordStrength(password);
    
    if (!validation.isValid) {
      return validation.errors.join('. ');
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = validateName(name);
    const lastnameError = validateLastname(lastname);
    
    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      name: nameError,
      lastname: lastnameError
    });

    return !usernameError && !emailError && !passwordError && !nameError && !lastnameError;
  };

  const handleFieldChange = (field: keyof FormErrors, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'lastname':
        setLastname(value);
        break;
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
    }

    if (touched[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: field === 'name' ? validateName(value) :
                 field === 'lastname' ? validateLastname(value) :
                field === 'username' ? validateUsername(value) :
                field === 'email' ? validateEmail(value) :
                validatePassword(value),
      }));
    }
  };

  const handleFieldBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({
      ...prev,
      [field]: 
              field === 'name' ? validateName(name) :
              field === 'lastname' ? validateLastname(lastname) :
              field === 'username' ? validateUsername(username) :
              field === 'email' ? validateEmail(email) :
              validatePassword(password),
    }));
  };

  const handleSubmit = () => {
    setTouched({ username: true, email: true, password: true, name: true, lastname: true });
    if (validateForm()) {
      onSubmit({ 
        username: username.trim(), 
        email: email.trim(), 
        password: password.trim(),
        name: name.trim(),
        lastname: lastname.trim()
      });
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
          label="Name" 
          fullWidth 
          margin="normal" 
          value={name} 
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleFieldBlur('name')}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
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
          label="Last Name" 
          fullWidth 
          margin="normal" 
          value={lastname} 
          onChange={(e) => handleFieldChange('lastname', e.target.value)}
          onBlur={() => handleFieldBlur('lastname')}
          error={touched.lastname && !!errors.lastname}
          helperText={touched.lastname && errors.lastname}
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
          label="Username" 
          fullWidth 
          margin="normal" 
          value={username} 
          onChange={(e) => handleFieldChange('username', e.target.value)}
          onBlur={() => handleFieldBlur('username')}
          error={touched.username && !!errors.username}
          helperText={touched.username && errors.username}
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
          label="Email" 
          fullWidth 
          margin="normal" 
          value={email} 
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
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
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => handleFieldBlur('password')}
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
          disabled={isLoading || !name.trim() || !lastname.trim() || !username.trim() || !email.trim() || !password.trim()}
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
          {isLoading ? 'Creating account...' : 'Create Account'}
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
          Create your account:
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
          label="Name" 
          fullWidth 
          margin="normal" 
          value={name} 
          onChange={(e) => handleFieldChange('name', e.target.value)}
          onBlur={() => handleFieldBlur('name')}
          error={touched.name && !!errors.name}
          helperText={touched.name && errors.name}
          disabled={isLoading}
        />

        <TextField 
          label="Last Name" 
          fullWidth 
          margin="normal" 
          value={lastname} 
          onChange={(e) => handleFieldChange('lastname', e.target.value)}
          onBlur={() => handleFieldBlur('lastname')}
          error={touched.lastname && !!errors.lastname}
          helperText={touched.lastname && errors.lastname}
          disabled={isLoading}
        />


        <TextField 
          label="Username" 
          fullWidth 
          margin="normal" 
          value={username} 
          onChange={(e) => handleFieldChange('username', e.target.value)}
          onBlur={() => handleFieldBlur('username')}
          error={touched.username && !!errors.username}
          helperText={touched.username && errors.username}
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
          label="Email" 
          fullWidth 
          margin="normal" 
          value={email} 
          onChange={(e) => handleFieldChange('email', e.target.value)}
          onBlur={() => handleFieldBlur('email')}
          error={touched.email && !!errors.email}
          helperText={touched.email && errors.email}
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
          onChange={(e) => handleFieldChange('password', e.target.value)}
          onBlur={() => handleFieldBlur('password')}
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
            mb: 2,
            '& .MuiFormHelperText-root.Mui-error': {
              fontSize: '0.8rem',
              marginLeft: 0,
            }
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleSubmit}
            disabled={isLoading || !username.trim() || !email.trim() || !password.trim()}
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
            {isLoading ? 'Creating...' : 'Register'}
          </Button>
          <Button 
            variant="outlined" 
            color="warning"
            onClick={onLoginClick}
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
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterForm; 