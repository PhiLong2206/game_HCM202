// src/components/FinalQuestionPhase.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Flame, CheckCircle2, XCircle, Trophy, BookOpen, Lock, Clock, Zap, BookMarked } from 'lucide-react';
import { playLockSound, playRevealSound, playCorrectSound, playWrongSound, playTickSound } from '../utils/audio';

export default function FinalQuestionPhase({
  question,
  teams,
  onApplyFinalResults,
  onShowFinalPodium
}) {
  // Phases: 'FINAL_BETTING' | 'FINAL_READING' | 'FINAL_TRANSITION' | 'FINAL_ANSWERING' | 'FINAL_LOCKED' | 'FINAL_RESULT'
  const [phase, setPhase] = useState('FINAL_BETTING');
  
  // Bets per team: { [teamId]: number }
  const [bets, setBets] = useState({});
  const [betLabels, setBetLabels] = useState({}); // e.g. '50%' or 'ALL-IN' or '500 PTS'

  // Answers per team: { [teamId]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState({});

  // Evaluated results after reveal: { [teamId]: { isCorrect, delta, newScore, wasAllIn } }
  const [results, setResults] = useState(null);

  // Timer State for Final
  const [timerSeconds, setTimerSeconds] = useState(7);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const timeLeftRef = useRef(0);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelectBet = (teamId, amount, label) => {
    setBets(prev => ({ ...prev, [teamId]: amount }));
    setBetLabels(prev => ({ ...prev, [teamId]: label }));
    playLockSound();
  };

  const allBetsLocked = teams.every(t => typeof bets[t.id] === 'number');

  // Start Final Question: Starts 7-second READING phase
  const handleStartFinalReading = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    playRevealSound();
    setPhase('FINAL_READING');
    setTimerSeconds(7);
    timeLeftRef.current = 7;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        
        // Switch to Transition
        setPhase('FINAL_TRANSITION');
        timeoutRef.current = setTimeout(() => {
          startFinalAnswering();
        }, 650);
      }
    }, 1000);
  };

  // Start 20-second ANSWERING phase
  const startFinalAnswering = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setPhase('FINAL_ANSWERING');
    setTimerSeconds(20);
    timeLeftRef.current = 20;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 4 && t > 0) {
        playTickSound(t <= 3);
      }
      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleLockAllAnswers(); // Timeout auto-locks
      }
    }, 1000);
  };

  const handleSelectAnswer = (teamId, optionKey) => {
    if (phase !== 'FINAL_ANSWERING') return;
    setAnswers(prev => ({ ...prev, [teamId]: optionKey }));
    playLockSound();
  };

  const allAnswersSelected = teams.every(t => Boolean(answers[t.id]));

  // Early Lock: Stop timer and lock answers
  const handleLockAllAnswers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPhase('FINAL_LOCKED');
    playLockSound();
  };

  // Reveal Final Results: System automatically compares with question.correctAnswer
  const handleRevealFinal = () => {
    const calculatedResults = {};
    const updatedTeams = teams.map(t => {
      const teamBet = bets[t.id] || 0;
      const teamAns = answers[t.id];
      const isCorrect = teamAns === question.correctAnswer;
      const isAllIn = betLabels[t.id] === 'ALL-IN';

      let delta = 0;
      let newScore = t.score;

      if (isCorrect) {
        delta = teamBet;
        newScore = t.score + teamBet;
      } else {
        if (isAllIn) {
          delta = -t.score;
          newScore = 0;
        } else {
          delta = -teamBet;
          newScore = Math.max(0, t.score - teamBet);
        }
      }

      calculatedResults[t.id] = {
        isCorrect,
        delta,
        newScore,
        wasAllIn: isAllIn,
        chosenOption: teamAns || 'CHƯA CHỌN'
      };

      return {
        ...t,
        score: newScore,
        correctCount: (t.correctCount || 0) + (isCorrect ? 1 : 0)
      };
    });

    setResults(calculatedResults);
    setPhase('FINAL_RESULT');

    const hasAnyCorrect = Object.values(calculatedResults).some(r => r.isCorrect);
    if (hasAnyCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    onApplyFinalResults(updatedTeams, calculatedResults);
  };

  const isReading = phase === 'FINAL_READING';
  const isTransition = phase === 'FINAL_TRANSITION';
  const isAnswering = phase === 'FINAL_ANSWERING';
  const isLocked = phase === 'FINAL_LOCKED';
  const isResult = phase === 'FINAL_RESULT';

  const getTimerStyle = () => {
    if (timerSeconds <= 3) {
      return { color: 'var(--danger)', borderColor: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.15)', className: 'timer-critical-pulse' };
    }
    if (timerSeconds <= 5) {
      return { color: 'var(--accent)', borderColor: 'var(--accent)', bg: 'rgba(251, 191, 36, 0.12)', className: '' };
    }
    return { color: 'var(--primary)', borderColor: 'var(--primary)', bg: 'rgba(34, 211, 238, 0.1)', className: '' };
  };

  const timerStyle = getTimerStyle();

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
      {/* 1. STAGE: BETTING (Secret Bets & 50% & ALL-IN)                  */}
      {/* ============================================================== */}
      {phase === 'FINAL_BETTING' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          {/* Header Banner */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--accent)',
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '3px 14px',
              borderRadius: '6px',
              border: '1px solid var(--accent)',
              marginBottom: '4px'
            }}>
              <Flame size={14} />
              FINAL ROUND — LÁ BÀI CUỐI CÙNG
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              Cả 4 đội bí mật lựa chọn số điểm cược
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Mức cược: 100, 200, 300, 500 PTS, 50% hoặc 🔥 ALL-IN • Đúng cộng cược, Sai trừ cược
            </p>
          </div>

          {/* 4 Team Betting Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            width: '100%',
            maxWidth: '1060px'
          }}>
            {teams.map((t) => {
              const currentBet = bets[t.id];
              const currentLabel = betLabels[t.id];
              const halfScore = Math.round(t.score * 0.5);

              return (
                <div
                  key={t.id}
                  style={{
                    background: 'var(--surface)',
                    border: `1.5px solid ${currentBet ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '12px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: currentBet ? '0 0 16px rgba(34, 211, 238, 0.2)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700 }}>
                      Hiện có: {t.score.toLocaleString()} PTS
                    </div>
                  </div>

                  {/* Bet Options Grid: 100, 200, 300, 500, 50%, ALL-IN */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      {[100, 200, 300, 500].map((amt) => {
                        const isDisabled = amt > t.score;
                        const isSelected = currentBet === amt && currentLabel !== '50%' && currentLabel !== 'ALL-IN';

                        return (
                          <button
                            key={amt}
                            disabled={isDisabled}
                            onClick={() => handleSelectBet(t.id, amt, `${amt} PTS`)}
                            className="btn-tactical"
                            style={{
                              padding: '5px 4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isSelected ? 'var(--primary-dark)' : 'var(--bg-secondary)',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                              color: isSelected ? '#FFFFFF' : isDisabled ? 'var(--text-muted)' : 'var(--text-primary)',
                              opacity: isDisabled ? 0.35 : 1
                            }}
                          >
                            {amt} PTS
                          </button>
                        );
                      })}
                    </div>

                    {/* 50% and ALL-IN */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <button
                        disabled={t.score <= 0}
                        onClick={() => handleSelectBet(t.id, halfScore, '50%')}
                        className="btn-tactical"
                        style={{
                          padding: '6px 4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: currentLabel === '50%' ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-secondary)',
                          borderColor: currentLabel === '50%' ? 'var(--accent)' : 'var(--border)',
                          color: currentLabel === '50%' ? 'var(--accent)' : 'var(--text-primary)'
                        }}
                      >
                        50% ({halfScore})
                      </button>

                      <button
                        onClick={() => handleSelectBet(t.id, Math.max(0, t.score), 'ALL-IN')}
                        className="btn-tactical"
                        style={{
                          padding: '6px 4px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: currentLabel === 'ALL-IN' ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)' : 'rgba(239, 68, 68, 0.1)',
                          borderColor: currentLabel === 'ALL-IN' ? '#EF4444' : 'rgba(239, 68, 68, 0.4)',
                          color: currentLabel === 'ALL-IN' ? '#FFFFFF' : '#EF4444'
                        }}
                      >
                        🔥 ALL-IN {t.score <= 0 ? '(0)' : ''}
                      </button>
                    </div>
                  </div>

                  {/* Bet Status Badge */}
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: typeof currentBet === 'number' ? (currentLabel === 'ALL-IN' ? '#EF4444' : 'var(--primary)') : 'var(--text-muted)'
                  }}>
                    {typeof currentBet === 'number' ? `✓ Đã cược: ${currentBet} PTS (${currentLabel})` : 'Chờ đặt cược...'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleStartFinalReading}
            disabled={!allBetsLocked}
            className="btn-tactical btn-primary-cyan pulse-cyan"
            style={{
              padding: '10px 32px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '8px',
              opacity: allBetsLocked ? 1 : 0.4,
              cursor: allBetsLocked ? 'pointer' : 'not-allowed'
            }}
          >
            <span>MỞ LÁ BÀI CUỐI CÙNG & BẮT ĐẦU ĐỌC (7s) ➔</span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2 & 3. STAGE: READING / ANSWERING / RESULT                     */}
      {/* ============================================================== */}
      {phase !== 'FINAL_BETTING' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {/* Question Card */}
          <div style={{
            background: 'var(--surface)',
            border: `1.5px solid ${isResult ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '12px 18px',
            position: 'relative',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  background: 'rgba(251, 191, 36, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--accent)',
                  letterSpacing: '0.5px'
                }}>
                  FINAL ROUND — LÁ BÀI CUỐI CÙNG
                </span>

                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Cả 4 đội cùng tham gia • Không có hiệu ứng Vận mệnh
                </span>
              </div>

              {/* Dynamic Final Timer Display */}
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
                    <span>📖 ĐỌC CÂU FINAL 00:0{timerSeconds}</span>
                  </div>
                )}

                {isTransition && (
                  <div 
                    className="transition-banner-anim"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(251, 191, 36, 0.25) 100%)',
                      border: '2px solid var(--accent)',
                      borderRadius: '8px',
                      padding: '4px 14px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 900
                    }}
                  >
                    <Zap size={15} color="var(--accent)" fill="var(--accent)" />
                    <span>⚡ FINAL – TRẢ LỜI!</span>
                  </div>
                )}

                {isAnswering && (
                  <div 
                    className={timerStyle.className}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: timerStyle.bg,
                      border: `1.5px solid ${timerStyle.borderColor}`,
                      borderRadius: '8px',
                      padding: '3px 10px',
                      color: timerStyle.color,
                      fontSize: '12px',
                      fontWeight: 800
                    }}
                  >
                    <Clock size={14} />
                    <span>⚡ TRẢ LỜI 00:{timerSeconds.toString().padStart(2, '0')}</span>
                  </div>
                )}

                {isLocked && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(251, 191, 36, 0.12)',
                    border: '1.5px solid var(--accent)',
                    borderRadius: '8px',
                    padding: '3px 10px',
                    color: 'var(--accent)',
                    fontSize: '12px',
                    fontWeight: 800
                  }}>
                    <Lock size={13} />
                    <span>ĐÃ KHÓA TẤT CẢ ĐÁP ÁN</span>
                  </div>
                )}

                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Trọng tâm: <strong style={{ color: 'var(--text-primary)' }}>{question.pillar}</strong>
                </span>
              </div>
            </div>

            <h1 style={{
              fontSize: '20px',
              fontWeight: 700,
              lineHeight: '1.4',
              color: 'var(--text-primary)',
              letterSpacing: '-0.3px'
            }}>
              {question.question || question.scenario}
            </h1>
          </div>

          {/* 4 Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            flexShrink: 0
          }}>
            {question.options.map((option) => {
              const isCorrect = isResult && option.key === question.correctAnswer;

              return (
                <div
                  key={option.key}
                  style={{
                    background: isResult
                      ? (isCorrect ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-secondary)')
                      : 'var(--bg-secondary)',
                    border: `1.5px solid ${isResult ? (isCorrect ? 'var(--success)' : 'rgba(36, 59, 83, 0.4)') : 'var(--border)'}`,
                    borderRadius: '10px',
                    padding: '9px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isCorrect ? '0 0 18px rgba(34, 197, 94, 0.3)' : 'none',
                    opacity: isResult && !isCorrect ? 0.45 : isReading ? 0.9 : 1,
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
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
                    lineHeight: '1.35',
                    color: isCorrect ? '#FFFFFF' : 'var(--text-primary)',
                    flex: 1
                  }}>
                    {option.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team Answer & Results Bar */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}>
            {/* 4 Team Answer Inputs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              flex: 1
            }}>
              {teams.map((t) => {
                const teamBet = bets[t.id];
                const teamLabel = betLabels[t.id];
                const chosen = answers[t.id];
                const res = results?.[t.id];

                return (
                  <div
                    key={t.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${res ? (res.isCorrect ? 'var(--success)' : 'var(--danger)') : 'var(--border)'}`,
                      borderRadius: '8px',
                      padding: '6px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {t.name}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: teamLabel === 'ALL-IN' ? '#EF4444' : 'var(--accent)'
                      }}>
                        {teamLabel === 'ALL-IN' ? `🔥 ${teamBet} PTS` : `${teamBet} PTS`}
                      </span>
                    </div>

                    {/* Answer Selection Buttons or Result */}
                    {!isResult ? (
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {['A', 'B', 'C', 'D'].map(key => (
                          <button
                            key={key}
                            disabled={!isAnswering}
                            onClick={() => handleSelectAnswer(t.id, key)}
                            className="btn-tactical"
                            style={{
                              flex: 1,
                              padding: '3px 0',
                              fontSize: '12px',
                              fontWeight: 800,
                              borderRadius: '4px',
                              background: chosen === key ? 'var(--primary-dark)' : 'var(--surface)',
                              borderColor: chosen === key ? 'var(--primary)' : 'var(--border)',
                              color: chosen === key ? '#FFFFFF' : 'var(--text-secondary)',
                              opacity: isReading || isLocked ? 0.4 : 1
                            }}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ) : res ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: res.isCorrect ? 'var(--success)' : 'var(--danger)',
                        background: res.isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '3px 6px',
                        borderRadius: '4px'
                      }}>
                        <span>[{res.chosenOption}] {res.isCorrect ? '✓ ĐÚNG' : '✕ SAI'}</span>
                        <span>{res.delta > 0 ? `+${res.delta}` : res.delta} PTS</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons: LOCK ALL or REVEAL FINAL or GO TO PODIUM */}
            {isAnswering ? (
              <button
                onClick={handleLockAllAnswers}
                disabled={!allAnswersSelected}
                className="btn-tactical btn-accent-gold pulse-gold"
                style={{
                  padding: '9px 22px',
                  fontSize: '13px',
                  fontWeight: 800,
                  opacity: allAnswersSelected ? 1 : 0.4,
                  cursor: allAnswersSelected ? 'pointer' : 'not-allowed',
                  flexShrink: 0
                }}
              >
                <Lock size={14} />
                <span>🔒 KHÓA TẤT CẢ ĐÁP ÁN</span>
              </button>
            ) : isLocked ? (
              <button
                onClick={handleRevealFinal}
                className="btn-tactical btn-primary-cyan pulse-cyan"
                style={{
                  padding: '9px 24px',
                  fontSize: '13px',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                <span>REVEAL FINAL ➔</span>
              </button>
            ) : isReading ? (
              <div style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                📖 Thời gian đọc...
              </div>
            ) : isResult ? (
              <button
                onClick={onShowFinalPodium}
                className="btn-tactical btn-primary-cyan pulse-cyan"
                style={{
                  padding: '9px 22px',
                  fontSize: '13px',
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                <Trophy size={16} />
                <span>BẢNG XẾP HẠNG CHUNG CUỘC ➔</span>
              </button>
            ) : null}
          </div>

          {/* Explanation Banner (When revealed) */}
          {isResult && (
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
                  Đáp án đúng: <strong>[{question.correctAnswer}]</strong> • Ý nghĩa bài học:
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {question.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
