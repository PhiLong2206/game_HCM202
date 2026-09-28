// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  QUESTIONS, 
  INITIAL_TEAMS, 
  FATE_TYPES,
  COOP_TEAM_QUESTIONS,
  RESCUE_QUESTIONS,
  GROUP_RESCUE_QUESTIONS,
  UNITY_FINAL_QUESTION
} from './data/questions';
import GameHeader from './components/GameHeader';
import TeamBoard from './components/TeamBoard';
import CardGameBoard from './components/CardGameBoard';
import CoopRound3Phase from './components/CoopRound3Phase';
import FinalRanking from './components/FinalRanking';
import MCPanel from './components/MCPanel';
import confetti from 'canvas-confetti';
import { 
  playSound, 
  stopAllSounds, 
  setSoundMuted, 
  getSoundMuted, 
  setSoundVolume, 
  getSoundVolume 
} from './utils/audioManager';
import { Layers, Play, Sparkles, Shield, Coins, Flame } from 'lucide-react';

export default function App() {
  // Game state: 'intro' | 'playing' | 'final_ranking'
  const [gameState, setGameState] = useState('intro');

  // Rounds: 1 (R1), 2 (R2), 3 (Final)
  const [currentRound, setCurrentRound] = useState(1);

  // Turn index inside current round (0..3)
  // Round 1 order: [1, 2, 3, 4]
  // Round 2 order: [4, 3, 2, 1]
  const [roundTurnIndex, setRoundTurnIndex] = useState(0);

  // Teams & Scores (Starts with 1000 PTS each)
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  // Unified Game Phase State:
  // 'CARD_SELECT' | 'CARD_CONFIRM' | 'BETTING' | 'READING' | 'TRANSITION_ANSWER' | 'ANSWERING' | 'ANSWER_LOCKED' | 'RESULT' | 'FATE_READY' | 'FATE_REVEAL' | 'ROUND_COMPLETE' | 'ROUND_TRANSITION' | 'FINAL'
  const [gamePhase, setGamePhase] = useState('CARD_SELECT');
  
  // Used cards map for current round deck: { [cardId]: teamName }
  const [usedCardMap, setUsedCardMap] = useState({});

  const [selectedCard, setSelectedCard] = useState(null);
  const [currentBet, setCurrentBet] = useState(null);
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [resultData, setResultData] = useState(null); // { isCorrect, isTimeout, delta, newScore }
  const [fateResult, setFateResult] = useState(null);

  // Track point deltas for floating animation
  const [roundScoreDeltas, setRoundScoreDeltas] = useState({});

  // Round 3 Cooperative Challenge status
  const [coopSuccess, setCoopSuccess] = useState(false);

  // History stack for [UNDO LAST ACTION]
  const [historyStack, setHistoryStack] = useState([]);

  // Strict Single Timer & Timeout Refs
  const [timerSeconds, setTimerSeconds] = useState(5);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isEvaluatingRef = useRef(false);
  const timeLeftRef = useRef(0);

  // State refs to prevent stale closure in interval handlers
  const chosenAnswerRef = useRef(null);
  chosenAnswerRef.current = chosenAnswer;

  const currentBetRef = useRef(null);
  currentBetRef.current = currentBet;

  const selectedCardRef = useRef(null);
  selectedCardRef.current = selectedCard;

  const activeTeamRef = useRef(null);

  // Audio & MC Modal
  const [isAudioMuted, setIsAudioMuted] = useState(() => getSoundMuted());
  const [effectVolume, setEffectVolume] = useState(() => getSoundVolume());
  const [isMCOpen, setIsMCOpen] = useState(false);

  // Determine active team by round order
  const round1Order = [1, 2, 3, 4];
  const round2Order = [4, 3, 2, 1];

  const activeTeamId = useMemo(() => {
    if (currentRound === 1) return round1Order[roundTurnIndex] || 1;
    if (currentRound === 2) return round2Order[roundTurnIndex] || 4;
    return null; // Round 3 is final shared
  }, [currentRound, roundTurnIndex]);

  const activeTeam = useMemo(() => {
    return teams.find(t => t.id === activeTeamId) || teams[0];
  }, [teams, activeTeamId]);
  activeTeamRef.current = activeTeam;

  const otherTeams = useMemo(() => {
    return teams.filter(t => t.id !== activeTeam.id);
  }, [teams, activeTeam]);

  // Questions for current round deck (12 cards per round)
  const roundQuestions = useMemo(() => {
    return QUESTIONS.filter(q => q.round === currentRound);
  }, [currentRound]);

  const finalQuestion = useMemo(() => {
    return QUESTIONS.find(q => q.isFinal) || QUESTIONS[QUESTIONS.length - 1];
  }, []);

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

  // Audio mute toggle (synced with audioManager & localStorage)
  const toggleMute = useCallback(() => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setSoundMuted(next);
  }, [isAudioMuted]);

  // Audio volume change
  const handleVolumeChange = useCallback((newVol) => {
    setEffectVolume(newVol);
    setSoundVolume(newVol);
  }, []);

  // Clear all running timer/timeout intervals
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTimerPaused(false);
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Save state snapshot before modifications
  const saveSnapshot = useCallback(() => {
    setHistoryStack(prev => [
      ...prev.slice(-10),
      {
        teams: JSON.parse(JSON.stringify(teams)),
        currentRound,
        roundTurnIndex,
        gamePhase,
        usedCardMap: { ...usedCardMap },
        selectedCard,
        currentBet,
        chosenAnswer,
        resultData: resultData ? { ...resultData } : null,
        fateResult: fateResult ? JSON.parse(JSON.stringify(fateResult)) : null,
        roundScoreDeltas: { ...roundScoreDeltas }
      }
    ]);
  }, [teams, currentRound, roundTurnIndex, gamePhase, usedCardMap, selectedCard, currentBet, chosenAnswer, resultData, fateResult, roundScoreDeltas]);

  // Undo last action
  const handleUndoLastAction = () => {
    if (historyStack.length === 0) return;
    clearAllTimers();
    const last = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, prev.length - 1));

    setTeams(last.teams);
    setCurrentRound(last.currentRound);
    setRoundTurnIndex(last.roundTurnIndex);
    setGamePhase(last.gamePhase);
    setUsedCardMap(last.usedCardMap);
    setSelectedCard(last.selectedCard);
    setCurrentBet(last.currentBet);
    setChosenAnswer(last.chosenAnswer);
    setResultData(last.resultData);
    setFateResult(last.fateResult);
    setRoundScoreDeltas(last.roundScoreDeltas);
    playWarningAlarm();
  };

  // Helper to adjust team score with delta animation
  const updateTeamScoreDelta = (teamId, delta) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return { ...t, score: Math.max(0, t.score + delta) };
      }
      return t;
    }));
    setRoundScoreDeltas(prev => ({ ...prev, [teamId]: delta }));
  };

  // Start game from intro
  const handleStartGame = () => {
    clearAllTimers();
    playSound('reveal');
    setGameState('playing');
    setCurrentRound(1);
    setRoundTurnIndex(0);
    setGamePhase('CARD_SELECT');
    setUsedCardMap({});
    setSelectedCard(null);
    setCurrentBet(null);
    setChosenAnswer(null);
    setResultData(null);
    setFateResult(null);
    setRoundScoreDeltas({});
  };

  // Step 1: Click card on board -> lifts card and prompts confirmation
  const handleSelectCard = (card) => {
    saveSnapshot();
    setSelectedCard(card);
    setGamePhase('CARD_CONFIRM');
    playSound('lock');
  };

  // Cancel card selection -> return to CARD_SELECT
  const handleCancelSelectCard = () => {
    setSelectedCard(null);
    setGamePhase('CARD_SELECT');
    playSound('lock');
  };

  // Confirm card selection -> proceed to BETTING
  const handleConfirmCardSelection = () => {
    saveSnapshot();
    setGamePhase('BETTING');
    if (activeTeam.score <= 0) {
      setCurrentBet(0);
    } else {
      setCurrentBet(null);
    }
    playSound('lock');
  };

  // Select Bet amount
  const handleSelectBet = (amount) => {
    setCurrentBet(amount);
    playSound('lock');
  };

  // Confirm Bet & Lock Bet -> Card Flip & Start 10-second Reading Phase
  const handleConfirmBetAndFlip = () => {
    if (typeof currentBet !== 'number' || !selectedCard) return;
    saveSnapshot();
    clearAllTimers();
    isEvaluatingRef.current = false;

    setChosenAnswer(null);
    setResultData(null);
    setFateResult(null);
    setGamePhase('READING');
    setTimerSeconds(10);
    timeLeftRef.current = 10;
    playSound('reveal');

    // 10-second countdown for reading (increased from 5s)
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;

        // 600ms Transition banner "⚡ TRẢ LỜI!"
        setGamePhase('TRANSITION_ANSWER');
        timeoutRef.current = setTimeout(() => {
          startAnsweringPhase();
        }, 600);
      }
    }, 1000);
  };

  // Start 15-second Answering Phase
  const startAnsweringPhase = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setGamePhase('ANSWERING');
    setTimerSeconds(15);
    timeLeftRef.current = 15;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 4 && t > 0) {
        playSound(t <= 3 ? 'warning-tick' : 'tick');
      }
      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleAnswerTimerExpired();
      }
    }, 1000);
  };

  // Timeout handler when 15s expires
  const handleAnswerTimerExpired = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    clearAllTimers();

    const ans = chosenAnswerRef.current;
    if (ans) {
      // Auto-lock selected answer! System automatically evaluates!
      handleLockAnswerWithOption(ans, true);
    } else {
      // No answer selected: Timeout penalty
      const bet = typeof currentBetRef.current === 'number' ? currentBetRef.current : 0;
      const card = selectedCardRef.current;
      const team = activeTeamRef.current;

      if (card && team) {
        setUsedCardMap(prev => ({ ...prev, [card.id]: team.name }));
      }

      updateTeamScoreDelta(team.id, -bet);
      setResultData({
        isCorrect: false,
        isTimeout: true,
        delta: -bet,
        newScore: Math.max(0, team.score - bet),
        correctAnswer: card?.correctAnswer
      });

      setGamePhase('RESULT');
      // Timeout sound only (prevents double wrong sound as requested)
      playSound('timeout');
    }
  };

  // Select answer option (before lock, can switch freely - SILENT as requested)
  const handleSelectAnswer = (optionKey) => {
    if (gamePhase !== 'ANSWERING') return;
    setChosenAnswer(optionKey);
  };

  // Lock answer with an option (Early lock or auto-lock) -> AUTOMATIC SYSTEM EVALUATION!
  const handleLockAnswerWithOption = (optionKey, fromTimeout = false) => {
    if (!fromTimeout) {
      if (isEvaluatingRef.current) return;
      isEvaluatingRef.current = true;
    }
    clearAllTimers();

    const card = selectedCardRef.current;
    const bet = typeof currentBetRef.current === 'number' ? currentBetRef.current : 0;
    const team = activeTeamRef.current;
    if (!card || !team) return;

    saveSnapshot();

    // Mark card as USED by current team
    setUsedCardMap(prev => ({ ...prev, [card.id]: team.name }));

    // Lock sound & show locked state
    playSound('lock');
    setGamePhase('ANSWER_LOCKED');

    // 350ms suspense before showing result & sound
    const isCorrect = optionKey === card.correctAnswer;
    timeoutRef.current = setTimeout(() => {
      if (isCorrect) {
        // CORRECT: score += bet, unlock Fate
        updateTeamScoreDelta(team.id, bet);
        setTeams(prev => prev.map(t => t.id === team.id ? { ...t, correctCount: (t.correctCount || 0) + 1 } : t));

        setResultData({
          isCorrect: true,
          isTimeout: false,
          delta: bet,
          newScore: team.score + bet,
          correctAnswer: card.correctAnswer
        });

        setGamePhase('FATE_READY');
        playSound('correct-cheer');

        // Light confetti for correct answer
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#22D3EE', '#38BDF8', '#FBBF24', '#34D399']
        });
      } else {
        // WRONG: score -= bet, Fate LOCKED
        updateTeamScoreDelta(team.id, -bet);

        setResultData({
          isCorrect: false,
          isTimeout: false,
          delta: -bet,
          newScore: Math.max(0, team.score - bet),
          correctAnswer: card.correctAnswer
        });

        setGamePhase('RESULT');
        playSound('wrong-sad');
      }
    }, 350);
  };

  // User/MC clicks [🔒 KHÓA ĐÁP ÁN]
  const handleLockAnswer = () => {
    if (gamePhase !== 'ANSWERING' || !chosenAnswer || isEvaluatingRef.current) return;
    handleLockAnswerWithOption(chosenAnswer);
  };

  // Open Fate Card (Only if Correct)
  const handleOpenFate = () => {
    if (gamePhase !== 'FATE_READY' || !selectedCard?.fate) return;
    saveSnapshot();

    const fateType = selectedCard.fate.type;
    const fateInfo = FATE_TYPES[fateType];
    let bonusPoints = 0;
    let headline = "";
    let description = "";
    let shieldTriggered = false;
    let mysteryValue = null;

    if (fateType === 'LUCKY') {
      bonusPoints = 200;
      headline = "+200 PTS";
      description = "May mắn mỉm cười! Đội nhận thêm 200 PTS trực tiếp vào quỹ điểm.";
      updateTeamScoreDelta(activeTeam.id, 200);
    } else if (fateType === 'JACKPOT') {
      bonusPoints = currentBet;
      headline = `+${currentBet} PTS (ĐẠI THẮNG VANG DỘI)`;
      description = `Thưởng thêm đúng bằng số điểm cược vừa thắng (+${currentBet} PTS).`;
      updateTeamScoreDelta(activeTeam.id, currentBet);
    } else if (fateType === 'ALLY') {
      bonusPoints = 100;
      headline = "+100 PTS & CHỌN ĐỒNG HÀNH";
      description = "Tinh thần đại đoàn kết! Đội của bạn nhận +100 PTS, hãy chọn 1 đội bạn để cùng nhận +100 PTS.";
      updateTeamScoreDelta(activeTeam.id, 100);
    } else if (fateType === 'SHIELD') {
      headline = "NHẬN 1 LÁ CHẮN BẢO HỘ 🛡️";
      description = "Đội nhận 1 Lá Chắn Bảo Hộ giúp vô hiệu hóa biến cố xấu tiếp theo.";
      setTeams(prev => prev.map(t => t.id === activeTeam.id ? { ...t, shield: (t.shield || 0) + 1 } : t));
    } else if (fateType === 'NEUTRAL') {
      headline = "BÌNH YÊN VÔ SỰ (0 PTS)";
      description = "Một lượt bình yên. Không có gì xảy ra.";
    } else if (fateType === 'BAD_LUCK') {
      if (activeTeam.shield > 0) {
        shieldTriggered = true;
        headline = "🛡️ BẢO HỘ ĐÃ KÍCH HOẠT!";
        description = "Biến cố -100 PTS đã bị Lá Chắn Bảo Hộ chặn đứng hoàn toàn! Khiên đã tiêu hao.";
        setTeams(prev => prev.map(t => t.id === activeTeam.id ? { ...t, shield: Math.max(0, (t.shield || 0) - 1) } : t));
      } else {
        bonusPoints = -100;
        headline = "BIẾN CỐ -100 PTS";
        description = "Biến cố bất ngờ! Đội bị trừ 100 PTS.";
        updateTeamScoreDelta(activeTeam.id, -100);
      }
    } else if (fateType === 'MYSTERY_GIFT') {
      const giftAmounts = [100, 200, 300];
      mysteryValue = giftAmounts[Math.floor(Math.random() * giftAmounts.length)];
      bonusPoints = mysteryValue;
      headline = `+${mysteryValue} PTS BẤT NGỜ!`;
      description = `Mở hộp quà bí mật nhận được phần thưởng trị giá +${mysteryValue} PTS!`;
      updateTeamScoreDelta(activeTeam.id, mysteryValue);
    }

    setFateResult({
      fateInfo,
      bonusPoints,
      headline,
      description,
      shieldTriggered,
      mysteryValue,
      allyTeamId: null
    });

    setGamePhase('FATE_REVEAL');
    playSound('fate-reveal');

    // Trigger specific fate sound after reveal whoosh (~450ms)
    timeoutRef.current = setTimeout(() => {
      if (fateType === 'LUCKY') {
        playSound('reward');
      } else if (fateType === 'JACKPOT') {
        playSound('jackpot');
      } else if (fateType === 'ALLY') {
        playSound('ally');
      } else if (fateType === 'SHIELD') {
        playSound('shield');
      } else if (fateType === 'BAD_LUCK') {
        if (shieldTriggered) {
          playSound('shield-block');
        } else {
          playSound('bad-luck');
        }
      } else if (fateType === 'MYSTERY_GIFT') {
        playSound('mystery');
      }
    }, 450);
  };

  // Ally pick companion team for +100 PTS (CÙNG TIẾN!)
  const handleSelectAllyTeam = (allyId) => {
    saveSnapshot();
    updateTeamScoreDelta(allyId, 100);
    const allyTeamName = teams.find(t => t.id === allyId)?.name || `Đội ${allyId}`;
    setFateResult(prev => ({
      ...prev,
      allyTeamId: allyId,
      description: `${prev.description} ➔ Đã tặng +100 PTS cho ${allyTeamName}!`
    }));
    playSound('team-up');
  };

  // Move to next team or round completion
  const handleContinueTurn = () => {
    saveSnapshot();
    clearAllTimers();
    setRoundScoreDeltas({});
    setChosenAnswer(null);
    setSelectedCard(null);
    setCurrentBet(null);
    setResultData(null);
    setFateResult(null);

    if (roundTurnIndex < 3) {
      // Next team in current round -> returns to SAME Card Board!
      setRoundTurnIndex(prev => prev + 1);
      setGamePhase('CARD_SELECT');
    } else {
      // 4 turns of round completed!
      if (currentRound === 1) {
        // Round 1 Complete banner (~1.2s)
        setGamePhase('ROUND_COMPLETE');
        timeoutRef.current = setTimeout(() => {
          // Transition to Round 2 (~1.2s)
          setGamePhase('ROUND_TRANSITION');
          timeoutRef.current = setTimeout(() => {
            setCurrentRound(2);
            setRoundTurnIndex(0);
            setUsedCardMap({}); // 12 brand new cards for Round 2!
            setGamePhase('CARD_SELECT');
            playSound('reveal');
          }, 1200);
        }, 1200);
      } else if (currentRound === 2) {
        // Round 2 Complete banner (~700ms)
        setGamePhase('ROUND_COMPLETE');
        timeoutRef.current = setTimeout(() => {
          // Transition to Round 3: 🤝 ROUND 3 - THỬ THÁCH ĐẠI ĐOÀN KẾT (~1.3s)
          setGamePhase('ROUND3_TRANSITION');
          timeoutRef.current = setTimeout(() => {
            setCurrentRound(3);
            setGamePhase('ROUND3_COOP');
            playSound('reveal');
          }, 1300);
        }, 700);
      }
    }
  };

  // Pause / Resume Timer
  const handleTogglePauseTimer = () => {
    setIsTimerPaused(prev => !prev);
  };

  // Round 3 Cooperative Challenge: Apply +300 PTS to all teams if successful
  const handleApplyCoopBonus = (bonusPoints, isSuccess) => {
    saveSnapshot();
    setCoopSuccess(isSuccess);
    if (isSuccess && bonusPoints > 0) {
      setTeams(prev => prev.map(t => ({
        ...t,
        score: t.score + bonusPoints,
        correctCount: (t.correctCount || 0) + 1
      })));
      setRoundScoreDeltas({
        1: bonusPoints,
        2: bonusPoints,
        3: bonusPoints,
        4: bonusPoints
      });
    }
  };

  // Reset entire game
  const handleResetGame = () => {
    clearAllTimers();
    stopAllSounds();
    playSound('glitch');
    setGameState('intro');
    setCurrentRound(1);
    setRoundTurnIndex(0);
    setTeams(INITIAL_TEAMS);
    setUsedCardMap({});
    setSelectedCard(null);
    setCurrentBet(null);
    setChosenAnswer(null);
    setResultData(null);
    setFateResult(null);
    setRoundScoreDeltas({});
    setHistoryStack([]);
    setCoopSuccess(false);
    setGamePhase('CARD_SELECT');
  };

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'Escape') {
        setIsMCOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMute]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-main)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Screen 1: INTRO SCREEN */}
      {gameState === 'intro' && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'radial-gradient(circle at 50% 35%, rgba(34, 211, 238, 0.08), transparent 50%), var(--bg-main)',
          position: 'relative'
        }}>
          {/* Main Title Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--primary)',
            background: 'rgba(34, 211, 238, 0.1)',
            padding: '5px 16px',
            borderRadius: '20px',
            border: '1px solid var(--primary)',
            marginBottom: '14px'
          }}>
            <Layers size={15} />
            MÔN HỌC HCM202 — TƯ TƯỞNG HỒ CHÍ MINH
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: 800,
            color: '#FFFFFF',
            textAlign: 'center',
            letterSpacing: '-1px',
            lineHeight: 1.15,
            marginBottom: '8px'
          }}>
            ĐẤU TRƯỜNG <span style={{ color: 'var(--primary)' }}>ĐẠI ĐOÀN KẾT</span>
          </h1>

          <p style={{
            fontSize: '17px',
            color: 'var(--accent)',
            fontWeight: 700,
            marginBottom: '24px',
            letterSpacing: '1px'
          }}>
            RÚT THẺ • ĐẶT ĐIỂM • TRẢ LỜI • MỞ VẬN MỆNH
          </p>

          {/* 3 Pillars & Gameplay Overview Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
            maxWidth: '920px',
            width: '100%',
            marginBottom: '26px'
          }}>
            {/* Feature 1 */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(34, 211, 238, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                color: 'var(--primary)'
              }}>
                <Coins size={18} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                12 Lá Bài Bí Mật
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Mỗi round gồm 12 lá bài. 4 đội rút 4 lá, 8 lá còn lại giữ nguyên bí mật và thay mới ở Round 2.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(251, 191, 36, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                color: 'var(--accent)'
              }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', marginBottom: '4px' }}>
                Tự Động Chấm Điểm
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                10s đọc câu hỏi, 15s trả lời. Khóa đáp án là hệ thống tự so khớp và mở khóa Vận Mệnh nếu trả lời đúng.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                color: '#EF4444'
              }}>
                <Flame size={18} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#EF4444', marginBottom: '4px' }}>
                Final Round ALL-IN
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                1 câu hỏi chung quyết định: Cả 4 đội bí mật đặt cược hoặc ALL-IN để xoay chuyển cục diện.
              </p>
            </div>
          </div>

          {/* Start Game Button */}
          <button
            onClick={handleStartGame}
            className="btn-tactical btn-primary-cyan pulse-cyan"
            style={{
              width: '320px',
              height: '54px',
              borderRadius: '10px',
              fontSize: '17px',
              fontWeight: 800,
              gap: '10px'
            }}
          >
            <Play size={18} fill="#FFFFFF" />
            <span>BẮT ĐẦU TRÒ CHƠI</span>
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
            currentRound={currentRound}
            activeTeam={activeTeam}
            currentBet={currentBet}
            timerSeconds={timerSeconds}
            gamePhase={gamePhase}
            isMuted={isAudioMuted}
            toggleMute={toggleMute}
            onOpenMC={() => setIsMCOpen(true)}
          />

          {/* Main Card Game Play Area */}
          <main style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {currentRound < 3 ? (
              <CardGameBoard
                roundQuestions={roundQuestions}
                currentRound={currentRound}
                activeTeam={activeTeam}
                otherTeams={otherTeams}
                usedCardMap={usedCardMap}
                selectedCard={selectedCard}
                onSelectCard={handleSelectCard}
                onCancelSelectCard={handleCancelSelectCard}
                onConfirmCardSelection={handleConfirmCardSelection}
                currentBet={currentBet}
                onSelectBet={handleSelectBet}
                onConfirmBetAndFlip={handleConfirmBetAndFlip}
                gamePhase={gamePhase}
                timerSeconds={timerSeconds}
                chosenAnswer={chosenAnswer}
                onSelectAnswer={handleSelectAnswer}
                onLockAnswer={handleLockAnswer}
                resultData={resultData}
                onOpenFate={handleOpenFate}
                fateResult={fateResult}
                onSelectAllyTeam={handleSelectAllyTeam}
                onContinueTurn={handleContinueTurn}
              />
            ) : (
              <CoopRound3Phase
                teams={teams}
                coopTeamQuestions={COOP_TEAM_QUESTIONS}
                rescueQuestions={RESCUE_QUESTIONS}
                groupRescueQuestions={GROUP_RESCUE_QUESTIONS}
                unityFinalQuestion={UNITY_FINAL_QUESTION}
                onApplyCoopBonus={handleApplyCoopBonus}
                onShowFinalPodium={() => setGameState('final_ranking')}
              />
            )}
          </main>

          {/* Bottom Fixed Teams Bar */}
          <TeamBoard
            teams={teams}
            rankings={rankings}
            activeTeamId={activeTeam?.id}
            isFinalRound={currentRound === 3}
            roundScoreDeltas={roundScoreDeltas}
            isResultRevealed={['RESULT', 'FATE_READY', 'FATE_REVEAL'].includes(gamePhase)}
          />
        </div>
      )}

      {/* Screen 3: FINAL RANKING & PODIUM */}
      {gameState === 'final_ranking' && (
        <FinalRanking
          teams={teams}
          onResetGame={handleResetGame}
          coopSuccess={coopSuccess}
        />
      )}

      {/* MC Panel Modal */}
      <MCPanel
        isOpen={isMCOpen}
        onClose={() => setIsMCOpen(false)}
        teams={teams}
        onUpdateTeamName={(id, name) => setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t))}
        onUpdateTeamScore={(id, score) => setTeams(prev => prev.map(t => t.id === id ? { ...t, score } : t))}
        onUpdateTeamShield={(id, shield) => setTeams(prev => prev.map(t => t.id === id ? { ...t, shield } : t))}
        currentRound={currentRound}
        activeTeam={activeTeam}
        selectedCard={selectedCard}
        currentBet={currentBet}
        gamePhase={gamePhase}
        onContinueTurn={handleContinueTurn}
        onUndoLastAction={handleUndoLastAction}
        canUndo={historyStack.length > 0}
        onResetGame={handleResetGame}
        isMuted={isAudioMuted}
        onToggleMute={toggleMute}
        effectVolume={effectVolume}
        onVolumeChange={handleVolumeChange}
        isTimerPaused={isTimerPaused}
        onTogglePauseTimer={handleTogglePauseTimer}
      />
    </div>
  );
}
