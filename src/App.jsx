// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QUESTIONS, INITIAL_TEAMS } from './data/questions';
import GameHeader from './components/GameHeader';
import TeamBoard from './components/TeamBoard';
import TurnPlayPhase from './components/TurnPlayPhase';
import FinalQuestionPhase from './components/FinalQuestionPhase';
import FinalRanking from './components/FinalRanking';
import MCPanel from './components/MCPanel';
import { 
  playLockSound, 
  playRevealSound, 
  playCorrectSound, 
  playWrongSound, 
  playWarningAlarm, 
  playGlitchSound, 
  setMuted 
} from './utils/audio';
import { ShieldCheck, Play, LifeBuoy, Star } from 'lucide-react';

export default function App() {
  // Game states: 'intro' | 'playing' | 'final_ranking'
  const [gameState, setGameState] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Teams & Scores
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  // Turn state for Questions 1-8
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [isResultRevealed, setIsResultRevealed] = useState(false);
  const [turnResult, setTurnResult] = useState(null);

  // Lifelines for active turn
  const [isStarActiveThisTurn, setIsStarActiveThisTurn] = useState(false);
  const [rescueState, setRescueState] = useState(null); 
  // { step: 'selecting_team' | 'consulting' | 'done', helperTeamId, helperTeamName, suggestion, usedInThisTurn: boolean }

  // Final Round State (Question 9)
  const [finalAnswers, setFinalAnswers] = useState({});
  const [finalStarTeams, setFinalStarTeams] = useState({});
  const [isFinalAnswerLocked, setIsFinalAnswerLocked] = useState(false);
  const [isFinalResultRevealed, setIsFinalResultRevealed] = useState(false);
  const [finalResults, setFinalResults] = useState({});
  const [isFinalLocking, setIsFinalLocking] = useState(false);
  const [finalCountdownStep, setFinalCountdownStep] = useState(null);

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Audio & Modals
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isMCOpen, setIsMCOpen] = useState(false);

  // Track point deltas for animation
  const [roundScoreDeltas, setRoundScoreDeltas] = useState({});

  const currentQuestion = useMemo(() => {
    return QUESTIONS[currentQuestionIndex] || QUESTIONS[0];
  }, [currentQuestionIndex]);

  const assignedTeam = useMemo(() => {
    if (currentQuestion.isFinal) return null;
    return teams.find(t => t.id === currentQuestion.assignedTeamId) || teams[0];
  }, [teams, currentQuestion]);

  const otherTeams = useMemo(() => {
    if (!assignedTeam) return teams;
    return teams.filter(t => t.id !== assignedTeam.id);
  }, [teams, assignedTeam]);

  // Dynamic ranking with tie handling
  const rankings = useMemo(() => {
    const sorted = [...teams].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.correctCount || 0) - (a.correctCount || 0);
    });

    const rankMap = {};
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      let rank = i + 1;
      let isTie = false;

      if (i > 0) {
        const prev = sorted[i - 1];
        if (prev.score === current.score && (prev.correctCount || 0) === (current.correctCount || 0)) {
          isTie = true;
          rank = rankMap[prev.id].rank;
        }
      }

      if (i < sorted.length - 1) {
        const next = sorted[i + 1];
        if (next.score === current.score && (next.correctCount || 0) === (current.correctCount || 0)) {
          isTie = true;
        }
      }

      rankMap[current.id] = { rank, isTie };
    }
    return rankMap;
  }, [teams]);

  // Audio mute toggle
  const toggleMute = useCallback(() => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setMuted(next);
  }, [isAudioMuted]);

  // Start game from intro
  const handleStartGame = () => {
    playRevealSound();
    setGameState('playing');
    setCurrentQuestionIndex(0);
    resetTurnState();
    setTimerSeconds(30);
    setIsTimerRunning(false);
  };

  const resetTurnState = () => {
    setChosenAnswer(null);
    setIsAnswerLocked(false);
    setIsResultRevealed(false);
    setTurnResult(null);
    setIsStarActiveThisTurn(false);
    setRescueState(null);
    setRoundScoreDeltas({});
  };

  // Turn: Select answer for active team
  const handleSelectAnswer = (answerKey) => {
    setChosenAnswer(answerKey);
  };

  // Turn: Toggle Star of Hope
  const handleToggleStar = () => {
    if (!assignedTeam?.starUsed) {
      setIsStarActiveThisTurn(prev => !prev);
      playWarningAlarm();
    }
  };

  const [wasTimerRunningBeforeRescue, setWasTimerRunningBeforeRescue] = useState(false);

  // Turn: Start Cứu Viện (Pauses main question timer)
  const handleStartRescue = () => {
    if (!assignedTeam?.rescueUsed && !rescueState?.usedInThisTurn) {
      if (isTimerRunning) {
        setWasTimerRunningBeforeRescue(true);
        setIsTimerRunning(false);
      }
      setRescueState({ step: 'selecting_team' });
      playWarningAlarm();
    }
  };

  const handleCancelRescue = () => {
    setRescueState(null);
    if (wasTimerRunningBeforeRescue) {
      setIsTimerRunning(true);
      setWasTimerRunningBeforeRescue(false);
    }
  };

  const handleSelectRescueTeam = (helperTeam) => {
    setRescueState({
      step: 'consulting',
      helperTeamId: helperTeam.id,
      helperTeamName: helperTeam.name,
      suggestion: null,
      usedInThisTurn: true
    });
  };

  const handleSelectRescueSuggestion = (suggestionKey) => {
    playLockSound();
    setRescueState(prev => ({
      ...prev,
      step: 'suggested',
      suggestion: suggestionKey
    }));
  };

  // MC clicks Continue after helper team suggested an answer
  const handleContinueAfterRescue = () => {
    setRescueState(prev => ({
      ...prev,
      step: 'collapsed'
    }));
    // Resume question timer from where it paused
    if (wasTimerRunningBeforeRescue) {
      setIsTimerRunning(true);
      setWasTimerRunningBeforeRescue(false);
    }
  };

  // Turn: Lock answer
  const handleLockAnswer = () => {
    setIsAnswerLocked(true);
    setIsTimerRunning(false);
    playLockSound();
  };

  // Turn: Reveal result and apply scoring
  const handleRevealResult = () => {
    const isCorrect = chosenAnswer === currentQuestion.correctAnswer;
    const points = currentQuestion.points;

    let playingTeamDelta = 0;
    if (isCorrect) {
      playingTeamDelta = isStarActiveThisTurn ? points * 2 : points;
    } else {
      playingTeamDelta = isStarActiveThisTurn ? -points : 0;
    }

    // Check helper team bonus (+50 PTS if helper suggested correct answer)
    let helperTeamBonus = 0;
    let helperTeamId = null;
    let isHelperCorrect = false;

    if (rescueState?.suggestion && rescueState.helperTeamId) {
      helperTeamId = rescueState.helperTeamId;
      isHelperCorrect = rescueState.suggestion === currentQuestion.correctAnswer;
      if (isHelperCorrect) {
        helperTeamBonus = 50;
      }
    }

    setRescueState(prev => prev ? ({ ...prev, isHelperCorrect }) : null);

    const deltas = {};
    const updatedTeams = teams.map((team) => {
      let newScore = team.score;
      let newCorrectCount = team.correctCount || 0;
      let newRescueUsed = team.rescueUsed;
      let newStarUsed = team.starUsed;

      if (team.id === assignedTeam.id) {
        newScore = Math.max(0, team.score + playingTeamDelta);
        if (isCorrect) newCorrectCount += 1;
        if (rescueState?.usedInThisTurn) newRescueUsed = true;
        if (isStarActiveThisTurn) newStarUsed = true;
        deltas[team.id] = playingTeamDelta;
      } else if (team.id === helperTeamId && helperTeamBonus > 0) {
        newScore = team.score + helperTeamBonus;
        deltas[team.id] = helperTeamBonus;
      }

      return {
        ...team,
        score: newScore,
        correctCount: newCorrectCount,
        rescueUsed: newRescueUsed,
        starUsed: newStarUsed
      };
    });

    setTeams(updatedTeams);
    setRoundScoreDeltas(deltas);
    setTurnResult({
      isCorrect,
      delta: playingTeamDelta,
      isHelperCorrect,
      helperTeamName: rescueState?.helperTeamName,
      helperSuggestion: rescueState?.suggestion
    });
    setIsResultRevealed(true);

    if (isCorrect || helperTeamBonus > 0) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < 8) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetTurnState();
      setTimerSeconds(30);
      setIsTimerRunning(false);

      if (currentQuestionIndex + 1 === 4) {
        playWarningAlarm(); // entering Round 2
      } else if (currentQuestionIndex + 1 === 8) {
        playGlitchSound(); // entering Final Round
      }
    } else {
      setGameState('final_ranking');
    }
  };

  // Final Round (Question 9) Handlers
  const handleSelectFinalAnswer = (teamId, answerKey) => {
    setFinalAnswers(prev => ({
      ...prev,
      [teamId]: answerKey
    }));
  };

  const handleToggleFinalStar = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team?.starUsed) {
      setFinalStarTeams(prev => ({
        ...prev,
        [teamId]: !prev[teamId]
      }));
      playWarningAlarm();
    }
  };

  const handleLockFinalAnswers = () => {
    setIsFinalLocking(true);
    setIsTimerRunning(false);
    playGlitchSound();

    setFinalCountdownStep(3);

    setTimeout(() => {
      setFinalCountdownStep(2);
      playLockSound();
    }, 700);

    setTimeout(() => {
      setFinalCountdownStep(1);
      playLockSound();
    }, 1400);

    setTimeout(() => {
      setFinalCountdownStep('reveal');
      playRevealSound();
    }, 2100);

    setTimeout(() => {
      setIsFinalLocking(false);
      setFinalCountdownStep(null);
      setIsFinalAnswerLocked(true);
    }, 2800);
  };

  const handleRevealFinalResults = () => {
    const points = currentQuestion.points; // 300
    const correctAnswer = currentQuestion.correctAnswer;
    const results = {};
    const deltas = {};

    const updatedTeams = teams.map((team) => {
      const chosen = finalAnswers[team.id];
      const isCorrect = chosen === correctAnswer;
      const isStarActive = Boolean(finalStarTeams[team.id]);

      let delta = 0;
      if (isCorrect) {
        delta = isStarActive ? points * 2 : points;
      } else {
        delta = isStarActive ? -points : 0;
      }

      const newScore = Math.max(0, team.score + delta);
      const newCorrectCount = (team.correctCount || 0) + (isCorrect ? 1 : 0);
      const newStarUsed = isStarActive ? true : team.starUsed;

      results[team.id] = { isCorrect, delta, isStarActive };
      deltas[team.id] = delta;

      return {
        ...team,
        score: newScore,
        correctCount: newCorrectCount,
        starUsed: newStarUsed
      };
    });

    setTeams(updatedTeams);
    setFinalResults(results);
    setRoundScoreDeltas(deltas);
    setIsFinalResultRevealed(true);

    const hasAnyCorrect = Object.values(results).some(r => r.isCorrect);
    if (hasAnyCorrect) {
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  // Reset entire game
  const handleResetGame = () => {
    setGameState('intro');
    setCurrentQuestionIndex(0);
    setTeams(INITIAL_TEAMS);
    resetTurnState();
    setFinalAnswers({});
    setFinalStarTeams({});
    setIsFinalAnswerLocked(false);
    setIsFinalResultRevealed(false);
    setFinalResults({});
    setTimerSeconds(30);
    setIsTimerRunning(false);
    setIsMCOpen(false);
  };

  // Reset current question
  const handleResetCurrentQuestion = () => {
    if (currentQuestionIndex === 8) {
      setFinalAnswers({});
      setFinalStarTeams({});
      setIsFinalAnswerLocked(false);
      setIsFinalResultRevealed(false);
      setFinalResults({});
    } else {
      resetTurnState();
    }
    setTimerSeconds(30);
    setIsTimerRunning(false);
  };

  // MC Helpers
  const handleUpdateTeamName = (id, newName) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const handleUpdateTeamScore = (id, newScore) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, score: newScore } : t));
  };

  const handleToggleTeamLifeline = (id, lifelineType) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (lifelineType === 'rescue') {
        return { ...t, rescueUsed: !t.rescueUsed };
      } else if (lifelineType === 'star') {
        return { ...t, starUsed: !t.starUsed };
      }
      return t;
    }));
  };

  const handleJumpQuestion = (targetIndex) => {
    setCurrentQuestionIndex(targetIndex);
    if (targetIndex === 8) {
      setFinalAnswers({});
      setFinalStarTeams({});
      setIsFinalAnswerLocked(false);
      setIsFinalResultRevealed(false);
      setFinalResults({});
    } else {
      resetTurnState();
    }
    setTimerSeconds(30);
    setIsTimerRunning(false);
    setIsMCOpen(false);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsTimerRunning(prev => !prev);
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'Escape') {
        setIsMCOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  const activeStarTeamsMap = useMemo(() => {
    if (currentQuestion.isFinal) {
      return finalStarTeams;
    }
    if (isStarActiveThisTurn && assignedTeam) {
      return { [assignedTeam.id]: true };
    }
    return {};
  }, [currentQuestion.isFinal, finalStarTeams, isStarActiveThisTurn, assignedTeam]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Subtle modern academic background grid */}
      <div className="subtle-grid-overlay" />

      {/* Screen 1: START SCREEN (Redesigned with requested hierarchy) */}
      {gameState === 'intro' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Top Label: [ HCM202 ] Tư tưởng Hồ Chí Minh */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            marginBottom: '14px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <span style={{
              color: 'var(--primary)',
              fontWeight: 800,
              background: 'rgba(34, 211, 238, 0.15)',
              padding: '1px 6px',
              borderRadius: '4px'
            }}>
              HCM202
            </span>
            <span>Tư tưởng Hồ Chí Minh</span>
          </div>

          {/* Main Title: Đấu trường Đại đoàn kết */}
          <h1 style={{
            fontSize: 'clamp(38px, 4.2vw, 54px)',
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}>
            Đấu trường <span style={{
              background: 'linear-gradient(135deg, #F8FAFC 20%, #67E8F9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Đại đoàn kết</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '22px'
          }}>
            4 đội • 8 câu hỏi luân phiên • 1 câu Final
          </p>

          {/* 2 Ability Cards (Side by side on desktop) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            width: '100%',
            maxWidth: '680px',
            marginBottom: '20px'
          }}>
            {/* Card 1: 🛟 Cứu viện (Cyan Accent) */}
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 16px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'border-color 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(34, 211, 238, 0.12)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LifeBuoy size={16} />
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--primary)'
                }}>
                  Cứu viện
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                Nhờ một đội khác tư vấn trong 10 giây. Tư vấn chính xác: đội hỗ trợ <strong>+50 PTS</strong>.
              </p>
            </div>

            {/* Card 2: ⭐ Ngôi sao hy vọng (Gold Accent) */}
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 16px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              transition: 'border-color 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(251, 191, 36, 0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={16} fill="var(--accent)" />
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--accent)'
                }}>
                  Ngôi sao hy vọng
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
                Kích hoạt trước khi khóa đáp án. Đúng: <strong>×2 điểm</strong> | Sai: <strong>−1× điểm</strong>.
              </p>
            </div>
          </div>

          {/* 3 Mini Badges for Rounds */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '26px'
          }}>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>ROUND 1</span>
              <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 800 }}>100 PTS</span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}>ROUND 2</span>
              <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 800 }}>200 PTS</span>
            </div>

            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--accent)',
              borderRadius: '8px',
              padding: '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.15)'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800 }}>FINAL</span>
              <span style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 800 }}>300 PTS</span>
            </div>
          </div>

          {/* Start Game Button (Requested specifications) */}
          <button
            onClick={handleStartGame}
            className="btn-tactical btn-primary-cyan"
            style={{
              width: '320px',
              height: '56px',
              borderRadius: '10px',
              fontSize: '17px',
              fontWeight: 800,
              gap: '10px'
            }}
          >
            <Play size={18} fill="#FFFFFF" />
            <span>Bắt đầu trò chơi</span>
          </button>
        </div>
      )}

      {/* Screen 2: GAMEPLAY (Single Screen Layout) */}
      {gameState === 'playing' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Header */}
          <GameHeader
            currentQuestion={currentQuestion}
            assignedTeam={assignedTeam}
            timerSeconds={timerSeconds}
            setTimerSeconds={setTimerSeconds}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
            isMuted={isAudioMuted}
            toggleMute={toggleMute}
            onOpenMC={() => setIsMCOpen(true)}
          />

          {/* Main Gameplay Screen */}
          <main style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {!currentQuestion.isFinal ? (
              <TurnPlayPhase
                question={currentQuestion}
                assignedTeam={assignedTeam}
                otherTeams={otherTeams}
                chosenAnswer={chosenAnswer}
                onSelectAnswer={handleSelectAnswer}
                isAnswerLocked={isAnswerLocked}
                onLockAnswer={handleLockAnswer}
                isResultRevealed={isResultRevealed}
                onRevealResult={handleRevealResult}
                onNextQuestion={handleNextQuestion}
                rescueState={rescueState}
                onStartRescue={handleStartRescue}
                onCancelRescue={handleCancelRescue}
                onSelectRescueTeam={handleSelectRescueTeam}
                onSelectRescueSuggestion={handleSelectRescueSuggestion}
                onContinueAfterRescue={handleContinueAfterRescue}
                isStarActive={isStarActiveThisTurn}
                onToggleStar={handleToggleStar}
                turnResult={turnResult}
              />
            ) : (
              <FinalQuestionPhase
                question={currentQuestion}
                teams={teams}
                finalAnswers={finalAnswers}
                onSelectFinalAnswer={handleSelectFinalAnswer}
                activeStarTeams={finalStarTeams}
                onToggleFinalStar={handleToggleFinalStar}
                isAnswerLocked={isFinalAnswerLocked}
                onLockFinalAnswers={handleLockFinalAnswers}
                isResultRevealed={isFinalResultRevealed}
                onRevealFinalResults={handleRevealFinalResults}
                onShowFinalPodium={() => setGameState('final_ranking')}
                finalResults={finalResults}
                isLocking={isFinalLocking}
                countdownStep={finalCountdownStep}
              />
            )}
          </main>

          {/* Bottom Fixed Teams Bar */}
          <TeamBoard
            teams={teams}
            rankings={rankings}
            activeTeamId={assignedTeam?.id}
            isFinalRound={currentQuestion.isFinal}
            activeStarTeams={activeStarTeamsMap}
            roundScoreDeltas={roundScoreDeltas}
            isResultRevealed={currentQuestion.isFinal ? isFinalResultRevealed : isResultRevealed}
          />
        </div>
      )}

      {/* Screen 3: FINAL RANKING & PODIUM */}
      {gameState === 'final_ranking' && (
        <FinalRanking
          teams={teams}
          onResetGame={handleResetGame}
        />
      )}

      {/* MC Panel Modal */}
      <MCPanel
        isOpen={isMCOpen}
        onClose={() => setIsMCOpen(false)}
        teams={teams}
        onUpdateTeamName={handleUpdateTeamName}
        onUpdateTeamScore={handleUpdateTeamScore}
        onToggleTeamLifeline={handleToggleTeamLifeline}
        currentQuestionIndex={currentQuestionIndex}
        onJumpQuestion={handleJumpQuestion}
        onResetCurrentQuestion={handleResetCurrentQuestion}
        onResetGame={handleResetGame}
        isMuted={isAudioMuted}
        onToggleMute={toggleMute}
        timerSeconds={timerSeconds}
        onSetTimerSeconds={setTimerSeconds}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
      />
    </div>
  );
}
