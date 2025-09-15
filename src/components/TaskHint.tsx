import { Box, Button, Alert, Typography } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import React from 'react';

interface TaskHintProps {
    task: { idealPrompt?: string };
    showHint: boolean;
    onToggleHint: () => void;
}

const TaskHint: React.FC<TaskHintProps> = ({ task, showHint, onToggleHint }) => {
    if (!task?.idealPrompt) return null;

    return (
        <Box className="hint-section" sx={{ mt: 2, mb: 2 }}>
            <Button
                variant={showHint ? 'outlined' : 'contained'}
                color="warning"
                onClick={onToggleHint}
                startIcon={<LightbulbOutlinedIcon />}
                sx={{ fontWeight: 600, mb: 1 }}
            >
                {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2, boxShadow: 1, bgcolor: '#e3f2fd' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LightbulbOutlinedIcon sx={{ color: '#ffb300' }} /> Hint:
                    </Typography>
                    <Typography variant="body2">{task.idealPrompt}</Typography>
                </Alert>
            )}
        </Box>
    );
};

export default TaskHint; 