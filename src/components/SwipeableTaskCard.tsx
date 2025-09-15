import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Heart, 
  Share, 
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';
import { useSwipeGesturesWithFeedback } from '../hooks/useSwipeGestures';

interface SwipeableTaskCardProps {
  task: {
    id: string;
    name: string;
    question: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    completed?: boolean;
    score?: number;
  };
  onShowHint?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
  onSelect?: () => void;
  showSwipeInstructions?: boolean;
}

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  onShowHint,
  onToggleFavorite,
  onShare,
  onSelect,
  showSwipeInstructions = false
}) => {
  const theme = useTheme();
  const [showHint, setShowHint] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleSwipeLeft = () => {
    if (onShowHint) {
      onShowHint();
      setShowHint(true);
      setActionFeedback('Hint revealed!');
      setTimeout(() => {
        setActionFeedback(null);
        setShowHint(false);
      }, 2000);
    }
  };

  const handleSwipeRight = () => {
    if (onToggleFavorite) {
      onToggleFavorite();
      setIsFavorited(!isFavorited);
      setActionFeedback(isFavorited ? 'Removed from favorites' : 'Added to favorites!');
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const handleSwipeUp = () => {
    if (onShare) {
      onShare();
      setActionFeedback('Opening share options...');
      setTimeout(() => setActionFeedback(null), 2000);
    }
  };

  const swipeProps = useSwipeGesturesWithFeedback({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onSwipeUp: handleSwipeUp,
    threshold: 60,
    showVisualFeedback: true,
    hapticFeedback: true,
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return theme.palette.primary.main;
    }
  };

  const getSwipeIndicatorContent = () => {
    switch (swipeProps.swipeDirection) {
      case 'left':
        return { icon: <Lightbulb size={24} />, text: 'Show Hint', color: '#ff9800' };
      case 'right':
        return { icon: <Heart size={24} />, text: 'Favorite', color: '#e91e63' };
      case 'up':
        return { icon: <Share size={24} />, text: 'Share', color: '#2196f3' };
      default:
        return null;
    }
  };

  const swipeIndicator = getSwipeIndicatorContent();

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      {/* Swipe Action Indicators */}
      <AnimatePresence>
        {swipeProps.swipeDirection && swipeIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: swipeProps.swipeDirection === 'right' ? '20px' : 
                    swipeProps.swipeDirection === 'left' ? 'calc(100% - 80px)' : '50%',
              transform: swipeProps.swipeDirection === 'up' ? 'translate(-50%, -50%)' : 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: swipeIndicator.color,
              color: 'white',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              opacity: Math.min(swipeProps.swipeDistance / 80, 1),
            }}
          >
            {swipeIndicator.icon}
            <Typography variant="caption" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
              {swipeIndicator.text}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Feedback */}
      <AnimatePresence>
        {actionFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {actionFeedback}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Task Card */}
      <motion.div
        style={{
          x: swipeProps.swipeDirection === 'left' ? -swipeProps.swipeDistance * 0.2 :
             swipeProps.swipeDirection === 'right' ? swipeProps.swipeDistance * 0.2 : 0,
          y: swipeProps.swipeDirection === 'up' ? -swipeProps.swipeDistance * 0.2 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Paper
          elevation={swipeProps.isSwiping ? 8 : 3}
          {...swipeProps}
          onClick={onSelect}
          sx={{
            p: 3,
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            background: task.completed 
              ? 'linear-gradient(135deg, #e8f5e8, #f1f8e9)'
              : 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            border: task.completed ? '2px solid #4caf50' : '1px solid #e0e0e0',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          {/* Completion Badge */}
          {task.completed && (
            <Box sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <CheckCircle size={20} color="#4caf50" />
              {task.score && (
                <Chip
                  label={`${task.score}%`}
                  size="small"
                  sx={{
                    bgcolor: '#4caf50',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Box>
          )}

          {/* Favorite Star */}
          {isFavorited && (
            <Star
              size={20}
              fill="#ffd700"
              color="#ffd700"
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
              }}
            />
          )}

          {/* Task Header */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a202c' }}>
                {task.name}
              </Typography>
              {task.difficulty && (
                <Chip
                  label={task.difficulty}
                  size="small"
                  sx={{
                    bgcolor: getDifficultyColor(task.difficulty),
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'capitalize',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Task Question */}
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {task.question}
          </Typography>

          {/* Hint Display */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{
                  p: 2,
                  bgcolor: '#fff3e0',
                  borderRadius: 2,
                  border: '1px solid #ffb74d',
                  mb: 2,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Lightbulb size={16} color="#ff9800" />
                    <Typography variant="caption" fontWeight="bold" color="#e65100">
                      HINT
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="#e65100">
                    Think about the key elements and be specific about style, composition, and details.
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Arrow */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            mt: 2
          }}>
            <ArrowRight size={20} color={theme.palette.primary.main} />
          </Box>

          {/* Swipe Instructions */}
          {showSwipeInstructions && (
            <Box sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '0.7rem',
              color: 'text.secondary',
              textAlign: 'center',
            }}>
              <Typography variant="caption">
                ← Hint • Favorite → • ↑ Share
              </Typography>
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default SwipeableTaskCard;