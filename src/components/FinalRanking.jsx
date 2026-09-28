// src/components/FinalRanking.jsx
import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, CheckCircle2, Crown, Medal } from 'lucide-react';
import { playSound } from '../utils/audioManager';

export default function FinalRanking({ teams, onResetGame, coopSuccess = false }) {
  // Sort teams: 1st by score descending, 2nd by correctCount descending
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (b.correctCount || 0) - (a.correctCount || 0);
  });

  // Calculate tie rankings
  const rankedList = [];
  let currentRank = 1;
  for (let i = 0; i < sortedTeams.length; i++) {
    const current = sortedTeams[i];
    let isTie = false;

    if (i > 0) {
      const prev = sortedTeams[i - 1];
      if (prev.score === current.score && (prev.correctCount || 0) === (current.correctCount || 0)) {
        isTie = true;
        currentRank = rankedList[i - 1].rank;
      } else {
        currentRank = i + 1;
      }
    } else {
      currentRank = 1;
    }

    if (i < sortedTeams.length - 1) {
      const next = sortedTeams[i + 1];
      if (next.score === current.score && (next.correctCount || 0) === (current.correctCount || 0)) {
        isTie = true;
      }
    }

    rankedList.push({
      team: current,
      rank: currentRank,
      isTie
    });
  }

  // Steps: 'calculating' -> 'top4' -> 'top3' -> 'top2' -> 'top1' -> 'finished'
  const [revealStep, setRevealStep] = useState('calculating');
  const timerRefs = useRef([]);

  useEffect(() => {
    playSound('glitch');

    const t1 = setTimeout(() => {
      setRevealStep('top4');
      playSound('top4');
    }, 1500);

    const t2 = setTimeout(() => {
      setRevealStep('top3');
      playSound('top3');
    }, 2800);

    const t3 = setTimeout(() => {
      setRevealStep('top2');
      playSound('top2');
    }, 4100);

    // Pause 500ms after TOP 2 before revealing TOP 1
    const t4 = setTimeout(() => {
      setRevealStep('top1');
      playSound('victory-crowd');

      // Strong Confetti celebration (Burst 1)
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FBBF24', '#F59E0B', '#22D3EE', '#38BDF8', '#FFFFFF']
      });

      // Second burst for grand champion feeling
      const tConfetti2 = setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.4 },
          colors: ['#FBBF24', '#34D399', '#EC4899', '#38BDF8']
        });
      }, 350);
      timerRefs.current.push(tConfetti2);
    }, 5100);

    const t5 = setTimeout(() => {
      setRevealStep('finished');
    }, 8000);

    timerRefs.current = [t1, t2, t3, t4, t5];

    return () => {
      timerRefs.current.forEach(clearTimeout);
    };
  }, []);

  const isRevealed = (targetRank) => {
    if (revealStep === 'calculating') return false;
    if (targetRank >= 4) return true;
    if (targetRank === 3) return ['top3', 'top2', 'top1', 'finished'].includes(revealStep);
    if (targetRank === 2) return ['top2', 'top1', 'finished'].includes(revealStep);
    if (targetRank === 1) return ['top1', 'finished'].includes(revealStep);
    return false;
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px 28px',
      background: 'radial-gradient(circle at 50% 35%, rgba(34, 211, 238, 0.05), transparent 45%), var(--bg-main)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginTop: '2px' }}>
        {coopSuccess ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 800,
            color: 'var(--accent)',
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1px solid var(--accent)',
            marginBottom: '6px'
          }}>
            🤝 THỬ THÁCH ĐẠI ĐOÀN KẾT: HOÀN THÀNH (+300 PTS CHO TẤT CẢ)
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            marginBottom: '6px'
          }}>
            THỬ THÁCH ĐẠI ĐOÀN KẾT: CHƯA HOÀN THÀNH
          </div>
        )}
        <h1 style={{
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.3px',
          color: 'var(--accent)',
          textShadow: '0 0 20px rgba(251, 191, 36, 0.25)'
        }}>
          Bảng xếp hạng chung cuộc
        </h1>
      </div>

      {/* Calculating status */}
      {revealStep === 'calculating' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--primary)',
            letterSpacing: '1px'
          }}>
            TỔNG HỢP KẾT QUẢ ĐẠI ĐOÀN KẾT...
          </div>
          <div style={{
            width: '200px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
            animation: 'subtlePulse 0.8s infinite'
          }} />
        </div>
      )}

      {/* Podium Cards Grid (Ranked 3, 1, 2, 4 visually) */}
      {revealStep !== 'calculating' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          width: '100%',
          maxWidth: '1060px',
          alignItems: 'flex-end',
          margin: '8px 0'
        }}>
          {[
            { item: rankedList[2], medal: '🥉', color: '#F97316', bg: 'rgba(249, 115, 22, 0.08)', border: '#EA580C', height: '180px' },
            { item: rankedList[0], medal: '🏆', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: '#FBBF24', height: '230px', isTop1: true },
            { item: rankedList[1], medal: '🥈', color: '#CBD5E1', bg: 'rgba(203, 213, 225, 0.08)', border: '#94A3B8', height: '205px' },
            { item: rankedList[3], medal: '4', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.05)', border: 'var(--border)', height: '155px' }
          ].map(({ item, medal, color, bg, border, height, isTop1 }, index) => {
            if (!item) return null;
            const { team, rank, isTie } = item;
            const revealed = isRevealed(rank);

            return (
              <div
                key={index}
                className={revealed && isTop1 ? 'winner-card-pulse' : ''}
                style={{
                  background: revealed ? bg : 'var(--surface)',
                  border: `2px solid ${revealed ? (isTop1 ? '#FBBF24' : border) : 'var(--border)'}`,
                  borderRadius: '12px',
                  height: height,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 10px',
                  position: 'relative',
                  opacity: revealed ? 1 : 0.2,
                  transform: revealed ? 'scale(1)' : 'scale(0.96)',
                  boxShadow: revealed && isTop1 
                    ? '0 0 45px rgba(251, 191, 36, 0.45), inset 0 0 20px rgba(251, 191, 36, 0.15)' 
                    : 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {revealed ? (
                  <>
                    <div style={{ 
                      fontSize: isTop1 ? '42px' : '24px', 
                      marginBottom: '2px',
                      animation: isTop1 ? 'trophyBounce 1.3s ease-in-out infinite' : 'none'
                    }}>
                      {medal}
                    </div>

                    <div style={{
                      fontSize: isTop1 ? '18px' : '15px',
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      textAlign: 'center',
                      marginBottom: isTop1 ? '2px' : '4px'
                    }}>
                      {team.name}
                    </div>

                    <div style={{
                      fontSize: isTop1 ? '13px' : '13px',
                      fontWeight: 900,
                      color: isTop1 ? '#FBBF24' : color,
                      background: isTop1 ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                      padding: isTop1 ? '2px 14px' : '0',
                      borderRadius: isTop1 ? '20px' : '0',
                      border: isTop1 ? '1.5px solid #FBBF24' : 'none',
                      letterSpacing: isTop1 ? '1.5px' : 'normal',
                      marginBottom: '4px',
                      textShadow: isTop1 ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none'
                    }}>
                      {isTop1 ? 'VÔ ĐỊCH' : (isTie ? `ĐỒNG HẠNG #${rank}` : `TOP ${rank}`)}
                    </div>

                    <div style={{
                      fontSize: isTop1 ? '26px' : '18px',
                      fontWeight: 900,
                      color: color,
                      marginBottom: '4px',
                      fontVariantNumeric: 'tabular-nums',
                      textShadow: isTop1 ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none'
                    }}>
                      {team.score.toLocaleString()} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>PTS</span>
                    </div>

                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)'
                    }}>
                      <CheckCircle2 size={11} color="var(--success)" />
                      <span>{team.correctCount || 0} câu đúng</span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    LOCKED...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Academic Takeaway & HCM202 Core Pillars */}
      {revealStep === 'finished' && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* Main prompt quote */}
          <blockquote style={{
            fontSize: '13.5px',
            fontWeight: 600,
            lineHeight: '1.5',
            color: 'var(--text-primary)',
            textAlign: 'center',
            maxWidth: '900px'
          }}>
            “ĐIỂM SỐ TẠO RA NGƯỜI CHIẾN THẮNG CỦA TRÒ CHƠI.
            <br />
            NHƯNG ĐẠI ĐOÀN KẾT ĐƯỢC TẠO RA KHI NHỮNG CON NGƯỜI KHÁC NHAU CÓ THỂ CÙNG HƯỚNG TỚI MỤC TIÊU CHUNG.”
          </blockquote>

          {/* 3 Pillars Formula from HCM202 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            padding: '6px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '11px',
            fontWeight: 700
          }}>
            <span style={{ color: 'var(--accent)' }}>TRUYỀN THỐNG YÊU NƯỚC, NHÂN NGHĨA</span>
            <span style={{ color: 'var(--primary)' }}>+</span>
            <span style={{ color: 'var(--accent)' }}>KHOAN DUNG, ĐỘ LƯỢNG</span>
            <span style={{ color: 'var(--primary)' }}>+</span>
            <span style={{ color: 'var(--accent)' }}>NIỀM TIN VÀO NHÂN DÂN</span>
            <span style={{ color: 'var(--primary)' }}>→</span>
            <span style={{
              color: '#FFFFFF',
              fontWeight: 800,
              background: 'var(--primary-dark)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--primary)'
            }}>
              ĐẠI ĐOÀN KẾT TOÀN DÂN TỘC
            </span>
          </div>

          {/* Replay Button */}
          <button
            onClick={onResetGame}
            className="btn-tactical btn-accent-gold"
            style={{
              padding: '8px 26px',
              fontSize: '13px',
              borderRadius: '8px',
              fontWeight: 700
            }}
          >
            <RotateCcw size={14} />
            <span>Chơi lại trò chơi</span>
          </button>
        </div>
      )}
    </div>
  );
}
