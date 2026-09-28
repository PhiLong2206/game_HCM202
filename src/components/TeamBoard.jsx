// src/components/TeamBoard.jsx
import React from 'react';
import { Shield, Crown, Medal, CheckCircle2 } from 'lucide-react';

export default function TeamBoard({
  teams,
  rankings,
  activeTeamId,
  isFinalRound,
  roundScoreDeltas = {},
  isResultRevealed
}) {
  const getRankBadge = (rankInfo) => {
    const { rank, isTie } = rankInfo || { rank: 4, isTie: false };
    const prefix = isTie ? 'TIE #' : '#';

    switch (rank) {
      case 1:
        return { text: `${prefix}1`, color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)', border: '#FBBF24', icon: Crown };
      case 2:
        return { text: `${prefix}2`, color: '#CBD5E1', bg: 'rgba(203, 213, 225, 0.1)', border: '#94A3B8', icon: Medal };
      case 3:
        return { text: `${prefix}3`, color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)', border: '#EA580C', icon: Medal };
      default:
        return { text: `${prefix}${rank}`, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.08)', border: '#334E68', icon: null };
    }
  };

  return (
    <div style={{
      width: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      padding: '8px 20px',
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      flexShrink: 0
    }}>
      {teams.map((team) => {
        const rankInfo = rankings[team.id];
        const rankBadge = getRankBadge(rankInfo);
        const isCurrentTurn = !isFinalRound && activeTeamId === team.id;
        const delta = roundScoreDeltas[team.id];
        const isTop1 = rankInfo?.rank === 1;

        return (
          <div
            key={team.id}
            style={{
              background: isCurrentTurn 
                ? 'var(--surface-hover)' 
                : 'var(--surface)',
              border: isCurrentTurn 
                ? '2px solid var(--primary)' 
                : isTop1 
                  ? '1.5px solid rgba(251, 191, 36, 0.4)' 
                  : '1px solid var(--border)',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isCurrentTurn 
                ? '0 0 16px rgba(34, 211, 238, 0.25)' 
                : 'none',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
          >
            {/* Top Bar: Team Name, Turn Badge & Rank */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isTop1 && (
                  <Crown size={14} color="#FBBF24" style={{ flexShrink: 0 }} />
                )}
                <span style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: isCurrentTurn ? 'var(--primary)' : 'var(--text-primary)',
                  letterSpacing: '-0.2px'
                }}>
                  {team.name}
                </span>

                {isCurrentTurn && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'rgba(34, 211, 238, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: '1px solid var(--primary)'
                  }}>
                    LƯỢT CHƠI
                  </span>
                )}
              </div>

              {/* Rank Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '1px 6px',
                borderRadius: '4px',
                background: rankBadge.bg,
                border: `1px solid ${rankBadge.border}`,
                color: rankBadge.color,
                fontSize: '10px',
                fontWeight: 800
              }}>
                {rankBadge.text}
              </div>
            </div>

            {/* Middle: Score (Gold) & Floating Delta */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '2px 0' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--accent)',
                  letterSpacing: '-0.3px',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {team.score.toLocaleString()}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  PTS
                </span>
              </div>

              {/* Floating score diff when revealed */}
              {isResultRevealed && delta !== undefined && delta !== 0 && (
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: delta > 0 ? 'var(--success)' : 'var(--danger)',
                  textShadow: delta > 0 ? '0 0 10px rgba(34, 197, 94, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.4)'
                }}>
                  {delta > 0 ? `+${delta}` : delta} PTS
                </div>
              )}
            </div>

            {/* Bottom: Shield & Correct Questions Count */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '4px',
              borderTop: '1px solid rgba(36, 59, 83, 0.5)',
              fontSize: '10px'
            }}>
              {/* 🛡️ SHIELD Status */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: team.shield > 0 ? '#A78BFA' : 'var(--text-muted)',
                fontWeight: team.shield > 0 ? 700 : 500
              }}>
                <Shield size={11} fill={team.shield > 0 ? '#A78BFA' : 'none'} />
                <span>{team.shield > 0 ? `🛡️ x${team.shield}` : 'Chưa có khiên'}</span>
              </div>

              {/* Correct count */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--text-secondary)'
              }}>
                <CheckCircle2 size={10} color="var(--success)" />
                <span>{team.correctCount || 0} câu đúng</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
