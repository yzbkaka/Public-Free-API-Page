import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import SiteConfirm from './pages/SiteConfirm';
import { translations } from './locales';
import LanguageDrawer from './components/LanguageDrawer';

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 6; // 每页显示的数量
  const [selectedSite, setSelectedSite] = useState(null);
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const t = translations[currentLang];
  const [isLangDrawerOpen, setIsLangDrawerOpen] = useState(false);

  // 模拟分类数据
  const categories = [
    { id: 1, name: '社交媒体', icon: '🌐' },
    { id: 2, name: '工具软件', icon: '🔧' },
    { id: 3, name: '学习资源', icon: '📚' },
    { id: 4, name: '娱乐休闲', icon: '🎮' },
    { id: 5, name: '生活服务', icon: '🏠' },
    { id: 6, name: '设计资源', icon: '🎨' },
    { id: 7, name: '开发者工具', icon: '💻' },
  ];

  // 模拟网站卡片数据
  const allSites = [
    // 开发者工具
    {
      id: 1,
      title: 'GitHub',
      description: '全球最大的代码托管平台',
      imageUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      category: '开发者工具',
      url: 'https://github.com',
      tags: ['代码托管', '开源社区', 'Git']
    },
    {
      id: 2,
      title: 'Stack Overflow',
      description: '程序员问答社区',
      imageUrl: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png',
      category: '开发者工具',
      url: 'https://stackoverflow.com',
      tags: ['程序员', '问答社区', 'Stack Overflow']
    },
    {
      id: 3,
      title: 'VS Code',
      description: '强大的代码编辑器',
      imageUrl: 'https://code.visualstudio.com/assets/images/code-stable.png',
      category: '开发者工具',
      url: 'https://code.visualstudio.com',
      tags: ['代码编辑器', 'VS Code', '开发工具']
    },
    // 工具软件
    {
      id: 4,
      title: 'ChatGPT',
      description: '强大的AI对话助手',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1200px-ChatGPT_logo.svg.png',
      category: '工具软件',
      url: 'https://chatgpt.com',
      tags: ['AI', '对话助手', 'ChatGPT']
    },
    {
      id: 5,
      title: 'Notion',
      description: '新一代协作与知识管理工具',
      imageUrl: 'https://www.notion.so/images/meta/default.png',
      category: '工具软件',
      url: 'https://notion.so',
      tags: ['协作', '知识管理', 'Notion']
    },
    {
      id: 6,
      title: 'Grammarly',
      description: '智能写作助手',
      imageUrl: 'https://static.grammarly.com/assets/files/cb6ce17d281d15f2c819035bcd430b0e/grammarly_logo.png',
      category: '工具软件',
      url: 'https://grammarly.com',
      tags: ['智能写作', '写作助手', 'Grammarly']
    },
    // 设计资源
    {
      id: 7,
      title: 'Figma',
      description: '专业的在线设计工具',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
      category: '设计资源',
      url: 'https://figma.com',
      tags: ['设计工具', '在线设计', 'Figma']
    },
    {
      id: 8,
      title: 'Dribbble',
      description: '设计师作品分享平台',
      imageUrl: 'https://cdn.dribbble.com/assets/dribbble-ball-192-ec064e49e6f63d9a5fa911518781bee0c90688d052a038f8876ef0824f65eaf2.png',
      category: '设计资源',
      url: 'https://dribbble.com',
      tags: ['设计师', '作品分享', 'Dribbble']
    },
    {
      id: 9,
      title: 'Behance',
      description: 'Adobe旗下创意作品平台',
      imageUrl: 'https://a5.behance.net/21dd46df77e010b8d2f543eb08f5f22f6b7fb033/img/gallery/gallery_1.png',
      category: '设计资源',
      url: 'https://behance.net',
      tags: ['创意作品', 'Adobe', 'Behance']
    },
    // 学习资源
    {
      id: 10,
      title: 'MDN',
      description: 'Mozilla开发者文档',
      imageUrl: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      category: '学习资源',
      url: 'https://developer.mozilla.org',
      tags: ['开发者文档', 'Mozilla', 'MDN']
    },
    {
      id: 11,
      title: 'Coursera',
      description: '全球顶尖大学在线课程',
      imageUrl: 'https://d3njjcbhbojbot.cloudfront.net/web/images/favicons/android-chrome-192x192.png',
      category: '学习资源',
      url: 'https://coursera.org',
      tags: ['在线课程', '顶尖大学', 'Coursera']
    },
    {
      id: 12,
      title: 'freeCodeCamp',
      description: '免费学习编程的平台',
      imageUrl: 'https://www.freecodecamp.org/news/content/images/2019/11/fcc_primary_large_24X210.png',
      category: '学习资源',
      url: 'https://freecodecamp.org',
      tags: ['免费学习', '编程平台', 'freeCodeCamp']
    },
    // 社交媒体
    {
      id: 13,
      title: 'Twitter',
      description: '全球即时社交平台',
      imageUrl: 'https://abs.twimg.com/responsive-web/client-web/icon-ios.b1fc727a.png',
      category: '社交媒体',
      url: 'https://twitter.com',
      tags: ['即时社交', 'Twitter', '社交媒体']
    },
    {
      id: 14,
      title: 'LinkedIn',
      description: '职业社交平台',
      imageUrl: 'https://static.licdn.com/sc/h/al2o9zrvru7aqj8e1x2rzsrca',
      category: '社交媒体',
      url: 'https://linkedin.com',
      tags: ['职业社交', 'LinkedIn', '社交媒体']
    },
    {
      id: 15,
      title: 'Instagram',
      description: '图片分享社交平台',
      imageUrl: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
      category: '社交媒体',
      url: 'https://instagram.com',
      tags: ['图片分享', 'Instagram', '社交媒体']
    },
    // 娱乐休闲
    {
      id: 16,
      title: 'YouTube',
      description: '全球最大的视频平台',
      imageUrl: 'https://www.youtube.com/img/desktop/yt_1200.png',
      category: '娱乐休闲',
      url: 'https://youtube.com',
      tags: ['全球最大的', '视频平台', 'YouTube']
    },
    {
      id: 17,
      title: 'Netflix',
      description: '流媒体视频服务',
      imageUrl: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png',
      category: '娱乐休闲',
      url: 'https://netflix.com',
      tags: ['流媒体', '视频服务', 'Netflix']
    },
    {
      id: 18,
      title: 'Spotify',
      description: '音乐流媒体平台',
      imageUrl: 'https://www.scdn.co/i/_global/twitter_card-default.jpg',
      category: '娱乐休闲',
      url: 'https://spotify.com',
      tags: ['音乐流媒体', 'Spotify', '娱乐休闲']
    },
    // 生活服务
    {
      id: 19,
      title: 'Airbnb',
      description: '全球民宿预订平台',
      imageUrl: 'https://a0.muscache.com/airbnb/static/icons/android-icon-192x192-c0465f9f0380893768972a31a614b670.png',
      category: '生活服务',
      url: 'https://airbnb.com',
      tags: ['全球民宿', '预订平台', 'Airbnb']
    },
    {
      id: 20,
      title: 'Uber',
      description: '打车服务平台',
      imageUrl: 'https://d1a3f4spazzrp4.cloudfront.net/arch-frontend/1.1.1/d1a3f4spazzrp4.cloudfront.net/google-new-guidelines-fa-2x.png',
      category: '生活服务',
      url: 'https://uber.com',
      tags: ['打车服务平台', 'Uber', '生活服务']
    },
    {
      id: 21,
      title: 'Yelp',
      description: '本地生活点评平台',
      imageUrl: 'https://s3-media0.fl.yelpcdn.com/assets/srv0/yelp_large_assets/dcfe403147fc/assets/img/logos/logo_192x192.png',
      category: '生活服务',
      url: 'https://yelp.com',
      tags: ['本地生活', '点评平台', 'Yelp']
    }
  ];

  // 分页显示的网站数据
  const [sites, setSites] = useState([]);

  // 模拟加载更多数据
  const loadMoreSites = useCallback(() => {
    if (loading) return;
    
    setLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      const filteredData = selectedCategory
        ? allSites.filter(site => site.category === selectedCategory)
        : allSites;

      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = page * ITEMS_PER_PAGE;
      const newSites = filteredData.slice(0, endIndex);
      
      setSites(newSites);
      setHasMore(endIndex < filteredData.length);
      setLoading(false);
      setPage(prev => prev + 1);
    }, 800);
  }, [page, loading, selectedCategory]);

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
    loadMoreSites();
  }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVisitClick = (site) => {
    navigate('/confirm', { state: { site } });
  };

  useEffect(() => {
    // 更新页面标题
    document.title = selectedCategory 
      ? `${selectedCategory} - WebNav优质网站导航`
      : 'WebNav - 优质网站导航平台';
    
    // 更新页面描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        selectedCategory
          ? `探索${selectedCategory}分类下的优质网站推荐，包含${sites.length}个精选网站。`
          : 'WebNav是一个精选优质网站的导航平台，为用户提供分类清晰、内容丰富的网站导航服务。'
      );
    }
  }, [selectedCategory, sites.length]);

  // 添加自动检测语言的函数
  const detectUserLanguage = async () => {
    try {
      // 通过 IP 获取用户地区信息
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      // 获取国家代码
      const countryCode = data.country_code.toLowerCase();
      
      // 语言映射表
      const languageMap = {
        'cn': 'zh', // 中国
        'tw': 'zh', // 台湾
        'hk': 'zh', // 香港
        'jp': 'ja', // 日本
        'kr': 'ko', // 韩国
        'de': 'de', // 德国
        'es': 'es', // 西班牙
        'ru': 'ru', // 俄罗斯
        'fr': 'fr', // 法国
        'pt': 'pt', // 葡萄牙
        // 可以添加更多国家和语言的映射
      };

      // 如果有对应的语言设置，则使用该语言，否则默认使用英语
      const detectedLanguage = languageMap[countryCode] || 'en';
      
      // 检查是否支持检测到的语言
      if (translations[detectedLanguage]) {
        setCurrentLang(detectedLanguage);
      } else {
        setCurrentLang('en');
      }
    } catch (error) {
      console.error('Error detecting user language:', error);
      // 如果检测失败，默认使用英语
      setCurrentLang('en');
    }
  };

  // 在组件加载时检测语言
  useEffect(() => {
    // 检查是否已经有语言设置
    const savedLang = localStorage.getItem('preferred-language');
    if (savedLang && translations[savedLang]) {
      setCurrentLang(savedLang);
    } else {
      detectUserLanguage();
    }
  }, []);

  // 修改语言切换函数，添加本地存储
  const handleLanguageChange = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('preferred-language', lang);
  };

  return (
    <div className="app">
      {/* 顶部导航 */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">WebNav</span>
          </div>
          <div className="search-container">
            <div className="search-bar">
              <i className="search-icon">🔍</i>
              <input type="text" placeholder={t.nav.search} />
            </div>
          </div>
          <div className="lang-switch">
            <button 
              className="lang-btn"
              onClick={() => setIsLangDrawerOpen(true)}
            >
              {translations[currentLang].name}
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
          {selectedCategory && (
            <div className="content-header">
              <h1>{selectedCategory || '全部网站'}</h1>
              <div className="content-meta">
                共 {sites.length} 个网站
              </div>
            </div>
          )}
          
          <div className="waterfall">
            {sites.map(site => (
              <div key={site.id} className="site-card">
                <div className="site-card-header">
                  <img className="site-icon" src={site.imageUrl} alt={site.title} />
                  <div className="site-info">
                    <h3>{site.title}</h3>
                    <span className="site-category">{site.category}</span>
                  </div>
                </div>
                <p className="site-description">{site.description}</p>
                {site.tags && (
                  <div className="site-tags">
                    {site.tags.map((tag, index) => (
                      <span key={index} className="site-tag">
                        <span className="site-tag-icon">#</span>
                        {tag}
                      </span>
                    ))}
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
              <span className="logo-text">WebNav</span>
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
    </div>
  );
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
