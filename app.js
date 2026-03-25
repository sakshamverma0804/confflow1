// ConfFlow — Main Application Logic
// ─────────────────────────────────
// Vanilla JS SPA. All pages are divs toggled via CF.navigate().
// Firebase calls are in js/firebase.js — this file uses mock data when Firebase
// is not configured, so the app runs fully without a backend for demos.

// ═══ STATE ═══════════════════════════════════════════════════════════════════
window.CF = window.CF || {};

CF.state = {
  user:         null,
  role:         null,
  conferences:  generateConferences(),
  papers:       generatePapers(),
  reviews:      generateReviews(),
  activeConf:   null,
  dashTab:      'overview',
  filterTag:    'all',
  searchQuery:  ''
};

// ═══ MOCK DATA ════════════════════════════════════════════════════════════════
function generateConferences() {
  return [
    { id:1, title:'International Conference on Machine Learning', abbr:'ICML 2025', org:'IMLS Foundation', domain:'AI', location:'Vienna, Austria', flag:'🇦🇹', sub:'Mar 15, 2025', notif:'May 20, 2025', cam:'Jun 10, 2025', date:'Jul 14–19, 2025', papers:1842, accepted:312, desc:'The premier venue for machine learning research worldwide. Bringing together leading researchers, practitioners, and industry experts.', tracks:['Deep Learning','Reinforcement Learning','Optimization','Generative Models','Fairness & Robustness','Theory'], color:'#6366f1', urgency:'urgent', acceptRate:17 },
    { id:2, title:'ACM Conference on Human Factors in Computing Systems', abbr:'CHI 2025', org:'ACM SIGCHI', domain:'HCI', location:'Tokyo, Japan', flag:'🇯🇵', sub:'Apr 5, 2025', notif:'Jun 15, 2025', cam:'Jul 5, 2025', date:'Sep 8–12, 2025', papers:923, accepted:189, desc:"The world's premier conference on Human-Computer Interaction, exploring the design and evaluation of interactive computing systems.", tracks:['User Studies','Accessibility','Social Computing','Interaction Techniques','Health & Wellbeing'], color:'#0ea5e9', urgency:'normal', acceptRate:20 },
    { id:3, title:'IEEE Symposium on Security and Privacy', abbr:'IEEE S&P 2025', org:'IEEE', domain:'Security', location:'San Francisco, USA', flag:'🇺🇸', sub:'May 1, 2025', notif:'Jul 10, 2025', cam:'Aug 1, 2025', date:'Oct 20–23, 2025', papers:434, accepted:67, desc:'One of the oldest and most prestigious venues for security and privacy research.', tracks:['Cryptography','Network Security','Systems Security','Privacy','Formal Methods'], color:'#ef4444', urgency:'open', acceptRate:15 },
    { id:4, title:'ACM SIGKDD Data Mining Conference', abbr:'KDD 2025', org:'ACM', domain:'Data', location:'Barcelona, Spain', flag:'🇪🇸', sub:'Feb 28, 2025', notif:'Apr 30, 2025', cam:'May 20, 2025', date:'Aug 4–8, 2025', papers:1250, accepted:238, desc:'The flagship annual conference of the ACM Special Interest Group on Knowledge Discovery and Data Mining.', tracks:['Data Streams','Graph Mining','Spatial & Temporal','Text Mining','Recommender Systems'], color:'#3b82f6', urgency:'normal', acceptRate:19 },
    { id:5, title:'International Conference on Quantum Computing', abbr:'ICQC 2025', org:'IEEE Quantum', domain:'Quantum', location:'Zurich, Switzerland', flag:'🇨🇭', sub:'Jun 1, 2025', notif:'Aug 5, 2025', cam:'Sep 1, 2025', date:'Nov 10–13, 2025', papers:187, accepted:42, desc:'Bringing together the quantum computing community to discuss the latest theoretical and experimental advances.', tracks:['Quantum Algorithms','Error Correction','Photonic Computing','Quantum Cryptography'], color:'#f59e0b', urgency:'open', acceptRate:22 },
    { id:6, title:'International Symposium on Bioinformatics', abbr:'ISB 2025', org:'BioSociety', domain:'Biotech', location:'London, UK', flag:'🇬🇧', sub:'Apr 20, 2025', notif:'Jun 25, 2025', cam:'Jul 20, 2025', date:'Sep 22–25, 2025', papers:312, accepted:74, desc:'A multidisciplinary conference at the intersection of biology, computer science, and data analytics.', tracks:['Genomics','Proteomics','Drug Discovery','Medical Imaging','Systems Biology'], color:'#10b981', urgency:'normal', acceptRate:24 }
  ];
}

function generatePapers() {
  return [
    { id:1, title:'Attention Mechanisms in Large Language Models: A Comprehensive Survey', confId:1, status:'accepted',  submitted:'Jan 15, 2025', aiScore:87, reviewers:3, track:'Deep Learning',    coAuthors:'J. Smith, R. Zhang' },
    { id:2, title:'Federated Learning with Differential Privacy for Medical Imaging',        confId:2, status:'review',    submitted:'Feb 3, 2025',  aiScore:74, reviewers:2, track:'Privacy & Health', coAuthors:'M. Patel' },
    { id:3, title:'Neural Architecture Search via Evolutionary Algorithms',                  confId:1, status:'submitted', submitted:'Mar 1, 2025',  aiScore:68, reviewers:0, track:'AutoML',           coAuthors:'' },
    { id:4, title:'Adversarial Robustness in Vision Transformers Under Distribution Shift',  confId:3, status:'review',    submitted:'Feb 20, 2025', aiScore:79, reviewers:2, track:'Robustness',       coAuthors:'Y. Kim' },
    { id:5, title:'Graph Neural Networks for Drug-Target Interaction Prediction',            confId:6, status:'camera',    submitted:'Jan 8, 2025',  aiScore:91, reviewers:3, track:'Drug Discovery',   coAuthors:'S. Chen, L. Wang' },
    { id:6, title:'Quantum-Classical Hybrid Algorithms for Combinatorial Optimization',      confId:5, status:'rejected',  submitted:'Feb 14, 2025', aiScore:52, reviewers:3, track:'Quantum Algorithms',coAuthors:'' }
  ];
}

function generateReviews() {
  return [
    { id:1, paperTitle:'Deep Learning Approaches to Climate Modeling',             track:'AI & Environment', aiOrig:82, aiQual:78, aiRel:90, aiRec:'accept',  status:'in-progress', deadline:'Mar 30, 2025' },
    { id:2, paperTitle:'Scalable Transformer Architecture for Multilingual NLP',   track:'NLP',              aiOrig:71, aiQual:85, aiRel:88, aiRec:'accept',  status:'pending',     deadline:'Apr 5, 2025'  },
    { id:3, paperTitle:'Privacy-Preserving Collaborative Filtering at Scale',      track:'Privacy',          aiOrig:45, aiQual:55, aiRel:62, aiRec:'reject',  status:'pending',     deadline:'Apr 10, 2025' }
  ];
}

