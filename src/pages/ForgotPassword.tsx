import { useState } from 'react';
import { 
    Box, 
    Typography, 
    TextField, 
    Button, 
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AUTH_BASE } from '../config';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await axios.post(`${AUTH_BASE}/auth/forgot-password`, { email });
            setSuccess(true);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.data?.error?.message) {
                setError(error.response.data.error.message);
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
                    Forgot Password
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {success ? (
                    <Box>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            If an account exists with this email, you will receive a password reset link.
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
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="warning"
                            type="submit"
                            disabled={loading || !email}
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