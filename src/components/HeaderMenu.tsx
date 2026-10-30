import type { NavigationTab } from '../types';

interface HeaderMenuProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export function HeaderMenu({ activeTab, onSelectTab }: HeaderMenuProps) {
  return (
    <nav className="HeaderMenu" aria-label="Main navigation" data-react-header>
      <div className="header__background" aria-hidden="true">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <path d="M0 0H100M100 0V100M100 100H0M0 100V0" stroke="#111111" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="header__content">
        <button
          type="button"
          className={`header__link ${activeTab === 'experience' ? 'active' : ''}`}
          aria-pressed={activeTab === 'experience'}
          onClick={() => onSelectTab('experience')}
        >
          <span>EXPERIENCE</span>
        </button>
        <svg className="header__ornament" width="42" height="12" viewBox="0 0 42 12" fill="none" aria-hidden="true">
          <path d="M 21 0 C 21 3.5, 25 6, 30 6 C 25 6, 21 8.5, 21 12 C 21 8.5, 17 6, 12 6 C 17 6, 21 3.5, 21 0 Z" fill="#A78BFA" />
        </svg>
        <button
          type="button"
          className={`header__link ${activeTab === 'collection' ? 'active' : ''}`}
          aria-pressed={activeTab === 'collection'}
          onClick={() => onSelectTab('collection')}
        >
          <span>COLLECTION</span>
        </button>
      </div>
    </nav>
  );
}
