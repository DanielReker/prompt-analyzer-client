// // src/components/MobileDashboard.tsx
// import React, { useState, useEffect } from 'react';
// import { Box, Typography, Fab, Snackbar, Alert } from '@mui/material';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';
// import SwipeableTaskCard from './SwipeableTaskCard';
// import { useSwipeGestures } from '../hooks/useSwipeGestures';

// interface Task {
//   id: string;
//   name: string;
//   question: string;
//   difficulty?: 'easy' | 'medium' | 'hard';
//   completed?: boolean;
//   score?: number;
//   Image?: Array<{
//     imageQuestion?: {
//       formats?: {
//         thumbnail?: { url: string };
//       };
//     };
//   }>;
// }

// interface MobileDashboardProps {
//   tasks: Task[];
//   currentTaskIndex: number;
//   onTaskChange: (index: number) => void;
//   onTaskSelect: (task: Task) => void;
//   streakData?: {
//     currentStreak: number;
//     longestStreak: number;
//     completedTasks: number;
//   } | undefined;
// }

// const MobileDashboard: React.FC<MobileDashboardProps> = ({
//   tasks,
//   currentTaskIndex,
//   onTaskChange,
//   onTaskSelect,
//   streakData
// }) => {
//   const [showInstructions, setShowInstructions] = useState(false);
//   const [swipeHint, setSwipeHint] = useState<string | null>(null);

//   // Show instructions for first-time users
//   useEffect(() => {
//     const hasSeenInstructions = localStorage.getItem('hasSeenSwipeInstructions');
//     if (!hasSeenInstructions) {
//       setShowInstructions(true);
//       setTimeout(() => {
//         setShowInstructions(false);
//         localStorage.setItem('hasSeenSwipeInstructions', 'true');
//       }, 3000);
//     }
//   }, []);

//   // Swipe between tasks
//   const taskSwipeProps = useSwipeGestures({
//     onSwipeLeft: () => {
//       if (currentTaskIndex < tasks.length - 1) {
//         onTaskChange(currentTaskIndex + 1);
//         setSwipeHint('Next task!');
//         setTimeout(() => setSwipeHint(null), 1000);
//       }
//     },
//     onSwipeRight: () => {
//       if (currentTaskIndex > 0) {
//         onTaskChange(currentTaskIndex - 1);
//         setSwipeHint('Previous task!');
//         setTimeout(() => setSwipeHint(null), 1000);
//       }
//     },
//     threshold: 100,
//   });

//   const currentTask = tasks[currentTaskIndex];

//   const handleShowHint = () => {
//     // This would trigger hint display logic
//     console.log('Show hint for task:', currentTask.id);
//   };

//   const handleToggleFavorite = () => {
//     // This would toggle favorite status
//     console.log('Toggle favorite for task:', currentTask.id);
//   };

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: `Prompt Pal Challenge: ${currentTask.name}`,
//           text: currentTask.question,
//           url: window.location.href,
//         });
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       } catch (error) {
//         console.log('Share cancelled or failed');
//       }
//     } else {
//       // Fallback for browsers without native sharing
//       if (navigator.clipboard) {
//         await navigator.clipboard.writeText(
//           `Check out this Prompt Pal challenge: ${currentTask.name}\n\n${currentTask.question}\n\n${window.location.href}`
//         );
//         setSwipeHint('Link copied to clipboard!');
//         setTimeout(() => setSwipeHint(null), 2000);
//       }
//     }
//   };

//   return (
//     <Box className="mobile-dashboard-container">
//       {/* Enhanced Header with Swipe Hints */}
//       <Box className="mobile-dashboard-header" sx={{ position: 'relative' }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <Zap size={24} color="#667eea" />
//           <Typography variant="h6" fontWeight="bold" color="#667eea">
//             Daily Challenge
//           </Typography>
//         </Box>
        
//         {/* Task Navigation Indicators */}
//         <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//           {tasks.map((_, index) => (
//             <Box
//               key={index}
//               sx={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: '50%',
//                 bgcolor: index === currentTaskIndex ? '#667eea' : '#e0e0e0',
//                 transition: 'all 0.3s ease',
//               }}
//             />
//           ))}
//         </Box>

//         {/* Swipe Navigation Arrows */}
//         <Box sx={{ 
//           position: 'absolute',
//           top: '50%',
//           left: 0,
//           right: 0,
//           transform: 'translateY(-50%)',
//           display: 'flex',
//           justifyContent: 'space-between',
//           pointerEvents: 'none',
//           px: 2,
//         }}>
//           {currentTaskIndex > 0 && (
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 0.5, x: 0 }}
//               style={{ pointerEvents: 'auto' }}
//             >
//               <ArrowLeft size={20} color="#667eea" />
//             </motion.div>
//           )}
//           {currentTaskIndex < tasks.length - 1 && (
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 0.5, x: 0 }}
//               style={{ pointerEvents: 'auto', marginLeft: 'auto' }}
//             >
//               <ArrowRight size={20} color="#667eea" />
//             </motion.div>
//           )}
//         </Box>
//       </Box>

