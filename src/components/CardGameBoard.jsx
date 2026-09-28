// src/components/CardGameBoard.jsx
import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  BookOpen, 
  Coins, 
  Clock, 
  Zap, 
  BookMarked,
  RotateCcw,
  Check
} from 'lucide-react';
import { playRevealSound } from '../utils/audio';

export default function CardGameBoard({
  roundQuestions,
  currentRound,
  activeTeam,
  otherTeams,
  usedCardMap, // { [cardId]: teamName }
  selectedCard,
  onSelectCard,
  onCancelSelectCard,
  onConfirmCardSelection,
  currentBet,
  onSelectBet,
  onConfirmBetAndFlip,
  gamePhase, // 'CARD_SELECT' | 'CARD_CONFIRM' | 'BETTING' | 'READING' | 'TRANSITION_ANSWER' | 'ANSWERING' | 'ANSWER_LOCKED' | 'RESULT' | 'FATE_READY' | 'FATE_REVEAL' | 'ROUND_COMPLETE' | 'ROUND_TRANSITION'
  timerSeconds,
  chosenAnswer,
  onSelectAnswer,
  onLockAnswer,
  resultData, // { isCorrect, isTimeout, delta, newScore, correctAnswer }
  onOpenFate,
  fateResult, // { fateInfo, bonusPoints, headline, description, shieldTriggered, mysteryValue, allyTeamId }
  onSelectAllyTeam,
  onContinueTurn
}) {
  const [isRevealingFateAnim, setIsRevealingFateAnim] = useState(false);

  // Available bets: [100, 200, 300, 400, 500] limited by team's current points
  const teamScore = activeTeam?.score ?? 0;
  let betOptions = [100, 200, 300, 400, 500].filter(amount => amount <= teamScore);
  if (betOptions.length === 0) {
    if (teamScore > 0) {
      betOptions = [teamScore];
    } else {
      betOptions = [0]; // Lượt gỡ điểm: cược 0 PTS
    }
  }

  const handleOpenFateClick = () => {
    setIsRevealingFateAnim(true);
    playRevealSound();
    setTimeout(() => {
      setIsRevealingFateAnim(false);
      onOpenFate();
    }, 1200);
  };

  const isReading = gamePhase === 'READING';
  const isTransition = gamePhase === 'TRANSITION_ANSWER';
  const isAnswering = gamePhase === 'ANSWERING';
  const isResult = ['ANSWER_LOCKED', 'RESULT', 'FATE_READY', 'FATE_REVEAL'].includes(gamePhase);
  const isQuestionScreen = ['READING', 'TRANSITION_ANSWER', 'ANSWERING', 'ANSWER_LOCKED', 'RESULT', 'FATE_READY', 'FATE_REVEAL'].includes(gamePhase);

  // Timer visual style for Answering phase
  const getAnswerTimerStyle = () => {
    if (timerSeconds <= 3) {
      return {
        color: 'var(--danger)',
        borderColor: 'var(--danger)',
        bg: 'rgba(239, 68, 68, 0.15)',
        className: 'timer-critical-pulse'
      };
    }
    if (timerSeconds <= 5) {
      return {
        color: 'var(--accent)',
        borderColor: 'var(--accent)',
        bg: 'rgba(251, 191, 36, 0.12)',
        className: ''
      };
    }
    return {
      color: 'var(--primary)',
      borderColor: 'var(--primary)',
      bg: 'rgba(34, 211, 238, 0.1)',
      className: ''
    };
  };

  const answerTimerStyle = getAnswerTimerStyle();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '8px 18px',
      gap: '6px',
      position: 'relative'
    }}>
      {/* ============================================================== */}
      {/* 1. CARD BOARD VIEW (12 CARDS: 6 × 2 GRID)                      */}
      {/* ============================================================== */}
      {(gamePhase === 'CARD_SELECT' || gamePhase === 'CARD_CONFIRM' || gamePhase === 'BETTING' || gamePhase === 'ROUND_COMPLETE' || gamePhase === 'ROUND_TRANSITION') && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 0',
          position: 'relative'
        }}>
          {/* Top Banner Prompt */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--primary)',
              background: 'rgba(34, 211, 238, 0.1)',
              padding: '3px 14px',
              borderRadius: '6px',
              border: '1px solid var(--primary)',
              marginBottom: '4px'
            }}>
              ROUND {currentRound} • LƯỢT: {activeTeam?.name} ({activeTeam?.score.toLocaleString()} PTS)
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              {gamePhase === 'BETTING' 
                ? `${activeTeam?.name} – CHỌN MỨC ĐIỂM CƯỢC`
                : selectedCard && gamePhase === 'CARD_CONFIRM'
                  ? `${activeTeam?.name} CHỌN CARD ${selectedCard.cardNum}`
                  : 'CHỌN MỘT LÁ BÀI BÍ MẬT'}
            </h2>
          </div>

          {/* 12 Cards Grid: 6 cards × 2 rows */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '12px',
            width: '100%',
            maxWidth: '1060px',
            margin: 'auto 0'
          }}>
            {roundQuestions.map((q) => {
              const usedTeam = usedCardMap[q.id];
              const isUsed = Boolean(usedTeam);
              const isSelected = selectedCard?.id === q.id;

              return (
                <div
                  key={q.id}
                  onClick={() => {
                    if (!isUsed && (gamePhase === 'CARD_SELECT' || gamePhase === 'CARD_CONFIRM')) {
                      onSelectCard(q);
                    }
                  }}
                  className={`card-3d-box ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    height: '135px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    textAlign: 'center',
                    transform: isSelected ? 'translateY(-10px) scale(1.05)' : 'none',
                    borderColor: isSelected ? 'var(--primary)' : isUsed ? '#1E293B' : 'var(--border-light)'
                  }}
                >
                  <div className="card-inner-pattern" />

                  {/* Top Glyph */}
                  <div style={{
                    fontSize: '13px',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    ◇
                  </div>

                  {/* Center Symbol */}
                  <div style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: isSelected ? 'var(--primary)' : isUsed ? '#334155' : '#476282',
                    textShadow: isSelected ? '0 0 15px rgba(34, 211, 238, 0.4)' : 'none'
                  }}>
                    {isUsed ? '✕' : '?'}
                  </div>

                  {/* Bottom Card Code */}
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: isSelected ? 'var(--primary)' : isUsed ? '#475569' : 'var(--text-secondary)',
                      letterSpacing: '0.5px'
                    }}>
                      CARD {q.cardNum}
                    </div>

                    {isUsed && (
                      <span style={{ fontSize: '9px', color: '#EF4444', fontWeight: 800, display: 'block', marginTop: '1px' }}>
                        ✓ {usedTeam}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar: Card Confirmation */}
          {gamePhase === 'CARD_CONFIRM' && selectedCard && (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--primary)',
              borderRadius: '10px',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.25)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeTeam?.name} đã chọn <strong style={{ color: 'var(--primary)' }}>CARD {selectedCard.cardNum}</strong>
              </span>

              <button
                onClick={onConfirmCardSelection}
                className="btn-tactical btn-primary-cyan pulse-cyan"
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 800 }}
              >
                <Check size={15} />
                <span>XÁC NHẬN CARD {selectedCard.cardNum}</span>
              </button>

              <button
                onClick={onCancelSelectCard}
                className="btn-tactical"
                style={{ padding: '8px 14px', fontSize: '12px' }}
              >
                <RotateCcw size={13} />
                <span>CHỌN LẠI</span>
              </button>
            </div>
          )}

          {/* Action Bar: Betting (Appears after Card is confirmed) */}
          {gamePhase === 'BETTING' && selectedCard && (
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--primary)',
              borderRadius: '10px',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 0 25px rgba(34, 211, 238, 0.25)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={16} color="var(--accent)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Mức cược:
                </span>
              </div>

              {/* Bet Amount Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {betOptions.map(amount => (
                  <button
                    key={amount}
                    onClick={() => onSelectBet(amount)}
                    className="btn-tactical"
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      fontWeight: 800,
                      background: currentBet === amount ? 'var(--primary-dark)' : 'var(--bg-secondary)',
                      borderColor: currentBet === amount ? 'var(--primary)' : 'var(--border)',
                      color: currentBet === amount ? '#FFFFFF' : 'var(--text-primary)',
                      boxShadow: currentBet === amount ? '0 0 12px rgba(34, 211, 238, 0.35)' : 'none'
                    }}
                  >
                    {amount === 0 ? '0 PTS (GỠ ĐIỂM)' : `${amount} PTS`}
                  </button>
                ))}
              </div>

              {/* Lock Bet & Flip Card Button */}
              {typeof currentBet === 'number' && (
                <button
                  onClick={onConfirmBetAndFlip}
                  className="btn-tactical btn-accent-gold pulse-gold"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    marginLeft: '8px'
                  }}
                >
                  <Lock size={14} />
                  <span>KHÓA CƯỢC ({currentBet} PTS) & MỞ CÂU HỎI ➔</span>
                </button>
              )}
            </div>
          )}

          {/* Round Complete Transition Overlay */}
          {gamePhase === 'ROUND_COMPLETE' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 17, 31, 0.92)',
              backdropFilter: 'blur(4px)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--accent)',
                letterSpacing: '0.5px'
              }}>
                ROUND {currentRound} HOÀN THÀNH
              </div>
              <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 600 }}>
                4 / 12 LÁ BÀI ĐÃ ĐƯỢC MỞ • 8 LÁ VẪN CÒN LÀ BÍ ẨN
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                8 lá bài còn lại không được hé lộ và sẽ được thay thế hoàn toàn...
              </div>
            </div>
          )}

          {/* Round Transition to Round 2 */}
          {gamePhase === 'ROUND_TRANSITION' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 17, 31, 0.95)',
              backdropFilter: 'blur(5px)',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 900,
                color: 'var(--primary)',
                letterSpacing: '-0.3px'
              }}>
                ROUND 2
              </div>
              <div style={{ fontSize: '16px', color: 'var(--accent)', fontWeight: 700 }}>
                BỘ BÀI MỚI ĐANG ĐƯỢC XÁO...
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Thứ tự đảo ngược: Đội 4 ➔ Đội 3 ➔ Đội 2 ➔ Đội 1
              </div>
            </div>
          )}

          {/* Round Transition to Round 3: THỬ THÁCH ĐẠI ĐOÀN KẾT */}
          {gamePhase === 'ROUND3_TRANSITION' && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 17, 31, 0.96)',
              backdropFilter: 'blur(6px)',
              zIndex: 35,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '1px'
              }}>
                🤝 ROUND 3
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 900,
                color: 'var(--accent)',
                letterSpacing: '-0.5px',
                textAlign: 'center'
              }}>
                THỬ THÁCH ĐẠI ĐOÀN KẾT
              </div>
              <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.5px' }}>
                “Từ cạnh tranh đến hợp lực”
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. QUESTION SCREEN (Reading 5s -> Answering 15s -> Result)     */}
      {/* ============================================================== */}
      {isQuestionScreen && selectedCard && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {/* Card Header & Question Container */}
          <div style={{
            background: 'var(--surface)',
            border: `1.5px solid ${gamePhase === 'FATE_REVEAL' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '12px 18px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            flexShrink: 0
          }}>
            {/* Badges Bar & Dual-Phase Timer Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  background: 'rgba(34, 211, 238, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--primary)',
                  letterSpacing: '0.5px'
                }}>
                  CARD {selectedCard.cardNum} • ROUND {currentRound}
                </span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  CƯỢC: {currentBet} PTS
                </span>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-primary)'
                }}>
                  LƯỢT: <strong style={{ color: 'var(--primary)' }}>{activeTeam?.name}</strong>
                </span>
              </div>

              {/* Dynamic Phase Timer Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isReading && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(34, 211, 238, 0.12)',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '8px',
                    padding: '3px 10px',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    <BookMarked size={14} />
                    <span>📖 ĐỌC CÂU HỎI 00:0{timerSeconds}</span>
                  </div>
                )}

                {isTransition && (
                  <div 
                    className="transition-banner-anim"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.25) 0%, rgba(251, 191, 36, 0.25) 100%)',
                      border: '2px solid var(--accent)',
                      borderRadius: '8px',
                      padding: '4px 14px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 900,
                      boxShadow: '0 0 16px rgba(251, 191, 36, 0.4)'
                    }}
                  >
                    <Zap size={15} color="var(--accent)" fill="var(--accent)" />
                    <span>⚡ TRẢ LỜI!</span>
                  </div>
                )}

                {isAnswering && (
                  <div 
                    className={answerTimerStyle.className}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: answerTimerStyle.bg,
                      border: `1.5px solid ${answerTimerStyle.borderColor}`,
                      borderRadius: '8px',
                      padding: '3px 10px',
                      color: answerTimerStyle.color,
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                  >
                    <Clock size={14} />
                    <span>⚡ TRẢ LỜI 00:{timerSeconds.toString().padStart(2, '0')}</span>
                  </div>
                )}

                {isResult && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: resultData?.isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1.5px solid ${resultData?.isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                    borderRadius: '8px',
                    padding: '3px 10px',
                    color: resultData?.isCorrect ? 'var(--success)' : 'var(--danger)',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    {resultData?.isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{resultData?.isCorrect ? 'CHÍNH XÁC' : 'CHƯA CHÍNH XÁC'}</span>
                  </div>
                )}

                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Trụ cột: <strong style={{ color: 'var(--text-primary)' }}>{selectedCard.pillar}</strong>
                </span>
              </div>
            </div>

            {/* Question Text */}
            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '1.4',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              {selectedCard.question}
            </h1>
          </div>

          {/* 4 Options Grid (Always visible, disabled in READING) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            flexShrink: 0
          }}>
            {selectedCard.options.map((option) => {
              const isSelected = chosenAnswer === option.key;
              const isCorrectAnswer = isResult && option.key === selectedCard.correctAnswer;
              const isWrongSelected = isResult && isSelected && !isCorrectAnswer;

              let bg = 'var(--bg-secondary)';
              let border = 'var(--border)';
              let textColor = 'var(--text-primary)';
              let opacity = 1;

              if (isReading) {
                // Reading phase: answers clearly visible, neutral/disabled
                bg = 'var(--bg-secondary)';
                border = 'var(--border)';
                textColor = 'var(--text-primary)';
                opacity = 0.9;
              } else if (isResult) {
                // Evaluated result: GREEN for correct answer, RED for wrong selected answer
                if (isCorrectAnswer) {
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
                // SELECTED before Lock: strictly CYAN! NEVER green or red!
                bg = 'rgba(34, 211, 238, 0.12)';
                border = 'var(--primary)';
                textColor = '#FFFFFF';
              }

              return (
                <div
                  key={option.key}
                  onClick={() => {
                    if (isAnswering) {
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
                    cursor: isAnswering ? 'pointer' : 'default',
                    boxShadow: isCorrectAnswer 
                      ? '0 0 16px rgba(34, 197, 94, 0.25)' 
                      : isSelected && !isResult 
                        ? '0 0 12px rgba(34, 211, 238, 0.3)' 
                        : 'none',
                    opacity,
                    transition: 'all 0.2s ease',
                    pointerEvents: isAnswering ? 'auto' : 'none'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    background: isCorrectAnswer 
                      ? 'var(--success)' 
                      : isWrongSelected 
                        ? 'var(--danger)' 
                        : isSelected 
                          ? 'var(--primary-dark)' 
                          : 'var(--surface)',
                    border: `1px solid ${
                      isCorrectAnswer 
                        ? '#4ADE80' 
                        : isWrongSelected 
                          ? '#F87171' 
                          : isSelected 
                            ? 'var(--primary)' 
                            : 'var(--border)'
                    }`,
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
                    fontSize: '15px',
                    fontWeight: isCorrectAnswer || isSelected ? 600 : 500,
                    lineHeight: '1.35',
                    color: textColor,
                    flex: 1
                  }}>
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================== */}
          {/* FATE CARD UNLOCKED (When Correct)                          */}
          {/* ========================================================== */}
          {gamePhase === 'FATE_READY' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',
              border: '2px solid var(--accent)',
              borderRadius: '10px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 0 25px rgba(251, 191, 36, 0.25)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ fontSize: '22px' }}>✨</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                    ✓ CHÍNH XÁC! {activeTeam?.name} +{currentBet} PTS • ✨ VẬN MỆNH ĐÃ ĐƯỢC MỞ KHÓA
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Lá bài đang ẩn chứa một hiệu ứng Vận mệnh bí mật. Nhấn nút để mở vận mệnh!
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenFateClick}
                disabled={isRevealingFateAnim}
                className="btn-tactical btn-accent-gold pulse-gold"
                style={{
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '6px'
                }}
              >
                <Sparkles size={16} />
                <span>{isRevealingFateAnim ? 'Đang mở Vận mệnh...' : 'MỞ VẬN MỆNH ✨'}</span>
              </button>
            </div>
          )}

          {/* REVEALED FATE EFFECT DETAILS */}
          {gamePhase === 'FATE_REVEAL' && fateResult && (
            <div 
              className="fate-reveal-anim"
              style={{
                background: 'var(--surface)',
                border: `2px solid ${fateResult.fateInfo.color || 'var(--primary)'}`,
                borderRadius: '10px',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: `0 0 25px ${fateResult.fateInfo.color}33`,
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '28px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${fateResult.fateInfo.color}`
                }}>
                  {fateResult.fateInfo.icon}
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: fateResult.fateInfo.color
                  }}>
                    VẬN MỆNH: {fateResult.fateInfo.name} — {fateResult.headline}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {fateResult.description}
                  </div>
                </div>
              </div>

              {/* Special Action if ALLY effect needs picking an ally team */}
              {fateResult.fateInfo.type === 'ALLY' && !fateResult.allyTeamId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textAlign: 'right' }}>
                    🤝 BẠN NHẬN +100 PTS • HÃY CHỌN 1 ĐỘI ĐỒNG HÀNH CÙNG NHẬN +100 PTS:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {otherTeams.map(t => (
                      <button
                        key={t.id}
                        onClick={() => onSelectAllyTeam(t.id)}
                        className="btn-tactical btn-primary-cyan pulse-cyan"
                        style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 800 }}
                      >
                        🤝 {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : fateResult.fateInfo.type === 'ALLY' && fateResult.allyTeamId ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    background: 'rgba(34, 211, 238, 0.15)',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    textAlign: 'center',
                    boxShadow: '0 0 16px rgba(34, 211, 238, 0.3)'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--primary)' }}>
                      {activeTeam?.name} 🤝 {otherTeams.find(t => t.id === fateResult.allyTeamId)?.name || `Đội ${fateResult.allyTeamId}`}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)' }}>
                      CÙNG TIẾN! (+100 PTS — +100 PTS)
                    </div>
                  </div>
                  <button
                    onClick={onContinueTurn}
                    className="btn-tactical btn-primary-cyan pulse-cyan"
                    style={{
                      padding: '8px 22px',
                      fontSize: '13px',
                      fontWeight: 800
                    }}
                  >
                    <span>TIẾP TỤC ➔</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onContinueTurn}
                  className="btn-tactical btn-primary-cyan pulse-cyan"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: 800
                  }}
                >
                  <span>TIẾP TỤC ➔</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* BOTTOM ACTION BAR (Reading / Answering / Result)            */}
          {/* ========================================================== */}
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
            {/* Left: Chosen Answer Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Đáp án {activeTeam?.name}:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['A', 'B', 'C', 'D'].map((key) => (
                  <button
                    key={key}
                    disabled={!isAnswering}
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
                      opacity: isReading ? 0.4 : 1
                    }}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Actions according to Current Phase */}
            {isReading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>
                <BookMarked size={16} />
                <span>Đang trong thời gian đọc (10s). Chuẩn bị trả lời...</span>
              </div>
            ) : isTransition ? (
              <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 800 }}>
                ⚡ Sẵn sàng trả lời!
              </div>
            ) : isAnswering ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={onLockAnswer}
                  disabled={!chosenAnswer}
                  className="btn-tactical btn-accent-gold"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: 800,
                    opacity: chosenAnswer ? 1 : 0.4,
                    cursor: chosenAnswer ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Lock size={15} />
                  <span>🔒 KHÓA ĐÁP ÁN</span>
                </button>
              </div>
            ) : gamePhase === 'RESULT' && !resultData?.isCorrect ? (
              /* When Wrong / Timeout: Show explanation + TIẾP TỤC (No Fate) */
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 700 }}>
                  {resultData?.isTimeout 
                    ? `⏰ HẾT GIỜ! Tính là sai: ${currentBet > 0 ? `-${currentBet}` : '0'} PTS • 🔒 VẬN MỆNH KHÔNG ĐƯỢC MỞ`
                    : `✕ CHƯA CHÍNH XÁC: ${currentBet > 0 ? `-${currentBet}` : '0'} PTS • 🔒 VẬN MỆNH KHÔNG ĐƯỢC MỞ`}
                </span>
                <button
                  onClick={onContinueTurn}
                  className="btn-tactical btn-primary-cyan"
                  style={{
                    padding: '8px 22px',
                    fontSize: '13px',
                    fontWeight: 800
                  }}
                >
                  <span>TIẾP TỤC ➔</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : null}
          </div>

          {/* Explanation Banner (Appears when evaluated) */}
          {(gamePhase === 'RESULT' || gamePhase === 'FATE_READY' || gamePhase === 'FATE_REVEAL') && (
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
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', marginBottom: '2px' }}>
                  Đáp án đúng: <strong>[{selectedCard.correctAnswer}]</strong> • Ý nghĩa bài học:
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {selectedCard.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
