import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../utils/formatters';
import PhoenixCard from '../features/phoenix/PhoenixCard';
import Button from '../ui/Button';

const PhoenixFocusPage = () => {
  const [studyTime, setStudyTime] = useState(25 * 60);
  const { timeLeft, isActive, isPaused, start, pause, reset, setTimeLeft } = useTimer(studyTime);
  const [phoenixes, setPhoenixes] = useState([]);
  const [currentPhoenix, setCurrentPhoenix] = useState(null);

  const phoenixStages = [
    { stage: 0, emoji: '🥚', name: 'Phoenix Egg', minTime: 0 },
    { stage: 1, emoji: '🐣', name: 'Hatching', minTime: 5 * 60 },
    { stage: 2, emoji: '🐦', name: 'Young Phoenix', minTime: 15 * 60 },
    { stage: 3, emoji: '🦅', name: 'Mature Phoenix', minTime: 25 * 60 },
    { stage: 4, emoji: '🐦‍🔥', name: 'Legendary Phoenix', minTime: 45 * 60}
  ];

  const getPhoenixStage = (timeStudied) => {
    for (let i = phoenixStages.length - 1; i >= 0; i--) {
      if (timeStudied >= phoenixStages[i].minTime) {
        return phoenixStages[i];
      }
    }
    return phoenixStages[0];
  };

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      if (currentPhoenix) {
        const timeStudied = studyTime - timeLeft;
        const stage = getPhoenixStage(timeStudied);
        setCurrentPhoenix(prev => ({
          ...prev,
          stage: stage.stage,
          emoji: stage.emoji,
          name: stage.name,
          timeStudied
        }));
      }
      
      if (timeLeft === 1) {
        completeSession();
      }
    }
  }, [timeLeft, isActive, isPaused, currentPhoenix, studyTime]);

  useEffect(() => {
    setTimeLeft(studyTime);
  }, [studyTime, setTimeLeft]);

  const startTimer = () => {
    if (!currentPhoenix) {
      const newPhoenix = {
        id: Date.now(),
        startTime: new Date(),
        emoji: '🥚',
        stage: 0,
        name: 'Phoenix Egg',
        timeStudied: 0,
        completed: false
      };
      setCurrentPhoenix(newPhoenix);
    }
    start();
  };

  const resetTimer = () => {
    reset();
    setCurrentPhoenix(null);
  };

  const completeSession = () => {
    if (currentPhoenix) {
      const completedPhoenix = {
        ...currentPhoenix,
        completed: true,
        completedAt: new Date(),
        finalStage: getPhoenixStage(studyTime)
      };
      
      setPhoenixes(prev => [completedPhoenix, ...prev]);
    }
    
    resetTimer();
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #d8dae7 0%, #0f5eb9 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: 'white', marginBottom: '30px', fontSize: '2.5em' }}>
          Phoenix Focus Timer
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Timer Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {currentPhoenix ? currentPhoenix.emoji : '🥚'}
            </div>
            
            <div style={{
              fontSize: '3rem',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#667eea',
              marginBottom: '1rem'
            }}>
              {formatTime(timeLeft)}
            </div>
            
            {currentPhoenix && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                  {currentPhoenix.name}
                </p>
                <div style={{
                  width: '100%',
                  background: '#f0f0f0',
                  borderRadius: '10px',
                  height: '10px',
                  marginTop: '10px'
                }}>
                  <div
                    style={{
                      background: 'linear-gradient(to right, #667eea, #764ba2)',
                      height: '100%',
                      borderRadius: '10px',
                      width: `${Math.min(((studyTime - timeLeft) / studyTime) * 100, 100)}%`,
                      transition: 'width 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              {!isActive || isPaused ? (
                <Button
                  onClick={startTimer}
                  variant="primary"
                  icon={<Play size={20} />}
                  style={{
                    background: 'linear-gradient(to right, #667eea, #764ba2)',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {isPaused ? 'Resume' : 'Start Focus'}
                </Button>
              ) : (
                <Button
                  onClick={pause}
                  variant="warning"
                  icon={<Pause size={20} />}
                  style={{
                    background: 'linear-gradient(to right, #ffa726, #ff7043)',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Pause
                </Button>
              )}
              
              <Button
                onClick={resetTimer}
                variant="secondary"
                icon={<RotateCcw size={20} />}
                style={{ fontSize: '16px' }}
              >
                Reset
              </Button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Focus Duration
              </label>
              <select
                value={studyTime}
                onChange={(e) => {
                  const newTime = parseInt(e.target.value);
                  setStudyTime(newTime);
                }}
                disabled={isActive}
                style={{
                  padding: '8px 16px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              >
                <option value={15 * 60}>15 minutes</option>
                <option value={25 * 60}>25 minutes</option>
                <option value={45 * 60}>45 minutes</option>
                <option value={60 * 60}>1 hour</option>
              </select>
            </div>
          </div>

          {/* Phoenix Collection */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '2rem' }}>
              Your Phoenix Collection
            </h2>
            
            {phoenixes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏜️</div>
                <p style={{ color: '#666' }}>
                  Your collection is empty. Complete focus sessions to hatch phoenixes!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: '1rem',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {phoenixes.map((phoenix) => (
                  <PhoenixCard key={phoenix.id} phoenix={phoenix} />
                ))}
              </div>
            )}

            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, #fff3e0, #ffecb3)',
              borderRadius: '10px',
              border: '2px solid #ffa726'
            }}>
              <h3 style={{ color: '#e65100', marginBottom: '8px', fontSize: '16px' }}>
                🔥 Phoenix Power
              </h3>
              <p style={{ fontSize: '14px', color: '#bf360c', margin: 0 }}>
                You've hatched {phoenixes.length} phoenixes through focus!
                {phoenixes.length >= 5 && (
                  <span style={{ display: 'block', marginTop: '4px' }}>
                    🌟 Amazing! You're developing legendary focus powers!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoenixFocusPage;