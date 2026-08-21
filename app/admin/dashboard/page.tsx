'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PROVINCES, getDistrictsForProvince } from '@/lib/srilanka-regions';

interface StudentFull {
  id: string;
  name: string;
  province: string;
  district: string;
  iq_marks: number;
  rank: number;
  created_at: string;
}

interface AppSettings {
  marks_entry_enabled: boolean;
  results_viewing_enabled: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [token, setToken] = useState('');

  // Filters
  const [filterProvince, setFilterProvince] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');

  // Feature flag state
  const [settings, setSettings] = useState<AppSettings>({
    marks_entry_enabled: true,
    results_viewing_enabled: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [toggleMsg, setToggleMsg] = useState('');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('admin_token');
    if (!storedToken) {
      router.replace('/admin');
      return;
    }
    setToken(storedToken);
  }, [router]);

  // Load settings
  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setSettings(data.settings || settings))
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudents = useCallback(async (adminToken: string) => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterProvince) params.set('province', filterProvince);
      if (filterDistrict) params.set('district', filterDistrict);
      const url = `/api/students/admin${params.toString() ? `?${params}` : ''}`;

      const res = await fetch(url, {
        headers: { 'x-admin-token': adminToken },
        cache: 'no-store',
      });

      if (res.status === 401) {
        sessionStorage.removeItem('admin_token');
        router.replace('/admin');
        return;
      }

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setStudents(data.students || []);
      setError('');
    } catch {
      setError('Failed to load student data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [router, filterProvince, filterDistrict]);

  useEffect(() => {
    if (token) fetchStudents(token);
  }, [token, fetchStudents]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterProvince(e.target.value);
    setFilterDistrict('');
  };

  const availableDistricts = getDistrictsForProvince(filterProvince);

  const handleToggle = async (key: keyof AppSettings) => {
    const newValue = !settings[key];
    setTogglingKey(key);
    setToggleMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ key, value: newValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        setToggleMsg(`❌ ${data.error || 'An error occurred.'}`);
        return;
      }

      setSettings((prev) => ({ ...prev, [key]: newValue }));
      setToggleMsg(`✅ ${newValue ? 'Enabled successfully' : 'Disabled successfully'}`);
      setTimeout(() => setToggleMsg(''), 3000);
    } catch {
      setToggleMsg('❌ A network error occurred.');
    } finally {
      setTogglingKey(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the data for "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': token },
      });

      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, rank: i + 1 })));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete record.');
      }
    } catch {
      alert('A network error occurred.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_token');
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.replace('/admin');
  };

  const handleExportCSV = () => {
    const headers = ['Rank', 'Name', 'Province', 'District', 'IQ Marks', 'Registered Date'];
    const rows = students.map((s) => [
      s.rank,
      `"${s.name}"`,
      s.province,
      s.district,
      s.iq_marks,
      new Date(s.created_at).toLocaleDateString('en-LK'),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meritview-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading && !token) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner" />
        <p className="spinner-text">Loading...</p>
      </div>
    );
  }

  const totalStudents = students.length;
  const avgMarks = totalStudents > 0
    ? Math.round(students.reduce((s, st) => s + st.iq_marks, 0) / totalStudents)
    : 0;
  const topScore = totalStudents > 0 ? students[0]?.iq_marks : 0;

  return (
    <div className="admin-dashboard-page">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
              📊 Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              Manage all student records and rankings
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="export-btn"
              onClick={handleExportCSV}
              id="btn-export-csv"
              disabled={students.length === 0}
              aria-label="Export as CSV"
            >
              📥 Export CSV
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              id="btn-admin-logout"
              aria-label="Logout"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* ── Feature Controls ──────────────────────────────────────────────── */}
        <div className="feature-controls-section">
          <h2 className="feature-controls-title">🎛️ Feature Controls</h2>
          {toggleMsg && (
            <div className={`feature-toggle-msg ${toggleMsg.startsWith('✅') ? 'success' : 'error'}`}>
              {toggleMsg}
            </div>
          )}
          <div className="feature-controls-grid">
            {/* Mark Entry Toggle */}
            <div className={`feature-control-card ${settings.marks_entry_enabled ? 'enabled' : 'disabled'}`}>
              <div className="feature-control-info">
                <span className="feature-control-icon" aria-hidden="true">✏️</span>
                <div>
                  <p className="feature-control-name">Mark Entry</p>
                  <p className="feature-control-sub">Student marks submission</p>
                  <p className="feature-control-desc">
                    Allow students to submit their marks
                  </p>
                </div>
              </div>
              <div className="feature-control-right">
                <span className={`feature-status-badge ${settings.marks_entry_enabled ? 'on' : 'off'}`}>
                  {settings.marks_entry_enabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={`feature-toggle-btn ${settings.marks_entry_enabled ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => handleToggle('marks_entry_enabled')}
                  disabled={togglingKey !== null || settingsLoading}
                  id="btn-toggle-marks-entry"
                  aria-label={`${settings.marks_entry_enabled ? 'Disable' : 'Enable'} mark entry`}
                  aria-pressed={settings.marks_entry_enabled}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>

            {/* Results Viewing Toggle */}
            <div className={`feature-control-card ${settings.results_viewing_enabled ? 'enabled' : 'disabled'}`}>
              <div className="feature-control-info">
                <span className="feature-control-icon" aria-hidden="true">🏆</span>
                <div>
                  <p className="feature-control-name">Results Viewing</p>
                  <p className="feature-control-sub">Public leaderboard access</p>
                  <p className="feature-control-desc">
                    Allow students to view the rankings
                  </p>
                </div>
              </div>
              <div className="feature-control-right">
                <span className={`feature-status-badge ${settings.results_viewing_enabled ? 'on' : 'off'}`}>
                  {settings.results_viewing_enabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={`feature-toggle-btn ${settings.results_viewing_enabled ? 'toggle-on' : 'toggle-off'}`}
                  onClick={() => handleToggle('results_viewing_enabled')}
                  disabled={togglingKey !== null || settingsLoading}
                  id="btn-toggle-results-viewing"
                  aria-label={`${settings.results_viewing_enabled ? 'Disable' : 'Enable'} results viewing`}
                  aria-pressed={settings.results_viewing_enabled}
                >
                  <span className="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <p className="admin-stat-number">{totalStudents}</p>
            <p className="admin-stat-label">
              {filterProvince || filterDistrict ? 'Filtered Students' : 'Total Students'}
            </p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-number" style={{ color: 'var(--accent-gold)' }}>
              {topScore}
            </p>
            <p className="admin-stat-label">Top Score</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-number" style={{ color: 'var(--accent-blue)' }}>
              {avgMarks}
            </p>
            <p className="admin-stat-label">Average Score</p>
          </div>
        </div>

        {/* ── Province / District Filter ── */}
        <div className="admin-filter-bar">
          <div className="results-filter-group">
            <label htmlFor="admin-filter-province" className="results-filter-label">
              🗺️ Province
            </label>
            <select
              id="admin-filter-province"
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
            <label htmlFor="admin-filter-district" className="results-filter-label">
              📍 District
            </label>
            <select
              id="admin-filter-district"
              className="results-filter-select"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
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
              ✕ Clear Filter
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <div>
              <span>{error}</span>
              <button
                onClick={() => fetchStudents(token)}
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
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="spinner-wrapper">
            <div className="spinner" />
            <p className="spinner-text">Fetching data...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && students.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h2 className="empty-title">
              {filterProvince || filterDistrict ? 'No students in this region' : 'No Student Records'}
            </h2>
            <p className="empty-text">
              {filterProvince || filterDistrict
                ? 'Try a different province or district.'
                : 'Records will appear here once students submit their marks.'}
            </p>
          </div>
        )}

        {/* Table */}
        {!isLoading && students.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table" aria-label="Student data table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Province</th>
                  <th scope="col">District</th>
                  <th scope="col" style={{ textAlign: 'right' }}>IQ Marks</th>
                  <th scope="col">Date</th>
                  <th scope="col" style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td>
                      <span
                        className={`rank-badge ${index < 3 ? ['top-1', 'top-2', 'top-3'][index] : ''}`}
                      >
                        {student.rank}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{student.province}</td>
                    <td style={{ fontSize: '0.85rem' }}>{student.district}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="marks-value">{student.iq_marks}<span style={{ fontSize: '0.75em', opacity: 0.6 }}>/100</span></span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(student.created_at).toLocaleDateString('en-LK')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(student.id, student.name)}
                        disabled={deletingId === student.id}
                        aria-label={`Delete student ${student.name}`}
                        id={`btn-delete-${student.id}`}
                      >
                        {deletingId === student.id ? '⏳' : '🗑️ Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
