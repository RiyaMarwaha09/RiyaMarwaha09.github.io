// =============== Responsive Nav Controller ===============
const MOBILE_BREAKPOINT_PX = 680;
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
const yearEl = document.getElementById('year');
const toTop = document.querySelector('.to-top');



// Year
if (yearEl) yearEl.textContent = new Date().getFullYear();

function isMobile() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`).matches;
}

function setNavForViewport() {
  if (!toggle || !links) return;

  if (isMobile()) {
    // Mobile: menu is hidden until hamburger is tapped
    if (!links.style.display) links.style.display = 'none';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.display = 'block';
  } else {
    // Desktop: always show menu, ignore inline mobile styles
    links.style.display = ''; // let CSS handle layout (flex)
    toggle.setAttribute('aria-expanded', 'false');
    toggle.style.display = 'none';
  }
}

// Initial state
setNavForViewport();

// Toggle only on mobile
toggle?.addEventListener('click', () => {
  if (!isMobile() || !links) return;
  const open = links.style.display === 'flex';
  links.style.display = open ? 'none' : 'flex';
  toggle.setAttribute('aria-expanded', (!open).toString());
});

// Close with Escape on mobile
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMobile() && links?.style.display === 'flex') {
    links.style.display = 'none';
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

// Recalculate on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(setNavForViewport, 150);
});

// =============== Reveal on Scroll ===============
const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// =============== Back-to-top ===============
window.addEventListener('scroll', () => {
  if (!toTop) return;
  if (window.scrollY > 600) toTop.classList.add('show');
  else toTop.classList.remove('show');
});
toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =============== Fake Contact Submit (demo) ===============
const form = document.querySelector('.contact__form');
const note = document.getElementById('formNote');
form?.addEventListener('submit', () => {
  const btn = document.getElementById('sendBtn');
  if (!btn || !note) return;
  btn.disabled = true;
  btn.textContent = 'Sending...';
  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = 'Send';
    note.textContent = 'Thanks! I’ll get back to you shortly.';
    form.reset();
    setTimeout(() => (note.textContent = ''), 4000);
  }, 900);
});

// =================================================== Skills Mind Map (vis-network) ========================================================


/* ============= Skills Mind Map (complete rewrite) ============= */
(function SkillsMindMap() {
  // Wait for vis-network to be ready
  const boot = () => {
    const canvas = document.getElementById('skillsGraph');
    if (!canvas) return;

    // ---- Pull palette from CSS (with safe fallbacks) ----
    const css     = getComputedStyle(document.documentElement);
    const INK     = (css.getPropertyValue('--ink')       || '#2E3A36').trim();
    const BRAND   = (css.getPropertyValue('--brand')     || '#D9A89C').trim();   // non-tech hub fill
    const BRAND2  = (css.getPropertyValue('--brand-2')   || '#8C6A5D').trim();   // hub/core border
    const ACCENT  = (css.getPropertyValue('--accent')    || '#E7C3A6').trim();   // tech hub fill
    const LEAF_BG = (css.getPropertyValue('--leaf-bg')   || '#EAF4EE').trim();   // soft green
    const LEAF_BR = (css.getPropertyValue('--leaf-border') || '#CFE1D7').trim();
    const LEAF_HI = (css.getPropertyValue('--leaf-hi')   || '#4A7C59').trim();

    // ---- Node styles ----
    const baseFont = { face: 'Inter', color: INK, size: 18, vadjust: 2 };

    const core = {
      shape: 'circle', size: 36, borderWidth: 2,
      color: { background: '#fff', border: BRAND2, highlight: { background: '#fff', border: BRAND2 } },
      font:  { ...baseFont, size: 20, bold: true }
    };

    const hub = (bg) => ({
      shape: 'ellipse', size: 30, borderWidth: 1.5,
      color: { background: bg, border: '#e8d6c7', highlight: { background: bg, border: BRAND2 } },
      font:  { ...baseFont, size: 18, bold: true }
    });

    // Default leaf = soft green for readability on white canvas
    const leaf = () => ({
      shape: 'box', margin: 5, borderWidth: 1.2, borderWidthSelected: 2, shadow: true,
      color: { background: LEAF_BG, border: LEAF_BR, highlight: { background: LEAF_BG, border: LEAF_HI } },
      font:  { ...baseFont, size: 16 }
    });

    // ---- Nodes (resume-based) ----
const nodes = new vis.DataSet([
  // core
  { id: 'skills', label: 'Skills', group: 'core', ...core },

  // hubs
  { id: 'technical', label: 'Technical', group: 'tech', ...hub(ACCENT) },
  { id: 'nontech',   label: 'Finance & Risk', group: 'non', ...hub(BRAND) },

  // technical groups
  { id: 'tg_tools',  label: 'Tools & Programming',    group: 'tech', ...hub(ACCENT) },
  { id: 'tg_bi',    label: 'BI & Automation',    group: 'tech', ...hub(ACCENT) },
  { id: 'tg_ml',    label: 'Analytical Methods',     group: 'tech', ...hub(ACCENT) },

  // Finance and risk categories
  { id: 'finance',  label: 'Financial Analysis',     group: 'non', ...hub(BRAND) },
  { id: 'risk',     label: 'Risk & Controls',        group: 'non', ...hub(BRAND) },
  { id: 'business', label: 'Business Communication', group: 'non', ...hub(BRAND) },

  // Tools
  { id: 'sql',      label: 'SQL',            group: 'tech', ...hub(BRAND) },
  { id: 'python',   label: 'Python',         group: 'tech', ...hub(BRAND) },
  { id: 'r',        label: 'R',              group: 'tech', ...hub(BRAND) },
  { id: 'excel',    label: 'Advanced Excel', group: 'tech', ...hub(BRAND) },
  { id: 'vba',      label: 'VBA',            group: 'tech', ...hub(BRAND) },

  // BI and automation
  { id: 'powerbi',    label: 'Power BI',              group: 'tech', ...hub(BRAND) },
  { id: 'tableau',    label: 'Tableau',               group: 'tech', ...hub(BRAND) },
  { id: 'dashboards', label: 'Dashboard Development', group: 'tech', ...hub(BRAND) },
  { id: 'automation', label: 'Reporting Automation',  group: 'tech', ...hub(BRAND) },
  { id: 'validation', label: 'Data Validation',       group: 'tech', ...hub(BRAND) },

  // Analytical methods
  { id: 'predictive',  label: 'Predictive Modeling',             group: 'tech', ...hub(BRAND) },
  { id: 'dcf',         label: 'DCF Valuation',                   group: 'tech', ...hub(BRAND) },
  { id: 'scenario',    label: 'Scenario & Sensitivity Analysis', group: 'tech', ...hub(BRAND) },
  { id: 'factors',     label: 'CAPM & Fama-French Models',       group: 'tech', ...hub(BRAND) },

  // Financial analysis
  { id: 'variance', label: 'Variance Analysis', group: 'financial', ...hub(BRAND) },
  { id: 'forecasting', label: 'Budgeting & Forecasting', group: 'financial', ...hub(BRAND) },
  { id: 'statements', label: 'Financial Statement Analysis', group: 'financial', ...hub(BRAND) },
  { id: 'reconciliation', label: 'Account Reconciliation', group: 'financial', ...hub(BRAND) },
  { id: 'portfolio', label: 'Portfolio Risk & Performance', group: 'financial', ...hub(BRAND) },

  // Risk and controls
  { id: 'operational', label: 'Operational Risk Management', group: 'financial', ...hub(BRAND) },
  { id: 'kri', label: 'KRI Monitoring', group: 'financial', ...hub(BRAND) },
  { id: 'rcsa', label: 'RCSA', group: 'financial', ...hub(BRAND) },
  { id: 'controls', label: 'Internal Controls Testing', group: 'financial', ...hub(BRAND) },
  { id: 'compliance', label: 'Regulatory Compliance', group: 'financial', ...hub(BRAND) },
  { id: 'register', label: 'Risk Register Management', group: 'financial', ...hub(BRAND) },

  // Business communication
  { id: 'stakeholders', label: 'Stakeholder Communication', group: 'non', ...hub(BRAND) },
  { id: 'storytelling', label: 'Data Storytelling', group: 'non', ...hub(BRAND) },
  { id: 'management', label: 'Management Reporting', group: 'non', ...hub(BRAND) },
  
  // non-technical groups (methods / domain)
  { id: 'ntg_course',   label: 'Coursework & Methods', group: 'non', ...hub(BRAND) },
  { id: 'ntg_comm',     label: 'Communication',        group: 'non', ...hub(BRAND) },
  { id: 'ntg_fore',     label: 'Forecasting',          group: 'non', ...hub(BRAND) },
  { id: 'ntg_ana',      label: 'Analytics & Strategy', group: 'non', ...hub(BRAND) },

  // non-technical leaves (methods / domain / soft skills)
  { id: 'c_bi',         label: 'Business Intelligence',          group: 'non', ...leaf() },
  { id: 'c_datamining', label: 'Data Mining',                   group: 'non', ...leaf() },
  { id: 'c_predict',    label: 'Predictive Analytics',           group: 'non', ...leaf() },
  { id: 'c_erm',        label: 'Enterprise Risk Mgmt',           group: 'non', ...leaf() },
  { id: 'c_reporting',  label: 'Reporting & Compliance',         group: 'non', ...leaf() },
  { id: 'c_risk',       label: 'Risk Analysis & Mitigation',     group: 'non', ...leaf() },
  { id: 'e_ab',         label: 'A/B Testing',                    group: 'non', ...leaf() },
  { id: 'e_kpi',        label: 'KPI Design',                     group: 'non', ...leaf() },
  { id: 'c_story',      label: 'Data Storytelling',              group: 'non', ...leaf() },
  { id: 'a_trend',      label: 'Trend & Variance Analysis',      group: 'non', ...leaf() },
  { id: 'a_validation', label: 'Data Validation',                group: 'non', ...leaf() },
  { id: 'a_stakeholder',label: 'Stakeholder Communication',      group: 'non', ...leaf() },
  { id: 'a_strategy',   label: 'Strategic Planning',             group: 'non', ...leaf() },
  { id: 'a_automation', label: 'Process Automation',             group: 'non', ...leaf() },
  { id: 'a_leadership', label: 'Team Leadership',                group: 'non', ...leaf() },
  { id: 'a_project',    label: 'Project Management',             group: 'non', ...leaf() }
]);

// ---- Edges ----
const connections = [
  // Main hubs
  ['skills', 'financial'],
  ['skills', 'technical'],
  ['skills', 'nontech'],

  // Technical categories
  ['technical', 'tg_tools'],
  ['technical', 'tg_bi'],
  ['technical', 'tg_ml'],

  // Finance and risk categories
  ['financial', 'finance'],
  ['financial', 'risk'],

  // Non-technical category
  ['nontech', 'business'],

  // Tools
  ['tg_tools', 'sql'],
  ['tg_tools', 'python'],
  ['tg_tools', 'r'],
  ['tg_tools', 'excel'],
  ['tg_tools', 'vba'],

  // BI and automation
  ['tg_bi', 'powerbi'],
  ['tg_bi', 'tableau'],
  ['tg_bi', 'dashboards'],
  ['tg_bi', 'automation'],
  ['tg_bi', 'validation'],

  // Analytical methods
  ['tg_ml', 'predictive'],
  ['tg_ml', 'dcf'],
  ['tg_ml', 'scenario'],
  ['tg_ml', 'factors'],

  // Financial analysis
  ['finance', 'variance'],
  ['finance', 'forecasting'],
  ['finance', 'statements'],
  ['finance', 'reconciliation'],
  ['finance', 'portfolio'],

  // Risk and controls
  ['risk', 'operational'],
  ['risk', 'kri'],
  ['risk', 'rcsa'],
  ['risk', 'controls'],
  ['risk', 'compliance'],
  ['risk', 'register'],

  // Business communication
  ['business', 'stakeholders'],
  ['business', 'storytelling'],
  ['business', 'management'],

  // Additional methods and non-technical categories
  ['nontech', 'ntg_course'],
  ['nontech', 'ntg_comm'],
  ['nontech', 'ntg_fore'],
  ['nontech', 'ntg_ana'],

  ['ntg_course', 'c_bi'],
  ['ntg_course', 'c_datamining'],
  ['ntg_course', 'c_predict'],
  ['ntg_course', 'c_erm'],
  ['ntg_course', 'c_reporting'],
  ['ntg_course', 'c_risk'],
  ['ntg_course', 'e_ab'],

  ['ntg_comm', 'c_story'],
  ['ntg_comm', 'a_stakeholder'],
  ['ntg_comm', 'a_leadership'],

  ['ntg_fore', 'a_trend'],

  ['ntg_ana', 'e_kpi'],
  ['ntg_ana', 'a_trend'],
  ['ntg_ana', 'a_validation'],
  ['ntg_ana', 'a_strategy'],
  ['ntg_ana', 'a_automation'],
  ['ntg_ana', 'a_project']
];

const edges = new vis.DataSet(
  connections.map(([from, to], index) => ({
    id: `edge_${index}`,
    from,
    to
  }))
);

    // ---- Network ----
    const net = new vis.Network(canvas, { nodes, edges }, {
      interaction: { hover: true, tooltipDelay: 120 },
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: { gravitationalConstant: -40, springConstant: 0.06, avoidOverlap: 1.0 },
        stabilization: { iterations: 20 }
      },
      edges: { color: { color: '#e0c9bd', highlight: BRAND2 }, width: 1.4, smooth: { type: 'continuous' } },
      layout: { improvedLayout: true }
    });

    // ---- Color management (restore on "All") ----
    const BASE_COLORS = new Map();
    nodes.forEach(n => BASE_COLORS.set(n.id, JSON.parse(JSON.stringify(n.color || {}))));

    const TINT_TECH = { background: '#FFF59D', border: '#FBC02D',
      highlight: { background: '#FFF59D', border: '#F57F17' } };
    const TINT_NON  = { background: '#FFCDD2', border: '#E57373',
      highlight: { background: '#FFCDD2', border: '#D32F2F' } };

    function setMode(mode) {
      const hideTech = (mode === 'nontech');
      const hideNon  = (mode === 'technical');

      // visibility
      nodes.forEach(n => {
        const isCore = n.group === 'core';
        const isTech = n.group === 'tech';
        const isNon  = n.group === 'non';
        const hidden = (hideTech && isTech) || (hideNon && isNon);
        nodes.update({ id: n.id, hidden: isCore ? false : hidden });
      });
      edges.forEach(e => {
        const a = nodes.get(e.from), b = nodes.get(e.to);
        edges.update({ id: e.id, hidden: (a.hidden || b.hidden) });
      });

      // palette
      if (mode === 'technical') {
        nodes.forEach(n => nodes.update({ id: n.id, color: (n.group === 'tech') ? TINT_TECH : BASE_COLORS.get(n.id) }));
      } else if (mode === 'nontech') {
        nodes.forEach(n => nodes.update({ id: n.id, color: (n.group === 'non') ? TINT_NON : BASE_COLORS.get(n.id) }));
      } else { // 'all' or 'fit'
        nodes.forEach(n => nodes.update({ id: n.id, hidden: false, color: BASE_COLORS.get(n.id) }));
        edges.forEach(e => edges.update({ id: e.id, hidden: false }));
      }

      // UI + camera
      const tb = document.querySelector('.graph-actions');
      const active = (mode === 'fit') ? 'all' : mode;
      tb?.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b.dataset.filter === active));

      net.fit({ animation: true, padding: (mode === 'all' || mode === 'fit') ? 90 : 110 });
    }

    // Toolbar
    document.querySelector('.graph-actions')?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (btn) setMode(btn.dataset.filter);
    });

    // Initial view: original palette + fit
    setTimeout(() => setMode('all'), 0);
    window.addEventListener('resize', () => net.fit({ animation: false, padding: 80 }));
  };

  if (window.vis) boot();
  else {
    const t = setInterval(() => { if (window.vis) { clearInterval(t); boot(); } }, 60);
  }

// ==== Load More Projects ====
(function () {
  const btn = document.querySelector('#loadMoreBtn');
  const cards = Array.from(document.querySelectorAll('#projects .proj-card'));
  const INITIAL_VISIBLE = 4; // first 4 visible
  let expanded = false;

  if (!btn) return;

  btn.addEventListener('click', function (e) {
    e.preventDefault();

    if (!expanded) {
      // reveal all hidden cards
      cards.slice(INITIAL_VISIBLE).forEach(card => {
        card.classList.remove('is-hidden');
        card.classList.add('revealed');
        setTimeout(() => card.classList.remove('revealed'), 320);
      });
      btn.textContent = 'Show Less';
      expanded = true;
    } else {
      // collapse back to first 4
      cards.slice(INITIAL_VISIBLE).forEach(card => card.classList.add('is-hidden'));
      btn.textContent = 'View All Projects';
      expanded = false;

      // scroll back up so user sees the grid start
      document.querySelector('#projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

})();


// =================================================== Projects Hidden Section ==================================================================================================

