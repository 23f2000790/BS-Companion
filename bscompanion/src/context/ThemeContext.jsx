import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // --- Theme State ---
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'dark';
  });

  // --- Accent Color State ---
  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('app-accent') || '#667eea'; // Default (Original gradient color)
  });

  // --- Audio State ---
  const [musicEnabled, setMusicEnabled] = useState(() => {
    return localStorage.getItem('app-music') === 'true';
  });
  
  const [audio] = useState(new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112762.mp3')); // Royalty free lofi

  // --- Quiz Preferences State ---
  const [quizPrefs, setQuizPrefs] = useState(() => {
    const saved = localStorage.getItem('app-quiz-prefs');
    return saved ? JSON.parse(saved) : {
      soundEffects: true,
      timerVisible: true,
    };
  });

  // Sound Effects
  const correctSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'), []);
  const incorrectSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'), []);

  const playSoundEffect = (type) => {
    if (!quizPrefs.soundEffects) return;
    
    if (type === 'correct') {
      correctSound.currentTime = 0;
      correctSound.play().catch(e => console.log("Sound play failed", e));
    } else if (type === 'incorrect') {
      incorrectSound.currentTime = 0;
      incorrectSound.play().catch(e => console.log("Sound play failed", e));
    }
  };

  // Apply Theme
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  // Apply Accent Color
  useEffect(() => {
    localStorage.setItem('app-accent', accentColor);
    document.documentElement.style.setProperty('--accent-primary', accentColor);
    
    // Calculate a glow color (transparent version)
    // Simple hex to rgba conversion for glow
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    document.documentElement.style.setProperty('--accent-glow', hexToRgba(accentColor, 0.5));
    // We can also update the gradient to be based on the accent
    document.documentElement.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${accentColor} 0%, ${hexToRgba(accentColor, 0.8)} 100%)`);
    
  }, [accentColor]);

  // Handle Music
  useEffect(() => {
    localStorage.setItem('app-music', musicEnabled);
    audio.loop = true;
    audio.volume = 0.3; // Low volume for background

    if (musicEnabled) {
      // User interaction is required to play audio usually, 
      // but we'll try to play if enabled. 
      // If it fails due to autoplay policy, it will just catch error.
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio autoplay prevented:", error);
          // We might need to set musicEnabled to false if autoplay fails
          // or show a UI to enable it. For now, we just log.
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [musicEnabled, audio]);

  // Save Quiz Prefs
  useEffect(() => {
    localStorage.setItem('app-quiz-prefs', JSON.stringify(quizPrefs));
  }, [quizPrefs]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme,
      accentColor,
      setAccentColor,
      musicEnabled,
      setMusicEnabled,
      quizPrefs,
      setQuizPrefs,
      playSoundEffect
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
