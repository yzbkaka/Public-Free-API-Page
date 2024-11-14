import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SiteConfirm from './pages/SiteConfirm';
import LanguageDrawer from './components/LanguageDrawer';
import { translations } from './locales/index';

// 语言到数据文件的映射
const LANGUAGE_DATA_MAP = {
  'en': 'data.json',
  'ar': 'data_ar.json',
  'de': 'data_de.json',
  'es': 'data_es.json',
  'fr': 'data_fr.json',
  'ja': 'data_ja.json',
  'ko': 'data_ko.json',
  'pt': 'data_pt.json',
  'ru': 'data_ru.json',
  'zh': 'data_zh.json'
};

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 6;
  const [selectedSite, setSelectedSite] = useState(null);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [isLangDrawerOpen, setIsLangDrawerOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 在 HomePage 组件中添加翻译获取
  const t = translations[currentLang] || translations['en'];

  // 修改语言切换函数
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('preferred-language', lang);
    
    // 保存当前选中的分类索引
    const currentCategoryIndex = apiData.findIndex(category => category.tab === selectedCategory);
    
    const dataFile = LANGUAGE_DATA_MAP[lang] || 'data.json';
    fetch(`/data/${dataFile}`)
      .then(res => res.json())
      .then(data => {
        // 先清空现有数据
        setSites([]);
        setPage(1);
        setHasMore(true);
        
        // 更新 API 数据
        setApiData(data.data);

        // 如果之前有选中的分类，尝试在新数据中找到相同位置的分类
        if (currentCategoryIndex !== -1 && data.data.length > 0) {
          // 如果索引有效，使用相同位置的分类
          if (currentCategoryIndex < data.data.length) {
            const newCategory = data.data[currentCategoryIndex].tab;
            setSelectedCategory(newCategory);
            // 立即加载新分类的数据
            loadNewCategoryData(data.data, newCategory);
          } else {
            // 如果索引超出范围，使用第一个分类
            setSelectedCategory(data.data[0].tab);
            loadNewCategoryData(data.data, data.data[0].tab);
          }
        } else if (!selectedCategory && data.data.length > 0) {
          // 如果没有选中的分类，选择第一个
          setSelectedCategory(data.data[0].tab);
          loadNewCategoryData(data.data, data.data[0].tab);
        }
      })
      .catch(err => {
        console.error('Error loading language data:', err);
        if (lang !== 'en') {
          fetch('/data/data.json')
            .then(res => res.json())
            .then(data => {
              setApiData(data.data);
              if (data.data.length > 0) {
                setSelectedCategory(data.data[0].tab);
                loadNewCategoryData(data.data, data.data[0].tab);
              }
            });
        }
      });
  };

  // 添加一个新的函数来加载分类数据
  const loadNewCategoryData = (data, category) => {
    const selectedTabData = category
      ? data.find(item => item.tab === category)?.apiList || []
      : data.flatMap(item => item.apiList);

    const newSites = selectedTabData.slice(0, ITEMS_PER_PAGE).map(api => ({
      id: api.name,
      title: api.name,
      description: api.description,
      imageUrl: getDefaultImage(api.name),
      category: category || api.category,
      url: api.url,
      tags: api.tags,
      auth: api.tags.find(tag => tag.includes('apiKey') || tag.includes('OAuth')) || 'No Auth'
    }));
    
    setSites(newSites);
    setHasMore(selectedTabData.length > ITEMS_PER_PAGE);
  };

  // 修改自动检测语言的函数
  const detectUserLanguage = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const countryCode = data.country_code.toLowerCase();
      
      const languageMap = {
        'cn': 'zh',
        'tw': 'zh',
        'hk': 'zh',
        'jp': 'ja',
        'kr': 'ko',
        'de': 'de',
        'es': 'es',
        'ru': 'ru',
        'fr': 'fr',
        'pt': 'pt',
        'sa': 'ar',
      };

      const detectedLanguage = languageMap[countryCode] || 'en';
      
      if (LANGUAGE_DATA_MAP[detectedLanguage]) {
        setCurrentLang(detectedLanguage);
        handleLanguageChange(detectedLanguage);
      } else {
        setCurrentLang('en');
        handleLanguageChange('en');
      }
    } catch (error) {
      console.error('Error detecting user language:', error);
      setCurrentLang('en');
      handleLanguageChange('en');
    }
  };

  // 在组件加载时检测语言
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && LANGUAGE_DATA_MAP[savedLang]) {
      setCurrentLang(savedLang);
      handleLanguageChange(savedLang);
    } else {
      detectUserLanguage();
    }
  }, []);

  // 修改categories的获取方式
  const categories = apiData.map((category, index) => ({
    id: category.tab,
    name: category.tab,
    icon: getIconForCategory(index)
  }));

  // 修改sites的获取和过滤逻辑
  const [sites, setSites] = useState([]);

  // 修改获取网站图标的函数
  function getDefaultImage(name) {
    // 使用 name 作为种子来生成一致的图像
    const style = 'identicon'; // 使用 identicon 风格，看起来更专业
    const seed = encodeURIComponent(name);
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=200`;
  }

  // 修改 loadMoreSites 函数中的站点数据处理
  const loadMoreSites = useCallback(() => {
    if (loading || !apiData.length) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const selectedTabData = selectedCategory
        ? apiData.find(category => category.tab === selectedCategory)?.apiList || []
        : apiData.flatMap(category => category.apiList);

      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = page * ITEMS_PER_PAGE;
      const newSites = selectedTabData.slice(0, endIndex).map(api => ({
        id: api.name,
        title: api.name,
        description: api.description,
        imageUrl: getDefaultImage(api.name), // 使用 getDefaultImage 替代 getSiteIcon
        category: selectedCategory || api.category,
        url: api.url,
        tags: api.tags,
        auth: api.tags.find(tag => tag.includes('apiKey') || tag.includes('OAuth')) || 'No Auth'
      }));
      
      setSites(newSites);
      setHasMore(endIndex < selectedTabData.length);
      setLoading(false);
      setPage(prev => prev + 1);
    }, 800);
  }, [page, loading, selectedCategory, apiData]);

  // 处理分类点击
  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
    setSites([]); // 清空当前显示的网站
    setPage(1); // 重置页码
    setHasMore(true); // 重置加载状态
  };

  // 监听滚动事件
  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;

    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    
    // 当距离底部100px时触发加载
    if (scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreSites();
    }
  }, [hasMore, loading, loadMoreSites]);

  // 添加滚动监听
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 初始加载和分类切换时加载数据
  useEffect(() => {
    if (apiData.length > 0) {
      setSites([]); // 清空当前显示的网站
      setPage(1); // 重置页码
      setHasMore(true); // 重置加载状态
      loadMoreSites();
    }
  }, [selectedCategory, apiData]); // 同时依赖 selectedCategory 和 apiData

  const handleVisitClick = (site) => {
    navigate('/confirm', { state: { site } });
  };

  useEffect(() => {
    const title = selectedCategory 
      ? t.meta.titleTemplate.replace('{category}', selectedCategory)
      : t.meta.defaultTitle;
    
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const description = selectedCategory
        ? t.meta.descriptionTemplate
            .replace('{category}', selectedCategory)
            .replace('{count}', sites.length)
        : t.meta.defaultDescription;
      
      metaDescription.setAttribute('content', description);
    }
  }, [selectedCategory, sites.length, t.meta]);

  // 修改颜色生成函数
  function getTagColor(tag) {
    // 使用更协调的颜色组合，基于网站的主色调
    const colors = [
      { bg: '#EFF6FF', text: '#2563eb' }, // 主题蓝色
      { bg: '#F1F5F9', text: '#475569' }, // 柔和灰色
      { bg: '#F8FAFC', text: '#64748b' }, // 浅灰色
      { bg: '#E0E7FF', text: '#4F46E5' }, // 靛蓝色
      { bg: '#F0F9FF', text: '#0369a1' }, // 天蓝色
    ];
    
    // 使用标签文本作为种子来确保同样的标签总是获得相同的颜色
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  const handleSiteClick = (site) => {
    setSelectedSite(site);
    setIsConfirmOpen(true);
  };

  const handleConfirm = (site) => {
    if (site && site.url) {
      window.open(site.url, '_blank', 'noopener,noreferrer');
    }
  };

  // 搜索处理函数
  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // 从所有分类中搜索
    const results = apiData.reduce((acc, category) => {
      const matchingApis = category.apiList.filter(api => {
        const searchText = `${api.name} ${api.description} ${api.tags.join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      }).map(api => ({
        id: api.name,
        title: api.name,
        description: api.description,
        imageUrl: getDefaultImage(api.name),
        category: category.tab,
        url: api.url,
        tags: api.tags,
        auth: api.tags.find(tag => tag.includes('apiKey') || tag.includes('OAuth')) || 'No Auth'
      }));
      return [...acc, ...matchingApis];
    }, []);

    setSearchResults(results);
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">{t.nav.logo}</span>
          </div>
          <div className="search-container">
            <div className="search-bar">
              <i className="search-icon">🔍</i>
              <input 
                type="text" 
                placeholder={t.nav.search}
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="lang-switch">
            <button 
              className="lang-btn"
              onClick={() => setIsLangDrawerOpen(true)}
            >
              {translations[currentLang]?.name || 'English'}
              <span className="lang-arrow">▼</span>
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* 侧边栏 */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h2>{!isSidebarCollapsed && t.nav.categories}</h2>
            <button 
              className="sidebar-toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? '›' : '‹'}
            </button>
          </div>
          <ul className="category-list">
            {categories.map(category => (
              <li 
                key={category.id} 
                className={`category-item ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <span className="category-icon">{category.icon}</span>
                {!isSidebarCollapsed && (
                  <>
                    <span className="category-name">{category.name}</span>
                    <span className="category-arrow">›</span>
                  </>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* 主要内容区 */}
        <main className="content">
          {!isSearching ? (
            // 原有的分类内容显示
            <>
              {selectedCategory && (
                <div className="content-header">
                  <h1>{selectedCategory || t.content.allSites}</h1>
                  <div className="content-meta">
                    {t.content.totalSites.replace('{count}', sites.length)}
                  </div>
                </div>
              )}
              
              <div className="waterfall">
                {sites.map(site => (
                  <div key={site.id} className="site-card">
                    <div className="site-card-header">
                      <img 
                        className="site-icon" 
                        src={site.imageUrl} 
                        alt={site.title}
                      />
                      <div className="site-info">
                        <h3>{site.title}</h3>
                      </div>
                    </div>
                    <p className="site-description">{site.description}</p>
                    {site.tags && (
                      <div className="site-tags">
                        {site.tags.map((tag, index) => {
                          const tagColor = getTagColor(tag);
                          return (
                            <span 
                              key={index} 
                              className="site-tag"
                              style={{
                                backgroundColor: tagColor.bg,
                                color: tagColor.text
                              }}
                            >
                              <span className="site-tag-icon" style={{ color: tagColor.text }}>#</span>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="card-actions">
                      <button className="visit-btn" onClick={() => handleVisitClick(site)}>
                        <span>{t.content.visitSite}</span>
                        <span className="btn-icon">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            // 搜索结果显示
            <>
              <div className="content-header">
                <h1>{t.content.searchResults}</h1>
                <div className="content-meta">
                  {t.content.searchResultsCount.replace('{count}', searchResults.length)}
                </div>
              </div>
              
              <div className="waterfall">
                {searchResults.map(site => (
                  <div key={site.id} className="site-card">
                    <div className="site-card-header">
                      <img 
                        className="site-icon" 
                        src={site.imageUrl} 
                        alt={site.title}
                      />
                      <div className="site-info">
                        <h3>{site.title}</h3>
                      </div>
                    </div>
                    <p className="site-description">{site.description}</p>
                    {site.tags && (
                      <div className="site-tags">
                        {site.tags.map((tag, index) => {
                          const tagColor = getTagColor(tag);
                          return (
                            <span 
                              key={index} 
                              className="site-tag"
                              style={{
                                backgroundColor: tagColor.bg,
                                color: tagColor.text
                              }}
                            >
                              <span className="site-tag-icon" style={{ color: tagColor.text }}>#</span>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="card-actions">
                      <button className="visit-btn" onClick={() => handleVisitClick(site)}>
                        <span>{t.content.visitSite}</span>
                        <span className="btn-icon">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {searchResults.length === 0 && (
                <div className="no-results">
                  <span className="no-results-icon">🔍</span>
                  <p>{t.content.noSearchResults}</p>
                </div>
              )}
            </>
          )}
          
          {sites.length === 0 && !loading && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>{t.content.noResults}</p>
            </div>
          )}
          
          {loading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <div>{t.content.loading}</div>
            </div>
          )}
          
          {!hasMore && sites.length > 0 && (
            <div className="no-more">
              <div className="no-more-line"></div>
              <span>{t.content.noMore}</span>
              <div className="no-more-line"></div>
            </div>
          )}
        </main>
      </div>

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <div className="footer-logo">
              <span className="logo-text">{t.nav.logo}</span>
            </div>
          </div>
          <nav className="footer-links">
            <a href="/about">{t.footer.about}</a>
            <a href="/contact">{t.footer.contact}</a>
            <a href="/privacy">{t.footer.privacy}</a>
            <a href="/terms">{t.footer.terms}</a>
            <span className="footer-copyright">{t.footer.copyright}</span>
          </nav>
        </div>
      </footer>

      <LanguageDrawer
        isOpen={isLangDrawerOpen}
        onClose={() => setIsLangDrawerOpen(false)}
        currentLang={currentLang}
        onSelectLang={handleLanguageChange}
      />

      <SiteConfirm
        site={selectedSite}
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        t={t}
      />
    </div>
  );
}

// 修改 getIconForCategory 函数为根据索引获取图标
function getIconForCategory(index) {
  // 按固定顺序定义图标数组
  const icons = [
    '🐾', // Animals
    '🎬', // Anime
    '🛡️', // Anti-Malware
    '🎨', // Art & Design
    '🔐', // Authentication
    '⛓️', // Blockchain
    '📚', // Books
    '💼', // Business
    '📅', // Calendar
    '☁️', // Cloud Storage
    '🔄', // Continuous Integration
    '💰', // Cryptocurrency
    '💱', // Currency Exchange
    '✔️', // Data Validation
    '💻', // Development
    '📖', // Dictionaries
    '📝', // Documents
    '📧', // Email
    '🎮', // Entertainment
    '🌍', // Environment
    '📅', // Events
    '💹', // Finance
    '🍔', // Food & Drink
    '🎲', // Games & Comics
    '🗺️', // Geocoding
    '🏛️', // Government
    '⚕️', // Health
    '💼', // Jobs
    '🤖', // Machine Learning
    '🎵', // Music
    '📰', // News
    '📊', // Open Data
    '🔧', // Open Source
    '📜', // Patent
    '😊', // Personality
    '📱', // Phone
    '📸', // Photography
    '👨‍💻', // Programming
    '🔬', // Science & Math
    '🔒', // Security
    '🛍️', // Shopping
    '👥', // Social
    '⚽', // Sports
    '🧪', // Test Data
    '📑', // Text Analysis
    '📍', // Tracking
    '🚗', // Transportation
    '🔗', // URL Shorteners
    '🚗', // Vehicle
    '🎥', // Video
    '🌤️'  // Weather
  ];

  // 返回对应索引的图标，如果索引超出范围则返回默认图标
  return icons[index] || '🔍';
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/confirm" element={<SiteConfirm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
