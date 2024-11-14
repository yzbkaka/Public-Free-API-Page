import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { translations } from '../locales/index';

const SiteConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const site = location.state?.site;
  
  // 从 localStorage 获取当前语言，默认为 'en'
  const currentLang = localStorage.getItem('preferred-language') || 'en';
  const t = translations[currentLang] || translations['en'];

  useEffect(() => {
    if (!site) {
      navigate('/');
    }
  }, [site, navigate]);

  if (!site) return null;

  const handleClose = () => {
    navigate('/');
  };

  const handleConfirm = () => {
    if (site && site.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
    }
    navigate('/');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {site.imageUrl && <img src={site.imageUrl} alt={site.title} className="modal-site-icon" />}
          <h2>{site.title}</h2>
        </div>
        <div className="modal-body">
          <p className="modal-description">{site.description}</p>
          <div className="modal-url">
            <span className="url-label">{t.content.url}:</span>
            <span className="url-text">{site.url}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={handleClose}>
            {t.content.cancel}
          </button>
          <button className="modal-btn confirm" onClick={handleConfirm}>
            {t.content.visitSite} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteConfirm; 