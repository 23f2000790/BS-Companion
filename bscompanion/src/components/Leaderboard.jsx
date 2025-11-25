import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { FOUNDATIONAL_SUBJECTS, DIPLOMA_SUBJECTS } from '../constants';

const Leaderboard = ({ fullPage = false }) => {
  const { theme, accentColor } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Global'); // 'Global' or Subject Name
  const listRef = useRef(null);

  // Combine subjects for tabs
  const subjects = ['Global', ...FOUNDATIONAL_SUBJECTS, ...DIPLOMA_SUBJECTS];

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = activeTab !== 'Global' ? { subject: activeTab } : {};
      
      const response = await api.get('/api/leaderboard', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeaderboardData(response.data);
      
      // Animation
      if (listRef.current) {
        gsap.fromTo(listRef.current.children, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" }
        );
      }

    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankStyle = (index) => {
    if (index === 0) return { border: '2px solid #FFD700', background: 'rgba(255, 215, 0, 0.1)' }; // Gold
    if (index === 1) return { border: '2px solid #C0C0C0', background: 'rgba(192, 192, 192, 0.1)' }; // Silver
    if (index === 2) return { border: '2px solid #CD7F32', background: 'rgba(205, 127, 50, 0.1)' }; // Bronze
    return {};
  };

  const getMedalIcon = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="leaderboard-container" style={{
      background: fullPage ? 'transparent' : 'var(--bg-secondary)',
      borderRadius: fullPage ? '0' : '24px',
      padding: fullPage ? '0' : '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="leaderboard-header" style={{ marginBottom: '20px' }}>
        {!fullPage && <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>🏆 Leaderboard</h2>}
        
        {/* Tabs */}
        <div className="tabs" style={{ 
          display: 'flex', 
          gap: '10px', 
          marginTop: '15px', 
          overflowX: 'auto', 
          paddingBottom: '5px',
          scrollbarWidth: 'none' 
        }}>
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => setActiveTab(subject)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: 'none',
                background: activeTab === subject ? accentColor : 'rgba(255,255,255,0.1)',
                color: activeTab === subject ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="leaderboard-list" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        paddingRight: '5px' 
      }} ref={listRef}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Loading rankings...</div>
        ) : leaderboardData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>No rankings yet for this category.</div>
        ) : (
          leaderboardData.map((user, index) => (
            <div key={user.userId} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              marginBottom: '8px',
              borderRadius: '12px',
              background: 'var(--bg-primary)',
              transition: 'transform 0.2s',
              ...getRankStyle(index)
            }}>
              {/* Rank */}
              <div style={{ 
                width: '30px', 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                marginRight: '15px',
                textAlign: 'center'
              }}>
                {getMedalIcon(index)}
              </div>

              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#ddd',
                marginRight: '15px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>👤</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{user.username}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.quizzesTaken} Quizzes</div>
              </div>

              {/* Score */}
              <div style={{ 
                fontWeight: '700', 
                fontSize: '1.1rem', 
                color: accentColor 
              }}>
                {user.totalScore} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
