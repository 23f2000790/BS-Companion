import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

const SkillRadarChart = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Default empty state if no data
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        No quiz data available yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
        <PolarGrid stroke="var(--border-color)" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={false} 
          axisLine={false} 
        />
        <Radar
          name="Proficiency"
          dataKey="proficiency"
          stroke="var(--accent-color)"
          strokeWidth={3}
          fill="var(--accent-color)"
          fillOpacity={0.5}
          dot={{ r: 4, fill: "var(--bg-secondary)", stroke: "var(--accent-color)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--accent-color)" }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '8px'
          }}
          itemStyle={{ color: 'var(--text-primary)' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;
