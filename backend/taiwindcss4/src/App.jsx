import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Users, Trophy, Flame, X } from 'lucide-react';

const PhoenixFocus = () => {
  const [studyTime, setStudyTime] = useState(25 * 60); // 25 minutes default
  const [timeLeft, setTimeLeft] = useState(studyTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phoenixes, setPhoenixes] = useState([]);
  const [currentPhoenix, setCurrentPhoenix] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalPhoenixes, setTotalPhoenixes] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const intervalRef = useRef(null);

  const phoenixStages = [
    { stage: 0, emoji: '🥚', name: 'Phoenix Egg', minTime: 0 },
    { stage: 1, emoji: '🐣', name: 'Hatching', minTime: 5 * 60 },
    { stage: 2, emoji: '🐦', name: 'Young Phoenix', minTime: 15 * 60 },
    { stage: 3, emoji: '🦅', name: 'Mature Phoenix', minTime: 25 * 60 },
    { stage: 4, emoji: '🐦‍🔥', name: 'Legendary Phoenix', minTime: 45*60}
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
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          
          // Update current phoenix growth
          if (currentPhoenix) {
            const timeStudied = studyTime - newTime;
            const stage = getPhoenixStage(timeStudied);
            setCurrentPhoenix(prev => ({
              ...prev,
              stage: stage.stage,
              emoji: stage.emoji,
              name: stage.name,
              timeStudied
            }));
          }
          
          if (newTime === 0) {
            completeSession();
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, timeLeft, currentPhoenix, studyTime]);

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
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(studyTime);
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
      setTotalPhoenixes(prev => prev + 1);
      setStreak(prev => prev + 1);
    }
    
    setIsActive(false);
    setCurrentPhoenix(null);
    setTimeLeft(studyTime);
  };

  const burnPhoenix = () => {
    if (currentPhoenix && isActive) {
      const burntPhoenix = {
        ...currentPhoenix,
        dead: true,
        diedAt: new Date(),
        emoji: '💀',
        name: 'Burnt Ashes'
      };
      
      setPhoenixes(prev => [burntPhoenix, ...prev]);
      setStreak(0);
      resetTimer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const login = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
      // In real app, this would authenticate with backend
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border-4 border-orange-300">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔥</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Phoenix Focus</h1>
            <p className="text-gray-600">Rise from distractions through focus</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Your name..."
              />
            </div>
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
            >
              Begin Your Rise 🔥
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-400 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 border-orange-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Welcome back, {username}!
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Flame className="text-red-500" size={20} />
                  <span className="font-semibold">{totalPhoenixes} phoenixes risen</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="text-yellow-500" size={20} />
                  <span className="font-semibold">{streak} day streak</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Users size={20} />
              Phoenix Nest
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Timer Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-300">
            <div className="text-center">
              <div className="text-8xl mb-4 animate-pulse">
                {currentPhoenix ? currentPhoenix.emoji : '🥚'}
              </div>
              
              <div className="text-6xl font-mono font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                {formatTime(timeLeft)}
              </div>
              
              {currentPhoenix && (
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-700">{currentPhoenix.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2 border border-orange-200">
                    <div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(((studyTime - timeLeft) / studyTime) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4 mb-6">
                {!isActive || isPaused ? (
                  <button
                    onClick={startTimer}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all transform hover:scale-105"
                  >
                    <Play size={20} />
                    {isPaused ? 'Resume Rise' : 'Begin Focus'}
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold transition-all"
                  >
                    <Pause size={20} />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={resetTimer}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>

              {/* Study Duration Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Focus Duration
                </label>
                <select
                  value={studyTime}
                  onChange={(e) => {
                    const newTime = parseInt(e.target.value);
                    setStudyTime(newTime);
                    setTimeLeft(newTime);
                  }}
                  disabled={isActive}
                  className="px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value={15 * 60}>15 minutes</option>
                  <option value={25 * 60}>25 minutes</option>
                  <option value={45 * 60}>45 minutes</option>
                  <option value={60 * 60}>1 hour</option>
                </select>
              </div>

              {/* Burn Phoenix Button (Simulate Phone Usage) */}
              {isActive && !isPaused && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <p className="text-sm text-red-600 mb-2">
                    📱 Gave in to distractions?
                  </p>
                  <button
                    onClick={burnPhoenix}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-all"
                  >
                    <X size={16} />
                    Burn Phoenix (I lost focus)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Phoenix Nest Display */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300">
            <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Your Phoenix Nest
            </h2>
            
            {phoenixes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏜️</div>
                <p className="text-gray-500">Your nest is empty. Begin focusing to hatch your first phoenix!</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {phoenixes.map((phoenix) => (
                  <div
                    key={phoenix.id}
                    className={`text-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      phoenix.dead 
                        ? 'border-red-300 bg-red-50 shadow-red-200' 
                        : 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-orange-200'
                    } shadow-lg`}
                  >
                    <div className="text-3xl mb-2">{phoenix.emoji}</div>
                    <p className="text-xs font-medium text-gray-700">{phoenix.name}</p>
                    <p className="text-xs text-gray-500">
                      {phoenix.dead 
                        ? '💀 Burnt' 
                        : `${Math.floor(phoenix.timeStudied / 60)}min`
                      }
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Motivational Impact */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
              <h3 className="font-semibold text-red-800 mb-2">🔥 Phoenix Power</h3>
              <p className="text-sm text-red-700">
                You've risen {totalPhoenixes} phoenixes from focus! 
                {totalPhoenixes >= 5 && (
                  <span className="block mt-1">
                    🌟 Incredible! You're developing legendary focus powers!
                  </span>
                )}
                {totalPhoenixes >= 10 && (
                  <span className="block mt-1">
                    🏆 Master Phoenix: Your dedication inspires others to rise!
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Modal */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full border-2 border-orange-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Phoenix Statistics
                </h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Phoenixes Risen:</span>
                  <span className="font-semibold">{totalPhoenixes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak:</span>
                  <span className="font-semibold">{streak} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Successful Rises:</span>
                  <span className="font-semibold text-orange-600">
                    {phoenixes.filter(p => !p.dead).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Burnt Phoenixes:</span>
                  <span className="font-semibold text-red-600">
                    {phoenixes.filter(p => p.dead).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Success Rate:</span>
                  <span className="font-semibold">
                    {phoenixes.length > 0 
                      ? Math.round((phoenixes.filter(p => !p.dead).length / phoenixes.length) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoenixFocus;