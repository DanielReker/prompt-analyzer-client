import { Box, Typography, LinearProgress, Button, Card, CardContent, Chip, Grid, useTheme, useMediaQuery, Collapse, IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
  LocalFireDepartment as FireIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { TaskResult, CriteriaData } from '../types';
import { useStreak } from '../contexts/StreakContext';
import StreakCelebrationModal from './StreakCelebrationModal';
// import AchievementSystem from './AchievementSystem';

interface TaskResultsProps {
  taskResult: TaskResult;
  criteriaData: CriteriaData;
  currentAttempts: number;
  onNextTask?: () => void;
  onSendEmail?: () => void;
  isSendingEmail?: boolean;
  userId: string;
  taskName?: string;
}

const TaskResults: React.FC<TaskResultsProps> = ({ 
  taskResult, 
  criteriaData, 
  currentAttempts, 
  onNextTask,
  onSendEmail,
  isSendingEmail,
  taskName = "Today's Challenge"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { streakData } = useStreak();
  
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [previousStreak, setPreviousStreak] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const totalScore = taskResult.criterionResults.reduce(
    (sum, criterion) => sum + criterion.score, 0
  );
  const maxPossibleScore = taskResult.criterionResults.length * 5;
  const percentageScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Check if this is a new streak record
  useEffect(() => {
    if (streakData && previousStreak !== null) {
      setIsNewRecord(streakData.currentStreak > streakData.longestStreak);
    }
    if (streakData && previousStreak === null) {
      setPreviousStreak(streakData.currentStreak - 1);
    }
  }, [streakData, previousStreak]);

  // Show celebration modal on task completion (mobile only)
  useEffect(() => {
    if (isMobile && taskResult && streakData) {
      const timer = setTimeout(() => {
        setShowCelebrationModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [taskResult, streakData, isMobile]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🎉";
    if (score >= 70) return "👏";
    if (score >= 60) return "👍";
    return "💪";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return "Outstanding!";
    if (score >= 80) return "Excellent!";
    if (score >= 70) return "Great Job!";
    if (score >= 60) return "Good Work!";
    return "Keep Trying!";
  };

  const handleNextChallenge = () => {
    setShowCelebrationModal(false);
    if (onNextTask) {
      onNextTask();
    }
  };

  return (
    <>
      <Box className="results-section" sx={{ mt: 4 }}>
        {/* Mobile-First Score Display */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <Card 
            sx={{ 
              mb: 3, 
              background: `linear-gradient(135deg, ${getScoreColor(percentageScore)}15, ${getScoreColor(percentageScore)}05)`,
              border: `2px solid ${getScoreColor(percentageScore)}40`,
              borderRadius: 3
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '3rem', md: '4rem' }, mr: 1 }}>
                  {getScoreEmoji(percentageScore)}
                </Typography>
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    color={getScoreColor(percentageScore)}
                    sx={{ fontSize: { xs: '3rem', md: '4rem' }, lineHeight: 1 }}
                  >
                    {percentageScore}%
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {getPerformanceLevel(percentageScore)}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={percentageScore}
                sx={{
                  width: '100%',
                  height: { xs: 12, md: 16 },
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: getScoreColor(percentageScore),
                    borderRadius: 2
                  }
                }}
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Score: {totalScore.toFixed(1)} / {maxPossibleScore} points • Attempt #{currentAttempts}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Streak Display for Desktop */}
        {!isMobile && streakData && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FireIcon sx={{ color: '#ff4444', fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {streakData.currentStreak} Day Streak!
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Keep the momentum going!
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    icon={<TrendingIcon />}
                    label={`Best: ${streakData.longestStreak}`}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Detailed Results (Collapsible on Mobile) */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Detailed Breakdown
              </Typography>
              {isMobile && (
                <IconButton
                  onClick={() => setShowDetailedResults(!showDetailedResults)}
                  sx={{ p: 1 }}
                >
                  {showDetailedResults ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>

            <Collapse in={!isMobile || showDetailedResults}>
              <Grid container spacing={2}>
                {taskResult.criterionResults.map((criterion, index) => (
                  <Grid item xs={12} md={6} key={criterion.criterionId}>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          height: '100%',
                          bgcolor: criterion.score >= 4 ? 'success.light' : 
                                   criterion.score >= 3 ? 'warning.light' : 'error.light',
                          color: 'white'
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold" fontSize="0.9rem">
                              {criteriaData?.[criterion.criterionId]?.name || `Criterion ${index + 1}`}
                            </Typography>
                            <Chip
                              label={`${criterion.score.toFixed(1)}/5`}
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                          
                          {criterion.subquestionResults?.map((sub) => (
                            <Box key={sub.subquestionId} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                                • {sub.feedback}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(sub.score / 5) * 100}
                                  sx={{
                                    flex: 1,
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: 'rgba(255,255,255,0.8)',
                                      borderRadius: 2
                                    }
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                  {sub.score.toFixed(1)}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          {onNextTask && (
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "large" : "medium"}
              onClick={onNextTask}
              startIcon={<TrophyIcon />}
              sx={{ 
                flex: 1,
                py: { xs: 1.5, md: 1 },
                fontWeight: 'bold',
                fontSize: { xs: '1.1rem', md: '1rem' }
              }}
            >
              Next Challenge
            </Button>
          )}
          
          {onSendEmail && (
            <Button
              variant="outlined"
              color="primary"
              size={isMobile ? "large" : "medium"}
              onClick={onSendEmail}
              disabled={isSendingEmail}
              startIcon={<ShareIcon />}
              sx={{ 
                flex: { xs: 1, md: 'auto' },
                py: { xs: 1.5, md: 1 }
              }}
            >
              {isSendingEmail ? 'Sending...' : 'Share Results'}
            </Button>
          )}
        </Box>
      </Box>

      {/* Celebration Modal (Mobile Only) */}
      <StreakCelebrationModal
        open={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        taskScore={percentageScore}
        streakData={streakData}
        taskName={taskName}
        isNewStreakRecord={isNewRecord}
        onNextChallenge={handleNextChallenge}
      />
    </>
  );
};

export default TaskResults;