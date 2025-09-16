import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE, AUTH_BASE } from '../config';
import { SecureAuth } from '../components/SecureAuth';
import './ProfilePage.css';

interface ProfilePageProps {
  userId: string;
  name?: string;
  onLogout: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  dailyEmailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'password' | 'account'>('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Notification preferences state
  const [notificationForm, setNotificationForm] = useState({
    dailyEmailNotifications: true
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Delete account state
  const [deleteForm, setDeleteForm] = useState({
    confirmPassword: '',
    confirmText: ''
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/${userId}/profile`);
        const data = await response.json();
        
        if (data.success) {
          setProfile(data.data);
          setProfileForm({
            name: data.data.name || '',
            email: data.data.email || ''
          });
          setNotificationForm({
            dailyEmailNotifications: data.data.dailyEmailNotifications ?? true
          });
        } else {
          toast.error('Failed to load profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileForm)
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        toast.success('Profile updated successfully!');
        
        // Log out user if email was changed for security
        if (profileForm.email !== profile?.email) {
          toast.info('Please log in again with your new email address');
          setTimeout(() => {
            onLogout();
          }, 2000);
        }
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Update notification preferences
  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationForm)
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => prev ? { ...prev, dailyEmailNotifications: data.data.dailyEmailNotifications } : null);
        toast.success('Notification preferences updated successfully!');
      } else {
        toast.error(data.error || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setNotificationLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      const jwt = SecureAuth.getJWT();
      if (!jwt) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`${AUTH_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword,
          passwordConfirmation: passwordForm.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Update JWT token if returned
        if (data.jwt) {
          const auth = SecureAuth.getAuth();
          if (auth) {
            SecureAuth.setAuth(auth.userId, auth.name, data.jwt);
          }
        }
        
        // Log out user for security after password change
        toast.info('Please log in again with your new password');
        setTimeout(() => {
          onLogout();
        }, 2000);
      } else {
        toast.error(data.error?.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (deleteForm.confirmText !== 'DELETE MY ACCOUNT') {
      toast.error('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/${userId}/account/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmPassword: deleteForm.confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Account deleted successfully');
        // Use proper logout function instead of manual localStorage clear
        setTimeout(() => {
          onLogout();
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <div className="profile-info">
            <h1>{profile?.name || 'User'}</h1>
            <p>{profile?.email}</p>
            <div className="profile-meta">
              <span>Member since {new Date(profile?.createdAt || '').toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profile
          </button>
          <button 
            className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
          </button>
          <button 
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <Lock size={20} />
            Password
          </button>
          <button 
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <Trash2 size={20} />
            Account
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={20} />
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={20} />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Update Profile
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="tab-content">
              <h2>Notification Preferences</h2>
              <form onSubmit={handleUpdateNotifications} className="profile-form">
                <div className="notification-section">
                  <h3>Email Notifications</h3>
                  <p className="section-description">
                    Choose when you'd like to receive email notifications from Prompt Pal.
                  </p>
                  
                  <div className="notification-option">
                    <div className="notification-toggle">
                      <input
                        type="checkbox"
                        id="dailyEmailNotifications"
                        checked={notificationForm.dailyEmailNotifications}
                        onChange={(e) => setNotificationForm({ 
                          ...notificationForm, 
                          dailyEmailNotifications: e.target.checked 
                        })}
                      />
                      <label htmlFor="dailyEmailNotifications" className="toggle-label">
                        <div className="toggle-icon">
                          {notificationForm.dailyEmailNotifications ? (
                            <Bell size={20} />
                          ) : (
                            <BellOff size={20} />
                          )}
                        </div>
                        <div className="toggle-content">
                          <div className="toggle-title">Daily Task Notifications</div>
                          <div className="toggle-description">
                            Receive email notifications when new daily challenges are available
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={notificationLoading}>
                  {notificationLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Preferences
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="tab-content">
              <h2>Change Password</h2>
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <Lock size={20} />
                    Current Password
                  </label>
                  <div className="password-input">
                    <input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <Lock size={20} />
                    New Password
                  </label>
                  <div className="password-input">
                    <input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Lock size={20} />
                    Confirm New Password
                  </label>
                  <div className="password-input">
                    <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      Change Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="tab-content">
              <h2>Delete Account</h2>
              <div className="danger-zone">
                <div className="danger-warning">
                  <AlertTriangle size={24} />
                  <div>
                    <h3>Danger Zone</h3>
                    <p>Once you delete your account, there is no going back. This action cannot be undone.</p>
                  </div>
                </div>

                <form onSubmit={handleDeleteAccount} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="deletePassword">
                      <Lock size={20} />
                      Confirm Your Password
                    </label>
                    <div className="password-input">
                      <input
                        id="deletePassword"
                        type={showDeletePassword ? "text" : "password"}
                        value={deleteForm.confirmPassword}
                        onChange={(e) => setDeleteForm({ ...deleteForm, confirmPassword: e.target.value })}
                        placeholder="Enter your password to confirm"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                      >
                        {showDeletePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmText">
                      <AlertTriangle size={20} />
                      Type "DELETE MY ACCOUNT" to confirm
                    </label>
                    <input
                      id="confirmText"
                      type="text"
                      value={deleteForm.confirmText}
                      onChange={(e) => setDeleteForm({ ...deleteForm, confirmText: e.target.value })}
                      placeholder="DELETE MY ACCOUNT"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-danger" disabled={deleteLoading}>
                    {deleteLoading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={20} />
                        Delete My Account
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 