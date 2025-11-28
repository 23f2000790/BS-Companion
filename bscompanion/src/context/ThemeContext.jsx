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

  // --- Music Tracks ---
  const musicTracks = useMemo(() => [
    { 
      id: 'lofi', 
      name: 'Algorithms', 
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3'
    },
    { 
      id: 'piano', 
      name: 'Elipsis', 
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Elipsis.mp3'
    },
    { 
      id: 'ambient', 
      name: 'Shipping Lanes', 
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Shipping_Lanes.mp3'
    },
    { 
      id: 'chill', 
      name: 'Organisms', 
      url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Organisms.mp3'
    }
  ], []);

  // --- Quiz Preferences State (DEFAULTS TO OFF) ---
  const [quizPrefs, setQuizPrefs] = useState(() => {
    const saved = localStorage.getItem('app-quiz-prefs');
    return saved ? JSON.parse(saved) : {
      soundEffects: false, // DEFAULT OFF
      timerVisible: true,
      selectedMusicTrack: 'lofi', // Default track
    };
  });

  // --- Audio State (DEFAULTS TO OFF) ---
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('app-music');
    return saved === 'true'; // Only true if explicitly set
  });
  
  // Create audio instance and set initial source
  const [audio] = useState(() => {
    const newAudio = new Audio();
    newAudio.preload = 'auto';
    return newAudio;
  });

  // Initialize audio source on mount
  useEffect(() => {
    const selectedTrack = musicTracks.find(t => t.id === (quizPrefs.selectedMusicTrack || 'lofi'));
    if (selectedTrack && !audio.src) {
      audio.src = selectedTrack.url;
      audio.load();
    }
  }, [audio, musicTracks, quizPrefs.selectedMusicTrack]);

  // Sound Effects
  const correctSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'), []); // Success notification
  const incorrectSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3'), []); // Error buzz
  const buttonClickSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'), []);
  const quizCompleteSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3'), []); // Fanfare
  const modalOpenSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'), []);
  const modalCloseSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'), []);
  const subjectAddSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'), []); // Notification pop
  const subjectRemoveSound = useMemo(() => new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'), []);

  const playSoundEffect = (type, volumeOverride = null) => {
    if (!quizPrefs.soundEffects) return;
    
    const sounds = {
      'correct': { sound: correctSound, volume: 0.7 },
      'incorrect': { sound: incorrectSound, volume: 0.7 },
      'button': { sound: buttonClickSound, volume: 0.3 },
      'quiz-complete': { sound: quizCompleteSound, volume: 0.8 },
      'modal-open': { sound: modalOpenSound, volume: 0.4 },
      'modal-close': { sound: modalCloseSound, volume: 0.4 },
      'subject-add': { sound: subjectAddSound, volume: 0.6 },
      'subject-remove': { sound: subjectRemoveSound, volume: 0.4 },
    };
    
    const soundConfig = sounds[type];
    if (soundConfig) {
      const { sound, volume } = soundConfig;
      sound.currentTime = 0;
      sound.volume = volumeOverride !== null ? volumeOverride : volume;
      sound.play().catch(e => console.log(`Sound play failed (${type}):`, e));
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

  // Handle Music with Persistence
  useEffect(() => {
    localStorage.setItem('app-music', musicEnabled);
    audio.loop = true;
    audio.volume = 0.3; // Low volume for background


    // Restore playback position from localStorage
    const savedPosition = localStorage.getItem('app-music-position');
    if (savedPosition && musicEnabled) {
      audio.currentTime = parseFloat(savedPosition);
    }

    if (musicEnabled) {
      
      // Try to play immediately
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Music playing successfully!');
          })
          .catch(error => {
            console.warn("Audio autoplay prevented:", error.message);
            console.log("Click anywhere on the page to start music");
            
            // Add one-time click handler to start music on user interaction
            const handleUserInteraction = () => {
              console.log('User interacted - attempting to play music...');
              audio.play()
                .then(() => console.log('Music started after user interaction!'))
                .catch(e => console.error('Failed to play after interaction:', e));
              
              // Remove listeners after first successful interaction
              document.removeEventListener('click', handleUserInteraction);
              document.removeEventListener('keydown', handleUserInteraction);
            };
            
            document.addEventListener('click', handleUserInteraction, { once: true });
            document.addEventListener('keydown', handleUserInteraction, { once: true });
          });
      }
    } else {
      audio.pause();
      console.log('Music paused');
    }

    // Save playback position every 2 seconds
    const positionInterval = setInterval(() => {
      if (musicEnabled && !audio.paused) {
        localStorage.setItem('app-music-position', audio.currentTime.toString());
      }
    }, 2000);

    return () => {
      clearInterval(positionInterval);
      // Save final position before cleanup
      if (musicEnabled) {
        localStorage.setItem('app-music-position', audio.currentTime.toString());
      }
    };
  }, [musicEnabled, audio]);

  // Handle Music Track Changes
  useEffect(() => {
    const selectedTrack = musicTracks.find(t => t.id === quizPrefs.selectedMusicTrack);
    if (selectedTrack) {
      const currentSrc = audio.src;
      const newSrc = selectedTrack.url;
      
      // Only change if the track is different
      if (currentSrc && !currentSrc.includes(newSrc)) {
        const wasPlaying = !audio.paused;
        
        console.log('Switching track to:', selectedTrack.name);
        audio.pause();
        audio.src = newSrc;
        audio.load();
        
        // Restart playback if music was playing
        if (wasPlaying && musicEnabled) {
          audio.play()
            .then(() => console.log('New track playing:', selectedTrack.name))
            .catch(e => console.error('Failed to play new track:', e));
        }
      }
    }
  }, [quizPrefs.selectedMusicTrack, audio, musicTracks, musicEnabled]);

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
      musicTracks, // NEW: Music tracks array
      quizPrefs,
      setQuizPrefs,
      playSoundEffect
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
