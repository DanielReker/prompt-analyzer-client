import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  refreshState: 'idle' | 'pulling' | 'ready' | 'refreshing';
  pullDistance: number;
  progressPercentage: number;
  message?: string;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  refreshState,
  pullDistance,
  progressPercentage,
  message,
  threshold = 80,
}) => {
  const getIndicatorContent = () => {
    switch (refreshState) {
      case 'pulling':
        return {
          icon: <ArrowDown size={24} />,
          color: '#667eea',
          message: message || 'Pull to refresh...',
        };
      case 'ready':
        return {
          icon: <RefreshCw size={24} />,
          color: '#22c55e',
          message: message || 'Release to refresh!',
        };
      case 'refreshing':
        return {
          icon: <CircularProgress size={24} sx={{ color: '#667eea' }} />,
          color: '#667eea',
          message: message || 'Refreshing...',
        };
      default:
        return null;
    }
  };

  const content = getIndicatorContent();

  if (!content || refreshState === 'idle') {
    return null;
  }

  const scale = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(pullDistance / (threshold * 0.5), 1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ 
          opacity,
          scale: refreshState === 'refreshing' ? 1 : scale,
          y: refreshState === 'refreshing' ? 0 : -10,
        }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30,
          duration: refreshState === 'refreshing' ? 0.3 : 0.1,
        }}
        style={{
          position: 'absolute',
          top: refreshState === 'refreshing' ? '20px' : `${Math.max(10, pullDistance - 60)}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: '12px 20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: `2px solid ${content.color}30`,
            minWidth: '140px',
          }}
        >
          {/* Icon with rotation animation */}
          <motion.div
            animate={{
              rotate: refreshState === 'ready' ? 180 : 0,
              scale: refreshState === 'ready' ? 1.2 : 1,
            }}
            transition={{ duration: 0.3 }}
            style={{ color: content.color }}
          >
            {content.icon}
          </motion.div>

          {/* Progress indicator for pulling state */}
          {refreshState === 'pulling' && (
            <Box sx={{ position: 'relative', width: 40, height: 40 }}>
              <CircularProgress
                variant="determinate"
                value={progressPercentage}
                size={40}
                thickness={3}
                sx={{
                  color: content.color,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
              <CircularProgress
                variant="determinate"
                value={100}
                size={40}
                thickness={3}
                sx={{
                  color: `${content.color}20`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </Box>
          )}

          {/* Message */}
          <Typography
            variant="caption"
            sx={{
              color: content.color,
              fontWeight: 'bold',
              fontSize: '0.8rem',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {content.message}
          </Typography>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default PullToRefreshIndicator;