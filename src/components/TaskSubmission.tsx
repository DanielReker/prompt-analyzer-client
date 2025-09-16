import { Box, TextField, Button, LinearProgress, Typography, Alert, Fade } from '@mui/material';
import { TaskSubmissionProps } from './types';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useState } from 'react';

export default function TaskSubmission({ 
    userSolution, 
    onSolutionChange, 
    onSubmit, 
    isEvaluating 
}: TaskSubmissionProps) {
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    const validateSolution = (solution: string): string | null => {
        if (!solution.trim()) {
            return 'Please enter your prompt solution';
        }
        
        // Count non-whitespace characters
        const nonWhitespaceCount = solution.replace(/\s/g, '').length;
        if (nonWhitespaceCount < 10) {
            return `Your solution must contain at least 10 non-whitespace characters. Current: ${nonWhitespaceCount}`;
        }
        
        if (solution.trim().length > 5000) {
            return 'Your solution is too long (max 5000 characters)';
        }
        
        return null;
    };

    const handleSolutionChange = (value: string) => {
        onSolutionChange(value);
        if (touched) {
            setError(validateSolution(value));
        }
    };

    const handleBlur = () => {
        setTouched(true);
        setError(validateSolution(userSolution));
    };

    const handleSubmit = () => {
        setTouched(true);
        const validationError = validateSolution(userSolution);
        setError(validationError);
        
        if (!validationError) {
            onSubmit();
        }
    };

    const isValid = !error && userSolution.trim().length > 0;

    return (
        <Box>
            {error && touched && (
                <Fade in={true}>
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 2, 
                            borderRadius: 1,
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
                label="Your Prompt"
                multiline
                fullWidth
                minRows={3}
                value={userSolution}
                placeholder="Write your prompt here... (minimum 10 non-whitespace characters)"
                onChange={(e) => handleSolutionChange(e.target.value)}
                onBlur={handleBlur}
                error={touched && !!error}
                helperText={
                    <span style={{ fontSize: '0.75rem', color: '#666', display: 'flex', justifyContent: 'flex-end' }}>
                        {userSolution.length}/5000 total
                    </span>
                }
                disabled={isEvaluating}
                className="solution-input"
                sx={{
                    '& .MuiFormHelperText-root': {
                        fontSize: '0.8rem',
                        marginLeft: 0,
                        marginTop: 1,
                    }
                }}
            />
            
            <Button
                variant="contained"
                color="warning"
                onClick={handleSubmit}
                disabled={isEvaluating || !isValid}
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
                className="submit-button"
                startIcon={isEvaluating ? undefined : <EmojiEventsIcon />}
            >
                {isEvaluating ? 'Evaluating...' : 'Submit Solution'}
            </Button>
            
            {isEvaluating && (
                <Box sx={{ mt: 2, width: '100%' }}>
                    <LinearProgress 
                        variant="indeterminate" 
                        sx={{ 
                            height: 6,
                            '& .MuiLinearProgress-bar': {
                                animation: 'indeterminate-bar 1.5s infinite ease-in-out',
                            },
                            '@keyframes indeterminate-bar': {
                                '0%': { left: '-30%', width: '30%' },
                                '50%': { left: '30%', width: '40%' },
                                '100%': { left: '100%', width: '30%' },
                            }
                        }} 
                    />
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                        Evaluating your submission...
                    </Typography>
                </Box>
            )}
        </Box>
    );
} 