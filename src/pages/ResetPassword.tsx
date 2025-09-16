import { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AUTH_BASE } from '../config';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const code = searchParams.get('code');
            if (!code) {
                throw new Error('Reset code is missing');
            }

            await axios.post(`${AUTH_BASE}/auth/reset-password`, {
                password,
                passwordConfirmation: confirmPassword,
                code
            });
            
            setSuccess(true);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Full error response:', error.response?.data);
                if (error.response?.data?.error?.message) {
                    setError(error.response.data.error.message);
                } else if (error.response?.data?.message) {
                    setError(error.response.data.message);
                } else {
                    setError('An error occurred while resetting the password. Please try again.');
                }
            } else {
                setError('An error occurred. Please try again.');
            }
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={4} sx={{ p: 5, borderRadius: 4, minWidth: 350, maxWidth: 400, width: '100%', boxShadow: 3 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#ff6600', letterSpacing: 1, mb: 3, textAlign: 'center' }}>
                    Prompt Pal
                </Typography>
                <Typography variant="h6" gutterBottom align="center" sx={{ mb: 2, fontWeight: 700 }}>
                    Reset Password
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Box>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            Your password has been reset successfully.
                        </Alert>
                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            onClick={handleBackToLogin}
                            sx={{ mt: 2 }}
                        >
                            Back to Login
                        </Button>
                    </Box>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Confirm New Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            required
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={handleBackToLogin}
                            disabled={loading}
                        >
                            Back to Login
                        </Button>
                    </form>
                )}
            </Paper>
        </Box>
    );
} 