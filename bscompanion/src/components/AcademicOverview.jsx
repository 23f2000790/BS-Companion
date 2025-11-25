import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import SkillRadarChart from './SkillRadarChart';
import { useTheme } from '../context/ThemeContext';

const AcademicOverview = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await api.get('/api/stats/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching academic stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="academic-overview" style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      // Background and padding handled by Bento card
      overflow: 'hidden'
    }}>
      <div style={{ flex: 1, minHeight: '0' }}>
        {loading ? (
          <div className="spinner" style={{ margin: 'auto' }}></div>
        ) : (
          <SkillRadarChart data={stats} />
        )}
      </div>
    </div>
  );
};

export default AcademicOverview;
