import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SiteConfirm.css';
import { translations } from '../locales';

function SiteConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const site = location.state?.site;

  if (!site) {
    navigate('/');
    return null;
  }

  const handleConfirmVisit = () => {
    window.open(site.url, '_blank');
    navigate('/');
  };

  const currentLang = 'zh';
  const t = translations[currentLang];

  return (
    <div className="site-confirm-page">
      <div className="confirm-container">
        <div className="confirm-content">
          <div className="confirm-header">
            <img src={site.imageUrl} alt={site.title} className="confirm-site-icon" />
            <h2>{site.title}</h2>
          </div>
          <div className="confirm-body">
            <p className="confirm-description">{site.description}</p>
            <div className="confirm-url">
              <span className="url-label">{t.confirm.willRedirect}</span>
              <span className="url-text">{site.url}</span>
            </div>
          </div>
          <div className="confirm-footer">
            <button className="confirm-btn cancel" onClick={() => navigate('/')}>
              {t.confirm.back}
            </button>
            <button className="confirm-btn confirm" onClick={handleConfirmVisit}>
              {t.confirm.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteConfirm; 