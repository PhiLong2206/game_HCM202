// src/components/MCPanel.jsx
import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Eye, 
  Shield, 
  Keyboard, 
  Settings, 
  ArrowRight, 
  Undo2,
  Pause,
  Play
} from 'lucide-react';
import { QUESTIONS, FATE_TYPES } from '../data/questions';

export default function MCPanel({
  isOpen,
  onClose,
  teams,
  onUpdateTeamName,
  onUpdateTeamScore,
  onUpdateTeamShield,
  currentRound,
  activeTeam,
  selectedCard,
  currentBet,
  gamePhase, // 'CARD_SELECT' | 'CARD_CONFIRM' | 'BETTING' | 'READING' | 'TRANSITION_ANSWER' | 'ANSWERING' | 'ANSWER_LOCKED' | 'RESULT' | 'FATE_READY' | 'FATE_REVEAL'
  onContinueTurn,
  onUndoLastAction,
  canUndo,
  onResetGame,
  isMuted,
  onToggleMute,
  effectVolume = 0.6,
  onVolumeChange,
  isTimerPaused,
  onTogglePauseTimer
}) {
  const [selectedTeamId, setSelectedTeamId] = useState(1);
  const [manualScoreInput, setManualScoreInput] = useState('');
  const [showAnswerCheat, setShowAnswerCheat] = useState(false);

  if (!isOpen) return null;

  const currentManagedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];

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
        maxWidth: '840px',
        maxHeight: '94vh',
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
          padding: '14px 18px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* Section 0: LIVE GAME STATUS & MC PACING CONTROLS */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--primary)',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
                ĐIỀU HÀNH GAME & NHỊP ĐỘ (MC PACING)
              </span>

              {/* Status Tags */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
                  Round: <strong>{currentRound}</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                  Đội: <strong>{activeTeam?.name || 'N/A'}</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  Thẻ: <strong>{selectedCard ? `CARD ${selectedCard.cardNum}` : 'Chưa chọn'}</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                <span style={{ color: 'var(--accent)' }}>
                  Cược: <strong>{currentBet ? `${currentBet} PTS` : 'Chưa cược'}</strong>
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>•</span>
                <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                  Phase: <strong>{gamePhase}</strong>
                </span>
              </div>
            </div>

            {/* Pacing Action Buttons (NO manual correct/wrong buttons!) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Pause/Resume Timer */}
              {['READING', 'ANSWERING'].includes(gamePhase) && (
                <button
                  onClick={onTogglePauseTimer}
                  className="btn-tactical"
                  style={{
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isTimerPaused ? 'var(--success)' : 'var(--accent)',
                    borderColor: isTimerPaused ? 'var(--success)' : 'var(--accent)'
                  }}
                >
                  {isTimerPaused ? <Play size={13} /> : <Pause size={13} />}
                  <span>{isTimerPaused ? 'Tiếp tục Timer' : 'Tạm dừng Timer'}</span>
                </button>
              )}

              {/* Next Turn */}
              <button
                disabled={!['RESULT', 'FATE_REVEAL'].includes(gamePhase)}
                onClick={onContinueTurn}
                className="btn-tactical btn-primary-cyan"
                style={{
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: 800,
                  opacity: ['RESULT', 'FATE_REVEAL'].includes(gamePhase) ? 1 : 0.4
                }}
              >
                <ArrowRight size={14} />
                <span>[ TIẾP TỤC / NEXT TEAM ]</span>
              </button>

              {/* Undo Last Action */}
              <button
                disabled={!canUndo}
                onClick={onUndoLastAction}
                className="btn-tactical"
                style={{
                  marginLeft: 'auto',
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: canUndo ? 'var(--accent)' : 'var(--text-muted)',
                  borderColor: canUndo ? 'var(--accent)' : 'var(--border)',
                  opacity: canUndo ? 1 : 0.4
                }}
              >
                <Undo2 size={14} />
                <span>[ UNDO ]</span>
              </button>
            </div>
          </div>

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
              1. QUẢN LÝ ĐIỂM SỐ & KHIÊN BẢO HỘ (SHIELD)
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
                  {t.name} ({t.score} PTS {t.shield > 0 ? `🛡️x${t.shield}` : ''})
                </button>
              ))}
            </div>

            {/* Selected Team Controls */}
            {currentManagedTeam && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                      Đổi Tên Đội:
                    </label>
                    <input
                      type="text"
                      value={currentManagedTeam.name}
                      onChange={(e) => onUpdateTeamName(currentManagedTeam.id, e.target.value)}
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
                      Điểm Hiện Tại: <strong style={{ color: 'var(--accent)' }}>{currentManagedTeam.score} PTS</strong>
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
                  {[+50, +100, +200, +300, +500, -50, -100, -200, -300, -500].map((delta) => (
                    <button
                      key={delta}
                      onClick={() => onUpdateTeamScore(currentManagedTeam.id, Math.max(0, currentManagedTeam.score + delta))}
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

                {/* Shield Toggle / Adjust */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '6px', borderTop: '1px dashed var(--border)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Khiên Bảo Hộ: <strong style={{ color: 'var(--primary)' }}>{currentManagedTeam.shield || 0}</strong>
                  </span>
                  <button
                    onClick={() => onUpdateTeamShield(currentManagedTeam.id, Math.max(0, (currentManagedTeam.shield || 0) + 1))}
                    className="btn-tactical"
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', color: 'var(--primary)' }}
                  >
                    <Shield size={12} />
                    <span>+1 Khiên 🛡️</span>
                  </button>
                  <button
                    disabled={!currentManagedTeam.shield}
                    onClick={() => onUpdateTeamShield(currentManagedTeam.id, Math.max(0, (currentManagedTeam.shield || 0) - 1))}
                    className="btn-tactical"
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px', color: 'var(--danger)' }}
                  >
                    <span>-1 Khiên</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Audio & Reset Game */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 14px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
              2. ÂM THANH & RESET GAME
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onToggleMute}
                className="btn-tactical"
                style={{ flex: 1, padding: '6px 8px', fontSize: '11px', borderRadius: '6px' }}
              >
                {isMuted ? <VolumeX size={13} color="var(--danger)" /> : <Volume2 size={13} color="var(--success)" />}
                <span>{isMuted ? "Đang tắt âm thanh (Phím M)" : "Đang bật âm thanh (Phím M)"}</span>
              </button>

              <button
                onClick={onResetGame}
                className="btn-tactical btn-danger-soft"
                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
              >
                <RotateCcw size={12} />
                <span>Reset Toàn Bộ Game</span>
              </button>
            </div>

            {/* Effect Volume Slider */}
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  🔉 ÂM LƯỢNG HIỆU ỨNG (EFFECT VOLUME)
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round((effectVolume ?? 0.6) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>0%</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={effectVolume ?? 0.6}
                  onChange={(e) => onVolumeChange && onVolumeChange(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--primary)',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100%</span>
              </div>
            </div>
          </div>

          {/* Section 3: Cheat Sheet (MC ONLY) */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px dashed var(--border-light)',
            borderRadius: '10px',
            padding: '8px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800 }}>
                CHEAT SHEET ĐÁP ÁN & VẬN MỆNH (CHỈ DÀNH CHO MC):
              </span>
              <button
                onClick={() => setShowAnswerCheat(!showAnswerCheat)}
                className="btn-tactical"
                style={{ padding: '2px 8px', fontSize: '10px', borderRadius: '4px' }}
              >
                <Eye size={11} />
                <span>{showAnswerCheat ? "Ẩn danh sách" : "Xem trước"}</span>
              </button>
            </div>

            {showAnswerCheat && (
              <div style={{
                marginTop: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                {QUESTIONS.map((q) => {
                  const fateInfo = q.fate ? FATE_TYPES[q.fate.type] : null;

                  return (
                    <div key={q.id} style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '4px 6px',
                      fontSize: '10px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 800 }}>
                          {q.isFinal ? 'FINAL' : `R${q.round}-C${q.cardNum}`} [{q.correctAnswer}]
                        </span>
                        {fateInfo && (
                          <span style={{ color: fateInfo.color, fontWeight: 700 }}>
                            {fateInfo.icon} {fateInfo.name}
                          </span>
                        )}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '9px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {q.pillar}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Keyboard Shortcuts Reference */}
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
            <span><strong>M:</strong> Bật/Tắt Âm thanh</span>
            <span><strong>ESC:</strong> Đóng/Mở MC Panel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
