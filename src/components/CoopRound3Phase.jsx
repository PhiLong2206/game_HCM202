// src/components/CoopRound3Phase.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Puzzle, 
  Lock, 
  Unlock, 
  Users, 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock, 
  HelpCircle, 
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import { playSound } from '../utils/audioManager';

/**
 * ROUND 3: THỬ THÁCH ĐẠI ĐOÀN KẾT
 * State machine phases:
 * - 'BOARD_VIEW': 4 pieces surrounding central locked vault
 * - 'TEAM_READING': 5s reading question for active team
 * - 'TEAM_ANSWERING': 15s answering question for active team
 * - 'TEAM_RESULT': Result of active team's answer (if correct -> completed, if wrong -> triggers rescue)
 * - 'RESCUE_INTRO': Announcement of Team X + Team Y pairing (~1.5s)
 * - 'RESCUE_READING': 3s reading rescue question
 * - 'RESCUE_ANSWERING': 10s discussing & answering rescue question
 * - 'RESCUE_RESULT': Result of rescue (if correct -> piece completed, if wrong -> piece marked NEEDS_GROUP_SUPPORT)
 * - 'GROUP_RESCUE_INTRO': Announcement of all 4 teams united challenge
 * - 'GROUP_RESCUE_READING': 5s reading group question
 * - 'GROUP_RESCUE_ANSWERING': 20s group discussion & answering
 * - 'GROUP_RESCUE_RESULT': Result of group rescue
 * - 'UNITY_UNLOCK': 4 pieces converge & unlock animation
 * - 'UNITY_READING': 7s reading final cooperative question
 * - 'UNITY_DISCUSSION': 20s group discussion for final question
 * - 'UNITY_RESULT': Final result (+300 PTS all teams if correct)
 */

