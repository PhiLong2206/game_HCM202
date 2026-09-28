// src/components/FinalQuestionPhase.jsx
import React from 'react';
import { Star, Lock, CheckCircle2, Trophy, BookOpen } from 'lucide-react';

export default function FinalQuestionPhase({
  question,
  teams,
  finalAnswers,
  onSelectFinalAnswer,
  activeStarTeams,
  onToggleFinalStar,
  isAnswerLocked,
  onLockFinalAnswers,
  isResultRevealed,
  onRevealFinalResults,
  onShowFinalPodium,
  finalResults,
  isLocking,
  countdownStep
}) {
  const allAnswersSelected = teams.every((t) => Boolean(finalAnswers[t.id]));

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '12px 20px',
      gap: '10px',
      position: 'relative'
    }}>
      {/* Question Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1.5px solid var(--accent)',
        borderRadius: '12px',
        padding: '14px 20px',
        position: 'relative',
        boxShadow: '0 0 25px rgba(251, 191, 36, 0.2)'
      }} className="pulse-gold">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--accent)',
            letterSpacing: '0.5px'
          }}>
            FINAL ROUND — 300 PTS • CẢ 4 ĐỘI THAM GIA ĐỒNG THỜI
          </span>

          <span style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 600
          }}>
            ⭐ Đúng: <strong style={{ color: 'var(--accent)' }}>+300 PTS</strong> (hoặc <strong style={{ color: 'var(--accent)' }}>+600</strong> nếu dùng Sao) | Sai: <strong style={{ color: 'var(--danger)' }}>0 PTS</strong> (<strong style={{ color: 'var(--danger)' }}>-300</strong> nếu dùng Sao)
          </span>
        </div>

        {/* Big Scenario Text */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: '1.45',
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px'
        }}>
          {question.scenario}
        </h1>
      </div>

      {/* 4 Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px'
      }}>
        {question.options.map((option) => {
          const isCorrect = isResultRevealed && option.key === question.correctAnswer;

          return (
            <div
              key={option.key}
              style={{
                background: isResultRevealed 
                  ? (isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary)')
                  : 'var(--bg-secondary)',
                border: `1.5px solid ${isResultRevealed ? (isCorrect ? 'var(--success)' : 'rgba(36, 59, 83, 0.4)') : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: isCorrect ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none',
                opacity: isResultRevealed && !isCorrect ? 0.45 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                flexShrink: 0,
                background: isCorrect ? 'var(--success)' : 'var(--surface)',
                border: `1px solid ${isCorrect ? '#4ADE80' : 'var(--border)'}`,
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
                fontWeight: isCorrect ? 700 : 500,
                lineHeight: '1.4',
                color: isCorrect ? '#FFFFFF' : 'var(--text-primary)'
              }}>
                {option.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* MC Input Bar for 4 Teams' Final Answers & Hope Star */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* 4 Teams Answer Rows */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          flex: 1
        }}>
          {teams.map((team) => {
            const chosen = finalAnswers[team.id];
            const isStarActive = activeStarTeams[team.id];
            const canUseStar = !team.starUsed && !isAnswerLocked;
            const res = finalResults?.[team.id];

            return (
              <div
                key={team.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1.5px solid ${isStarActive ? 'var(--accent)' : chosen ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: isStarActive ? '0 0 10px rgba(251, 191, 36, 0.2)' : 'none'
                }}
              >
                {/* Team Name + Star Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {team.name}
                  </span>

                  {!isResultRevealed ? (
                    canUseStar && (
                      <button
                        onClick={() => onToggleFinalStar(team.id)}
                        className="btn-tactical"
                        style={{
                          padding: '2px 6px',
                          fontSize: '10px',
                          color: isStarActive ? '#FEF3C7' : 'var(--accent)',
                          background: isStarActive ? 'var(--accent-gold)' : 'transparent',
                          borderColor: isStarActive ? 'var(--accent)' : 'var(--border)'
                        }}
                        title="Bật Ngôi Sao Hy Vọng cho Final Round"
                      >
                        <Star size={10} fill={isStarActive ? 'var(--accent)' : 'none'} />
                        <span>{isStarActive ? 'ĐÃ BẬT ⭐' : 'DÙNG ⭐'}</span>
                      </button>
                    )
                  ) : (
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: res?.isCorrect ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {res?.delta > 0 ? `+${res?.delta}` : res?.delta} PTS
                    </span>
                  )}
                </div>

                {/* Option Buttons A, B, C, D */}
                <div style={{ display: 'flex', gap: '3px' }}>
                  {['A', 'B', 'C', 'D'].map((key) => {
                    const isSelected = chosen === key;
                    const isCorrect = isResultRevealed && key === question.correctAnswer;

                    return (
                      <button
                        key={key}
                        disabled={isAnswerLocked}
                        onClick={() => onSelectFinalAnswer(team.id, key)}
                        className="btn-tactical"
                        style={{
                          flex: 1,
                          height: '28px',
                          padding: 0,
                          fontSize: '13px',
                          fontWeight: 800,
                          borderRadius: '4px',
                          background: isResultRevealed 
                            ? (isCorrect && isSelected ? 'var(--success)' : isSelected ? 'var(--primary-dark)' : 'var(--surface)')
                            : (isSelected ? 'var(--primary-dark)' : 'var(--surface)'),
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)'
                        }}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lock / Reveal / Podium Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {!isAnswerLocked ? (
            <button
              onClick={onLockFinalAnswers}
              disabled={!allAnswersSelected || isLocking}
              className="btn-tactical btn-primary-cyan"
              style={{
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 700
              }}
            >
              <Lock size={15} />
              <span>Khóa đáp án chung cuộc</span>
            </button>
          ) : !isResultRevealed ? (
            <button
              onClick={onRevealFinalResults}
              className="btn-tactical btn-accent-gold"
              style={{
                padding: '9px 22px',
                fontSize: '13px',
                fontWeight: 800
              }}
            >
              <CheckCircle2 size={16} />
              <span>Công bố kết quả</span>
            </button>
          ) : (
            <button
              onClick={onShowFinalPodium}
              className="btn-tactical btn-accent-gold pulse-gold"
              style={{
                padding: '9px 24px',
                fontSize: '13px',
                fontWeight: 800
              }}
            >
              <Trophy size={16} />
              <span>Bảng xếp hạng chung cuộc 🏆</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanation Banner (After reveal) */}
      {isResultRevealed && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BookOpen size={16} />
          </div>

          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--accent)',
              marginBottom: '2px'
            }}>
              Tổng hòa 3 điều kiện Đại đoàn kết toàn dân tộc:
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45' }}>
              {question.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Countdown overlay modal when locking final answers */}
      {isLocking && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(7, 17, 31, 0.92)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--primary)',
            marginBottom: '10px'
          }}>
            LOCKED FINAL ANSWERS
          </div>

          {typeof countdownStep === 'number' && (
            <div style={{
              fontSize: '88px',
              fontWeight: 800,
              color: '#FFFFFF',
              textShadow: '0 0 35px rgba(34, 211, 238, 0.6)',
              lineHeight: 1
            }}>
              {countdownStep}
            </div>
          )}

          {countdownStep === 'reveal' && (
            <div style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--accent)',
              textShadow: '0 0 25px rgba(251, 191, 36, 0.6)'
            }}>
              REVEAL QUESTION
            </div>
          )}
        </div>
      )}
    </div>
  );
}
