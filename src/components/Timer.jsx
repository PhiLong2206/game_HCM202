// src/components/Timer.jsx
import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { playTickSound } from '../utils/audio';

export default function Timer({ 
  seconds, 
  setSeconds, 
  isRunning, 
  setIsRunning, 
  initialTime = 30 
}) {
  useEffect(() => {
    let interval = null;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          const next = prev - 1;
          if (next <= 10 && next >= 0) {
            playTickSound(next <= 5);
          }
          return next;
        });
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds, setIsRunning, setSeconds]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setSeconds(initialTime);
  };

  const isWarning = seconds <= 10 && seconds > 5;
  const isCritical = seconds <= 5 && seconds > 0;

  const formatTime = (timeInSec) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = timeInSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: 'var(--surface)',
      border: `1px solid ${isCritical ? 'var(--danger)' : isWarning ? 'var(--accent)' : 'var(--border)'}`,
      padding: '4px 10px',
      borderRadius: '8px',
      boxShadow: isCritical ? '0 0 16px rgba(239, 68, 68, 0.3)' : isWarning ? '0 0 12px rgba(251, 191, 36, 0.2)' : 'none',
      transition: 'all 0.25s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock 
          size={15} 
          style={{ 
            color: isCritical ? 'var(--danger)' : isWarning ? 'var(--accent)' : 'var(--text-secondary)' 
          }} 
        />
        <span 
          className={isCritical ? 'timer-critical' : ''}
          style={{
            fontSize: '18px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: isCritical ? 'var(--danger)' : isWarning ? 'var(--accent)' : 'var(--text-primary)',
            letterSpacing: '0.5px',
            minWidth: '54px'
          }}
        >
          {formatTime(seconds)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={toggleTimer}
          className="btn-tactical"
          title={isRunning ? "Tạm dừng (Space)" : "Bắt đầu (Space)"}
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '6px',
            background: isRunning ? 'var(--surface-hover)' : 'var(--bg-secondary)',
            borderColor: isRunning ? 'var(--primary)' : 'var(--border)',
            color: isRunning ? 'var(--primary)' : 'var(--text-primary)'
          }}
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          onClick={resetTimer}
          className="btn-tactical"
          title="Đặt lại 30s"
          style={{
            padding: '4px 8px',
            fontSize: '12px',
            borderRadius: '6px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
