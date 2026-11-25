import type { PageId } from '../../types/communication';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="footer-brand">Cross-Modal Communication Bridge (C²B)</p>
          <p className="footer-tagline">One bridge. Different ways to communicate.</p>
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          <button type="button" className="footer-link" onClick={() => onNavigate('home')}>
            Home
          </button>
          <button type="button" className="footer-link" onClick={() => onNavigate('tools')}>
            Communication Tools
          </button>
          <button type="button" className="footer-link" onClick={() => onNavigate('conversation')}>
            Conversation
          </button>
          <button type="button" className="footer-link" onClick={() => onNavigate('about')}>
            About
          </button>
        </div>
      </div>
    </footer>
  );
}
