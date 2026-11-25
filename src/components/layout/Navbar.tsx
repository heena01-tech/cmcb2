import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { PageId } from '../../types/communication';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const NAV_ITEMS: ReadonlyArray<{ id: PageId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'tools', label: 'Communication Tools' },
  { id: 'conversation', label: 'Conversation' },
  { id: 'about', label: 'About' },
];

export function BrandLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="brand-svg"
    >
      <rect width="64" height="64" rx="16" fill="#0F3D4C" />
      <path
        d="M14 40C14 30.0589 22.0589 22 32 22C41.9411 22 50 30.0589 50 40"
        stroke="#2DD4BF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M22 40C22 34.4772 26.4772 30 32 30C37.5228 30 42 34.4772 42 40"
        stroke="#99F6E4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="14" cy="42" r="4" fill="#FFFFFF" />
      <circle cx="50" cy="42" r="4" fill="#FFFFFF" />
      <path d="M10 46H54" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="brand-button"
          onClick={() => handleSelect('home')}
        >
          <BrandLogo />
          <div className="brand-text">
            <span className="brand-title">C²B</span>
            <span className="brand-subtitle">Cross-Modal Communication Bridge</span>
          </div>
        </button>

        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`main-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-link ${activePage === item.id ? 'is-active' : ''}`}
              aria-current={activePage === item.id ? 'page' : undefined}
              onClick={() => handleSelect(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
