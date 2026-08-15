import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MeritView - ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ පද්ධතිය',
  description: 'ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ නිල පද්ධතිය. ලකුණු ඇතුළත් කරන්න සහ ප්‍රතිඵල බලන්න.',
};

export default function HomePage() {
  return (
    <div className="home-hero">
      {/* Badge */}
      <div className="home-badge">
        <span>🏫</span>
        <span>ශිෂ්‍ය ශ්‍රේණිගත කිරීමේ නිල පද්ධතිය</span>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="home-title">MeritView</h1>
        <p className="home-subtitle" style={{ marginTop: '1rem' }}>
          ඔබගේ ලකුණු ඇතුළත් කරන්න සහ ශ්‍රේණිගත කිරීම් බලන්න
        </p>
      </div>

      {/* Action Buttons */}
      <div className="home-actions" role="group" aria-label="ප්‍රධාන ක්‍රියාකාරකම්">
        <Link
          href="/enter-marks"
          className="home-btn home-btn-primary"
          id="btn-enter-marks"
          aria-label="ලකුණු ඇතුළත් කිරීමේ පිටුවට යන්න"
        >
          <span className="home-btn-icon" aria-hidden="true">✏️</span>
          <span className="home-btn-label">ලකුණු ඇතුළත් කරන්න</span>
          <span className="home-btn-sublabel">Enter Marks</span>
        </Link>

        <Link
          href="/results"
          className="home-btn home-btn-secondary"
          id="btn-view-results"
          aria-label="ප්‍රතිඵල බැලීමේ පිටුවට යන්න"
        >
          <span className="home-btn-icon" aria-hidden="true">🏆</span>
          <span className="home-btn-label">ප්‍රතිඵල බලන්න</span>
          <span className="home-btn-sublabel">View Results</span>
        </Link>
      </div>

      {/* Info Row */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        fontFamily: 'var(--font-sinhala)',
        animation: 'fadeInUp 0.7s ease 0.5s both'
      }}>
        <span>✅ IQ ලකුණු පරීක්ෂාව</span>
        <span>🔒 ජා.හැ. සත්‍යාපනය</span>
        <span>📊 සැබෑ-කාල ශ්‍රේණිගත කිරීම</span>
      </div>
    </div>
  );
}
