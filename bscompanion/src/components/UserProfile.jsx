import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dock from './Dock';
import {
  HomeIcon,
  StatsIcon,
  SettingsIcon,
  LogoutIcon,
} from './icons';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    currentLevel: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/getuser', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        setFormData({
          name: res.data.user.name,
          city: res.data.user.city,
          currentLevel: res.data.user.currentLevel,
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.city || !formData.currentLevel) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/user/update-profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      city: user.city,
      currentLevel: user.currentLevel,
    });
    setIsEditing(false);
    setError('');
  };

  const LogoutUser = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const DOCK_ITEMS = [
    { label: 'Home', icon: <HomeIcon />, onClick: () => navigate('/dashboard') },
    { label: 'History', icon: <StatsIcon />, onClick: () => navigate('/quiz-history') },
    { label: 'Settings', icon: <SettingsIcon />, onClick: () => {} },
    { label: 'Logout', icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  if (!user) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <h3 className="loading-text">Loading profile...</h3>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1>User Profile</h1>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="profile-form">
            <div className="form-group">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              ) : (
                <div className="profile-value">{user.name}</div>
              )}
            </div>

            <div className="form-group">
              <label>City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter your city"
                />
              ) : (
                <div className="profile-value">{user.city}</div>
              )}
            </div>

            <div className="form-group">
              <label>Current Level</label>
              {isEditing ? (
                <select
                  name="currentLevel"
                  value={formData.currentLevel}
                  onChange={handleInputChange}
                >
                  <option value="Foundational">Foundational</option>
                  <option value="Diploma">Diploma</option>
                </select>
              ) : (
                <div className="profile-value">{user.currentLevel}</div>
              )}
            </div>

            <div className="form-group">
              <label>Total Subjects</label>
              <div className="profile-value">{user.subjects?.length || 0}</div>
            </div>
          </div>

          <div className="profile-actions">
            {isEditing ? (
              <>
                <button
                  className="btn btn-cancel"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-save"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                className="btn btn-edit"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default UserProfile;
