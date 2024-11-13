import React from 'react';
import './LanguageDrawer.css';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' }
];

function LanguageDrawer({ isOpen, onClose, currentLang, onSelectLang }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="language-drawer-overlay" onClick={onClose} />
      <div className="language-drawer">
        <div className="language-drawer-header">
          <h2>Select Language</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="language-list">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-item ${currentLang === lang.code ? 'active' : ''}`}
              onClick={() => {
                onSelectLang(lang.code);
                onClose();
              }}
            >
              <span className="language-name">{lang.name}</span>
              {currentLang === lang.code && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default LanguageDrawer; 