export default function CoopRound3Phase({
  teams,
  coopTeamQuestions,
  rescueQuestions,
  groupRescueQuestions,
  unityFinalQuestion,
  onApplyCoopBonus,
  onShowFinalPodium
}) {
  // 4 Team Pieces State
  const [pieces, setPieces] = useState([
    { teamId: 1, teamName: "ĐỘI 1", status: "ACTIVE", pieceNum: 1 },
    { teamId: 2, teamName: "ĐỘI 2", status: "LOCKED", pieceNum: 2 },
    { teamId: 3, teamName: "ĐỘI 3", status: "LOCKED", pieceNum: 3 },
    { teamId: 4, teamName: "ĐỘI 4", status: "LOCKED", pieceNum: 4 }
  ]);

  // Turn index: 0 (Team 1), 1 (Team 2), 2 (Team 3), 3 (Team 4)
  const [turnIndex, setTurnIndex] = useState(0);

  // Subphase state
  const [phase, setPhase] = useState('BOARD_VIEW');

  // Support count per team for fair rescue selection: { [teamId]: number }
  const [supportCounts, setSupportCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  // Rescue context
  const [failingTeamId, setFailingTeamId] = useState(null);
  const [supporterTeamId, setSupporterTeamId] = useState(null);
  const [rescueQuestionIndex, setRescueQuestionIndex] = useState(0);

  // Group rescue question index
  const [groupQuestionIndex, setGroupQuestionIndex] = useState(0);

  // Current Question & Answer State
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [resultData, setResultData] = useState(null); // { isCorrect, correctAnswer, explanation, isTimeout }

  // Final Unity Question State
  const [unityResult, setUnityResult] = useState(null); // { isSuccess }

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState(5);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const timeLeftRef = useRef(0);
  const isEvaluatingRef = useRef(false);

  // Refs for stale closure
  const chosenAnswerRef = useRef(null);
  chosenAnswerRef.current = chosenAnswer;

  const currentTeam = useMemo(() => teams[turnIndex] || teams[0], [teams, turnIndex]);
  const completedCount = useMemo(() => pieces.filter(p => p.status === 'COMPLETED').length, [pieces]);

  // Clear timers safely
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Update piece status helper
  const updatePieceStatus = (teamId, status) => {
    setPieces(prev => prev.map(p => p.teamId === teamId ? { ...p, status } : p));
  };

  // ==========================================
  // FLOW 1: TEAM PIECE QUESTION
  // ==========================================
  const handleStartTeamQuestion = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setChosenAnswer(null);
    setResultData(null);
    setPhase('TEAM_READING');
    setTimerSeconds(10);
    timeLeftRef.current = 10;
    playSound('reveal');

    // 10s Reading
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        startTeamAnswering();
      }
    }, 1000);
  };

  const startTeamAnswering = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setPhase('TEAM_ANSWERING');
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
        handleTeamAnswerExpired();
      }
    }, 1000);
  };

  const handleTeamAnswerExpired = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    clearAllTimers();

    const ans = chosenAnswerRef.current;
    const currentQ = coopTeamQuestions[turnIndex];

    if (ans) {
      evaluateTeamAnswer(ans);
    } else {
      // Timeout -> evaluated as wrong
      setResultData({
        isCorrect: false,
        isTimeout: true,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });
      setPhase('TEAM_RESULT');
      playSound('timeout');
    }
  };

  const evaluateTeamAnswer = (selectedKey) => {
    isEvaluatingRef.current = true;
    clearAllTimers();
    const currentQ = coopTeamQuestions[turnIndex];
    const isCorrect = selectedKey === currentQ.correctAnswer;

    playSound('lock');
    timeoutRef.current = setTimeout(() => {
      setResultData({
        isCorrect,
        isTimeout: false,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });

      if (isCorrect) {
        playSound('correct-cheer');
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#22D3EE', '#38BDF8', '#FBBF24', '#34D399']
        });
        updatePieceStatus(currentTeam.id, 'COMPLETED');
      } else {
        playSound('wrong-sad');
      }

      setPhase('TEAM_RESULT');
    }, 350);
  };

  // Continue after Team Question Result
  const handleContinueAfterTeamResult = () => {
    clearAllTimers();

    if (resultData?.isCorrect) {
      // Correct! Advance to next team or check if round complete
      advanceTurnOrCheckRound();
    } else {
      // Wrong! Automatic trigger of RESCUE PHASE
      triggerRescuePhase(currentTeam.id);
    }
  };

  // ==========================================
  // FLOW 2: RESCUE PHASE (TƯƠNG TRỢ)
  // ==========================================
  const triggerRescuePhase = (teamToRescueId) => {
    setFailingTeamId(teamToRescueId);

    // Pick fair supporter: candidate with lowest supportCount
    const candidates = [1, 2, 3, 4].filter(id => id !== teamToRescueId);
    const minSupport = Math.min(...candidates.map(id => supportCounts[id] || 0));
    const bestCandidates = candidates.filter(id => (supportCounts[id] || 0) === minSupport);
    const chosenSupporterId = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

    setSupporterTeamId(chosenSupporterId);
    setSupportCounts(prev => ({ ...prev, [chosenSupporterId]: (prev[chosenSupporterId] || 0) + 1 }));

    setPhase('RESCUE_INTRO');
    playSound('team-up');

    // After 1.6s intro -> Start Rescue Question
    timeoutRef.current = setTimeout(() => {
      startRescueQuestion();
    }, 1600);
  };

  const startRescueQuestion = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setChosenAnswer(null);
    setResultData(null);
    setPhase('RESCUE_READING');
    setTimerSeconds(3);
    timeLeftRef.current = 3;
    playSound('reveal');

    // 3s Reading
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        startRescueAnswering();
      }
    }, 1000);
  };

  const startRescueAnswering = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setPhase('RESCUE_ANSWERING');
    setTimerSeconds(10);
    timeLeftRef.current = 10;

    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 3 && t > 0) {
        playSound('warning-tick');
      }
      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleRescueExpired();
      }
    }, 1000);
  };

  const handleRescueExpired = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    clearAllTimers();

    const ans = chosenAnswerRef.current;
    const currentQ = rescueQuestions[rescueQuestionIndex % rescueQuestions.length];

    if (ans) {
      evaluateRescueAnswer(ans);
    } else {
      setResultData({
        isCorrect: false,
        isTimeout: true,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });
      setPhase('RESCUE_RESULT');
      playSound('timeout');
      updatePieceStatus(failingTeamId, 'NEEDS_GROUP_SUPPORT');
    }
  };

  const evaluateRescueAnswer = (selectedKey) => {
    isEvaluatingRef.current = true;
    clearAllTimers();
    const currentQ = rescueQuestions[rescueQuestionIndex % rescueQuestions.length];
    const isCorrect = selectedKey === currentQ.correctAnswer;

    playSound('lock');
    timeoutRef.current = setTimeout(() => {
      setResultData({
        isCorrect,
        isTimeout: false,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });

      if (isCorrect) {
        playSound('team-cheer');
        updatePieceStatus(failingTeamId, 'COMPLETED');
      } else {
        playSound('wrong-sad');
        updatePieceStatus(failingTeamId, 'NEEDS_GROUP_SUPPORT');
      }

      setRescueQuestionIndex(prev => prev + 1);
      setPhase('RESCUE_RESULT');
    }, 350);
  };

  const handleContinueAfterRescueResult = () => {
    clearAllTimers();
    advanceTurnOrCheckRound();
  };

  // Turn Progression logic
  const advanceTurnOrCheckRound = () => {
    if (turnIndex < 3) {
      const nextTurn = turnIndex + 1;
      setTurnIndex(nextTurn);
      setPieces(prev => prev.map((p, idx) => {
        if (p.status === 'COMPLETED' || p.status === 'NEEDS_GROUP_SUPPORT') return p;
        if (idx === nextTurn) return { ...p, status: 'ACTIVE' };
        return { ...p, status: 'LOCKED' };
      }));
      setPhase('BOARD_VIEW');
    } else {
      // All 4 team pieces have had their initial turns!
      checkAllPiecesGathered();
    }
  };

  const checkAllPiecesGathered = () => {
    // Check if any pieces are still incomplete
    const incompletePieces = pieces.filter(p => p.status !== 'COMPLETED');

    if (incompletePieces.length === 0) {
      // 4 / 4 Complete! Direct to Unity Unlock!
      triggerUnityUnlock();
    } else {
      // 1 or more pieces need group support -> THỬ THÁCH HỢP LỰC
      triggerGroupRescue();
    }
  };

  // ==========================================
  // FLOW 3: GROUP RESCUE (THỬ THÁCH HỢP LỰC)
  // ==========================================
  const triggerGroupRescue = () => {
    clearAllTimers();
    setPhase('GROUP_RESCUE_INTRO');
    playSound('team-up');

    timeoutRef.current = setTimeout(() => {
      startGroupRescueQuestion();
    }, 1800);
  };

  const startGroupRescueQuestion = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setChosenAnswer(null);
    setResultData(null);
    setPhase('GROUP_RESCUE_READING');
    setTimerSeconds(5);
    timeLeftRef.current = 5;
    playSound('reveal');

    // 5s Reading
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        startGroupRescueAnswering();
      }
    }, 1000);
  };

  const startGroupRescueAnswering = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setPhase('GROUP_RESCUE_ANSWERING');
    setTimerSeconds(20);
    timeLeftRef.current = 20;

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
        handleGroupRescueExpired();
      }
    }, 1000);
  };

  const handleGroupRescueExpired = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    clearAllTimers();

    const ans = chosenAnswerRef.current;
    const currentQ = groupRescueQuestions[groupQuestionIndex % groupRescueQuestions.length];

    if (ans) {
      evaluateGroupRescueAnswer(ans);
    } else {
      setResultData({
        isCorrect: false,
        isTimeout: true,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });
      setPhase('GROUP_RESCUE_RESULT');
      playSound('timeout');
    }
  };

  const evaluateGroupRescueAnswer = (selectedKey) => {
    isEvaluatingRef.current = true;
    clearAllTimers();
    const currentQ = groupRescueQuestions[groupQuestionIndex % groupRescueQuestions.length];
    const isCorrect = selectedKey === currentQ.correctAnswer;

    playSound('lock');
    timeoutRef.current = setTimeout(() => {
      setResultData({
        isCorrect,
        isTimeout: false,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation
      });

      if (isCorrect) {
        playSound('team-cheer');
        // Recover ALL remaining pieces to COMPLETED!
        setPieces(prev => prev.map(p => ({ ...p, status: 'COMPLETED' })));
      } else {
        playSound('wrong-sad');
      }

      setGroupQuestionIndex(prev => prev + 1);
      setPhase('GROUP_RESCUE_RESULT');
    }, 350);
  };

  const handleContinueAfterGroupRescueResult = () => {
    clearAllTimers();
    triggerUnityUnlock();
  };

  // ==========================================
  // FLOW 4: UNITY UNLOCK & FINAL QUESTION
  // ==========================================
  const triggerUnityUnlock = () => {
    clearAllTimers();
    setPhase('UNITY_UNLOCK');
    playSound('unity-unlock');

    timeoutRef.current = setTimeout(() => {
      startUnityFinalQuestion();
    }, 2000);
  };

  const startUnityFinalQuestion = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setChosenAnswer(null);
    setResultData(null);
    setPhase('UNITY_READING');
    setTimerSeconds(7);
    timeLeftRef.current = 7;
    playSound('reveal');

    // 7s Reading
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1;
      const t = timeLeftRef.current;
      setTimerSeconds(Math.max(0, t));

      if (t <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        startUnityFinalDiscussion();
      }
    }, 1000);
  };

  const startUnityFinalDiscussion = () => {
    clearAllTimers();
    isEvaluatingRef.current = false;
    setPhase('UNITY_DISCUSSION');
    setTimerSeconds(20);
    timeLeftRef.current = 20;

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
        handleUnityFinalExpired();
      }
    }, 1000);
  };

  const handleUnityFinalExpired = () => {
    if (isEvaluatingRef.current) return;
    isEvaluatingRef.current = true;
    clearAllTimers();

    const ans = chosenAnswerRef.current;
    if (ans) {
      evaluateUnityFinalAnswer(ans);
    } else {
      setResultData({
        isCorrect: false,
        isTimeout: true,
        correctAnswer: unityFinalQuestion.correctAnswer,
        explanation: unityFinalQuestion.explanation
      });
      setUnityResult({ isSuccess: false });
      setPhase('UNITY_RESULT');
      playSound('timeout');
      onApplyCoopBonus(0, false);
    }
  };

  const evaluateUnityFinalAnswer = (selectedKey) => {
    isEvaluatingRef.current = true;
    clearAllTimers();
    const isCorrect = selectedKey === unityFinalQuestion.correctAnswer;

    playSound('lock');
    timeoutRef.current = setTimeout(() => {
      setResultData({
        isCorrect,
        isTimeout: false,
        correctAnswer: unityFinalQuestion.correctAnswer,
        explanation: unityFinalQuestion.explanation
      });

      setUnityResult({ isSuccess: isCorrect });
      setPhase('UNITY_RESULT');

      if (isCorrect) {
        playSound('unity-success');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#22D3EE', '#FBBF24', '#34D399', '#38BDF8']
        });
        // All teams receive +300 PTS!
        onApplyCoopBonus(300, true);
      } else {
        playSound('wrong-sad');
        onApplyCoopBonus(0, false);
      }
    }, 350);
  };

  // User locks answer during any answering subphase
  const handleLockAnswer = () => {
    if (!chosenAnswer || isEvaluatingRef.current) return;
    playSound('lock');

    if (phase === 'TEAM_ANSWERING') {
      evaluateTeamAnswer(chosenAnswer);
    } else if (phase === 'RESCUE_ANSWERING') {
      evaluateRescueAnswer(chosenAnswer);
    } else if (phase === 'GROUP_RESCUE_ANSWERING') {
      evaluateGroupRescueAnswer(chosenAnswer);
    } else if (phase === 'UNITY_DISCUSSION') {
      evaluateUnityFinalAnswer(chosenAnswer);
    }
  };

  // Helper to get active question for current phase
  const getActiveQuestion = () => {
    if (phase.startsWith('TEAM_')) return coopTeamQuestions[turnIndex];
    if (phase.startsWith('RESCUE_')) return rescueQuestions[rescueQuestionIndex % rescueQuestions.length];
    if (phase.startsWith('GROUP_RESCUE_')) return groupRescueQuestions[groupQuestionIndex % groupRescueQuestions.length];
    if (phase.startsWith('UNITY_')) return unityFinalQuestion;
    return null;
  };

  const activeQuestion = getActiveQuestion();
  const isReading = ['TEAM_READING', 'RESCUE_READING', 'GROUP_RESCUE_READING', 'UNITY_READING'].includes(phase);
  const isAnswering = ['TEAM_ANSWERING', 'RESCUE_ANSWERING', 'GROUP_RESCUE_ANSWERING', 'UNITY_DISCUSSION'].includes(phase);
  const isResult = ['TEAM_RESULT', 'RESCUE_RESULT', 'GROUP_RESCUE_RESULT', 'UNITY_RESULT'].includes(phase);
  const isQuestionScreen = isReading || isAnswering || isResult;

  // Helper for piece status badge
  const renderPieceCard = (piece) => {
    const isCurrentActive = piece.teamId === currentTeam.id && phase === 'BOARD_VIEW';
    const isCompleted = piece.status === 'COMPLETED';
    const isNeedsSupport = piece.status === 'NEEDS_GROUP_SUPPORT';

    let borderColor = 'var(--border)';
    let bgColor = 'var(--surface)';
    let statusLabel = 'CHỜ THỬ THÁCH';
    let statusColor = 'var(--text-muted)';

    if (isCompleted) {
      borderColor = '#10B981';
      bgColor = 'rgba(16, 185, 129, 0.08)';
      statusLabel = '✓ HOÀN THÀNH';
      statusColor = '#10B981';
    } else if (isNeedsSupport) {
      borderColor = '#F59E0B';
      bgColor = 'rgba(245, 158, 11, 0.08)';
      statusLabel = '⚠ CHỜ HỢP LỰC';
      statusColor = '#F59E0B';
    } else if (isCurrentActive) {
      borderColor = 'var(--primary)';
      bgColor = 'rgba(34, 211, 238, 0.1)';
      statusLabel = '⚡ ĐANG THỬ THÁCH';
      statusColor = 'var(--primary)';
    }

    return (
      <div
        key={piece.teamId}
        style={{
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: isCurrentActive ? '0 0 20px rgba(34, 211, 238, 0.3)' : 'none',
          transition: 'all 0.3s ease',
          minHeight: '120px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🧩</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {piece.teamName}
          </span>
        </div>

        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.5px' }}>
          MẢNH GHÉP 0{piece.pieceNum}
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 800,
          color: statusColor,
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '3px 10px',
          borderRadius: '12px',
          border: `1px solid ${statusColor}44`
        }}>
          {statusLabel}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      position: 'relative',
      overflowY: 'auto'
    }}>
      {/* Top Breadcrumb & Progress Tracker */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1060px',
        padding: '6px 16px',
        background: 'var(--surface)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HeartHandshake size={18} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
            ROUND 3: THỬ THÁCH ĐẠI ĐOÀN KẾT
          </span>
          <span style={{ color: 'var(--border-light)' }}>•</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Từ Cạnh Tranh Đến Hợp Lực
          </span>
        </div>

        {/* Progress Tracker Pill: 0/4 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(34, 211, 238, 0.08)',
          padding: '4px 12px',
          borderRadius: '16px',
          border: '1px solid var(--primary)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            TIẾN ĐỘ MẢNH GHÉP:
          </span>
          <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--accent)' }}>
            {completedCount} / 4
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW A: BOARD VIEW (4 PIECES AROUND CENTER VAULT) */}
      {/* ======================================================== */}
      {phase === 'BOARD_VIEW' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1060px',
          flex: 1,
          gap: '20px'
        }}>
          {/* Main 4-Corners Grid with Central Locked Box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: '16px',
            width: '100%',
            alignItems: 'center'
          }}>
            {/* Top-Left: ĐỘI 1 */}
            {renderPieceCard(pieces[0])}

            {/* Center Locked Vault */}
            <div style={{
              gridRow: 'span 2',
              background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.08), var(--surface))',
              border: `2px solid ${completedCount === 4 ? 'var(--accent)' : 'var(--border-light)'}`,
              borderRadius: '20px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '12px',
              boxShadow: completedCount === 4 ? '0 0 35px rgba(251, 191, 36, 0.3)' : '0 0 25px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: completedCount === 4 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${completedCount === 4 ? 'var(--accent)' : 'var(--border)'}`
              }}>
                {completedCount === 4 ? (
                  <Unlock size={32} color="var(--accent)" />
                ) : (
                  <Lock size={32} color="var(--primary)" />
                )}
              </div>

              <div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  CÂU HỎI ĐẠI ĐOÀN KẾT
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  THU THẬP ĐỦ 4 MẢNH GHÉP ĐỂ MỞ KHÓA
                </div>
              </div>

              {/* 4 Puzzle Dots Visual */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {pieces.map((p) => (
                  <div
                    key={p.teamId}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: p.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1.5px solid ${p.status === 'COMPLETED' ? '#10B981' : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: p.status === 'COMPLETED' ? '#10B981' : 'var(--text-muted)'
                    }}
                  >
                    {p.status === 'COMPLETED' ? '✓' : `0${p.pieceNum}`}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent)' }}>
                {completedCount} / 4 MẢNH GHÉP
              </div>
            </div>

            {/* Top-Right: ĐỘI 2 */}
            {renderPieceCard(pieces[1])}

            {/* Bottom-Left: ĐỘI 3 */}
            {renderPieceCard(pieces[2])}

            {/* Bottom-Right: ĐỘI 4 */}
            {renderPieceCard(pieces[3])}
          </div>

          {/* Action Trigger for Active Team */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            background: 'var(--surface)',
            border: '1.5px solid var(--primary)',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Lượt thử thách: <strong style={{ color: 'var(--primary)' }}>{currentTeam.name}</strong> (MẢNH GHÉP 0{turnIndex + 1})
            </span>

            <button
              onClick={handleStartTeamQuestion}
              className="btn-tactical btn-primary-cyan pulse-cyan"
              style={{ padding: '8px 24px', fontSize: '13px', fontWeight: 800 }}
            >
              <Sparkles size={15} />
              <span>BẮT ĐẦU THỬ THÁCH MẢNH GHÉP ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: INTERACTIVE QUESTION PANEL (TEAM / RESCUE / GROUP / UNITY) */}
      {/* ======================================================== */}
      {isQuestionScreen && activeQuestion && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '1060px',
          flex: 1,
          justifyContent: 'center',
          gap: '12px'
        }}>
          {/* Question Header Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            padding: '8px 16px',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: phase.startsWith('RESCUE') ? 'var(--accent)' : 'var(--primary)',
                background: phase.startsWith('RESCUE') ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 211, 238, 0.1)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: `1px solid ${phase.startsWith('RESCUE') ? 'var(--accent)' : 'var(--primary)'}`
              }}>
                {phase.startsWith('TEAM') && `MẢNH GHÉP 0${turnIndex + 1} • ${currentTeam.name}`}
                {phase.startsWith('RESCUE') && `🤝 TƯƠNG TRỢ: ĐỘI ${failingTeamId} + ĐỘI ${supporterTeamId}`}
                {phase.startsWith('GROUP_RESCUE') && `🔥 THỬ THÁCH HỢP LỰC • 4 ĐỘI CHUNG SỨC`}
                {phase.startsWith('UNITY') && `🌟 THỬ THÁCH ĐỒNG LÒNG • 4 ĐỘI - 1 ĐÁP ÁN`}
              </span>

              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {activeQuestion.pillar}
              </span>
            </div>

            {/* Timer Badge */}
            {!isResult && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isReading ? 'rgba(56, 189, 248, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                border: `1px solid ${isReading ? 'var(--primary)' : 'var(--accent)'}`,
                padding: '4px 12px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '12px',
                color: isReading ? 'var(--primary)' : 'var(--accent)'
              }}>
                <Clock size={14} />
                <span>{isReading ? `ĐỌC CÂU HỎI: ${timerSeconds}s` : `TRẢ LỜI: ${timerSeconds}s`}</span>
              </div>
            )}
          </div>

          {/* Question Text Box */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <p style={{
              fontSize: '17px',
              fontWeight: 700,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              margin: 0
            }}>
              {activeQuestion.question}
            </p>
          </div>

          {/* 4 Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            {activeQuestion.options.map((opt) => {
              const isSelected = chosenAnswer === opt.key;
              const isCorrectAnswer = opt.key === activeQuestion.correctAnswer;

              let optionBg = 'var(--surface)';
              let optionBorder = 'var(--border)';
              let textColor = 'var(--text-primary)';

              if (isResult) {
                if (isCorrectAnswer) {
                  optionBg = 'rgba(16, 185, 129, 0.15)';
                  optionBorder = '#10B981';
                  textColor = '#10B981';
                } else if (isSelected && !isCorrectAnswer) {
                  optionBg = 'rgba(239, 68, 68, 0.15)';
                  optionBorder = '#EF4444';
                  textColor = '#EF4444';
                }
              } else if (isSelected) {
                optionBg = 'var(--primary-dark)';
                optionBorder = 'var(--primary)';
                textColor = '#FFFFFF';
              }

              return (
                <button
                  key={opt.key}
                  disabled={isReading || isResult}
                  onClick={() => {
                    setChosenAnswer(opt.key);
                  }}
                  className="btn-tactical"
                  style={{
                    background: optionBg,
                    border: `1.5px solid ${optionBorder}`,
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    opacity: isReading ? 0.5 : 1,
                    cursor: (isReading || isResult) ? 'default' : 'pointer',
                    boxShadow: isSelected && !isResult ? '0 0 12px rgba(34, 211, 238, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.06)',
                    color: isSelected ? '#000000' : 'var(--text-secondary)',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {opt.key}
                  </span>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: textColor
                  }}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action / Result Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 18px',
            minHeight: '52px'
          }}>
            {/* Status explanation / reading note */}
            <div>
              {isReading && (
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  📖 Đang trong thời gian đọc đề. Chuẩn bị trả lời...
                </span>
              )}
              {isAnswering && (
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {chosenAnswer ? `Đã chọn đáp án: [${chosenAnswer}]` : 'Nhấp chọn đáp án để khóa...'}
                </span>
              )}
              {isResult && (
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: resultData?.isCorrect ? '#10B981' : '#EF4444'
                }}>
                  {resultData?.isCorrect 
                    ? '✓ CHÍNH XÁC!' 
                    : resultData?.isTimeout 
                      ? `⏰ HẾT GIỜ! Đáp án đúng: [${resultData.correctAnswer}]`
                      : `✕ CHƯA CHÍNH XÁC! Đáp án đúng: [${resultData?.correctAnswer}]`}
                </span>
              )}
            </div>

            {/* Lock Answer Button (During Answering) */}
            {isAnswering && (
              <button
                disabled={!chosenAnswer}
                onClick={handleLockAnswer}
                className="btn-tactical btn-accent-gold pulse-gold"
                style={{
                  padding: '8px 22px',
                  fontSize: '13px',
                  fontWeight: 800,
                  opacity: chosenAnswer ? 1 : 0.4,
                  cursor: chosenAnswer ? 'pointer' : 'not-allowed'
                }}
              >
                <Lock size={14} />
                <span>{phase.startsWith('TEAM') ? '🔒 KHÓA ĐÁP ÁN' : '🔒 KHÓA ĐÁP ÁN CHUNG'}</span>
              </button>
            )}

            {/* Continue Button (During Result) */}
            {isResult && (
              <button
                onClick={() => {
                  if (phase === 'TEAM_RESULT') handleContinueAfterTeamResult();
                  else if (phase === 'RESCUE_RESULT') handleContinueAfterRescueResult();
                  else if (phase === 'GROUP_RESCUE_RESULT') handleContinueAfterGroupRescueResult();
                  else if (phase === 'UNITY_RESULT') onShowFinalPodium();
                }}
                className="btn-tactical btn-primary-cyan"
                style={{ padding: '8px 22px', fontSize: '13px', fontWeight: 800 }}
              >
                <span>{phase === 'UNITY_RESULT' ? '🏆 XEM BẢNG XẾP HẠNG ➔' : 'TIẾP TỤC ➔'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Explanation in Result Phase */}
          {isResult && activeQuestion.explanation && (
            <div style={{
              background: 'rgba(34, 211, 238, 0.05)',
              border: '1px solid rgba(34, 211, 238, 0.2)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              <strong style={{ color: 'var(--primary)' }}>Ý nghĩa bài học: </strong>
              {activeQuestion.explanation}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW C: TRANSITIONS & ANNOUNCEMENT OVERLAYS */}
      {/* ======================================================== */}

      {/* 1. Rescue Intro Overlay */}
      {phase === 'RESCUE_INTRO' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(7, 17, 31, 0.95)',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            color: 'var(--accent)',
            letterSpacing: '1px',
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '6px 18px',
            borderRadius: '20px',
            border: '1px solid var(--accent)'
          }}>
            🤝 TƯƠNG TRỢ ĐỒNG ĐỘI
          </div>

          <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFFFFF', textAlign: 'center' }}>
            LIÊN KẾT ĐƯỢC KÍCH HOẠT:
            <br />
            <span style={{ color: 'var(--primary)' }}>ĐỘI {failingTeamId}</span>
            <span style={{ margin: '0 12px', color: 'var(--accent)' }}>🤝</span>
            <span style={{ color: 'var(--primary)' }}>ĐỘI {supporterTeamId}</span>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Hai đội cùng nhau thảo luận để hoàn thành câu hỏi tương trợ và khôi phục mảnh ghép!
          </div>
        </div>
      )}

      {/* 2. Group Rescue Intro Overlay */}
      {phase === 'GROUP_RESCUE_INTRO' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(7, 17, 31, 0.95)',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#EF4444',
            letterSpacing: '1px',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '6px 18px',
            borderRadius: '20px',
            border: '1px solid #EF4444'
          }}>
            🔥 THỬ THÁCH HỢP LỰC
          </div>

          <div style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', textAlign: 'center' }}>
            “KHÔNG ĐỘI NÀO BỊ BỎ LẠI PHÍA SAU”
          </div>

          <div style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, maxWidth: '600px', textAlign: 'center' }}>
            Còn mảnh ghép chưa hoàn thành. Cả 4 đội cùng hợp sức giải quyết 1 thử thách chung để kích hoạt trọn vẹn sức mạnh Đại Đoàn Kết!
          </div>
        </div>
      )}

      {/* 3. Unity Unlock Animation Overlay */}
      {phase === 'UNITY_UNLOCK' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.15), rgba(7, 17, 31, 0.95))',
          backdropFilter: 'blur(6px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ fontSize: '40px', letterSpacing: '8px' }}>
            🧩 + 🧩 + 🧩 + 🧩
          </div>

          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
            🔓 ĐẠI ĐOÀN KẾT ĐÃ ĐƯỢC KÍCH HOẠT!
          </div>

          <div style={{ fontSize: '15px', color: '#FFFFFF', fontWeight: 700 }}>
            Trọn vẹn 4 mảnh ghép đã hội tụ ➔ Mở khóa CÂU HỎI ĐỒNG LÒNG!
          </div>
        </div>
      )}

      {/* 4. Unity Result Banner (when Unity Final finished) */}
      {phase === 'UNITY_RESULT' && unityResult && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(7, 17, 31, 0.94)',
          backdropFilter: 'blur(8px)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 800,
            color: unityResult.isSuccess ? 'var(--accent)' : '#EF4444',
            background: unityResult.isSuccess ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '6px 20px',
            borderRadius: '20px',
            border: `1px solid ${unityResult.isSuccess ? 'var(--accent)' : '#EF4444'}`
          }}>
            {unityResult.isSuccess ? '🤝 ĐẠI ĐOÀN KẾT THÀNH CÔNG!' : 'THỬ THÁCH ĐỒNG LÒNG'}
          </div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0
          }}>
            {unityResult.isSuccess ? (
              <span>4 ĐỘI ĐÃ HOÀN THÀNH <span style={{ color: 'var(--accent)' }}>THỬ THÁCH ĐỒNG LÒNG</span></span>
            ) : (
              <span>CHƯA HOÀN THÀNH THỬ THÁCH ĐỒNG LÒNG</span>
            )}
          </h2>

          {unityResult.isSuccess ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(34, 211, 238, 0.15) 100%)',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              padding: '16px 32px',
              textAlign: 'center',
              boxShadow: '0 0 25px rgba(251, 191, 36, 0.25)'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)' }}>
                🎉 COOPERATIVE BONUS: +300 PTS
              </div>
              <div style={{ fontSize: '13px', color: '#FFFFFF', marginTop: '4px', fontWeight: 600 }}>
                Cộng 300 PTS vào quỹ điểm của cả 4 Đội vì tinh thần đoàn kết tuyệt vời!
              </div>
            </div>
          ) : (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '12px 24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Đáp án đúng là: <strong style={{ color: '#10B981' }}>[{activeQuestion.correctAnswer}]</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Không bị trừ điểm. Điểm số từ Round 1 và Round 2 được bảo toàn nguyên vẹn.
              </div>
            </div>
          )}

          <button
            onClick={onShowFinalPodium}
            className="btn-tactical btn-accent-gold pulse-gold"
            style={{ padding: '10px 28px', fontSize: '14px', fontWeight: 800, marginTop: '8px' }}
          >
            <Award size={16} />
            <span>XEM BẢNG XẾP HẠNG CHUNG CUỘC ➔</span>
          </button>
        </div>
      )}
    </div>
  );
}