//       {/* Stats Bar */}
//       {streakData && (
//         <div className="mobile-stats-bar">
//           <div className="mobile-stat-card" style={{ '--accent-color': '#ef4444' } as React.CSSProperties}>
//             <span className="mobile-stat-icon">🔥</span>
//             <div className="mobile-stat-value">{streakData.currentStreak}</div>
//             <div className="mobile-stat-label">Day Streak</div>
//           </div>
//           <div className="mobile-stat-card" style={{ '--accent-color': '#22c55e' } as React.CSSProperties}>
//             <span className="mobile-stat-icon">🏆</span>
//             <div className="mobile-stat-value">{streakData.longestStreak}</div>
//             <div className="mobile-stat-label">Best</div>
//           </div>
//           <div className="mobile-stat-card" style={{ '--accent-color': '#3b82f6' } as React.CSSProperties}>
//             <span className="mobile-stat-icon">📝</span>
//             <div className="mobile-stat-value">{streakData.completedTasks}</div>
//             <div className="mobile-stat-label">Total</div>
//           </div>
//         </div>
//       )}

//       {/* Swipeable Task Container */}
//       <Box 
//         {...taskSwipeProps}
//         sx={{ 
//           flex: 1, 
//           overflow: 'hidden',
//           position: 'relative',
//           px: 2,
//         }}
//       >
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentTaskIndex}
//             initial={{ x: 300, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             exit={{ x: -300, opacity: 0 }}
//             transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//           >
//             {currentTask && (
//               <SwipeableTaskCard
//                 task={currentTask}
//                 onShowHint={handleShowHint}
//                 onToggleFavorite={handleToggleFavorite}
//                 onShare={handleShare}
//                 onSelect={() => onTaskSelect(currentTask)}
//                 showSwipeInstructions={showInstructions}
//               />
//             )}
//           </motion.div>
//         </AnimatePresence>
//       </Box>

//       {/* Floating Action Button */}
//       <Fab
//         color="primary"
//         sx={{
//           position: 'fixed',
//           bottom: 24,
//           right: 24,
//           background: 'linear-gradient(135deg, #667eea, #764ba2)',
//           zIndex: 1000,
//         }}
//         onClick={() => onTaskSelect(currentTask)}
//       >
//         <Zap size={24} />
//       </Fab>

//       {/* Swipe Hints and Instructions */}
//       <Snackbar
//         open={!!swipeHint}
//         autoHideDuration={1500}
//         onClose={() => setSwipeHint(null)}
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//       >
//         <Alert severity="info" variant="filled" sx={{ fontWeight: 'bold' }}>
//           {swipeHint}
//         </Alert>
//       </Snackbar>

//       {/* First-time Instructions */}
//       <Snackbar
//         open={showInstructions}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert 
//           severity="info" 
//           variant="filled"
//           sx={{ 
//             bgcolor: '#667eea',
//             color: 'white',
//             fontWeight: 'bold',
//             borderRadius: 3,
//           }}
//         >
//           💡 Swipe left for hints, right for favorites, up to share!
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default MobileDashboard;

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Fab, Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import SwipeableTaskCard from './SwipeableTaskCard';
import PullToRefreshIndicator from './PullToRefreshIndicator';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { usePullToRefreshWithFeedback } from '../hooks/usePulltoRefresh';

interface Task {
  id: string;
  name: string;
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  score?: number;
  Image?: Array<{
    imageQuestion?: {
      formats?: {
        thumbnail?: { url: string };
      };
    };
  }>;
}

