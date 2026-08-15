'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface StudentFull {
  id: string;
  name: string;
  phone: string;
  nic: string;
  iq_marks: number;
  rank: number;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('admin_token');
    if (!storedToken) {
      router.replace('/admin');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchStudents = useCallback(async (adminToken: string) => {
    if (!adminToken) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/students/admin', {
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
      setError('දත්ත ලබා ගැනීමේ දෝෂයක් ඇතිවිය.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (token) fetchStudents(token);
  }, [token, fetchStudents]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ශිෂ්‍යයාගේ දත්ත මකා දැමීමට අවශ්‍යද?`)) return;

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
        alert(data.error || 'මකා දැමීම අසාර්ථකයි.');
      }
    } catch {
      alert('ජාල දෝෂයක් ඇතිවිය.');
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
    const headers = ['ශ්‍රේණිය', 'නම', 'දුරකථන අංකය', 'ජා.හැ. අංකය', 'IQ ලකුණු', 'ලියාපදිංචි දිනය'];
    const rows = students.map((s) => [
      s.rank,
      `"${s.name}"`,
      s.phone,
      s.nic,
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
        <p className="spinner-text">ලෝඩ් වෙමින්...</p>
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
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <div className="admin-dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-sinhala)' }}>
              📊 පරිපාලක උපකරණ පුවරුව
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem', fontFamily: 'var(--font-sinhala)' }}>
              සියලු ශිෂ්‍ය දත්ත සහ ශ්‍රේණිගත කිරීම් කළමනාකරණය
            </p>
          </div>
          <div className="admin-actions">
            <button
              className="export-btn"
              onClick={handleExportCSV}
              id="btn-export-csv"
              disabled={students.length === 0}
              aria-label="CSV ලෙස ඉදිරිපත් කරන්න"
            >
              📥 CSV ලෙස ඉදිරිපත් කරන්න
            </button>
            <button
              className="logout-btn"
              onClick={handleLogout}
              id="btn-admin-logout"
              aria-label="පිටවීම"
            >
              🚪 පිටවීම
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <p className="admin-stat-number">{totalStudents}</p>
            <p className="admin-stat-label">මුළු ශිෂ්‍යයන්</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-number" style={{ color: 'var(--accent-purple-light)' }}>
              {topScore}
            </p>
            <p className="admin-stat-label">ඉහළම ලකුණු</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-number" style={{ color: 'var(--accent-blue-light)' }}>
              {avgMarks}
            </p>
            <p className="admin-stat-label">සාමාන්‍ය ලකුණු</p>
          </div>
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
                  border: '1px solid rgba(239,68,68,0.4)',
                  color: '#fca5a5',
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sinhala)',
                }}
              >
                නැවත උත්සාහ කරන්න
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="spinner-wrapper">
            <div className="spinner" />
            <p className="spinner-text">දත්ත ලබා ගනිමින්...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && students.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h2 className="empty-title">ශිෂ්‍ය දත්ත නොමැත</h2>
            <p className="empty-text">ශිෂ්‍යයන් ලකුණු ඇතුළත් කළ පසු මෙහි දිස්වේ.</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && students.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table" aria-label="ශිෂ්‍ය දත්ත වගුව">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">නම</th>
                  <th scope="col">දුරකථන</th>
                  <th scope="col">ජා.හැ. අංකය</th>
                  <th scope="col" style={{ textAlign: 'right' }}>IQ ලකුණු</th>
                  <th scope="col">දිනය</th>
                  <th scope="col" style={{ textAlign: 'center' }}>ක්‍රියා</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td>
                      <span
                        className={`rank-badge ${index < 3 ? ['top-1','top-2','top-3'][index] : ''}`}
                      >
                        {student.rank}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-base)' }}>
                      {student.phone}
                    </td>
                    <td style={{ fontFamily: 'var(--font-base)', color: 'var(--text-secondary)' }}>
                      {student.nic}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="marks-value">{student.iq_marks}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {new Date(student.created_at).toLocaleDateString('si-LK')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(student.id, student.name)}
                        disabled={deletingId === student.id}
                        aria-label={`${student.name} ශිෂ්‍යයා මකා දමන්න`}
                        id={`btn-delete-${student.id}`}
                      >
                        {deletingId === student.id ? '⏳' : '🗑️ මකන්න'}
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
