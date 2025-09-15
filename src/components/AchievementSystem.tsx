import React, { useState, useEffect } from 'react';

// Define proper types for achievements
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  type: 'streak' | 'tasks' | 'score' | 'high-scores' | 'special';
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completedTasks: number;
}

interface AchievementSystemProps {
  streakData: StreakData;
  recentScore?: number;
  onClose?: () => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  emoji: string;
  color: string;
}

// Achievement definitions with proper typing
const ACHIEVEMENTS: Record<string, Achievement> = {
  'first-streak': {
    id: 'first-streak',
    title: 'Getting Started',
    description: 'Complete your first daily challenge',
    icon: '🌟',
    color: '#22c55e',
    requirement: 1,
    type: 'streak'
  },
  'week-warrior': {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    color: '#f59e0b',
    requirement: 7,
    type: 'streak'
  },
  'monthly-master': {
    id: 'monthly-master',
    title: 'Monthly Master',
    description: 'Achieve a 30-day streak',
    icon: '👑',
    color: '#8b5cf6',
    requirement: 30,
    type: 'streak'
  },
  'century-club': {
    id: 'century-club',
    title: 'Century Club',
    description: 'Reach 100 completed tasks',
    icon: '💯',
    color: '#3b82f6',
    requirement: 100,
    type: 'tasks'
  },
  'perfectionist': {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% on a challenge',
    icon: '✨',
    color: '#ec4899',
    requirement: 100,
    type: 'score'
  },
  'high-achiever': {
    id: 'high-achiever',
    title: 'High Achiever',
    description: 'Score above 90% on 5 challenges',
    icon: '🎯',
    color: '#10b981',
    requirement: 5,
    type: 'high-scores'
  },
  'early-bird': {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Complete a challenge before 9 AM',
    icon: '🌅',
    color: '#f97316',
    requirement: 1,
    type: 'special'
  },
  'comeback-kid': {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Restart your streak after losing it',
    icon: '💪',
    color: '#ef4444',
    requirement: 1,
    type: 'special'
  }
};

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  streakData = { currentStreak: 7, longestStreak: 15, completedTasks: 23 }, 
  recentScore = 95}) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['first-streak', 'week-warrior']);
  const [newAchievement, setNewAchievement] = useState<string | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);

  // Generate confetti particles
  useEffect(() => {
    if (newAchievement) {
      const particles: ConfettiParticle[] = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 400,
        y: -50,
        rotation: Math.random() * 360,
        emoji: ['🎉', '⭐', '🔥', '🏆', '💫'][i % 5],
        color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5]
      }));
      setConfetti(particles);
      
      const timer = setTimeout(() => setConfetti([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [newAchievement]);

  // Check for new achievements
  useEffect(() => {
    const checkAchievements = () => {
      const newUnlocked: string[] = [];

      // Check streak achievements
      if (streakData.currentStreak >= 1 && !unlockedAchievements.includes('first-streak')) {
        newUnlocked.push('first-streak');
      }
      if (streakData.currentStreak >= 7 && !unlockedAchievements.includes('week-warrior')) {
        newUnlocked.push('week-warrior');
      }
      if (streakData.currentStreak >= 30 && !unlockedAchievements.includes('monthly-master')) {
        newUnlocked.push('monthly-master');
      }

      // Check task completion achievements
      if (streakData.completedTasks >= 100 && !unlockedAchievements.includes('century-club')) {
        newUnlocked.push('century-club');
      }

      // Check score achievements
      if (recentScore === 100 && !unlockedAchievements.includes('perfectionist')) {
        newUnlocked.push('perfectionist');
      }

      // Update unlocked achievements
      if (newUnlocked.length > 0) {
        setUnlockedAchievements(prev => [...prev, ...newUnlocked]);
        // Show the first new achievement
        setNewAchievement(newUnlocked[0]);
      }

      // Simulate unlocking an achievement for demo (remove in production)
      if (Math.random() > 0.7 && !newAchievement && unlockedAchievements.length < 6) {
        const availableAchievements = Object.keys(ACHIEVEMENTS).filter(
          id => !unlockedAchievements.includes(id)
        );
        if (availableAchievements.length > 0) {
          const randomAchievement = availableAchievements[Math.floor(Math.random() * availableAchievements.length)];
          setNewAchievement(randomAchievement);
          setUnlockedAchievements(prev => [...prev, randomAchievement]);
        }
      }
    };

    const timer = setTimeout(checkAchievements, 1000);
    return () => clearTimeout(timer);
  }, [streakData, recentScore, unlockedAchievements, newAchievement]);

  const getAchievementProgress = (achievement: Achievement): number => {
    switch (achievement.type) {
      case 'streak':
        return Math.min((streakData.currentStreak / achievement.requirement) * 100, 100);
      case 'tasks':
        return Math.min((streakData.completedTasks / achievement.requirement) * 100, 100);
      case 'score':
        return unlockedAchievements.includes(achievement.id) ? 100 : 0;
      case 'high-scores':
        // This would need additional data tracking in a real implementation
        return Math.min((recentScore && recentScore >= 90 ? 20 : 0), 100);
      case 'special':
        return unlockedAchievements.includes(achievement.id) ? 100 : 0;
      default:
        return 0;
    }
  };

  const shareAchievement = (achievement: Achievement, platform: 'twitter' | 'whatsapp'): void => {
    const shareText = `🎉 Just unlocked "${achievement.title}" on Prompt Pal! ${achievement.icon}\n\n${achievement.description}\n\nJoin me in improving your prompt engineering skills!`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText)}`
    };
    
    // Open share URL in new window
    window.open(urls[platform], '_blank', 'width=550,height=420');
  };

  // Fixed CSS styles with proper TypeScript types
  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    modal: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      padding: '2rem',
      color: 'white',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center' as const,
      position: 'relative' as const,
      overflow: 'hidden'
    },
    confettiContainer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none' as const,
      overflow: 'hidden'
    },
    confettiParticle: {
      position: 'absolute' as const,
      fontSize: '20px',
      animation: 'fall 3s ease-out forwards'
    },
    closeButton: {
      position: 'absolute' as const,
      top: '15px',
      right: '15px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    achievementIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      display: 'block',
      animation: 'bounce 1s ease-out'
    },
    shareButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      margin: '20px 0'
    },
    shareButton: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease'
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px'
    },
    button: {
      flex: 1,
      padding: '12px 24px',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '16px',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      backdropFilter: 'blur(10px)'
    },
    secondaryButton: {
      background: 'transparent',
      color: 'white',
      border: '2px solid rgba(255, 255, 255, 0.5)'
    },
    allAchievementsModal: {
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto',
      color: '#333'
    },
    achievementsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    achievementCard: {
      border: '1px solid #e0e0e0',
      borderRadius: '15px',
      padding: '20px',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    unlockedCard: {
      borderColor: '#22c55e',
      borderWidth: '2px',
      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
    },
    lockedCard: {
      opacity: 0.6
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: 'rgba(0,0,0,0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '10px'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    fab: {
      position: 'fixed' as const,
      bottom: '20px',
      left: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ff6600, #ff9800)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(255, 102, 0, 0.3)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    },
    achievementBadge: {
      position: 'absolute' as const,
      top: '-8px',
      right: '-8px',
      background: '#ff4444',
      color: 'white',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid white'
    }
  };

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes fall {
          0% { 
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% { 
            transform: translateY(600px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translateY(0);
          }
          40%, 43% {
            transform: translateY(-15px);
          }
          70% {
            transform: translateY(-7px);
          }
          90% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes slideIn {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          100% { 
            transform: translateX(0);
            opacity: 1;
          }
        }

        .achievement-card {
          animation: slideIn 0.5s ease-out;
        }

        .achievement-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .share-button:hover {
          transform: scale(1.1);
        }

        .fab:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(255, 102, 0, 0.4);
        }

        .primary-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .secondary-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: white;
        }

        @media (max-width: 768px) {
          .achievements-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .modal {
            padding: 1.5rem;
            margin: 10px;
          }
          
          .all-achievements-modal {
            padding: 1.5rem;
            margin: 10px;
            max-height: 90vh;
          }
        }
      `}</style>

      {/* New Achievement Celebration Modal */}
      {newAchievement && ACHIEVEMENTS[newAchievement] && (
        <div style={styles.overlay} onClick={() => setNewAchievement(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Confetti Animation */}
            <div style={styles.confettiContainer}>
              {confetti.map((particle) => (
                <div
                  key={particle.id}
                  style={{
                    ...styles.confettiParticle,
                    left: `${particle.x}px`,
                    color: particle.color,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  {particle.emoji}
                </div>
              ))}
            </div>

            <button 
              style={styles.closeButton}
              onClick={() => setNewAchievement(null)}
              aria-label="Close achievement modal"
            >
              ✕
            </button>

            <div style={styles.achievementIcon}>
              {ACHIEVEMENTS[newAchievement].icon}
            </div>
            
            <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: 'bold' }}>
              Achievement Unlocked!
            </h2>
            
            <h3 style={{ margin: '0 0 10px 0', opacity: 0.9, fontSize: '1.5rem' }}>
              {ACHIEVEMENTS[newAchievement].title}
            </h3>
            
            <p style={{ margin: '0 0 20px 0', opacity: 0.8, fontSize: '1.1rem', lineHeight: '1.4' }}>
              {ACHIEVEMENTS[newAchievement].description}
            </p>

            <div style={styles.shareButtons}>
              <button
                style={{...styles.shareButton, backgroundColor: '#1DA1F2'}}
                onClick={() => shareAchievement(ACHIEVEMENTS[newAchievement], 'twitter')}
                className="share-button"
                title="Share on Twitter"
              >
                🐦
              </button>
              <button
                style={{...styles.shareButton, backgroundColor: '#25D366'}}
                onClick={() => shareAchievement(ACHIEVEMENTS[newAchievement], 'whatsapp')}
                className="share-button"
                title="Share on WhatsApp"
              >
                💬
              </button>
            </div>

            <div style={styles.actionButtons}>
              <button
                style={{...styles.button, ...styles.primaryButton}}
                className="primary-button"
                onClick={() => {
                  setNewAchievement(null);
                  setShowAllAchievements(true);
                }}
              >
                🏆 View All Achievements
              </button>
              <button
                style={{...styles.button, ...styles.secondaryButton}}
                className="secondary-button"
                onClick={() => setNewAchievement(null)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Achievements View */}
      {showAllAchievements && (
        <div style={styles.overlay} onClick={() => setShowAllAchievements(false)}>
          <div 
            style={styles.allAchievementsModal} 
            className="all-achievements-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                🏆 Your Achievements
              </h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowAllAchievements(false)}
                aria-label="Close achievements modal"
              >
                ✕
              </button>
            </div>

            <div 
              style={styles.achievementsGrid}
              className="achievements-grid"
            >
              {Object.values(ACHIEVEMENTS).map((achievement, index) => {
                const isUnlocked = unlockedAchievements.includes(achievement.id);
                const progress = getAchievementProgress(achievement);

                return (
                  <div 
                    key={achievement.id}
                    className="achievement-card"
                    style={{
                      ...styles.achievementCard,
                      ...(isUnlocked ? styles.unlockedCard : styles.lockedCard),
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '2rem', marginRight: '15px' }}>
                        {achievement.icon}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {achievement.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666', lineHeight: '1.4' }}>
                          {achievement.description}
                        </p>
                      </div>
                      {isUnlocked && (
                        <span style={{
                          backgroundColor: achievement.color,
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          Unlocked
                        </span>
                      )}
                    </div>
                    
                    {!isUnlocked && (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '5px',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div style={styles.progressBar}>
                          <div 
                            style={{
                              ...styles.progressFill,
                              width: `${progress}%`,
                              backgroundColor: achievement.color
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {isUnlocked && (
                      <div style={{
                        position: 'absolute' as const,
                        top: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        borderTop: `30px solid ${achievement.color}`,
                        borderLeft: '30px solid transparent'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', textAlign: 'center' as const }}>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '1rem' }}>
                {unlockedAchievements.length} of {Object.keys(ACHIEVEMENTS).length} achievements unlocked
              </p>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${(unlockedAchievements.length / Object.keys(ACHIEVEMENTS).length) * 100}%`,
                    backgroundColor: '#22c55e'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Achievement Button */}
      <button
        style={{
          ...styles.fab,
          position: 'relative' as const
        }}
        className="fab"
        onClick={() => setShowAllAchievements(true)}
        title="View Achievements"
      >
        🏆
        {/* Achievement count badge */}
        {unlockedAchievements.length > 0 && (
          <span style={styles.achievementBadge}>
            {unlockedAchievements.length}
          </span>
        )}
      </button>
    </>
  );
};

export default AchievementSystem;