'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const links = [
    { href: '/', label: 'මුල් පිටුව', sublabel: 'Home' },
    { href: '/enter-marks', label: 'ලකුණු ඇතුළත් කරන්න', sublabel: 'Enter Marks' },
    { href: '/results', label: 'ප්‍රතිඵල', sublabel: 'Results' },
    { href: '/admin', label: 'Admin', sublabel: '' },
  ];

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main Navigation">
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand" aria-label="MeritView Home">
            <div className="navbar-logo" aria-hidden="true">M</div>
            <span className="navbar-title">
              Merit<span>View</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links" role="list">
            {links.map((link) => (
              <li key={link.href} role="listitem">
                <Link
                  href={link.href}
                  className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                >
                  {link.sublabel || link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Hamburger button */}
          <button
            className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'මෙනු වසන්න' : 'මෙනු විවෘත කරන්න'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="ham-line" />
            <span className="ham-line" />
            <span className="ham-line" />
          </button>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu drawer */}
      <div
        id="mobile-menu"
        className={`nav-mobile-menu ${menuOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Navigation Menu"
        aria-modal="true"
      >
        <ul className="nav-mobile-links" role="list">
          {links.map((link) => (
            <li key={link.href} role="listitem">
              <Link
                href={link.href}
                className={`nav-mobile-link ${pathname === link.href ? 'active' : ''}`}
                aria-current={pathname === link.href ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-mobile-link-main">{link.label}</span>
                {link.sublabel && (
                  <span className="nav-mobile-link-sub">{link.sublabel}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
