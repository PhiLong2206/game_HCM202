// src/components/TurnPlayPhase.jsx
import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Star, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  Users,
  X
} from 'lucide-react';
import { playTickSound, playLockSound, playWarningAlarm } from '../utils/audio';

export default function TurnPlayPhase({
  question,
  assignedTeam,
  otherTeams,
  chosenAnswer,
  onSelectAnswer,
  isAnswerLocked,
  onLockAnswer,
  isResultRevealed,
  onRevealResult,
  onNextQuestion,
  rescueState,
  onStartRescue,
  onCancelRescue,
  onSelectRescueTeam,
  onSelectRescueSuggestion,
  onContinueAfterRescue,
  isStarActive,
  onToggleStar,
  turnResult
}) {
  const [consultTimer, setConsultTimer] = useState(10);

  // Reset and run 10s countdown when entering 'consulting' step
  useEffect(() => {
    let interval = null;
    if (rescueState?.step === 'consulting') {
      setConsultTimer(10);
      interval = setInterval(() => {
        setConsultTimer((prev) => {
          const next = prev - 1;
          if (next <= 3 && next >= 0) {
            playTickSound(true);
          }
          if (next <= 0) {
            clearInterval(interval);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rescueState?.step, rescueState?.helperTeamId]);

  const canUseRescue = !assignedTeam?.rescueUsed && !rescueState?.usedInThisTurn && !isAnswerLocked;
  const canUseStar = !assignedTeam?.starUsed && !isAnswerLocked;
  const isRescueActive = rescueState && rescueState.step !== 'collapsed';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '12px 20px',
      gap: '8px',
      position: 'relative'
    }}>
      {/* 1. Question Card (Always 100% visible) */}
      <div style={{
        background: 'var(--surface)',
        border: `1.5px solid ${isStarActive ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '12px 18px',
        position: 'relative',
        boxShadow: isStarActive ? '0 0 25px rgba(251, 191, 36, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.25)',
        transition: 'all 0.3s ease',
        flexShrink: 0
      }}>
        {/* Top Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--primary)',
              background: 'rgba(34, 211, 238, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid var(--primary)',
              letterSpacing: '0.3px'
            }}>
              LƯỢT: {assignedTeam?.name}
            </span>

            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(251, 191, 36, 0.3)'
            }}>
              {question.points} PTS
            </span>

            {/* Collapsed Rescue Badge right on question header */}
            {rescueState?.step === 'collapsed' && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(34, 211, 238, 0.12)',
                border: '1px solid var(--primary)',
                color: '#E0F2FE',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                <LifeBuoy size={13} color="var(--primary)" />
                <span>CỨU VIỆN {rescueState.helperTeamName?.toUpperCase()}: [{rescueState.suggestion}]</span>
              </div>
            )}
          </div>

          <span style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            Trụ cột: <strong style={{ color: 'var(--text-primary)' }}>{question.pillar}</strong>
          </span>
        </div>

        {/* Big Scenario Text for Classroom Projector */}
        <h1 style={{
          fontSize: '21px',
          fontWeight: 700,
          lineHeight: '1.4',
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          {question.scenario}
        </h1>

        {/* Star Active Indicator */}
        {isStarActive && (
          <div style={{
            marginTop: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700
          }} className="pulse-gold">
            <Star size={13} fill="var(--accent)" />
            <span>⭐ NGÔI SAO HY VỌNG: Đúng +{question.points * 2} PTS | Sai -{question.points} PTS</span>
          </div>
        )}
      </div>

      {/* 2. 4 Options Grid (Always 100% visible!) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        flexShrink: 0
      }}>
        {question.options.map((option) => {
          const isSelected = chosenAnswer === option.key;
          const isCorrect = isResultRevealed && option.key === question.correctAnswer;
          const isWrongSelected = isResultRevealed && isSelected && !isCorrect;
          const isRescueSuggested = (rescueState?.step === 'suggested' || rescueState?.step === 'collapsed') && rescueState?.suggestion === option.key;

          let bg = 'var(--bg-secondary)';
          let border = 'var(--border)';
          let textColor = 'var(--text-primary)';

          if (isResultRevealed) {
            if (isCorrect) {
              bg = 'rgba(34, 197, 94, 0.15)';
              border = 'var(--success)';
              textColor = '#FFFFFF';
            } else if (isWrongSelected) {
              bg = 'rgba(239, 68, 68, 0.15)';
              border = 'var(--danger)';
              textColor = '#FCA5A5';
            } else {
              bg = 'var(--bg-secondary)';
              border = 'rgba(36, 59, 83, 0.4)';
              textColor = 'var(--text-muted)';
            }
          } else if (isSelected) {
            bg = 'rgba(34, 211, 238, 0.08)';
            border = 'var(--primary)';
            textColor = '#FFFFFF';
          } else if (isRescueSuggested) {
            border = 'rgba(34, 211, 238, 0.6)';
          }

          return (
            <div
              key={option.key}
              onClick={() => {
                if (!isAnswerLocked && rescueState?.step !== 'consulting' && rescueState?.step !== 'selecting_team') {
                  onSelectAnswer(option.key);
                }
              }}
              style={{
                background: bg,
                border: `1.5px solid ${border}`,
                borderRadius: '10px',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: !isAnswerLocked && rescueState?.step !== 'consulting' ? 'pointer' : 'default',
                boxShadow: isCorrect 
                  ? '0 0 16px rgba(34, 197, 94, 0.25)' 
                  : isSelected && !isResultRevealed 
                    ? '0 0 12px rgba(34, 211, 238, 0.2)' 
                    : 'none',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                flexShrink: 0,
                background: isCorrect ? 'var(--success)' : isSelected ? 'var(--primary-dark)' : 'var(--surface)',
                border: `1px solid ${isCorrect ? '#4ADE80' : isSelected ? 'var(--primary)' : 'var(--border)'}`,
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {option.key}
              </div>

              <div style={{
                fontSize: '16px',
                fontWeight: isCorrect || isSelected ? 600 : 500,
                lineHeight: '1.35',
                color: textColor,
                flex: 1
              }}>
                {option.text}
              </div>

              {/* Tag if helper team recommended this option */}
              {isRescueSuggested && !isResultRevealed && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: 'rgba(34, 211, 238, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid var(--primary)',
                  flexShrink: 0
                }}>
                  🛟 {rescueState.helperTeamName} ĐỀ XUẤT
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. INLINE RESCUE PANEL (Positioned directly below answers, NEVER covers them!) */}
      {rescueState?.step === 'selecting_team' && (
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--primary)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LifeBuoy size={18} color="var(--primary)" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
              🛟 CỨU VIỆN:
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              {assignedTeam?.name} chọn 1 đội tư vấn trong 10 giây (Tư vấn đúng nhận <strong>+50 PTS</strong>):
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {otherTeams.map(team => (
              <button
                key={team.id}
                onClick={() => onSelectRescueTeam(team)}
                className="btn-tactical btn-primary-cyan"
                style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '6px' }}
              >
                {team.name}
              </button>
            ))}

            <button
              onClick={onCancelRescue}
              className="btn-tactical"
              style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)' }}
              title="Hủy cứu viện và tiếp tục thời gian"
            >
              <X size={13} />
              <span>Hủy</span>
            </button>
          </div>
        </div>
      )}

      {rescueState?.step === 'consulting' && (
        <div style={{
          background: 'var(--surface)',
          border: '2px solid var(--primary)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 0 25px rgba(34, 211, 238, 0.3)',
          flexShrink: 0
        }}>
          {/* Helper team info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'rgba(34, 211, 238, 0.15)',
              border: '1px solid var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <LifeBuoy size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                {rescueState.helperTeamName?.toUpperCase()} ĐANG TƯ VẤN CHO {assignedTeam?.name?.toUpperCase()}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Đội tư vấn chính xác sẽ nhận +50 PTS • Timer câu hỏi chính tạm dừng
              </div>
            </div>
          </div>

          {/* Rescue 10s Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-secondary)',
            padding: '3px 10px',
            borderRadius: '6px',
            border: `1px solid ${consultTimer <= 3 ? 'var(--danger)' : 'var(--primary)'}`
          }}>
            <Clock size={14} color={consultTimer <= 3 ? 'var(--danger)' : 'var(--primary)'} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>CỨU VIỆN:</span>
            <span 
              className={consultTimer <= 3 ? 'timer-critical' : ''}
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: consultTimer <= 3 ? 'var(--danger)' : 'var(--primary)',
                fontVariantNumeric: 'tabular-nums',
                minWidth: '52px'
              }}
            >
              00:{consultTimer.toString().padStart(2, '0')}
            </span>
          </div>

          {/* MC buttons to record helper team's suggestion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700 }}>
              {rescueState.helperTeamName} ĐỀ XUẤT:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['A', 'B', 'C', 'D'].map(key => (
                <button
                  key={key}
                  onClick={() => onSelectRescueSuggestion(key)}
                  className="btn-tactical btn-primary-cyan"
                  style={{
                    width: '34px',
                    height: '34px',
                    padding: 0,
                    fontSize: '15px',
                    fontWeight: 800,
                    borderRadius: '6px'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {rescueState?.step === 'suggested' && (
        <div style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--primary)',
          borderRadius: '10px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 0 20px rgba(34, 211, 238, 0.25)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(34, 211, 238, 0.15)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: 800,
              fontSize: '13px'
            }}>
              🛟 {rescueState.helperTeamName?.toUpperCase()} ĐỀ XUẤT: [{rescueState.suggestion}]
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
              “{assignedTeam?.name} có thể giữ hoặc thay đổi quyết định cuối cùng.”
            </span>
          </div>

          <button
            onClick={onContinueAfterRescue}
            className="btn-tactical btn-primary-cyan"
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '6px'
            }}
          >
            <span>Tiếp tục ➔</span>
          </button>
        </div>
      )}

      {/* 4. MC Action Controls Bar */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexShrink: 0
      }}>
        {/* Left: Lifelines (Cứu Viện & Ngôi Sao Hy Vọng) */}
        {!isResultRevealed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 🛟 CỨU VIỆN Button */}
            <button
              onClick={onStartRescue}
              disabled={!canUseRescue}
              className="btn-tactical"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: isRescueActive ? 'rgba(34, 211, 238, 0.15)' : 'var(--bg-secondary)',
                borderColor: isRescueActive ? 'var(--primary)' : 'var(--border)',
                color: canUseRescue ? 'var(--primary)' : 'var(--text-muted)'
              }}
              title="Nhờ 1 trong 3 đội còn lại tư vấn trong 10s (Tư vấn đúng nhận +50 PTS)"
            >
              <LifeBuoy size={14} />
              <span>🛟 Cứu viện {assignedTeam?.rescueUsed ? '(Đã dùng)' : '(1/1)'}</span>
            </button>

            {/* ⭐ NGÔI SAO HY VỌNG Button */}
            <button
              onClick={onToggleStar}
              disabled={!canUseStar}
              className={`btn-tactical ${isStarActive ? 'btn-accent-gold pulse-gold' : ''}`}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                color: isStarActive ? '#FEF3C7' : canUseStar ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: isStarActive ? 'var(--accent)' : 'var(--border)'
              }}
              title="Đúng +2x điểm, Sai -1x điểm (Điểm không âm)"
            >
              <Star size={14} fill={isStarActive ? 'var(--accent)' : 'none'} />
              <span>⭐ Sao hy vọng {assignedTeam?.starUsed ? '(Đã dùng)' : isStarActive ? '(Đang bật)' : '(1/1)'}</span>
            </button>
          </div>
        )}

        {/* Center: Selected Answer for Active Team */}
        {!isResultRevealed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              Đáp án {assignedTeam?.name}:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['A', 'B', 'C', 'D'].map((key) => (
                <button
                  key={key}
                  disabled={isAnswerLocked || rescueState?.step === 'consulting'}
                  onClick={() => onSelectAnswer(key)}
                  className="btn-tactical"
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    fontSize: '14px',
                    fontWeight: 800,
                    borderRadius: '6px',
                    background: chosenAnswer === key ? 'var(--primary-dark)' : 'var(--bg-secondary)',
                    borderColor: chosenAnswer === key ? 'var(--primary)' : 'var(--border)',
                    color: chosenAnswer === key ? '#FFFFFF' : 'var(--text-primary)',
                    boxShadow: chosenAnswer === key ? '0 0 10px rgba(34, 211, 238, 0.3)' : 'none'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Lock & Reveal / Next Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {!isAnswerLocked ? (
            <button
              onClick={onLockAnswer}
              disabled={!chosenAnswer || rescueState?.step === 'consulting' || rescueState?.step === 'selecting_team'}
              className="btn-tactical btn-primary-cyan"
              style={{
                padding: '8px 22px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <Lock size={14} />
              <span>Khóa đáp án</span>
            </button>
          ) : !isResultRevealed ? (
            <button
              onClick={onRevealResult}
              className="btn-tactical btn-accent-gold"
              style={{
                padding: '8px 22px',
                fontSize: '13px',
                fontWeight: 800
              }}
            >
              <CheckCircle2 size={15} />
              <span>Công bố kết quả</span>
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="btn-tactical btn-primary-cyan pulse-cyan"
              style={{
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: 800
              }}
            >
              <span>{question.turnIndex === 8 ? 'Tiến vào Final Round ➔' : 'Câu tiếp theo ➔'}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 5. Result Explanation & Breakdown Banner (When result is revealed) */}
      {isResultRevealed && turnResult && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(34, 211, 238, 0.1)',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={16} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '2px',
              flexWrap: 'wrap'
            }}>
              {/* Active Team Result */}
              <span style={{ color: turnResult.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                {assignedTeam?.name}: [{chosenAnswer}] {turnResult.isCorrect ? '✅' : '❌'} ({turnResult.delta > 0 ? `+${turnResult.delta}` : turnResult.delta} PTS)
              </span>

              {/* Helper Team Result if Rescue was used */}
              {rescueState?.suggestion && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span style={{
                    color: rescueState.isHelperCorrect ? 'var(--primary)' : 'var(--text-secondary)',
                    background: rescueState.isHelperCorrect ? 'rgba(34, 211, 238, 0.1)' : 'rgba(255,255,255,0.03)',
                    padding: '1px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${rescueState.isHelperCorrect ? 'var(--primary)' : 'var(--border)'}`
                  }}>
                    CỨU VIỆN {rescueState.helperTeamName?.toUpperCase()}: [{rescueState.suggestion}] {rescueState.isHelperCorrect ? '✅ (+50 PTS)' : '❌ (0 PTS)'}
                  </span>
                </>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
              <strong>Ý nghĩa đoàn kết: </strong>{question.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
