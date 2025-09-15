import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import PromptPal from '../utils/Images/prompt-pal-logo.png'
import {
  Zap,
  Calendar,
  Image,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Users,
  TrendingUp,
  Target
} from "lucide-react";
import { useStreak } from "../contexts/StreakContext";
import "./LeftSidebar.css";

interface LeftSidebarProps {
  userName?: string;
  userInitials?: string;
  onLogout: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  userName = "User", 
  userInitials = "U", 
  onLogout 
}) => {
  const location = useLocation();
  const { streakData, loading, error } = useStreak();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const prevStreakRef = useRef<number | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Animate streak changes
  useEffect(() => {
    if (streakData && prevStreakRef.current !== null && streakData.currentStreak > prevStreakRef.current) {
      setShowStreakAnimation(true);
      setTimeout(() => setShowStreakAnimation(false), 2000);
    }
    if (streakData) {
      prevStreakRef.current = streakData.currentStreak;
    }
  }, [streakData]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isMobileMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return "🥶";
    if (streak < 3) return "🔥";
    if (streak < 7) return "🔥🔥";
    if (streak < 14) return "🔥🔥🔥";
    if (streak < 30) return "🔥🔥🔥🔥";
    return "🔥🔥🔥🔥🔥";
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return "#3b82f6";
    if (streak < 7) return "#ef4444";
    if (streak < 14) return "#f97316";
    if (streak < 30) return "#eab308";
    return "#22c55e";
  };

  const getStreakTitle = (streak: number) => {
    if (streak === 0) return "Start Your Journey!";
    if (streak < 7) return "Building Momentum";
    if (streak < 14) return "On Fire!";
    if (streak < 30) return "Unstoppable!";
    return "Legendary!";
  };

  const getNextMilestone = (streak: number) => {
    if (streak < 7) return 7;
    if (streak < 14) return 14;
    if (streak < 30) return 30;
    if (streak < 60) return 60;
    if (streak < 100) return 100;
    return Math.ceil((streak + 1) / 100) * 100;
  };

  const getMilestoneProgress = (streak: number) => {
    const nextMilestone = getNextMilestone(streak);
    let previousMilestone = 0;
    
    if (nextMilestone === 7) previousMilestone = 0;
    else if (nextMilestone === 14) previousMilestone = 7;
    else if (nextMilestone === 30) previousMilestone = 14;
    else if (nextMilestone === 60) previousMilestone = 30;
    else if (nextMilestone === 100) previousMilestone = 60;
    else previousMilestone = Math.floor(streak / 100) * 100;
    
    return ((streak - previousMilestone) / (nextMilestone - previousMilestone)) * 100;
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          style={{
            background: isMobileMenuOpen ? '#764ba2' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white',
            transform: isMobileMenuOpen ? 'scale(0.95)' : 'scale(1)',
            transition: 'all 0.2s ease'
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`sidebar-fixed ${isMobile ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}
        style={{
          transform: isMobile ? (isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {/* Logo Section */}
        <div className="sidebar-logo-wrap">
          <img 
            src={PromptPal} 
            alt="Prompt Pal Logo" 
            className="sidebar-logo" 
            style={{ 
              height: 58,
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <Link
            className={`sidebar-link${location.pathname === "/dashboard" ? " active" : ""}`}
            to="/dashboard"
            onClick={handleLinkClick}
            style={{
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <Zap size={24} color="#111" /> Daily Challenge
          </Link>
          
          <Link
            className={`sidebar-link${location.pathname === "/calendar" ? " active" : ""}`}
            to="/calendar"
            onClick={handleLinkClick}
            style={{
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <Calendar size={24} color="#111" /> All Challenges
          </Link>
          
          <Link
            className={`sidebar-link${location.pathname === "/image-generation" ? " active" : ""}`}
            to="/image-generation"
            onClick={handleLinkClick}
            style={{
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(4px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <Image size={24} color="#111" /> Image Prompts
          </Link>
        </nav>

        {/* Enhanced Stats Section */}
        <div className="sidebar-stats">
          <div className="sidebar-divider">
            <span>YOUR PROGRESS</span>
          </div>
          
          {/* Enhanced Streak Display */}
          <div
            style={{
              opacity: loading ? 0.7 : 1,
              transform: showStreakAnimation ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <div 
                style={{ 
                  background: '#f8fafc', 
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span 
                    style={{ 
                      fontSize: '1.5rem',
                      animation: 'spin 1s linear infinite'
                    }}
                  >
                    ⏳
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                    Loading streak...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div 
                style={{ 
                  background: '#fee2e2', 
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  border: '1px solid #fca5a5'
                }}
              >
                <span style={{ fontSize: '0.9rem', color: '#dc2626' }}>
                  ❌ Error loading streak
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: `linear-gradient(135deg, ${getStreakColor(streakData?.currentStreak || 0)}15, ${getStreakColor(streakData?.currentStreak || 0)}05)`,
                  border: `2px solid ${getStreakColor(streakData?.currentStreak || 0)}40`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  marginBottom: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {showStreakAnimation && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      zIndex: 1,
                      animation: 'shimmer 0.8s ease-out'
                    }}
                  />
                )}
                
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '2rem',
                        animation: showStreakAnimation ? 'bounce 0.6s ease' : 'pulse 2s infinite'
                      }}
                    >
                      {getStreakEmoji(streakData?.currentStreak || 0)}
                    </span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: getStreakColor(streakData?.currentStreak || 0),
                        lineHeight: 1
                      }}>
                        {streakData?.currentStreak || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        day streak
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    {getStreakTitle(streakData?.currentStreak || 0)}
                  </div>

                  {streakData && streakData.currentStreak > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        marginBottom: '4px' 
                      }}>
                        Next milestone: {getNextMilestone(streakData.currentStreak)} days
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${getMilestoneProgress(streakData.currentStreak)}%`,
                          height: '100%',
                          backgroundColor: getStreakColor(streakData.currentStreak),
                          borderRadius: '3px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          {streakData && !loading && !error && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '16px',
                opacity: 0,
                animation: 'slideUp 0.5s ease 0.2s forwards'
              }}
            >
              <div style={{
                background: '#f0f9ff',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #e0f2fe',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <TrendingUp size={20} color="#0369a1" style={{ marginBottom: '4px' }} />
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: '#0369a1',
                  lineHeight: 1
                }}>
                  {streakData.longestStreak}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Best
                </div>
              </div>
              
              <div style={{
                background: '#f0fdf4',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #dcfce7',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Target size={20} color="#16a34a" style={{ marginBottom: '4px' }} />
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: '#16a34a',
                  lineHeight: 1
                }}>
                  {streakData.completedTasks}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Total
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Section */}
        <div 
          className="sidebar-community"
          style={{
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div className="sidebar-community-content">
            <div className="sidebar-community-header">
              <Users size={20} />
              <span className="sidebar-community-title">Join Our Community</span>
            </div>
            
            <p className="sidebar-community-description">
              Connect with 400+ learners and get exclusive resources
            </p>
            
            <a 
              href="https://www.skool.com/pivot2tech/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="sidebar-community-btn"
              style={{
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Users size={16} />
              Join Community
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* User Section */}
        <div className="sidebar-user">
          <div 
            className="sidebar-user-avatar"
            style={{
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {userInitials}
          </div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-actions">
              <Link 
                to="/profile" 
                className="sidebar-user-action" 
                onClick={handleLinkClick}
                style={{ transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <User size={16} color="#111" /> Profile
              </Link>
              <div 
                className="sidebar-user-action" 
                onClick={() => { handleLinkClick(); onLogout(); }}
                style={{ 
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <LogOut size={16} color="#111" /> Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          25% { 
            transform: scale(1.1) rotate(5deg);
          }
          50% { 
            transform: scale(1.2) rotate(0deg);
          }
          75% { 
            transform: scale(1.1) rotate(-5deg);
          }
        }

        @keyframes bounce {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
          }
          25% { 
            transform: scale(1.2) rotate(10deg);
          }
          50% { 
            transform: scale(1.3) rotate(0deg);
          }
          75% { 
            transform: scale(1.2) rotate(-10deg);
          }
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default LeftSidebar;