// ═══ ROUTER ═══════════════════════════════════════════════════════════════════
CF.navigate = function(page, data) {
  // 'register' is now part of the unified login page — redirect and show Create Account tab
  if (page === 'register') {
    CF.navigate('login');
    requestAnimationFrame(() => CF.switchAuthTab('create'));
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (!el) { console.warn('Page not found:', page); return; }
  el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // When navigating to login, default to Sign In tab
  if (page === 'login') CF.switchAuthTab('signin');

  // Toggle nav visibility — hide public nav inside dashboard
  const publicNav = document.getElementById('navbar');
  if (publicNav) publicNav.style.display = page === 'dashboard' ? 'none' : '';

  if (data) CF.state.activeConf = data;
  if (page === 'conferences')  CF.renderConferences();
  if (page === 'conf-detail')  CF.renderConfDetail();
  if (page === 'dashboard')    CF.renderDashboard();

  CF._updateNavAuthButtons();
};

// Switch between Sign In and Create Account tabs on the unified auth page
CF.switchAuthTab = function(tab) {
  const panelSignin  = document.getElementById('authPanelSignin');
  const panelCreate  = document.getElementById('authPanelCreate');
  const tabSignIn    = document.getElementById('tabSignIn');
  const tabCreateAcc = document.getElementById('tabCreateAcc');

  if (!panelSignin || !panelCreate) return; // page not yet in DOM

  if (tab === 'create') {
    panelSignin.style.display  = 'none';
    panelCreate.style.display  = '';
    tabSignIn?.classList.remove('active');
    tabCreateAcc?.classList.add('active');
  } else {
    panelCreate.style.display  = 'none';
    panelSignin.style.display  = '';
    tabCreateAcc?.classList.remove('active');
    tabSignIn?.classList.add('active');
  }
};

CF._updateNavAuthButtons = function() {
  const loggedIn = !!CF.state.user;
  const set = (id, show) => { const el = document.getElementById(id); if(el) el.style.display = show ? '' : 'none'; };
  set('navLoginBtn',  !loggedIn);
  set('navRegBtn',    !loggedIn);
  set('navDashBtn',   loggedIn);
  set('navLogoutBtn', loggedIn);
};

// ═══ TOAST ════════════════════════════════════════════════════════════════════
CF.toast = function(msg, type = 'info', duration = 3500) {
  const t = document.getElementById('cf-toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `cf-toast show cf-toast--${type}`;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), duration);
};

// ═══ AUTH (Demo + Firebase) ════════════════════════════════════════════════════
CF.handleLogin = function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value || '';
  const pass  = document.getElementById('loginPass')?.value || '';

  // Try Firebase first, fall back to demo mode
  if (window.AuthService && window.firebaseReady) {
    window.AuthService.login(email, pass)
      .then(user => {
        CF._onFirebaseLogin(user, email);
      })
      .catch(err => {
        CF.toast('Sign in failed: ' + (err.message || 'Check credentials'), 'error');
      });
  } else {
    CF._demoLogin(email);
  }
};

CF._demoLogin = function(email) {
  let role = 'author';
  if (email.includes('chair')) role = 'chair';
  else if (email.includes('review')) role = 'reviewer';
  else if (email.includes('admin')) role = 'admin';

  CF.state.user = {
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email, role, institution: 'University Research Lab',
    initials: email.substring(0, 2).toUpperCase()
  };
  CF.state.role = role;
  CF.toast('Welcome back! 👋', 'success');
  setTimeout(() => CF.navigate('dashboard'), 400);
};

CF._onFirebaseLogin = function(user, email) {
  let role = 'author';
  if (email.includes('chair')) role = 'chair';
  else if (email.includes('review')) role = 'reviewer';
  CF.state.user = {
    name: user.displayName || email.split('@')[0],
    email: user.email, role, institution: '',
    initials: (user.displayName || email).substring(0, 2).toUpperCase(),
    uid: user.uid
  };
  CF.state.role = role;
  CF.toast('Welcome back! 👋', 'success');
  setTimeout(() => CF.navigate('dashboard'), 400);
};

CF.handleRegister = function(e) {
  e.preventDefault();
  const first = document.getElementById('regFirst')?.value || 'User';
  const last  = document.getElementById('regLast')?.value  || '';
  const email = document.getElementById('regEmail')?.value || '';
  const pass  = document.getElementById('regPass')?.value  || '';
  const role  = document.getElementById('regRole')?.value  || 'author';
  const inst  = document.getElementById('regInst')?.value  || '';
  const name  = `${first} ${last}`.trim();

  if (window.AuthService && window.firebaseReady) {
    window.AuthService.register(email, pass, name, role, inst)
      .then(user => {
        CF.state.user = {
          name, email, role, institution: inst,
          initials: `${first[0]}${last[0] || ''}`.toUpperCase(),
          uid: user.uid
        };
        CF.state.role = role;
        CF.toast('Account created! Welcome to ConfFlow 🚀', 'success');
        setTimeout(() => CF.navigate('dashboard'), 400);
      })
      .catch(err => CF.toast('Registration failed: ' + (err.message || 'Try again'), 'error'));
  } else {
    CF.state.user = {
      name, email, role, institution: inst,
      initials: `${first[0]}${last[0] || ''}`.toUpperCase()
    };
    CF.state.role = role;
    CF.toast('Account created! Welcome to ConfFlow 🚀', 'success');
    setTimeout(() => CF.navigate('dashboard'), 400);
  }
};

CF.loginWithGoogle = function() {
  if (window.AuthService && window.firebaseReady) {
    window.AuthService.loginWithGoogle()
      .then(user => CF._onFirebaseLogin(user, user.email))
      .catch(err => CF.toast('Google sign-in failed: ' + err.message, 'error'));
  } else {
    CF.state.user = { name:'Alex Researcher', email:'alex@university.edu', role:'author', initials:'AR', institution:'MIT' };
    CF.state.role = 'author';
    CF.toast('Signed in with Google ✓', 'success');
    setTimeout(() => CF.navigate('dashboard'), 400);
  }
};

CF.logout = function() {
  if (window.AuthService) window.AuthService.logout().catch(() => {});
  CF.state.user = null; CF.state.role = null;
  CF.navigate('home');
  CF.toast('Signed out', 'info');
};

CF.selectRole = function(el, role) {
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const inp = document.getElementById('regRole');
  if (inp) inp.value = role;
};

CF.requireAuth = function(action) {
  if (!CF.state.user) {
    CF.toast('Please sign in to continue', 'info');
    setTimeout(() => CF.navigate('register'), 600);
  } else {
    CF.state.dashTab = action === 'submit' ? 'submit' : 'overview';
    CF.navigate('dashboard');
  }
};

// ═══ CONFERENCES ══════════════════════════════════════════════════════════════
CF.renderConferences = function() {
  const grid = document.getElementById('confGrid');
  if (!grid) return;
  const q   = CF.state.searchQuery.toLowerCase();
  const tag = CF.state.filterTag;
  let confs = CF.state.conferences;
  if (tag !== 'all') confs = confs.filter(c => c.domain === tag);
  if (q) confs = confs.filter(c =>
    c.title.toLowerCase().includes(q) || c.abbr.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q)
  );

  if (!confs.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div><h4>No conferences found</h4><p>Try different search terms or filters</p>
    </div>`;
    return;
  }

  grid.innerHTML = confs.map(c => `
    <article class="conf-card" onclick="CF.openConf(${c.id})" style="--card-accent:${c.color}">
      <div class="conf-card__accent"></div>
      <div class="conf-card__body">
        <div class="conf-card__top">
          <span class="tag tag--domain">${c.domain}</span>
          <span class="tag tag--${c.urgency}">${c.urgency==='urgent'?'⏰ Due Soon':c.urgency==='open'?'✅ Open':'📌 Active'}</span>
        </div>
        <h3 class="conf-card__abbr">${c.abbr}</h3>
        <p class="conf-card__org">${c.org}</p>
        <p class="conf-card__title">${c.title}</p>
        <div class="conf-card__meta">
          <span>${c.flag} ${c.location}</span>
          <span>📅 ${c.date}</span>
        </div>
      </div>
      <div class="conf-card__footer">
        <div class="conf-stats">
          <div class="conf-stat"><span class="conf-stat__num">${c.papers.toLocaleString()}</span><span class="conf-stat__lbl">Papers</span></div>
          <div class="conf-stat"><span class="conf-stat__num">${c.acceptRate}%</span><span class="conf-stat__lbl">Accept Rate</span></div>
        </div>
        <button class="btn btn--sm btn--primary">View →</button>
      </div>
    </article>
  `).join('');
};

CF.openConf = function(id) {
  CF.state.activeConf = CF.state.conferences.find(c => c.id === id);
  CF.navigate('conf-detail');
};

CF.filterByTag = function(el, tag) {
  document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  CF.state.filterTag = tag;
  CF.renderConferences();
};

CF.filterSearch = function(val) {
  CF.state.searchQuery = val;
  CF.renderConferences();
};

CF.renderConfDetail = function() {
  const conf = CF.state.activeConf;
  const el   = document.getElementById('confDetailContent');
  if (!el || !conf) return;
  const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b'];
  const committee = [
    { name:'Prof. Sarah Chen',   role:'General Chair', inst:'MIT CSAIL' },
    { name:'Dr. Marcus Patel',   role:'Program Chair', inst:'Stanford University' },
    { name:'Dr. Yuki Tanaka',    role:'Area Chair',    inst:'Google DeepMind' },
    { name:'Prof. Elena Kovács', role:'Area Chair',    inst:'ETH Zürich' }
  ];
  el.innerHTML = `
    <div class="conf-detail">
      <div class="conf-detail__hero" style="--accent:${conf.color};border-top-color:${conf.color}">
        <div class="conf-detail__info">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
            <span class="tag tag--domain">${conf.domain}</span>
            <span class="tag tag--${conf.urgency}">${conf.urgency==='urgent'?'⏰ Deadline Soon':'✅ Accepting Submissions'}</span>
          </div>
          <h1 class="conf-detail__title">${conf.title}</h1>
          <div class="conf-detail__meta">
            <span>${conf.flag} ${conf.location}</span>
            <span>🗓 ${conf.date}</span>
            <span>🏛 ${conf.org}</span>
          </div>
          <p class="conf-detail__desc">${conf.desc}</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn--primary" onclick="CF.requireAuth('submit')">📤 Submit Paper</button>
            <button class="btn btn--outline" onclick="CF.toast('CFP download coming soon','info')">📋 Download CFP</button>
          </div>
          <div class="conf-detail__stats">
            <div class="det-stat"><span class="det-stat__n">${conf.papers.toLocaleString()}</span><span class="det-stat__l">Submissions</span></div>
            <div class="det-stat__div"></div>
            <div class="det-stat"><span class="det-stat__n">${conf.accepted}</span><span class="det-stat__l">Accepted</span></div>
            <div class="det-stat__div"></div>
            <div class="det-stat"><span class="det-stat__n">${conf.acceptRate}%</span><span class="det-stat__l">Accept Rate</span></div>
          </div>
        </div>
        <div class="conf-sidebar">
          <h4 class="sidebar-box__title">Important Dates</h4>
          <div class="dates-list">
            <div class="date-item"><span class="date-item__label">Submission</span><span class="date-item__val">${conf.sub}</span></div>
            <div class="date-item"><span class="date-item__label">Notification</span><span class="date-item__val">${conf.notif}</span></div>
            <div class="date-item"><span class="date-item__label">Camera Ready</span><span class="date-item__val">${conf.cam}</span></div>
            <div class="date-item"><span class="date-item__label">Conference</span><span class="date-item__val">${conf.date}</span></div>
          </div>
          <button class="btn btn--primary btn--full" onclick="CF.requireAuth('submit')" style="margin-top:20px">Submit Paper →</button>
        </div>
      </div>
      <div class="section-block">
        <h3 class="section-block__title">Tracks & Topics</h3>
        <div class="tracks-grid">${conf.tracks.map(t=>`<div class="track-chip">${t}</div>`).join('')}</div>
      </div>
      <div class="section-block">
        <h3 class="section-block__title">Program Committee</h3>
        <div class="committee-grid">
          ${committee.map((m,i)=>`
            <div class="committee-card">
              <div class="committee-card__avatar" style="background:${avatarColors[i]}20;color:${avatarColors[i]}">${m.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div class="committee-card__name">${m.name}</div>
              <div class="committee-card__role">${m.role}</div>
              <div class="committee-card__inst">${m.inst}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

// ═══ DASHBOARD ════════════════════════════════════════════════════════════════
CF.navConfig = {
  author: [
    { id:'overview',       icon:'⬡', label:'Overview' },
    { id:'papers',         icon:'◈', label:'My Papers' },
    { id:'submit',         icon:'⊕', label:'Submit Paper' },
    { id:'notifications',  icon:'◎', label:'Notifications' },
    { id:'camera',         icon:'◉', label:'Camera Ready' }
  ],
  reviewer: [
    { id:'overview',       icon:'⬡', label:'Overview' },
    { id:'assigned',       icon:'◈', label:'Assigned Papers' },
    { id:'review-form',    icon:'◐', label:'Write Review' },
    { id:'discussion',     icon:'◎', label:'Discussion' }
  ],
  chair: [
    { id:'overview',       icon:'⬡', label:'Overview' },
    { id:'setup',          icon:'◎', label:'Conference Setup' },
    { id:'papers',         icon:'◈', label:'All Papers' },
    { id:'assignments',    icon:'◐', label:'Assignments' },
    { id:'decisions',      icon:'◉', label:'Decisions' },
    { id:'program',        icon:'◷', label:'Program' },
    { id:'analytics',      icon:'◑', label:'Analytics' }
  ],
  admin: [
    { id:'overview',       icon:'⬡', label:'Overview' },
    { id:'papers',         icon:'◈', label:'All Papers' },
    { id:'analytics',      icon:'◑', label:'Analytics' }
  ]
};

CF.renderDashboard = function() {
  if (!CF.state.user) { CF.navigate('login'); return; }
  const u = CF.state.user;
  const $  = id => document.getElementById(id);

  if ($('sidebarAvatar')) $('sidebarAvatar').textContent = u.initials;
  if ($('sidebarName'))   $('sidebarName').textContent   = u.name;
  if ($('sidebarRole'))   $('sidebarRole').textContent   = u.role.charAt(0).toUpperCase() + u.role.slice(1);

  const items = CF.navConfig[u.role] || CF.navConfig.author;
  const nav   = $('sidebarNav');
  if (nav) nav.innerHTML = items.map(item => `
    <button class="nav-item ${CF.state.dashTab===item.id?'active':''}" onclick="CF.switchTab('${item.id}')">
      <span class="nav-item__icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `).join('');

  CF.renderTab(CF.state.dashTab);
};

CF.switchTab = function(tab) {
  CF.state.dashTab = tab;
  CF.renderDashboard();
};

CF.renderTab = function(tab) {
  const el   = document.getElementById('dashContent');
  if (!el) return;
  const role = CF.state.role;

  const map = {
    overview:      role==='reviewer' ? CF.tabs.reviewerOverview : role==='chair'||role==='admin' ? CF.tabs.chairOverview : CF.tabs.authorOverview,
    papers:        CF.tabs.papers,
    submit:        CF.tabs.submit,
    notifications: CF.tabs.notifications,
    camera:        CF.tabs.camera,
    assigned:      CF.tabs.assigned,
    'review-form': CF.tabs.reviewForm,
    discussion:    CF.tabs.discussion,
    decisions:     CF.tabs.decisions,
    setup:         CF.tabs.setup,
    assignments:   CF.tabs.assignments,
    analytics:     CF.tabs.analytics,
    program:       CF.tabs.program
  };

  const fn = map[tab];
  el.innerHTML = fn ? fn() : `<div class="dash-header"><h1 class="dash-title">${tab}</h1></div><div class="card"><p style="color:var(--t2)">Coming soon.</p></div>`;
};

// ═══ TAB RENDERERS ════════════════════════════════════════════════════════════
CF.tabs = {};

// ── Author Overview ──────────────────────────────────────────────────────────
CF.tabs.authorOverview = function() {
  const p   = CF.state.papers;
  const acc = p.filter(x => x.status==='accepted').length;
  const rev = p.filter(x => x.status==='review').length;
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Overview</h1><p class="dash-sub">Welcome back, ${CF.state.user.name.split(' ')[0]}</p></div>
      <button class="btn btn--primary" onclick="CF.switchTab('submit')">+ Submit Paper</button>
    </div>
    <div class="stat-grid">
      ${CF.statCard('◈', p.length,                               'Total Submissions', '↑ 2 this month',    '#6366f1')}
      ${CF.statCard('◐', rev,                                    'Under Review',      'Active',            '#0ea5e9')}
      ${CF.statCard('✓', acc,                                    'Accepted',          '↑ 1 this quarter',  '#10b981')}
      ${CF.statCard('◉', p.filter(x=>x.status==='camera').length,'Camera Ready',      'Action needed',     '#f59e0b')}
    </div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Recent Submissions</h3>
        <button class="btn btn--sm btn--ghost" onclick="CF.switchTab('papers')">View All →</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Title</th><th>Conference</th><th>AI Score</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>${p.map(x=>`
            <tr>
              <td class="table-title" title="${x.title}">${x.title}</td>
              <td><span class="chip">${CF.state.conferences.find(c=>c.id===x.confId)?.abbr||'—'}</span></td>
              <td>${CF.aiScoreEl(x.aiScore)}</td>
              <td><span class="status-badge status--${x.status}">${CF.statusLabel(x.status)}</span></td>
              <td class="table-date">${x.submitted}</td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <h3 class="card-title" style="margin-bottom:24px">Submission Progress</h3>
      <div class="progress-tracker">
        ${['Submitted','Under Review','Decision','Camera Ready','Presented'].map((s,i)=>`
          <div class="pt-step">
            <div class="pt-dot ${i<2?'done':i===2?'active':''}">${i<2?'✓':i===2?'⟳':'○'}</div>
            <div class="pt-label">${s}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
};

// ── Reviewer Overview ────────────────────────────────────────────────────────
CF.tabs.reviewerOverview = function() {
  return `
    <div class="dash-header"><h1 class="dash-title">Reviewer Dashboard</h1><p class="dash-sub">3 papers assigned this cycle</p></div>
    <div class="stat-grid">
      ${CF.statCard('◈', 3, 'Assigned',  'This cycle',   '#6366f1')}
      ${CF.statCard('✓', 1, 'Reviewed',  '33% complete', '#10b981')}
      ${CF.statCard('⟳', 2, 'Pending',   'Due in 7 days','#f59e0b')}
      ${CF.statCard('◎', 5, 'Messages',  'From chair',   '#0ea5e9')}
    </div>
    <div class="card">
      <div class="card-header"><h3 class="card-title">Assigned Papers</h3></div>
      ${CF.state.reviews.map(r=>`
        <div class="review-card" onclick="CF.switchTab('review-form')">
          <div class="review-card__top">
            <div class="review-card__info">
              <div class="review-card__title">${r.paperTitle}</div>
              <div class="review-card__track">${r.track} · Due ${r.deadline}</div>
            </div>
            <span class="status-badge status--${r.status==='pending'?'submitted':'review'}">${r.status==='pending'?'Pending':'In Progress'}</span>
          </div>
          ${CF._aiPanel(r)}
          <button class="btn btn--primary btn--sm" style="margin-top:12px">Write Review →</button>
        </div>
      `).join('')}
    </div>
  `;
};

// ── Chair Overview ───────────────────────────────────────────────────────────
CF.tabs.chairOverview = function() {
  const total=142,reviewed=89,accepted=34,rejected=21;
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Chair Dashboard</h1><p class="dash-sub">ICML 2025 — Full lifecycle management</p></div>
      <button class="btn btn--primary" onclick="CF.switchTab('setup')">⚙ Setup</button>
    </div>
    <div class="stat-grid">
      ${CF.statCard('◈', total,          'Total Papers',  '↑ 12 this week',                   '#6366f1')}
      ${CF.statCard('◐', reviewed,       'Reviewed',      `${Math.round(reviewed/total*100)}% done`,  '#0ea5e9')}
      ${CF.statCard('✓', accepted,       'Accepted',      `${Math.round(accepted/total*100)}% rate`,  '#10b981')}
      ${CF.statCard('⟳', total-reviewed, 'Pending',       'Need review',                      '#f59e0b')}
    </div>
    <div class="two-col">
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Decision Progress</h3>
        ${[['Reviewed',reviewed,total,'#6366f1'],['Accepted',accepted,total,'#10b981'],['Rejected',rejected,total,'#ef4444'],['Camera Ready',18,total,'#f59e0b']].map(([l,v,t,c])=>`
          <div class="prog-row">
            <div class="prog-row__top"><span>${l}</span><span class="prog-row__val">${v}/${t}</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:${Math.round(v/t*100)}%;background:${c}"></div></div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Reviewer Load</h3>
        ${['Dr. Smith','Prof. Johnson','Dr. García','Dr. Kim','Prof. Müller'].map((r,i)=>`
          <div class="reviewer-row">
            <div class="reviewer-avatar">${r.split(' ')[1][0]}</div>
            <div class="reviewer-info">
              <div class="reviewer-name">${r}</div>
              <div class="prog-bar" style="margin-top:4px"><div class="prog-fill" style="width:${30+i*15}%;background:#6366f1"></div></div>
            </div>
            <div class="reviewer-count">${3+i}/8</div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Papers Awaiting Decision</h3>
        <button class="btn btn--sm btn--ghost" onclick="CF.switchTab('decisions')">All Decisions →</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Paper</th><th>Track</th><th>AI Score</th><th>Reviews</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${CF.state.papers.slice(0,4).map(p=>`
            <tr>
              <td class="table-title" title="${p.title}">${p.title}</td>
              <td class="table-date">${p.track}</td>
              <td>${CF.aiScoreEl(p.aiScore)}</td>
              <td class="table-date">${p.reviewers}/3</td>
              <td><span class="status-badge status--${p.status}">${CF.statusLabel(p.status)}</span></td>
              <td style="white-space:nowrap">
                <button class="btn btn--xs btn--success" onclick="CF.acceptPaper(${p.id});event.stopPropagation()">✓</button>
                <button class="btn btn--xs btn--danger"  onclick="CF.rejectPaper(${p.id});event.stopPropagation()" style="margin-left:4px">✗</button>
              </td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ── Papers ───────────────────────────────────────────────────────────────────
CF.tabs.papers = function() {
  const role   = CF.state.role;
  const papers = role==='chair'||role==='admin' ? CF.state.papers : CF.state.papers.slice(0,4);
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">${role==='chair'||role==='admin'?'All Papers':'My Papers'}</h1></div>
      ${role!=='chair'&&role!=='admin'?'<button class="btn btn--primary" onclick="CF.switchTab(\'submit\')">+ New Submission</button>':''}
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>#</th><th>Title</th><th>Conference</th><th>Track</th><th>AI Score</th><th>Status</th><th>${role==='chair'||role==='admin'?'Action':'Submitted'}</th></tr></thead>
          <tbody>${papers.map(p=>`
            <tr>
              <td class="table-date">#${p.id}</td>
              <td class="table-title" title="${p.title}">${p.title}</td>
              <td><span class="chip">${CF.state.conferences.find(c=>c.id===p.confId)?.abbr||'—'}</span></td>
              <td class="table-date">${p.track}</td>
              <td>${CF.aiScoreEl(p.aiScore)}</td>
              <td><span class="status-badge status--${p.status}">${CF.statusLabel(p.status)}</span></td>
              <td>${(role==='chair'||role==='admin')
                ? `<button class="btn btn--xs btn--success" onclick="CF.acceptPaper(${p.id})">✓</button> <button class="btn btn--xs btn--danger" onclick="CF.rejectPaper(${p.id})">✗</button>`
                : `<span class="table-date">${p.submitted}</span>`}
              </td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ── Submit Paper ─────────────────────────────────────────────────────────────
CF.tabs.submit = function() {
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Submit Paper</h1><p class="dash-sub">Complete all fields for a successful submission</p></div>
    </div>
    <div class="card">
      <form onsubmit="CF.handlePaperSubmit(event)" style="display:flex;flex-direction:column;gap:20px">
        <div class="form-group">
          <label class="form-label">Paper Title *</label>
          <input class="form-input" type="text" id="paperTitle" placeholder="Enter your full paper title" required>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Conference *</label>
            <select class="form-input" id="paperConf" required>
              <option value="">Select conference...</option>
              ${CF.state.conferences.map(c=>`<option value="${c.id}">${c.abbr}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Track</label>
            <select class="form-input" id="paperTrack">
              <option>Deep Learning</option>
              <option>NLP & Text</option>
              <option>Computer Vision</option>
              <option>Reinforcement Learning</option>
              <option>Healthcare AI</option>
              <option>Fairness & Ethics</option>
              <option>Systems & Architecture</option>
              <option>Theory</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Abstract * <span style="color:var(--t3);font-weight:400;font-size:12px">(min 150 words)</span></label>
          <textarea class="form-input" id="paperAbstract" rows="6" placeholder="A concise summary of your research, including motivation, methodology, key results, and contribution..." required></textarea>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Keywords</label>
            <input class="form-input" type="text" id="paperKeywords" placeholder="transformer, attention, NLP (comma-separated)">
          </div>
          <div class="form-group">
            <label class="form-label">Co-Authors</label>
            <input class="form-input" type="text" id="paperCoAuthors" placeholder="Jane Smith (MIT), Bob Chen (Stanford)">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Upload PDF *</label>
          <div class="upload-zone" id="uploadZone" onclick="document.getElementById('pdfInput').click()" ondragover="CF.dragOver(event)" ondrop="CF.dropFile(event)">
            <input type="file" id="pdfInput" accept=".pdf" style="display:none" onchange="CF.fileSelected(this)">
            <div class="upload-zone__icon">📄</div>
            <div class="upload-zone__text" id="uploadText">Drop PDF here or click to browse</div>
            <div class="upload-zone__hint">Maximum 50MB · PDF format only</div>
          </div>
          <div id="uploadProgress" style="display:none;margin-top:8px">
            <div class="prog-bar"><div class="prog-fill" id="uploadFill" style="width:0%;background:#6366f1;transition:width .3s"></div></div>
            <div style="font-size:12px;color:var(--t2);margin-top:4px" id="uploadPct">Uploading... 0%</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <label class="toggle-label">
            <input type="checkbox" id="dblBlind" checked class="toggle-input">
            <span class="toggle-track"></span>
            Submit as double-blind (author names hidden from reviewers)
          </label>
          <label class="toggle-label">
            <input type="checkbox" id="aiConsent" checked class="toggle-input">
            <span class="toggle-track"></span>
            Allow AI pre-screening of this paper
          </label>
        </div>
        <div class="form-check">
          <input type="checkbox" id="ethicsDecl" required>
          <label for="ethicsDecl">I declare this is original work and has not been submitted elsewhere</label>
        </div>
        <div style="display:flex;gap:10px">
          <button type="submit" class="btn btn--primary">Submit Paper 🚀</button>
          <button type="button" class="btn btn--ghost" onclick="CF.saveDraft()">Save Draft</button>
        </div>
      </form>
    </div>
  `;
};

// ── Review Form ──────────────────────────────────────────────────────────────
CF.tabs.reviewForm = function() {
  const r = CF.state.reviews[0];
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Write Review</h1><p class="dash-sub">${r.paperTitle}</p></div>
    </div>
    ${CF._aiPanel(r, true)}
    <div class="card">
      <h3 class="card-title" style="margin-bottom:20px">Your Evaluation Scores</h3>
      ${['Originality','Scientific Quality','Relevance to Venue','Clarity of Writing','Significance of Contribution'].map((c,i)=>`
        <div class="criteria-row">
          <div class="criteria-row__label">${c}<span class="criteria-score" id="cs${i}">7 / 10</span></div>
          <input type="range" min="1" max="10" value="${6+i%3}" class="criteria-slider" oninput="document.getElementById('cs${i}').textContent=this.value+' / 10'">
        </div>
      `).join('')}
      <div class="form-group" style="margin-top:24px">
        <label class="form-label">Overall Recommendation</label>
        <select class="form-input" id="reviewRec">
          <option value="strong-accept">Strong Accept</option>
          <option value="accept" selected>Accept</option>
          <option value="weak-accept">Weak Accept</option>
          <option value="borderline">Borderline</option>
          <option value="weak-reject">Weak Reject</option>
          <option value="reject">Reject</option>
          <option value="strong-reject">Strong Reject</option>
        </select>
      </div>
      <div class="form-group" style="margin-top:16px">
        <label class="form-label">Summary for Authors <span style="color:var(--t3);font-weight:400;font-size:12px">(visible to authors)</span></label>
        <textarea class="form-input" rows="6" id="reviewSummary" placeholder="Provide a comprehensive review that explains your scores. Be constructive and specific about strengths and weaknesses..."></textarea>
      </div>
      <div class="form-group" style="margin-top:16px">
        <label class="form-label">Confidential Comments <span style="color:var(--t3);font-weight:400;font-size:12px">(chair only, not shown to authors)</span></label>
        <textarea class="form-input" rows="3" id="reviewConfidential" placeholder="Private notes for the program chair only..."></textarea>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn--primary" onclick="CF.submitReview()">Submit Review ✓</button>
        <button class="btn btn--ghost" onclick="CF.toast('Review draft saved ✓','info')">Save Draft</button>
      </div>
    </div>
  `;
};

// ── Decisions ────────────────────────────────────────────────────────────────
CF.tabs.decisions = function() {
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Decision Console</h1><p class="dash-sub">Make final accept/reject decisions</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--success btn--sm" onclick="CF.bulkAccept()">✓ Bulk Accept</button>
        <button class="btn btn--outline btn--sm" onclick="CF.exportDecisions()">↓ Export</button>
      </div>
    </div>
    <div class="pill-tabs">
      <button class="pill-tab active" onclick="CF.pillTab(this)">All (${CF.state.papers.length})</button>
      <button class="pill-tab" onclick="CF.pillTab(this)">Pending</button>
      <button class="pill-tab" onclick="CF.pillTab(this)">Accepted</button>
      <button class="pill-tab" onclick="CF.pillTab(this)">Rejected</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      ${CF.state.papers.map(p=>`
        <div class="decision-row">
          <div class="decision-row__main">
            <div class="decision-row__title">${p.title}</div>
            <div class="decision-row__meta">Track: ${p.track} · ${p.reviewers} reviewers · Submitted ${p.submitted}</div>
            <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
              <span class="status-badge status--${p.status}">${CF.statusLabel(p.status)}</span>
              ${CF.aiScoreEl(p.aiScore)}
            </div>
          </div>
          <div class="decision-row__scores">
            ${[['Orig.',6+p.id%2],['Qual.',7-p.id%3],['Rel.',7+p.id%2]].map(([l,v])=>`
              <div class="mini-score"><div class="mini-score__num">${v}/10</div><div class="mini-score__lbl">${l}</div></div>
            `).join('')}
          </div>
          <div class="decision-row__actions">
            <button class="btn btn--success btn--sm" onclick="CF.acceptPaper(${p.id})">✓ Accept</button>
            <button class="btn btn--danger btn--sm"  onclick="CF.rejectPaper(${p.id})">✗ Reject</button>
            <button class="btn btn--ghost btn--sm"   onclick="CF.toast('Revision request sent','info')">↩ Revise</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

// ── Conference Setup ─────────────────────────────────────────────────────────
CF.tabs.setup = function() {
  const conf = CF.state.conferences[0];
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Conference Setup</h1><p class="dash-sub">Configure your conference details and workflow</p></div>
    </div>
    <div class="card" style="margin-bottom:18px">
      <h3 class="card-title" style="margin-bottom:20px">Basic Information</h3>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">Conference Name</label><input class="form-input" type="text" value="${conf.title}" id="setupName"></div>
          <div class="form-group"><label class="form-label">Acronym</label><input class="form-input" type="text" value="${conf.abbr}" id="setupAbbr"></div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">Location</label><input class="form-input" type="text" value="${conf.location}" id="setupLoc"></div>
          <div class="form-group"><label class="form-label">Conference Dates</label><input class="form-input" type="text" value="${conf.date}" id="setupDates"></div>
        </div>
        <div class="form-row-2">
          <div class="form-group"><label class="form-label">Submission Deadline</label><input class="form-input" type="date" value="2025-03-15" id="setupSub"></div>
          <div class="form-group"><label class="form-label">Notification Date</label><input class="form-input" type="date" value="2025-05-20" id="setupNotif"></div>
        </div>
        <div class="form-group"><label class="form-label">Description</label><textarea class="form-input" rows="3" id="setupDesc">${conf.desc}</textarea></div>
        <div class="form-group"><label class="form-label">Tracks (comma-separated)</label><input class="form-input" type="text" value="${conf.tracks.join(', ')}" id="setupTracks"></div>
      </div>
    </div>
    <div class="card" style="margin-bottom:18px">
      <h3 class="card-title" style="margin-bottom:16px">Review Settings</h3>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Reviews per Paper</label>
            <select class="form-input" id="setupRevCount">
              <option>2</option><option selected>3</option><option>4</option><option>5</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Review Deadline</label>
            <input class="form-input" type="date" value="2025-04-15">
          </div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <label class="toggle-label">
            <input type="checkbox" checked class="toggle-input" onchange="CF.toast('Double-blind '+(this.checked?'enabled':'disabled'),'info')">
            <span class="toggle-track"></span> Double-blind review
          </label>
          <label class="toggle-label">
            <input type="checkbox" checked class="toggle-input" onchange="CF.toast('AI pre-screening '+(this.checked?'enabled':'disabled'),'info')">
            <span class="toggle-track"></span> AI pre-screening
          </label>
          <label class="toggle-label">
            <input type="checkbox" class="toggle-input" onchange="CF.toast('Email automation '+(this.checked?'enabled':'disabled'),'info')">
            <span class="toggle-track"></span> Email automation
          </label>
          <label class="toggle-label">
            <input type="checkbox" class="toggle-input" onchange="CF.toast('Author rebuttal '+(this.checked?'enabled':'disabled'),'info')">
            <span class="toggle-track"></span> Author rebuttal phase
          </label>
        </div>
      </div>
    </div>
    <button class="btn btn--primary" onclick="CF.saveSetup()">Save All Changes ✓</button>
  `;
};

// ── Assignments ──────────────────────────────────────────────────────────────
CF.tabs.assignments = function() {
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Paper Assignments</h1><p class="dash-sub">Assign reviewers to papers</p></div>
      <button class="btn btn--primary" onclick="CF.autoAssign()">🤖 Auto-Assign</button>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Paper</th><th>Track</th><th>AI Score</th><th>Reviewers</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${CF.state.papers.map(p=>`
            <tr>
              <td class="table-title" title="${p.title}">${p.title}</td>
              <td class="table-date">${p.track}</td>
              <td>${CF.aiScoreEl(p.aiScore)}</td>
              <td>
                <div style="display:flex;gap:3px;align-items:center">
                  ${['R1','R2','R3'].slice(0,p.reviewers).map(r=>`<div style="width:26px;height:26px;border-radius:50%;background:#6366f115;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#6366f1">${r}</div>`).join('')}
                  ${p.reviewers<3?`<div style="width:26px;height:26px;border-radius:50%;border:2px dashed var(--border2);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--t3);cursor:pointer" onclick="CF.toast('Reviewer assigned ✓','success')">+</div>`:''}
                </div>
              </td>
              <td><span class="status-badge status--${p.reviewers>=3?'accepted':'submitted'}">${p.reviewers>=3?'Fully assigned':'Needs reviewers'}</span></td>
              <td><button class="btn btn--ghost btn--sm" onclick="CF.toast('Reviewer assigned ✓','success')">+ Assign</button></td>
            </tr>
          `).join('')}</tbody>
        </table>
      </div>
    </div>
  `;
};

// ── Analytics ────────────────────────────────────────────────────────────────
CF.tabs.analytics = function() {
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Analytics</h1><p class="dash-sub">ICML 2025 submission statistics</p></div>
      <button class="btn btn--outline btn--sm" onclick="CF.toast('Report exported as CSV ✓','success')">↓ Export Report</button>
    </div>
    <div class="stat-grid">
      ${CF.statCard('◈', 142,    'Submissions',   'Total received',        '#6366f1')}
      ${CF.statCard('🌍', 47,    'Countries',     'Authors worldwide',     '#0ea5e9')}
      ${CF.statCard('%', '23.9%','Accept Rate',   'Industry avg 25%',      '#10b981')}
      ${CF.statCard('⚡', '4.2d','Avg Review',    '↓ 0.8d vs last year',   '#f59e0b')}
    </div>
    <div class="two-col">
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Submissions by Track</h3>
        ${[['Deep Learning',58],['NLP & Text',34],['Computer Vision',28],['RL & Planning',14],['Theory',8]].map(([t,n])=>`
          <div class="prog-row">
            <div class="prog-row__top"><span>${t}</span><span class="prog-row__val">${n}</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:${n/58*100}%;background:#6366f1"></div></div>
          </div>
        `).join('')}
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Top Countries</h3>
        ${[['🇺🇸 USA',38],['🇨🇳 China',29],['🇩🇪 Germany',18],['🇬🇧 UK',15],['🇯🇵 Japan',12],['🇮🇳 India',10]].map(([c,n])=>`
          <div class="prog-row">
            <div class="prog-row__top"><span>${c}</span><span class="prog-row__val">${n}</span></div>
            <div class="prog-bar"><div class="prog-fill" style="width:${n/38*100}%;background:#0ea5e9"></div></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Weekly Submissions</h3>
        <div style="display:flex;align-items:flex-end;gap:6px;height:80px;padding-top:8px">
          ${[12,18,24,19,31,28,10].map((v,i)=>`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <div style="font-size:10px;color:var(--t3)">${v}</div>
              <div style="width:100%;background:#6366f1;border-radius:3px 3px 0 0;height:${v/31*60}px;opacity:${0.4+i*.1}"></div>
              <div style="font-size:9px;color:var(--t3)">${['M','T','W','T','F','S','S'][i]}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:16px">Review Completion</h3>
        <div style="display:flex;align-items:center;justify-content:center;gap:24px;padding:12px 0">
          <div style="position:relative;width:80px;height:80px">
            <svg viewBox="0 0 36 36" style="width:80px;height:80px;transform:rotate(-90deg)">
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" stroke-width="3"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#6366f1" stroke-width="3" stroke-dasharray="${63} ${88-63}" stroke-linecap="round"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:16px;font-weight:800">63%</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px"><span style="color:#10b981;font-weight:700">89</span> <span style="color:var(--t2)">reviewed</span></div>
            <div style="font-size:13px"><span style="color:#f59e0b;font-weight:700">53</span> <span style="color:var(--t2)">pending</span></div>
            <div style="font-size:13px"><span style="color:var(--t3);font-weight:700">142</span> <span style="color:var(--t2)">total</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// ── Program Builder ──────────────────────────────────────────────────────────
CF.tabs.program = function() {
  const sessions = [
    { time:'09:00', title:'Opening Keynote: The Future of AI Research',       room:'Main Hall',       type:'keynote' },
    { time:'10:30', title:'Session A: Deep Learning Advances',                room:'Hall A',          type:'session' },
    { time:'10:30', title:'Session B: NLP & Language Models',                 room:'Hall B',          type:'session' },
    { time:'12:00', title:'Lunch Break',                                      room:'Cafeteria',       type:'break'   },
    { time:'13:30', title:'Poster Session I — All Tracks',                    room:'Exhibition Hall', type:'poster'  },
    { time:'15:00', title:'Session C: Computer Vision',                       room:'Hall A',          type:'session' },
    { time:'17:00', title:'Panel Discussion: Ethics in AI',                   room:'Main Hall',       type:'keynote' }
  ];
  const colors = { keynote:'#6366f1', session:'#0ea5e9', break:'#94a3b8', poster:'#10b981' };
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Program Builder</h1><p class="dash-sub">Day 1 · July 14, 2025</p></div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--primary" onclick="CF.toast('Program exported as PDF ✓','success')">Export PDF</button>
        <button class="btn btn--outline btn--sm" onclick="CF.toast('Published to conference website ✓','success')">Publish</button>
      </div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      ${sessions.map(s=>`
        <div class="program-row">
          <div class="program-row__time">${s.time}</div>
          <div class="program-row__accent" style="background:${colors[s.type]}"></div>
          <div class="program-row__info">
            <div class="program-row__title">${s.title}</div>
            <div class="program-row__room">📍 ${s.room}</div>
          </div>
          <span class="tag" style="background:${colors[s.type]}15;color:${colors[s.type]};border-color:${colors[s.type]}30;text-transform:uppercase;font-size:10px;letter-spacing:.5px">${s.type}</span>
          <button class="btn btn--ghost btn--xs" onclick="CF.toast('Session edited','info')">✎</button>
        </div>
      `).join('')}
      <div style="padding:16px 24px">
        <button class="btn btn--ghost btn--sm" style="width:100%" onclick="CF.toast('New session added ✓','success')">+ Add Session</button>
      </div>
    </div>
  `;
};

// ── Notifications ────────────────────────────────────────────────────────────
CF.tabs.notifications = function() {
  const ns = [
    { icon:'🎉', title:'Paper Accepted!',        msg:'Your paper "Attention Mechanisms..." was accepted to ICML 2025',    time:'2h ago',  type:'success' },
    { icon:'🔍', title:'Review Started',          msg:'"Federated Learning..." is now under review by 2 reviewers',        time:'1d ago',  type:'info'    },
    { icon:'⏰', title:'Deadline Reminder',       msg:'Camera-ready deadline in 7 days — ICML 2025',                       time:'2d ago',  type:'warning' },
    { icon:'📝', title:'Reviewer Comments',       msg:'New review comment on "Neural Architecture Search..."',             time:'3d ago',  type:'info'    },
    { icon:'📄', title:'New Conference Open',     msg:'ICML 2026 is now open for paper submissions',                       time:'1w ago',  type:'info'    }
  ];
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Notifications</h1><p class="dash-sub">${ns.length} notifications</p></div>
      <button class="btn btn--ghost btn--sm" onclick="CF.toast('All marked as read ✓','info')">Mark all read</button>
    </div>
    <div class="card" style="padding:0">
      ${ns.map(n=>`
        <div class="notif-row">
          <div class="notif-row__icon notif-row__icon--${n.type}">${n.icon}</div>
          <div class="notif-row__content">
            <div class="notif-row__title">${n.title}</div>
            <div class="notif-row__msg">${n.msg}</div>
          </div>
          <div class="notif-row__time">${n.time}</div>
        </div>
      `).join('')}
    </div>
  `;
};

// ── Camera Ready ─────────────────────────────────────────────────────────────
CF.tabs.camera = function() {
  const accepted = CF.state.papers.filter(p => p.status==='accepted' || p.status==='camera');
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Camera Ready</h1><p class="dash-sub">Upload final versions of accepted papers</p></div>
    </div>
    ${accepted.map(p=>`
      <div class="card" style="margin-bottom:18px">
        <div class="info-banner info-banner--success" style="margin-bottom:16px">
          🎉 <strong>"${p.title.slice(0,60)}..."</strong> has been accepted!
          ${p.status==='camera'?' · Camera-ready already submitted ✓':''}
        </div>
        <div class="form-group" style="margin-bottom:16px">
          <label class="form-label">Conference</label>
          <input class="form-input" type="text" value="${CF.state.conferences.find(c=>c.id===p.confId)?.abbr||'—'}" readonly style="opacity:.6">
        </div>
        <div class="form-group" style="margin-bottom:20px">
          <label class="form-label">Upload Final PDF ${p.status==='camera'?'(Resubmit)':' *'}</label>
          <div class="upload-zone" onclick="CF.toast('Connect Firebase Storage to enable uploads','info')">
            <div class="upload-zone__icon">${p.status==='camera'?'✅':'📤'}</div>
            <div class="upload-zone__text">${p.status==='camera'?'Submitted — click to re-upload':'Drop camera-ready PDF here or click to browse'}</div>
            <div class="upload-zone__hint">Formatted per ACM/IEEE camera-ready template · Max 50MB</div>
          </div>
        </div>
        <button class="btn btn--primary" onclick="CF.submitCameraReady(${p.id})">${p.status==='camera'?'Resubmit Camera-Ready':'Submit Camera-Ready'}</button>
      </div>
    `).join('')}
    ${!accepted.length?`<div class="card"><div class="empty-state"><div class="empty-icon">📬</div><h4>No accepted papers yet</h4><p>Camera-ready uploads will appear here once papers are accepted</p></div></div>`:''}
  `;
};

// ── Assigned Papers (Reviewer) ───────────────────────────────────────────────
CF.tabs.assigned = function() {
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Assigned Papers</h1><p class="dash-sub">${CF.state.reviews.length} papers to review</p></div>
    </div>
    ${CF.state.reviews.map(r=>`
      <div class="card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px;flex-wrap:wrap">
          <div>
            <div class="review-card__title" style="font-weight:700;font-size:15px;margin-bottom:4px">${r.paperTitle}</div>
            <div style="font-size:12px;color:var(--t2)">${r.track} · Due ${r.deadline}</div>
          </div>
          <span class="status-badge status--${r.status==='pending'?'submitted':'review'}">${r.status==='pending'?'Pending':'In Progress'}</span>
        </div>
        ${CF._aiPanel(r)}
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn--primary btn--sm" onclick="CF.switchTab('review-form')">Write Review →</button>
          <button class="btn btn--ghost btn--sm" onclick="CF.switchTab('discussion')">💬 Discussion</button>
        </div>
      </div>
    `).join('')}
  `;
};

// ── Discussion ───────────────────────────────────────────────────────────────
CF.tabs.discussion = function() {
  const msgs = [
    { a:'Prof. Johnson (Chair)',    msg:'Please pay special attention to novelty versus prior work in Section 3.',         t:'2h ago',  chair:true  },
    { a:'Dr. Smith (Reviewer 1)',   msg:'The baselines section is weak. Missing comparison with SOTA methods.',             t:'1h ago',  chair:false },
    { a:'Dr. García (Reviewer 2)',  msg:'Methodology is sound but evaluation metrics need stronger justification.',        t:'45m ago', chair:false }
  ];
  return `
    <div class="dash-header">
      <div><h1 class="dash-title">Discussion Panel</h1><p class="dash-sub">Confidential · Reviewers and chair only</p></div>
    </div>
    <div class="card">
      <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:20px">
        ${msgs.map(m=>`
          <div class="msg-row">
            <div class="msg-avatar" style="background:${m.chair?'#6366f1':'#0ea5e9'}15;color:${m.chair?'#6366f1':'#0ea5e9'}">${m.a[0]}</div>
            <div class="msg-bubble">
              <div class="msg-header"><span class="msg-author">${m.a}</span><span class="msg-time">${m.t}</span></div>
              <div class="msg-text">${m.msg}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="msg-input-row">
        <input type="text" class="form-input" id="msgInput" placeholder="Add to discussion..." style="flex:1" onkeydown="if(event.key==='Enter')CF.sendDiscussionMsg()">
        <button class="btn btn--primary" onclick="CF.sendDiscussionMsg()">Send →</button>
      </div>
    </div>
  `;
};

// ═══ HELPERS & ACTIONS ════════════════════════════════════════════════════════
CF._aiPanel = function(r, standalone = false) {
  return `
    <div class="ai-panel${standalone?' ai-panel--standalone':''}">
      <div class="ai-panel__header">
        <span class="ai-tag">🤖 AI Pre-Evaluation</span>
        <span style="font-size:12px;color:var(--t2)">Confidential · Not shown to authors</span>
      </div>
      <div class="ai-scores">
        ${[['Originality',r.aiOrig],['Quality',r.aiQual],['Relevance',r.aiRel]].map(([l,v])=>`
          <div class="ai-score-item">
            <div class="ai-score-num" style="color:${v>75?'var(--green)':v>60?'var(--amber)':'var(--red)'}">${v}</div>
            <div class="ai-score-lbl">${l}</div>
          </div>
        `).join('')}
      </div>
      <div class="ai-rec ai-rec--${r.aiRec}">${r.aiRec==='accept'?'✅ AI Recommends: Accept':'❌ AI Recommends: Reject'}</div>
    </div>
  `;
};

CF.statCard = function(icon, num, label, trend, color) {
  return `<div class="stat-card" style="--c:${color}">
    <div class="stat-card__accent"></div>
    <div class="stat-card__icon">${icon}</div>
    <div class="stat-card__num">${num}</div>
    <div class="stat-card__label">${label}</div>
    <div class="stat-card__trend">${trend}</div>
  </div>`;
};

CF.aiScoreEl = function(score) {
  if (score === null || score === undefined) {
    return `<span style="font-size:12px;color:var(--t3);font-family:'JetBrains Mono',monospace">Scoring...</span>`;
  }
  const c = score>=80?'var(--green)':score>=60?'var(--amber)':'var(--red)';
  return `<div class="ai-score-inline">
    <div class="ai-score-bar"><div style="width:${score}%;background:${c};height:100%;border-radius:2px"></div></div>
    <span style="font-size:12px;font-family:'JetBrains Mono',monospace;color:${c};font-weight:600">${score}</span>
  </div>`;
};

CF.statusLabel = function(s) {
  return { submitted:'Submitted', review:'In Review', accepted:'Accepted', rejected:'Rejected',
           camera:'Camera Ready', 'in-progress':'In Progress', pending:'Pending' }[s] || s;
};

CF.acceptPaper = function(id) {
  const p = CF.state.papers.find(p => p.id===id);
  if (p) {
    p.status = 'accepted';
    CF.toast('Paper accepted ✅ — Author notified', 'success');
    CF.renderTab(CF.state.dashTab);
    if (window.PaperService && window.firebaseReady) {
      // window.PaperService.updateStatus(p.firestoreId, 'accepted');
    }
  }
};

CF.rejectPaper = function(id) {
  const p = CF.state.papers.find(p => p.id===id);
  if (p) {
    p.status = 'rejected';
    CF.toast('Paper rejected — Author notified', 'info');
    CF.renderTab(CF.state.dashTab);
  }
};

CF.handlePaperSubmit = function(e) {
  e.preventDefault();
  const title    = document.getElementById('paperTitle')?.value;
  const confId   = parseInt(document.getElementById('paperConf')?.value) || 1;
  const track    = document.getElementById('paperTrack')?.value || 'General';
  const abstract = document.getElementById('paperAbstract')?.value || '';

  // Simulate AI scoring
  const aiScore = Math.round(55 + Math.random() * 40);

  CF.state.papers.unshift({
    id:         CF.state.papers.length + 1,
    title, confId, track, status: 'submitted',
    submitted:  'Today',
    aiScore,
    reviewers:  0,
    coAuthors:  document.getElementById('paperCoAuthors')?.value || ''
  });

  CF.toast('Paper submitted successfully! 🚀 AI scoring in progress...', 'success');
  setTimeout(() => CF.switchTab('papers'), 500);
};

CF.submitReview = function() {
  const summary = document.getElementById('reviewSummary')?.value || '';
  if (summary.length < 50) { CF.toast('Please write a more detailed review (min 50 chars)', 'error'); return; }
  CF.toast('Review submitted ✅ — Chair notified', 'success');
  CF.state.reviews[0].status = 'in-progress';
  setTimeout(() => CF.switchTab('assigned'), 400);
};

CF.submitCameraReady = function(id) {
  const p = CF.state.papers.find(p => p.id===id);
  if (p) {
    p.status = 'camera';
    CF.toast('Camera-ready version submitted ✅', 'success');
    CF.renderTab('camera');
  }
};

CF.saveDraft = function() {
  CF.toast('Draft saved ✓', 'info');
};

CF.saveSetup = function() {
  CF.toast('Conference settings saved ✓', 'success');
};

CF.autoAssign = function() {
  CF.state.papers.forEach(p => { if (p.reviewers < 3) p.reviewers = 3; });
  CF.toast('🤖 Auto-assigned papers via expertise matching ✓', 'success');
  CF.renderTab('assignments');
};

CF.bulkAccept = function() {
  const pending = CF.state.papers.filter(p => p.status==='review'||p.status==='submitted');
  if (!pending.length) { CF.toast('No pending papers to accept', 'info'); return; }
  pending.forEach(p => p.status='accepted');
  CF.toast(`${pending.length} papers bulk accepted ✅`, 'success');
  CF.renderTab('decisions');
};

CF.exportDecisions = function() {
  CF.toast('Decisions exported as CSV ✓', 'success');
};

CF.sendDiscussionMsg = function() {
  const inp = document.getElementById('msgInput');
  if (!inp || !inp.value.trim()) return;
  CF.toast('Message sent ✓', 'success');
  inp.value = '';
};

CF.pillTab = function(el) {
  document.querySelectorAll('.pill-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

CF.toggleMobileMenu = function() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
};

// File upload helpers
CF.dragOver = function(e) { e.preventDefault(); document.getElementById('uploadZone')?.classList.add('drag-over'); };
CF.dropFile = function(e) {
  e.preventDefault();
  document.getElementById('uploadZone')?.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) CF._handleFileSelect(file);
};
CF.fileSelected = function(input) {
  if (input.files[0]) CF._handleFileSelect(input.files[0]);
};
CF._handleFileSelect = function(file) {
  if (!file.name.endsWith('.pdf')) { CF.toast('Please upload a PDF file', 'error'); return; }
  if (file.size > 50 * 1024 * 1024) { CF.toast('File exceeds 50MB limit', 'error'); return; }
  document.getElementById('uploadText').textContent = `✅ ${file.name} (${(file.size/1024/1024).toFixed(1)}MB)`;
  CF.toast(`"${file.name}" ready for upload`, 'success');
};

// ═══ INIT ══════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  CF.navigate('home');

  // Animate hero counters
  document.querySelectorAll('[data-count]').forEach(el => {
    const target  = parseFloat(el.dataset.count);
    const suffix  = el.dataset.suffix || '';
    let startTime = null;
    const step    = ts => {
      if (!startTime) startTime = ts;
      const p      = Math.min((ts - startTime) / 1600, 1);
      const eased  = 1 - Math.pow(1 - p, 3);
      el.textContent = (Number.isInteger(target)
        ? Math.round(eased * target).toLocaleString()
        : (eased * target).toFixed(1)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 500);
  });
});
