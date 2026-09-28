// src/components/GameHeader.jsx
import React from 'react';
import { Volume2, VolumeX, Settings, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import Timer from './Timer';

export default function GameHeader({
  currentQuestion,
  timerSeconds,
  setTimerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  isMuted,
  toggleMute,
  onOpenMC,
  assignedTeam
}) {
  const isFinal = currentQuestion?.isFinal;

  return (
    <header style={{
      width: '100%',
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      zIndex: 50,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Brand & Academic Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'rgba(34, 211, 238, 0.1)',
          border: '1px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '17px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              Đấu trường <span style={{ color: 'var(--primary)' }}>Đại đoàn kết</span>
            </span>

            {/* Academic Tag */}
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'rgba(34, 211, 238, 0.08)',
              padding: '2px 7px',
              borderRadius: '6px',
              border: '1px solid rgba(34, 211, 238, 0.25)',
              letterSpacing: '0.3px'
            }}>
              HCM202
            </span>
          </div>

          <div style={{ 
            fontSize: '11px', 
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>
            Tư tưởng Hồ Chí Minh • Chuyên đề Đại đoàn kết toàn dân tộc
          </div>
        </div>
      </div>

      {/* Round & Turn Status Tracker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          background: 'var(--surface)',
          border: `1.5px solid ${isFinal ? 'var(--accent)' : 'var(--border)'}`,
          padding: '6px 14px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: isFinal ? '0 0 15px rgba(251, 191, 36, 0.2)' : 'none'
        }} className={isFinal ? 'pulse-gold' : ''}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: isFinal ? 'var(--accent)' : 'var(--primary)',
            letterSpacing: '0.5px'
          }}>
            {isFinal ? 'FINAL ROUND' : `CÂU ${currentQuestion.turnIndex} / 8`}
          </span>

          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-light)' }} />

          <span style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            fontWeight: 600
          }}>
            {isFinal ? (
              <span style={{ color: 'var(--accent)' }}>300 PTS • Cả 4 đội tham gia</span>
            ) : (
              <>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{currentQuestion.points} PTS</span>
                <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>•</span>
                <span>Lượt: <strong style={{ color: 'var(--primary)' }}>{assignedTeam?.name}</strong></span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Timer & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Timer
          seconds={timerSeconds}
          setSeconds={setTimerSeconds}
          isRunning={isTimerRunning}
          setIsRunning={setIsTimerRunning}
        />

        {/* Mute Audio Button */}
        <button
          onClick={toggleMute}
          className="btn-tactical"
          title={isMuted ? "Bật âm thanh (Phím M)" : "Tắt âm thanh (Phím M)"}
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            color: isMuted ? 'var(--danger)' : 'var(--text-secondary)',
            borderColor: isMuted ? 'var(--danger)' : 'var(--border)'
          }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* MC Panel Button */}
        <button
          onClick={onOpenMC}
          className="btn-tactical"
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            background: 'var(--surface)'
          }}
          title="Mở Bảng Điều Khiển MC"
        >
          <Settings size={14} style={{ color: 'var(--primary)' }} />
          <span>MC Panel</span>
        </button>
      </div>
    </header>
  );
}