interface MobileDashboardProps {
  tasks: Task[];
  currentTaskIndex: number;
  onTaskChange: (index: number) => void;
  onTaskSelect: (task: Task) => void;
  onRefresh: () => Promise<void>;
  streakData?: {
    currentStreak: number;
    longestStreak: number;
    completedTasks: number;
  } | undefined;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  tasks,
  currentTaskIndex,
  onTaskChange,
  onTaskSelect,
  onRefresh,
  streakData
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [swipeHint, setSwipeHint] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Show instructions for first-time users
  useEffect(() => {
    const hasSeenInstructions = localStorage.getItem('hasSeenSwipeInstructions');
    const hasSeenRefreshInstructions = localStorage.getItem('hasSeenRefreshInstructions');
    
    if (!hasSeenInstructions || !hasSeenRefreshInstructions) {
      setShowInstructions(true);
      setTimeout(() => {
        setShowInstructions(false);
        localStorage.setItem('hasSeenSwipeInstructions', 'true');
        localStorage.setItem('hasSeenRefreshInstructions', 'true');
      }, 4000);
    }
  }, []);

  // Enhanced refresh function with feedback
  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 2000);
    } catch (error) {
      console.error('Refresh failed:', error);
      // You could show an error message here
    }
  }, [onRefresh]);

  // Pull to refresh setup
  const pullToRefreshProps = usePullToRefreshWithFeedback({
    onRefresh: handleRefresh,
    threshold: 80,
    maxDistance: 120,
    resistance: 0.6,
    showVisualFeedback: true,
    customMessages: {
      pulling: 'Pull to refresh tasks...',
      ready: 'Release to refresh!',
      refreshing: 'Getting latest data...',
    },
  });

  // Swipe between tasks (disabled while pulling to refresh)
  const taskSwipeProps = useSwipeGestures({
    onSwipeLeft: () => {
      if (!pullToRefreshProps.isPulling && !pullToRefreshProps.isRefreshing) {
        if (currentTaskIndex < tasks.length - 1) {
          onTaskChange(currentTaskIndex + 1);
          setSwipeHint('Next task!');
          setTimeout(() => setSwipeHint(null), 1000);
        }
      }
    },
    onSwipeRight: () => {
      if (!pullToRefreshProps.isPulling && !pullToRefreshProps.isRefreshing) {
        if (currentTaskIndex > 0) {
          onTaskChange(currentTaskIndex - 1);
          setSwipeHint('Previous task!');
          setTimeout(() => setSwipeHint(null), 1000);
        }
      }
    },
    threshold: 100,
  });

  const currentTask = tasks[currentTaskIndex];

  const handleShowHint = () => {
    console.log('Show hint for task:', currentTask.id);
  };

  const handleToggleFavorite = () => {
    console.log('Toggle favorite for task:', currentTask.id);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Prompt Pal Challenge: ${currentTask.name}`,
          text: currentTask.question,
          url: window.location.href,
        });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback for browsers without native sharing
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `Check out this Prompt Pal challenge: ${currentTask.name}\n\n${currentTask.question}\n\n${window.location.href}`
        );
        setSwipeHint('Link copied to clipboard!');
        setTimeout(() => setSwipeHint(null), 2000);
      }
    }
  };

  return (
    <Box 
      className="mobile-dashboard-container"
      ref={pullToRefreshProps.containerRef}
      {...pullToRefreshProps}
      sx={{ 
        position: 'relative',
        touchAction: pullToRefreshProps.isPulling ? 'none' : 'pan-x pan-y',
        overflowY: 'auto',
        height: '100vh',
      }}
    >
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        refreshState={pullToRefreshProps.refreshState as 'refreshing' | 'ready' | 'pulling' | 'idle'}
        pullDistance={pullToRefreshProps.pullDistance}
        progressPercentage={pullToRefreshProps.progressPercentage}
        message={pullToRefreshProps.feedbackMessage}
      />

      {/* Enhanced Header with Refresh Status */}
      <Box 
        className="mobile-dashboard-header" 
        sx={{ 
          position: 'relative',
          transform: pullToRefreshProps.isRefreshing 
            ? 'translateY(60px)' 
            : `translateY(${Math.min(pullToRefreshProps.pullDistance * 0.3, 20)}px)`,
          transition: pullToRefreshProps.isRefreshing 
            ? 'transform 0.3s ease' 
            : 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Zap size={24} color="#667eea" />
          <Typography variant="h6" fontWeight="bold" color="#667eea">
            Daily Challenge
          </Typography>
          
          {/* Refresh icon when refreshing */}
          {pullToRefreshProps.isRefreshing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={16} color="#667eea" />
            </motion.div>
          )}
        </Box>
        
        {/* Task Navigation Indicators */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {tasks.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: index === currentTaskIndex ? '#667eea' : '#e0e0e0',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>

        {/* Swipe Navigation Arrows */}
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          px: 2,
        }}>
          {currentTaskIndex > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.5, x: 0 }}
              style={{ pointerEvents: 'auto' }}
            >
              <ArrowLeft size={20} color="#667eea" />
            </motion.div>
          )}
          {currentTaskIndex < tasks.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 0.5, x: 0 }}
              style={{ pointerEvents: 'auto', marginLeft: 'auto' }}
            >
              <ArrowRight size={20} color="#667eea" />
            </motion.div>
          )}
        </Box>
      </Box>

      {/* Stats Bar */}
      {streakData && (
        <div 
          className="mobile-stats-bar"
          style={{
            transform: pullToRefreshProps.isRefreshing 
              ? 'translateY(60px)' 
              : `translateY(${Math.min(pullToRefreshProps.pullDistance * 0.2, 15)}px)`,
            transition: pullToRefreshProps.isRefreshing 
              ? 'transform 0.3s ease' 
              : 'none',
          }}
        >
          <div className="mobile-stat-card" style={{ '--accent-color': '#ef4444' } as React.CSSProperties}>
            <span className="mobile-stat-icon">🔥</span>
            <div className="mobile-stat-value">{streakData.currentStreak}</div>
            <div className="mobile-stat-label">Day Streak</div>
          </div>
          <div className="mobile-stat-card" style={{ '--accent-color': '#22c55e' } as React.CSSProperties}>
            <span className="mobile-stat-icon">🏆</span>
            <div className="mobile-stat-value">{streakData.longestStreak}</div>
            <div className="mobile-stat-label">Best</div>
          </div>
          <div className="mobile-stat-card" style={{ '--accent-color': '#3b82f6' } as React.CSSProperties}>
            <span className="mobile-stat-icon">📝</span>
            <div className="mobile-stat-value">{streakData.completedTasks}</div>
            <div className="mobile-stat-label">Total</div>
          </div>
        </div>
      )}

      {/* Swipeable Task Container */}
      <Box 
        {...taskSwipeProps}
        sx={{ 
          flex: 1, 
          overflow: 'hidden',
          position: 'relative',
          px: 2,
          transform: pullToRefreshProps.isRefreshing 
            ? 'translateY(60px)' 
            : `translateY(${Math.min(pullToRefreshProps.pullDistance * 0.1, 10)}px)`,
          transition: pullToRefreshProps.isRefreshing 
            ? 'transform 0.3s ease' 
            : 'none',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTaskIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {currentTask && (
              <SwipeableTaskCard
                task={currentTask}
                onShowHint={handleShowHint}
                onToggleFavorite={handleToggleFavorite}
                onShare={handleShare}
                onSelect={() => onTaskSelect(currentTask)}
                showSwipeInstructions={showInstructions}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          zIndex: 1000,
        }}
        onClick={() => onTaskSelect(currentTask)}
      >
        <Zap size={24} />
      </Fab>

      {/* Success Message */}
      <Snackbar
        open={refreshSuccess}
        autoHideDuration={2000}
        onClose={() => setRefreshSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontWeight: 'bold' }}>
          ✨ Tasks refreshed successfully!
        </Alert>
      </Snackbar>

      {/* Swipe Hints */}
      <Snackbar
        open={!!swipeHint}
        autoHideDuration={1500}
        onClose={() => setSwipeHint(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" sx={{ fontWeight: 'bold' }}>
          {swipeHint}
        </Alert>
      </Snackbar>

      {/* Enhanced First-time Instructions */}
      <Snackbar
        open={showInstructions}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled"
          sx={{ 
            bgcolor: '#667eea',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 3,
            maxWidth: '90vw',
          }}
        >
          💡 Pull down to refresh • Swipe ← → for tasks • ↑ for hints!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileDashboard;