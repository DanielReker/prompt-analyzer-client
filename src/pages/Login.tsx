import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/register')}
                sx={{
                    textTransform: 'none',
                    color: '#4a5568'
                }}
            >
                Don't have an account? Sign up
            </Button>

            <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/forgot-password')}
                sx={{
                    textTransform: 'none',
                    color: '#4a5568',
                    mt: 1
                }}
            >
                Forgot your password?
            </Button>
        </div>
    );
};

export default Login; 