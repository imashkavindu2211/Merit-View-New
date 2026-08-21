'use client';

import { useState, useEffect, useCallback } from 'react';
import { PROVINCES, getDistrictsForProvince } from '@/lib/srilanka-regions';

interface RankedStudent {
  id: string;
  name: string;
  province: string;
  district: string;
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

  // Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Feature flag
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [resultsEnabled, setResultsEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setResultsEnabled(data.settings?.results_viewing_enabled ?? true);
      })
      .catch(() => setResultsEnabled(true)) // fail open
      .finally(() => setSettingsLoading(false));
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterProvince) params.set('province', filterProvince);
      if (filterDistrict) params.set('district', filterDistrict);
      const url = `/api/students${params.toString() ? `?${params}` : ''}`;

      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStudents(data.students || []);
      setLastUpdated(new Date());
      setError('');
    } catch {
      setError('Failed to load results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filterProvince, filterDistrict]);

  useEffect(() => {
    if (!settingsLoading && resultsEnabled) {
      setIsLoading(true);
      fetchResults();
      const interval = setInterval(fetchResults, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchResults, settingsLoading, resultsEnabled]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterProvince(e.target.value);
    setFilterDistrict(''); // reset district when province changes
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDistrict(e.target.value);
  };

  const availableDistricts = getDistrictsForProvince(filterProvince);

  const top3 = students.slice(0, 3);

  // Loading settings
  if (settingsLoading) {
    return (
      <div className="results-page">
        <div className="spinner-wrapper">
          <div className="spinner" />
          <p className="spinner-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Feature disabled
  if (!resultsEnabled) {
    return (
      <div className="results-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="feature-locked-card">
          <div className="feature-locked-icon" aria-hidden="true">🏆</div>
          <h1 className="feature-locked-title">Results Viewing Temporarily Disabled</h1>
          <p className="feature-locked-text">
            Results have not yet been published by the administrator.
            <br />
            <strong>Results viewing is currently disabled by the administrator.</strong>
          </p>
          <p className="feature-locked-subtext">Please check back later.</p>
          <a href="/" className="feature-locked-btn">
            ← Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-title">🏆 Rankings & Results</h1>
          <p className="results-subtitle">Student rankings by IQ marks</p>
          {lastUpdated && (
            <p className="results-subtitle" style={{ marginTop: '0.25rem', fontSize: '0.78rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString('en-LK')}
            </p>
          )}
        </div>

        {/* ── Province / District Filter ── */}
        <div className="results-filter-bar" role="search" aria-label="Filter results by region">
          <div className="results-filter-group">
            <label htmlFor="filter-province" className="results-filter-label">
              🗺️ Province
            </label>
            <select
              id="filter-province"
              className="results-filter-select"
              value={filterProvince}
              onChange={handleProvinceChange}
            >
              <option value="">All Provinces</option>
              {PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} Province
                </option>
              ))}
            </select>
          </div>

          <div className="results-filter-group">
            <label htmlFor="filter-district" className="results-filter-label">
              📍 District
            </label>
            <select
              id="filter-district"
              className="results-filter-select"
              value={filterDistrict}
              onChange={handleDistrictChange}
              disabled={!filterProvince}
            >
              <option value="">
                {filterProvince ? 'All Districts' : 'Select Province first'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {(filterProvince || filterDistrict) && (
            <button
              className="results-filter-clear"
              onClick={() => { setFilterProvince(''); setFilterDistrict(''); }}
              aria-label="Clear filters"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Active filter pill */}
        {(filterProvince || filterDistrict) && (
          <p className="results-filter-active">
            Showing results for:{' '}
            <strong>{filterDistrict || filterProvince}{filterDistrict ? `, ${filterProvince} Province` : ' Province'}</strong>
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="spinner-wrapper" role="status" aria-label="Loading...">
            <div className="spinner" aria-hidden="true" />
            <p className="spinner-text">Fetching results...</p>
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
                  border: '1px solid rgba(220,38,38,0.3)',
                  color: '#991b1b',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                id="btn-retry-results"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && students.length === 0 && (
          <div className="empty-state" aria-label="No students">
            <span className="empty-icon" aria-hidden="true">📋</span>
            <h2 className="empty-title">
              {filterProvince || filterDistrict ? 'No results for this region' : 'No students registered yet'}
            </h2>
            <p className="empty-text">
              {filterProvince || filterDistrict
                ? 'Try selecting a different province or district.'
                : 'Rankings will appear here once students submit their marks.'}
            </p>
          </div>
        )}

        {/* Podium — Top 3 */}
        {!isLoading && !error && top3.length > 0 && (
          <div className="podium" role="region" aria-label="Top 3 students">
            {top3.map((student, index) => (
              <div
                key={student.id}
                className={`podium-card ${PODIUM_CLASSES[index]}`}
                aria-label={`Rank ${index + 1}: ${student.name}`}
              >
                <span className="podium-medal" aria-hidden="true">
                  {MEDALS[index]}
                </span>
                <p className="podium-name">{student.name}</p>
                <p className="podium-marks">{student.iq_marks}<span style={{ fontSize: '0.6em', opacity: 0.7 }}>/100</span></p>
                <p className="podium-marks-label">IQ Marks</p>
                <p className="podium-region">{student.district}, {student.province}</p>
              </div>
            ))}
          </div>
        )}

        {/* Full Rankings Table */}
        {!isLoading && !error && students.length > 0 && (
          <div className="rankings-table-wrapper" role="region" aria-label="Full rankings">
            <table className="rankings-table" aria-label="Student rankings table">
              <thead>
                <tr>
                  <th scope="col" style={{ width: '60px' }}>Rank</th>
                  <th scope="col">Name</th>
                  <th scope="col">Province / District</th>
                  <th scope="col" style={{ textAlign: 'right' }}>IQ Marks</th>
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
                          aria-label={`Rank ${student.rank}`}
                        >
                          {isTop3 ? MEDALS[rankIdx] : student.rank}
                        </span>
                      </td>
                      <td style={{ fontWeight: isTop3 ? 700 : 400 }}>
                        {student.name}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        {student.district}
                        {student.province && (
                          <span style={{ opacity: 0.6 }}> · {student.province}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="marks-value">{student.iq_marks}<span style={{ fontSize: '0.75em', opacity: 0.6 }}>/100</span></span>
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
            🔄 Results auto-update every 30 seconds
          </p>
        )}
      </div>
    </div>
  );
}
