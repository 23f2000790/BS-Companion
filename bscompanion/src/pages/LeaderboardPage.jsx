import React from 'react';
import Leaderboard from '../components/Leaderboard';
import Dock from '../components/Dock';
import { useNavigate } from 'react-router-dom';
import { HomeIcon, StatsIcon, SettingsIcon, LogoutIcon, TrophyIcon } from '../components/icons'; // Assuming TrophyIcon exists or I'll add it

const LeaderboardPage = () => {
  const navigate = useNavigate();

  const LogoutUser = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const DOCK_ITEMS = [
    { label: "Home", icon: <HomeIcon />, onClick: () => navigate("/dashboard") },
    { label: "Leaderboard", icon: <TrophyIcon />, onClick: () => {} }, // Active
    { label: "History", icon: <StatsIcon />, onClick: () => navigate("/quiz-history") },
    { label: "Settings", icon: <SettingsIcon />, onClick: () => navigate("/settings") },
    { label: "Logout", icon: <LogoutIcon />, onClick: LogoutUser },
  ];

  return (
    <div className="leaderboard-page" style={{ 
      padding: '20px', 
      paddingBottom: '100px', // Space for Dock
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Global Rankings 🏆</h1>
        <div style={{ height: 'calc(100vh - 150px)' }}>
          <Leaderboard fullPage={true} />
        </div>
      </div>
      <Dock items={DOCK_ITEMS} />
    </div>
  );
};

export default LeaderboardPage;
