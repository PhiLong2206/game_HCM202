// src/components/MCPanel.jsx
import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Eye, 
  RefreshCw,
  LifeBuoy,
  Star,
  Keyboard,
  Settings
} from 'lucide-react';
import { QUESTIONS } from '../data/questions';

export default function MCPanel({
  isOpen,
  onClose,
  teams,
  onUpdateTeamName,
  onUpdateTeamScore,
  onToggleTeamLifeline,
  currentQuestionIndex,
  onJumpQuestion,
  onResetCurrentQuestion,
  onResetGame,
  isMuted,
  onToggleMute,
  timerSeconds,
  onSetTimerSeconds,
  isTimerRunning,
  onToggleTimer
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [manualScoreInput, setManualScoreInput] = useState('');
  const [showAnswerCheat, setShowAnswerCheat] = useState(false);

  if (!isOpen) return null;

  const currentTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

  const handleApplyScore = () => {
    const val = parseInt(manualScoreInput, 10);
    if (!isNaN(val)) {
      onUpdateTeamScore(selectedTeamId, Math.max(0, val));
      setManualScoreInput('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 17, 31, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: '14px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(34, 211, 238, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '12px 18px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={16} color="var(--primary)" />
            <span style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.2px'
            }}>
              Bảng Điều Khiển MC — Đấu Trường Đại Đoàn Kết
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn-tactical"
            style={{ padding: '4px 8px', borderRadius: '6px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{
          padding: '16px 18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Section 1: Team Manager */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--primary)',
              marginBottom: '8px'
            }}>
              1. QUẢN LÝ ĐIỂM & QUYỀN TRỢ GIÚP (LIFELINES)
            </div>

            {/* Team Tabs 1, 2, 3, 4 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className="btn-tactical"
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    background: selectedTeamId === t.id ? 'var(--surface-hover)' : 'var(--surface)',
                    borderColor: selectedTeamId === t.id ? 'var(--primary)' : 'var(--border)',
                    color: selectedTeamId === t.id ? '#FFFFFF' : 'var(--text-secondary)',
                    fontWeight: selectedTeamId === t.id ? 700 : 500
                  }}
                >
                  {t.name} ({t.score} PTS)
                </button>
              ))}
            </div>

            {/* Selected Team Controls */}
            {currentTeam && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Đổi Tên Đội:
                    </label>
                    <input
                      type="text"
                      value={currentTeam.name}
                      onChange={(e) => onUpdateTeamName(currentTeam.id, e.target.value)}
                      style={{
                        width: '100%',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        padding: '5px 8px',
                        fontSize: '12px',
                        fontFamily: 'var(--font-main)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Điểm Hiện Tại: <strong style={{ color: 'var(--accent)' }}>{currentTeam.score} PTS</strong>
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="number"
                        placeholder="Điểm mới..."
                        value={manualScoreInput}
                        onChange={(e) => setManualScoreInput(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          padding: '5px 8px',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={handleApplyScore}
                        className="btn-tactical btn-primary-cyan"
                        style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px' }}
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Add/Subtract Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '4px' }}>Cộng/Trừ nhanh:</span>
                  {[+50, +100, +200, +300, -50, -100, -200, -300].map((delta) => (
                    <button
                      key={delta}
                      onClick={() => onUpdateTeamScore(currentTeam.id, Math.max(0, currentTeam.score + delta))}
                      className="btn-tactical"
                      style={{
                        padding: '3px 6px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        color: delta > 0 ? 'var(--success)' : 'var(--danger)'
                      }}
                    >
                      {delta > 0 ? `+${delta}` : delta}
                    </button>
                  ))}
                </div>

                {/* Lifeline Toggle for Selected Team */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                  <button
                    onClick={() => onToggleTeamLifeline(currentTeam.id, 'rescue')}
                    className="btn-tactical"
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      color: currentTeam.rescueUsed ? 'var(--text-muted)' : 'var(--primary)',
                      borderColor: currentTeam.rescueUsed ? 'var(--border)' : 'var(--primary)'
                    }}
                  >
                    <LifeBuoy size={12} />
                    <span>🛟 Cứu viện: {currentTeam.rescueUsed ? 'Đã dùng (Bấm để hồi phục)' : 'Chưa dùng'}</span>
                  </button>

                  <button
                    onClick={() => onToggleTeamLifeline(currentTeam.id, 'star')}
                    className="btn-tactical"
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      color: currentTeam.starUsed ? 'var(--text-muted)' : 'var(--accent)',
                      borderColor: currentTeam.starUsed ? 'var(--border)' : 'var(--accent)'
                    }}
                  >
                    <Star size={12} fill={!currentTeam.starUsed ? 'var(--accent)' : 'none'} />
                    <span>⭐ Sao hy vọng: {currentTeam.starUsed ? 'Đã dùng (Bấm để hồi phục)' : 'Chưa dùng'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Jump Question / Round */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--primary)'
            }}>
              2. ĐIỀU HƯỚNG CÂU HỎI (QUICK JUMP)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>R1 (100 PTS):</span>
              {[0, 1, 2, 3].map((idx) => (
                <button
                  key={idx}
                  onClick={() => onJumpQuestion(idx)}
                  className="btn-tactical"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    background: currentQuestionIndex === idx ? 'var(--primary-dark)' : 'var(--surface)',
                    borderColor: currentQuestionIndex === idx ? 'var(--primary)' : 'var(--border)',
                    color: currentQuestionIndex === idx ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  C{idx + 1} (Đ{QUESTIONS[idx].assignedTeamId})
                </button>
              ))}

              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '6px' }}>R2 (200 PTS):</span>
              {[4, 5, 6, 7].map((idx) => (
                <button
                  key={idx}
                  onClick={() => onJumpQuestion(idx)}
                  className="btn-tactical"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    background: currentQuestionIndex === idx ? 'var(--primary-dark)' : 'var(--surface)',
                    borderColor: currentQuestionIndex === idx ? 'var(--primary)' : 'var(--border)',
                    color: currentQuestionIndex === idx ? '#FFFFFF' : 'var(--text-secondary)'
                  }}
                >
                  C{idx + 1} (Đ{QUESTIONS[idx].assignedTeamId})
                </button>
              ))}

              <button
                onClick={() => onJumpQuestion(8)}
                className="btn-tactical btn-accent-gold"
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  marginLeft: '4px'
                }}
              >
                FINAL (300 PTS)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                onClick={onResetCurrentQuestion}
                className="btn-tactical"
                style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px', color: 'var(--primary)' }}
              >
                <RefreshCw size={11} />
                <span>Reset câu hiện tại</span>
              </button>

              <button
                onClick={onResetGame}
                className="btn-tactical btn-danger-soft"
                style={{ marginLeft: 'auto', padding: '5px 12px', fontSize: '11px', borderRadius: '6px' }}
              >
                <RotateCcw size={11} />
                <span>Reset toàn bộ game</span>
              </button>
            </div>
          </div>

          {/* Section 3: Timer & Audio Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
                3. ĐIỀU CHỈNH TIMER ({timerSeconds}s)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {[15, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => onSetTimerSeconds(sec)}
                    className="btn-tactical"
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                  >
                    {sec}s
                  </button>
                ))}
                <button
                  onClick={() => onSetTimerSeconds(timerSeconds + 10)}
                  className="btn-tactical"
                  style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', color: 'var(--success)' }}
                >
                  +10s
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '10px 14px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
                4. ÂM THANH
              </div>
              <button
                onClick={onToggleMute}
                className="btn-tactical"
                style={{ padding: '5px 10px', fontSize: '11px', borderRadius: '6px' }}
              >
                {isMuted ? <VolumeX size={13} color="var(--danger)" /> : <Volume2 size={13} color="var(--success)" />}
                <span>{isMuted ? "Đang tắt tiếng (Phím M)" : "Đang bật tiếng (Phím M)"}</span>
              </button>
            </div>
          </div>

          {/* Section 4: Cheat Sheet (MC ONLY) */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px dashed var(--border-light)',
            borderRadius: '10px',
            padding: '8px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>
                CHEAT SHEET ĐÁP ÁN (CHỈ DÀNH CHO MC):
              </span>
              <button
                onClick={() => setShowAnswerCheat(!showAnswerCheat)}
                className="btn-tactical"
                style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px' }}
              >
                <Eye size={11} />
                <span>{showAnswerCheat ? "Ẩn đáp án" : "Xem đáp án"}</span>
              </button>
            </div>

            {showAnswerCheat && (
              <div style={{
                marginTop: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px'
              }}>
                {QUESTIONS.map((q) => (
                  <div key={q.id} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '4px 6px',
                    fontSize: '10px'
                  }}>
                    <div style={{ color: 'var(--accent)', fontWeight: 800 }}>
                      C{q.turnIndex} ({q.assignedTeamId ? `Đội ${q.assignedTeamId}` : 'Cả 4 đội'}): [{q.correctAnswer}]
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.pillar}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Keyboard Shortcuts Reference */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            padding: '4px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: '6px'
          }}>
            <Keyboard size={13} style={{ color: 'var(--primary)' }} />
            <span><strong>SPACE:</strong> Start/Pause Timer</span>
            <span><strong>M:</strong> Bật/Tắt Âm thanh</span>
            <span><strong>ESC:</strong> Đóng MC Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
