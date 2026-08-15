'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Metadata } from 'next';

interface RankedStudent {
  id: string;
  name: string;
  iq_marks: number;
  rank: number;
  created_at: string;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_CLASSES = ['top-1', 'top-2', 'top-3'];
const PODIUM_CLASSES = ['rank-1', 'rank-2', 'rank-3'];

export default function ResultsPage() {
  const [students, setStudents] = useState<RankedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const res = await fetch('/api/students', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStudents(data.students || []);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('ප්‍රතිඵල ලබා ගැනීමේ දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, 30000);
    return () => clearInterval(interval);
  }, [fetchResults]);

  const top3 = students.slice(0, 3);
  const restStudents = students.slice(3);

  return (
    <div className="results-page">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-title">🏆 ශ්‍රේණිගත කිරීම් ප්‍රතිඵල</h1>
          <p className="results-subtitle">IQ ලකුණු අනුව ශිෂ්‍ය ශ්‍රේණිගත කිරීම</p>
          {lastUpdated && (
            <p className="results-subtitle" style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
              අවසන් යාවත්කාලීනය: {lastUpdated.toLocaleTimeString('si-LK')}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="spinner-wrapper" role="status" aria-label="ලෝඩ් වෙමින්...">
            <div className="spinner" aria-hidden="true" />
            <p className="spinner-text">ප්‍රතිඵල ලබා ගනිමින්...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon" aria-hidden="true">⚠️</span>
            <div>
              <span>{error}</span>
              <button
                onClick={fetchResults}
                style={{
                  display: 'block',
                  marginTop: '0.5rem',
                  background: 'none',
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#fca5a5',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sinhala)',
                }}
                id="btn-retry-results"
              >
                නැවත උත්සාහ කරන්න
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && students.length === 0 && (
          <div className="empty-state" aria-label="ශිෂ්‍යයන් නොමැත">
            <span className="empty-icon" aria-hidden="true">📋</span>
            <h2 className="empty-title">තවම ශිෂ්‍යයන් ලියාපදිංචි නොවීය</h2>
            <p className="empty-text">
              ලකුණු ඇතුළත් කිරීමෙන් පසු ශ්‍රේණිගත කිරීම් මෙහි දිස්වේ.
            </p>
          </div>
        )}

        {/* Podium — Top 3 */}
        {!isLoading && !error && top3.length > 0 && (
          <div
            className="podium"
            role="region"
            aria-label="ඉහළ ශිෂ්‍යයන් 3"
          >
            {top3.map((student, index) => (
              <div
                key={student.id}
                className={`podium-card ${PODIUM_CLASSES[index]}`}
                aria-label={`${index + 1} වන ස්ථානය: ${student.name}`}
              >
                <span className="podium-medal" aria-hidden="true">
                  {MEDALS[index]}
                </span>
                <p className="podium-name">{student.name}</p>
                <p className="podium-marks">{student.iq_marks}</p>
                <p className="podium-marks-label">IQ ලකුණු</p>
              </div>
            ))}
          </div>
        )}

        {/* Full Rankings Table */}
        {!isLoading && !error && students.length > 0 && (
          <div className="rankings-table-wrapper" role="region" aria-label="සම්පූර්ණ ශ්‍රේණිගත කිරීම්">
            <table className="rankings-table" aria-label="ශිෂ්‍ය ශ්‍රේණිගත කිරීම් වගුව">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '60px' }}>ශ්‍රේණිය</th>
                  <th scope="col">නම</th>
                  <th scope="col" style={{ textAlign: 'right' }}>IQ ලකුණු</th>
                  <th scope="col" style={{ textAlign: 'right' }}>ලියාපදිංචි දිනය</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const rankIdx = student.rank - 1;
                  const isTop3 = rankIdx < 3;
                  return (
                    <tr key={student.id}>
                      <td>
                        <span
                          className={`rank-badge ${isTop3 ? RANK_CLASSES[rankIdx] : ''}`}
                          aria-label={`${student.rank} වන ස්ථානය`}
                        >
                          {isTop3 ? MEDALS[rankIdx] : student.rank}
                        </span>
                      </td>
                      <td style={{ fontWeight: isTop3 ? 700 : 400 }}>
                        {student.name}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="marks-value">{student.iq_marks}</span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(student.created_at).toLocaleDateString('si-LK')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Auto refresh note */}
        {!isLoading && students.length > 0 && (
          <p className="refresh-info" aria-live="polite">
            🔄 ප්‍රතිඵල සෑම තත්පර 30කට වරක් ස්වයංක්‍රීයව යාවත්කාලීන වේ
          </p>
        )}
      </div>
    </div>
  );
}
