import React from 'react';
import './LanguageDrawer.css';

const languages = [
  { code: 'en', name: 'English', users: '15亿用户' },
  { code: 'zh', name: '简体中文', users: '10亿用户' },
  { code: 'es', name: 'Español', users: '5.3亿用户' },
  { code: 'hi', name: 'हिन्दी', users: '4.9亿用户' },
  { code: 'ar', name: 'العربية', users: '4.2亿用户' },
  { code: 'pt', name: 'Português', users: '2.8亿用户' },
  { code: 'bn', name: 'বাংলা', users: '2.7亿用户' },
  { code: 'ru', name: 'Русский', users: '2.5亿用户' },
  { code: 'ja', name: '日本語', users: '1.8亿用户' },
  { code: 'de', name: 'Deutsch', users: '1.3亿用户' },
  { code: 'ko', name: '한국어', users: '1.2亿用户' },
  { code: 'fr', name: 'Français', users: '1.1亿用户' },
];

function LanguageDrawer({ isOpen, onClose, currentLang, onSelectLang }) {
  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}
      <div className={`language-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3>选择语言</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="drawer-content">
          {languages.map(lang => (
            <div
              key={lang.code}
              className={`lang-item ${currentLang === lang.code ? 'active' : ''}`}
              onClick={() => {
                onSelectLang(lang.code);
                onClose();
              }}
            >
              <div className="lang-info">
                <span className="lang-name">{lang.name}</span>
                <span className="lang-users">{lang.users}</span>
              </div>
              {currentLang === lang.code && (
                <span className="check-icon">✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default LanguageDrawer; 