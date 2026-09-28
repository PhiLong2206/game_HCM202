// src/components/GameHeader.jsx
import React from 'react';
import { Volume2, VolumeX, Settings, Layers, Clock, BookMarked, Lock, Zap } from 'lucide-react';

export default function GameHeader({
  currentRound,
  activeTeam,
  currentBet,
  timerSeconds,
  gamePhase,
  isMuted,
  toggleMute,
  onOpenMC
}) {
  const isFinal = currentRound === 3;
  const isReading = gamePhase === 'READING' || gamePhase === 'FINAL_READING';
  const isTransition = gamePhase === 'TRANSITION_ANSWER' || gamePhase === 'FINAL_TRANSITION';
  const isAnswering = gamePhase === 'ANSWERING' || gamePhase === 'FINAL_ANSWERING';
  const isLocked = gamePhase === 'ANSWER_LOCKED';

  return (
    <header style={{
      width: '100%',
      height: '60px',
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
      {/* Brand & Subtitle */}
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
          <Layers size={18} />
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

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--primary)',
              background: 'rgba(34, 211, 238, 0.08)',
              padding: '2px 7px',
              borderRadius: '6px',
              border: '1px solid rgba(34, 211, 238, 0.25)'
            }}>
              HCM202
            </span>
          </div>

          <div style={{ 
            fontSize: '11px', 
            fontWeight: 500,
            color: 'var(--text-secondary)'
          }}>
            Rút thẻ • Đặt điểm • Trả lời • Mở vận mệnh
          </div>
        </div>
      </div>

      {/* Round & Status Tracker */}
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
            {isFinal ? 'ROUND 3: ĐẠI ĐOÀN KẾT' : `ROUND ${currentRound}`}
          </span>

          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-light)' }} />

          <span style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            fontWeight: 600
          }}>
            {isFinal ? (
              <span style={{ color: 'var(--accent)' }}>THU THẬP MẢNH GHÉP • 4 ĐỘI HỢP LỰC</span>
            ) : (
              <>
                <span>Lượt: <strong style={{ color: 'var(--primary)' }}>{activeTeam?.name}</strong></span>
                {currentBet ? (
                  <>
                    <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>•</span>
                    <span>Cược: <strong style={{ color: 'var(--accent)' }}>{currentBet} PTS</strong></span>
                  </>
                ) : (
                  <>
                    <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>•</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Chọn thẻ & đặt điểm</span>
                  </>
                )}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Synchronized Header Timer & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Header Timer Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--surface)',
          border: `1px solid ${
            isReading 
              ? 'var(--primary)' 
              : isAnswering && timerSeconds <= 3 
                ? 'var(--danger)' 
                : isAnswering && timerSeconds <= 5 
                  ? 'var(--accent)' 
                  : 'var(--border)'
          }`,
          padding: '4px 12px',
          borderRadius: '8px',
          boxShadow: isAnswering && timerSeconds <= 3 
            ? '0 0 16px rgba(239, 68, 68, 0.35)' 
            : isReading 
              ? '0 0 10px rgba(34, 211, 238, 0.2)' 
              : 'none'
        }}>
          {isReading ? (
            <>
              <BookMarked size={14} color="var(--primary)" />
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>ĐỌC:</span>
              <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)', minWidth: '32px' }}>
                0{timerSeconds}s
              </span>
            </>
          ) : isTransition ? (
            <>
              <Zap size={14} color="var(--accent)" />
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 900 }}>TRẢ LỜI!</span>
            </>
          ) : isAnswering ? (
            <>
              <Clock size={14} color={timerSeconds <= 3 ? 'var(--danger)' : timerSeconds <= 5 ? 'var(--accent)' : 'var(--primary)'} />
              <span style={{ 
                fontSize: '11px', 
                color: timerSeconds <= 3 ? 'var(--danger)' : timerSeconds <= 5 ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: 700 
              }}>
                TRẢ LỜI:
              </span>
              <span 
                className={timerSeconds <= 3 ? 'timer-critical-pulse' : ''}
                style={{ 
                  fontSize: '16px', 
                  fontWeight: 800, 
                  color: timerSeconds <= 3 ? 'var(--danger)' : timerSeconds <= 5 ? 'var(--accent)' : 'var(--primary)',
                  minWidth: '34px'
                }}
              >
                {timerSeconds.toString().padStart(2, '0')}s
              </span>
            </>
          ) : isLocked ? (
            <>
              <Lock size={13} color="var(--accent)" />
              <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>ĐÃ KHÓA</span>
            </>
          ) : (
            <>
              <Clock size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CHỜ LƯỢT</span>
            </>
          )}
        </div>

        {/* Audio Mute Button */}
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
          title="Mở Bảng Điều Khiển MC (Phím ESC)"
        >
          <Settings size={14} style={{ color: 'var(--primary)' }} />
          <span>MC Panel</span>
        </button>
      </div>
    </header>
  );
}
