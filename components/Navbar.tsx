'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/enter-marks', label: 'Enter Marks' },
    { href: '/results', label: 'Results' },
    { href: '/admin', label: 'Admin' },
  ];

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" aria-label="MeritView Home">
          <div className="navbar-logo" aria-hidden="true">M</div>
          <span className="navbar-title">
            Merit<span>View</span>
          </span>
        </Link>

        <ul className="navbar-links" role="list">
          {links.map((link) => (
            <li key={link.href} role="listitem">
              <Link
                href={link.href}
                className={`navbar-link ${pathname === link.href ? 'active' : ''}`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
