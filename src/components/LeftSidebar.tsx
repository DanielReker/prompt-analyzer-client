import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import PromptPal from '../utils/Images/prompt-pal-logo.png'
import {
  Zap,
  Calendar,
  // Sparkles,
  Image,
  // Lightbulb,
  User,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Users
} from "lucide-react";
import { useStreak } from "../contexts/StreakContext";
import "./LeftSidebar.css";

interface LeftSidebarProps {
  userName?: string;
  userInitials?: string;
  onLogout: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ userName = "Regi Loshi", userInitials = "RL", onLogout }) => {
  const location = useLocation();
  const { streakData, loading, error } = useStreak();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    return "🔥"; // Fire emoji for any active streak
  };

  const getStreakStyle = (streak: number) => {
    if (streak === 0) {
      return {
        backgroundColor: '#3b82f6', // Blue background for no streak
        color: 'white',
      };
    } else {
      return {
        backgroundColor: '#ef4444', // Red background for active streak
        color: 'white',
      };
    }
  };



  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`sidebar-fixed ${isMobile ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}
      >
        <div className="sidebar-logo-wrap">
          <img src={PromptPal} alt="Prompt Pal Logo" className="sidebar-logo" style={{ height: 58 }} />
        </div>
        <nav className="sidebar-nav">
          <Link
            className={`sidebar-link${location.pathname === "/dashboard" ? " active" : ""}`}
            to="/dashboard"
            onClick={handleLinkClick}
          >
            <Zap size={24} color="#111" /> Daily Challenge
          </Link>
          <Link
            className={`sidebar-link${location.pathname === "/calendar" ? " active" : ""}`}
            to="/calendar"
            onClick={handleLinkClick}
          >
            <Calendar size={24} color="#111" /> All Challenges
          </Link>
          <Link
            className={`sidebar-link${location.pathname === "/image-generation" ? " active" : ""}`}
            to="/image-generation"
            onClick={handleLinkClick}
          >
            <Image size={24} color="#111" />
            Image Prompts
          </Link>
        </nav>
        <div className="sidebar-stats">
          <div className="sidebar-divider">
            <span>STATS</span>
          </div>
          
          {/* Dynamic Streak Section */}
          <div 
            className="sidebar-streak"
            style={!loading && !error ? getStreakStyle(streakData?.currentStreak || 0) : {}}
          >
            {loading ? (
              <>
                <span role="img" aria-label="loading">⏳</span>
                <span>Loading streak...</span>
              </>
            ) : error ? (
              <>
                <span role="img" aria-label="error">❌</span>
                <span>Error loading streak</span>
              </>
            ) : (
              <>
                <span role="img" aria-label="streak">
                  {getStreakEmoji(streakData?.currentStreak || 0)}
                </span>
                <span>
                  {(streakData?.currentStreak || 0) === 0 
                    ? "No Streak Yet!" 
                    : `${streakData?.currentStreak} day streak!`
                  }
                </span>
              </>
            )}
          </div>
        </div>
        <div className="sidebar-community">
          <div className="sidebar-community-content">
            <div className="sidebar-community-header">
              <Users size={20} color="#6366f1" />
              <span className="sidebar-community-title">Join Our Community</span>
            </div>
            <p className="sidebar-community-description">
              Connect with over 400+ like-minded learners and get access to exclusive resources
            </p>
            <a 
              href="https://www.skool.com/pivot2tech/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="sidebar-community-btn"
            >
              <Users size={16} />
              Join Community
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{userInitials}</div>
          <div className="sidebar-user-details">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-actions">
              <Link to="/profile" className="sidebar-user-action" onClick={handleLinkClick}>
                <User size={16} color="#111" /> Profile
              </Link>
              <div className="sidebar-user-action" onClick={() => { handleLinkClick(); onLogout(); }}>
                <LogOut size={16} color="#111" /> Logout
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftSidebar; 