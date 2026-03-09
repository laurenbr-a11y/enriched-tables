import { useState, useEffect } from 'react'
import './App.css'

// ── Steps ──────────────────────────────────────────────────
// 0: Home
// 1: Templates gallery
// 2: Blueprint detail
// 3: Backlog (empty, import dropdown)
// 4: Jira import modal
// 5: Enrichment confirm modal
// 6: Enrichment start (table + toast)
// 7: Enriched table (columns filled)

export default function App() {
  const [step, setStep] = useState(0)
  const next = () => setStep(s => s + 1)
  const goto = (n) => setStep(n)

  return (
    <div className="app">
      {step === 0 && <HomeScreen onNext={next} />}
      {step === 1 && <TemplatesScreen onNext={next} onBack={() => goto(0)} />}
      {step === 2 && <BlueprintDetail onNext={next} onBack={() => goto(1)} />}
      {step === 3 && <BacklogEmpty onNext={next} />}
      {step === 4 && <JiraImport onNext={next} onClose={() => goto(3)} />}
      {step === 5 && <EnrichConfirm onNext={next} onSkip={() => goto(6)} />}
      {step === 6 && <EnrichmentStart onNext={next} />}
      {step === 7 && <EnrichedTable onRestart={() => goto(0)} />}
    </div>
  )
}

// ── Shared chrome ───────────────────────────────────────────
function MiroTopbar({ title, showBoard }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <MiroLogo />
        {showBoard && <span className="topbar-board">{title || 'Product Roadmap'}</span>}
        {showBoard && <span className="badge-internal">Internal</span>}
      </div>
      <div className="topbar-right">
        <div className="avatar-stack">
          <div className="avatar av1">V</div>
        </div>
        <button className="btn-share">Share</button>
      </div>
    </div>
  )
}

function MiroLogo() {
  return (
    <div className="miro-logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#FFD02F"/>
        <path d="M19.5 7h-3l-4 6.5L10 7H7l4.5 7L7 21h3l2.5-4.5 2.5 4.5h3l-4.5-7L19.5 7z" fill="#050038"/>
      </svg>
    </div>
  )
}

function Sidebar({ active }) {
  const items = [
    { icon: '⊞', label: 'Overview' },
    { icon: '▤', label: 'Backlog', active: true },
    { icon: '↔', label: 'Roadmap' },
    { icon: '✦', label: 'AI Suggestions' },
    { icon: '💬', label: 'Ideas' },
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-project">
        <strong>Product Roadmap</strong>
        <span className="sidebar-meta">1 member</span>
      </div>
      <div className="sidebar-section-label">Roadmap Planning</div>
      {items.map(it => (
        <div key={it.label} className={`sidebar-item ${it.active ? 'active' : ''}`}>
          <span className="sidebar-icon">{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  )
}

// ── Overlay backdrop ────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  )
}

// ── SCREEN 0: Home ──────────────────────────────────────────
function HomeScreen({ onNext }) {
  const boards = [
    { icon: '💡', name: 'Insights: Onboarding Journey Map', mod: 'Today', space: 'Miro Insights…', owner: 'Holly Rankin', badge: 'Internal' },
    { icon: '✅', name: 'Miro Insights Playtests', mod: 'Jan 30', space: 'Miro Insights…', owner: 'Mor Sela', badge: 'Internal' },
    { icon: '💬', name: 'Insights-Driven Roadmapping Evolution', mod: 'Yesterday', space: '', owner: 'Lauren Brucato', badge: 'Internal' },
    { icon: '📊', name: 'Metrics Dashboard', mod: 'Jan 31', space: 'Roadmap Tracki…', owner: 'Holly Rankin', badge: 'Internal' },
  ]
  const templates = [
    { label: 'Product Roadmap', blueprint: true, clickable: true },
    { label: 'AI Playground', blueprint: false },
    { label: 'Project Workspace', blueprint: true },
    { label: 'UX Research Project', blueprint: true },
    { label: 'Crazy Eights', blueprint: false },
    { label: 'Research Insight Sy…', blueprint: true },
    { label: 'Prototype', blueprint: false },
  ]

  return (
    <div className="home-screen">
      <div className="home-sidebar">
        <MiroLogo />
        <nav className="home-nav">
          {['Home', 'Recent', 'Starred', 'Insights', 'Recordings'].map(n => (
            <div key={n} className={`home-nav-item ${n === 'Home' ? 'active' : ''}`}>{n}</div>
          ))}
        </nav>
        <div className="home-nav-section">Spaces</div>
        <div className="home-nav-item dim">Your Spaces</div>
      </div>
      <div className="home-main">
        <div className="home-hero">
          <h2>Ready to kick things off?</h2>
          <div className="home-search">Search or ask anything <span className="kbd">⌘+shift+E</span></div>
        </div>
        <div className="templates-row">
          <div className="templates-row-header">Templates for Design ▾</div>
          <div className="template-chips">
            <div className="template-chip new"><div className="template-thumb new-thumb">+</div><span>Blank board</span></div>
            {templates.map(t => (
              <div key={t.label} className="template-chip" onClick={t.clickable ? onNext : undefined} style={t.clickable ? { cursor: 'pointer' } : {}}>
                <div className="template-thumb">
                  {t.blueprint && <div className="blueprint-badge">Blueprint</div>}
                  <div className="thumb-grid">
                    {[...Array(6)].map((_, i) => <div key={i} className="thumb-cell" />)}
                  </div>
                </div>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="boards-section">
          <div className="boards-header">
            <span>Boards in this team</span>
            <div className="boards-actions">
              <button className="btn-outline">Explore templates</button>
              <button className="btn-primary" onClick={onNext}>+ Create new</button>
            </div>
          </div>
          <table className="boards-table">
            <thead>
              <tr><th>Name</th><th>Online users</th><th>Space</th><th>Classification</th><th>Last opened</th><th>Owner</th></tr>
            </thead>
            <tbody>
              {boards.map(b => (
                <tr key={b.name}>
                  <td><span className="board-icon">{b.icon}</span>{b.name}</td>
                  <td><div className="avatar av1" style={{width:24,height:24,fontSize:11}}>A</div></td>
                  <td>{b.space}</td>
                  <td>{b.badge && <span className="badge-internal">{b.badge}</span>}</td>
                  <td>Today</td>
                  <td>{b.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 1: Templates gallery ─────────────────────────────
function TemplatesScreen({ onNext, onBack }) {
  const categories = ['All templates', 'AI Accelerated', 'Miro Templates', 'Miroverse', 'Building Blocks']
  const useCases = ['Meetings & Workshops', 'Ideation & Brainstorming', 'Research & Design', 'Agile Workflows', 'Strategy & Planning', 'Diagramming & Mapping', 'Presentations & Slides']
  const custom = ['Personal', 'Shared']

  const featured = [
    { name: 'Product Roadmap', cols: 3, color: '#e8eaff' },
    { name: 'OKR planning', cols: 3, color: '#f0e8ff' },
    { name: 'Sprint cycle', cols: 3, color: '#e8f4ff' },
    { name: 'Design Sprint', cols: 3, color: '#fff0e8' },
    { name: 'Brainstorming session', cols: 3, color: '#e8ffe8' },
    { name: 'PI planning', cols: 3, color: '#ffe8f0' },
  ]

  return (
    <div className="fullpage-screen">
      <div className="fullpage-topbar">
        <MiroLogo />
        <button className="modal-close" onClick={onBack}>✕</button>
      </div>
      <div className="templates-layout">
        <div className="templates-sidebar">
          {categories.map(c => (
            <div key={c} className={`tcat ${c === 'Miro Templates' ? 'active' : ''}`}>{c}</div>
          ))}
          <div className="tcat-section">BY USE CASE</div>
          {useCases.map(c => <div key={c} className="tcat">{c}</div>)}
          <div className="tcat-section">CUSTOM TEMPLATES</div>
          {custom.map(c => <div key={c} className="tcat">{c}</div>)}
        </div>
        <div className="templates-content">
          <div className="templates-content-header">
            <div>
              <h3 className="templates-title">Miro Templates</h3>
              <p className="templates-sub">Ensure consistency with using templates created especially for your company.</p>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Show when creating a board
            </label>
          </div>
          <div className="templates-grid">
            {featured.map(t => (
              <div key={t.name} className="template-card" onClick={t.name === 'Product Roadmap' ? onNext : undefined}>
                <div className="template-preview" style={{ background: t.color }}>
                  <span className="blueprint-tag">Blueprint</span>
                  <div className="template-preview-grid">
                    {[...Array(9)].map((_, i) => <div key={i} className="preview-cell" />)}
                  </div>
                </div>
                <div className="template-card-footer">
                  <div className="miro-m">M</div>
                  <div>
                    <div className="template-provider">Miro</div>
                    <div className="template-name">{t.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 2: Blueprint detail ──────────────────────────────
function BlueprintDetail({ onNext, onBack }) {
  const boards = ['How it works', 'Backlog', 'Roadmap', 'AI Suggestions', 'Ideas']
  const icons = ['ℹ', '▤', '↔', '✦', '💬']
  return (
    <div className="fullpage-screen">
      <div className="fullpage-topbar">
        <button className="btn-text" onClick={onBack}>← Back to Templates</button>
        <button className="btn-text">🔗 Copy link to share</button>
        <button className="modal-close" onClick={onBack}>✕</button>
      </div>
      <div className="blueprint-page-body">
        <div className="blueprint-body">
          <div className="blueprint-left">
            <h2 className="blueprint-title">Product Roadmap</h2>
            <p className="blueprint-meta">This Blueprint creates a Space with 5 boards:</p>
            <div className="blueprint-boards">
              <div className="blueprint-section-label">Overview</div>
              <div className="blueprint-board active"><span>ℹ</span> How it works</div>
              <div className="blueprint-section-label">Planning and Prioritization</div>
              {boards.slice(1).map((b, i) => (
                <div key={b} className="blueprint-board"><span>{icons[i + 1]}</span> {b}</div>
              ))}
            </div>
            <button className="btn-use-blueprint" onClick={onNext}>Use Blueprint</button>
          </div>
          <div className="blueprint-right">
            <div className="blueprint-preview-area">
              <div className="bp-preview-grid">
                {[...Array(12)].map((_, i) => <div key={i} className="bp-cell" />)}
              </div>
            </div>
            <div className="blueprint-preview-footer">
              <div className="miro-m">M</div>
              <div>
                <strong>Project Kickoff</strong>
                <div className="dim-text">Modified 9 days ago</div>
              </div>
              <button className="btn-expand">⤢</button>
            </div>
          </div>
        </div>
        <div className="blueprint-about">
          <h3>About this template</h3>
          <p>This template provides everything you need to guide your team through every stage of a product launch, from ideation to execution. With six dedicated boards, you can kick off new projects, map customer journeys, and more.</p>
          <div className="blueprint-author">
            <div className="miro-m large">M</div>
            <div>
              <strong>Miro</strong><br />
              <span className="dim-text">The Visual Workspace for Innovation</span><br />
              <span className="dim-text small">Miro empowers 80M users to shape the future by providing a place where they can…</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 3: Backlog (empty table, import dropdown) ─────────
function BacklogEmpty({ onNext }) {
  const [showImportMenu, setShowImportMenu] = useState(false)
  const cols = ['Title', 'Description', 'Status', 'Priority', 'Assignee']
  const rows = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body">
        <Sidebar />
        <div className="board-content">
          <div className="board-toolbar">
            <span className="toolbar-icon">↺</span>
            <span className="toolbar-icon">▤</span>
            <span className="toolbar-icon">▽</span>
            <span className="toolbar-icon">↕</span>
            <span className="toolbar-icon">⊞</span>
            <span className="toolbar-icon" style={{ position: 'relative' }} onClick={() => setShowImportMenu(v => !v)}>
              🔗
              {showImportMenu && (
                <div className="import-dropdown">
                  {[
                    { name: 'Jira', color: '#0052CC' },
                    { name: 'Azure', color: '#0078D4' },
                    { name: 'Asana', color: '#F06A6A' },
                    { name: 'Trello', color: '#0052CC' },
                    { name: 'Upload .CSV', color: '#555' },
                  ].map(item => (
                    <div key={item.name} className="import-option" onClick={onNext}>
                      <span className="import-dot" style={{ background: item.color }} />
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </span>
          </div>
          <div className="backlog-table-wrap">
            <table className="backlog-table">
              <thead>
                <tr>
                  <th className="row-num">#</th>
                  {cols.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r}>
                    <td className="row-num">{r}</td>
                    {cols.map(c => <td key={c} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 4: Jira import modal ──────────────────────────────
const jiraItems = [
  { type: 'epic',  icon: '⚡', summary: 'This is the name of an Epic in Jira',     key: 'EPC-1234', priority: 'High', status: 'Backlog', expand: true },
  { type: 'story', icon: '🔖', summary: 'Independent story with subtasks',          key: 'EPC-1234', priority: 'High', status: 'Backlog', expand: true },
  { type: 'story', icon: '🔖', summary: 'This is a story without a subtask',        key: 'EPC-1234', priority: 'High', status: 'Backlog' },
  { type: 'story', icon: '🔖', summary: 'This is the name of a Story in Jira',      key: 'EPC-1234', priority: 'High', status: 'Backlog', expand: true },
  { type: 'task',  icon: '✅', summary: 'Independent Task',                          key: 'TSK-1234', priority: 'High', status: 'Backlog' },
  { type: 'bug',   icon: '🐛', summary: 'This is a bug',                             key: 'BUG-1234', priority: 'High', status: 'Backlog' },
  { type: 'other', icon: '○',  summary: 'This is a different parent task type',     key: 'DES-1234', priority: 'High', status: 'Backlog', expand: true },
]

function JiraImport({ onNext, onClose }) {
  const [selected, setSelected] = useState(new Set())
  const [showViewMenu, setShowViewMenu] = useState(false)
  const [importAs, setImportAs] = useState('Table')

  const toggleAll = () => {
    if (selected.size === jiraItems.length) setSelected(new Set())
    else setSelected(new Set(jiraItems.map((_, i) => i)))
  }

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body">
        <Sidebar />
        <div className="board-content" style={{ filter: 'blur(1px)', pointerEvents: 'none' }} />
      </div>
      <Overlay onClose={onClose}>
        <div className="modal jira-modal">
          <div className="modal-titlebar">
            <h2>Import from Jira</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="jira-toolbar">
            <span className="jira-url">https://miro.atlassian.net</span>
            <div className="jira-actions">
              <button className="btn-outline-sm">Create issue</button>
              <button className="btn-outline-sm">Show imported</button>
              <button className="btn-outline-sm">Configure cards</button>
              <button className="btn-outline-sm">Settings</button>
            </div>
          </div>
          <div className="jira-search-row">
            <div className="jira-search">🔍 Basic search</div>
            <label className="toggle-label">
              <div className="toggle on" /> Advanced search
            </label>
          </div>
          <table className="jira-table">
            <thead>
              <tr>
                <th><input type="checkbox" onChange={toggleAll} checked={selected.size === jiraItems.length} /></th>
                <th>Summary</th><th>Key</th><th>Type</th><th>Assignee</th><th>Priority</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jiraItems.map((item, i) => (
                <tr key={i} className={selected.has(i) ? 'selected' : ''}>
                  <td><input type="checkbox" checked={selected.has(i)} onChange={() => {
                    const s = new Set(selected)
                    s.has(i) ? s.delete(i) : s.add(i)
                    setSelected(s)
                  }} /></td>
                  <td>
                    {item.expand && <span className="expand-icon">›</span>}
                    {item.summary}
                  </td>
                  <td>{item.key}</td>
                  <td><span className="type-icon">{item.icon}</span></td>
                  <td><span className="avatar av-sm">JD</span></td>
                  <td>{item.priority}</td>
                  <td><span className="status-badge">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="jira-footer">
            <button className="btn-primary" onClick={onNext}>Import</button>
            <div className="import-as-row">
              <span>Import as</span>
              <div className="import-as-select" onClick={() => setShowViewMenu(v => !v)}>
                <span className="import-as-icon">▤</span> {importAs} ▾
                {showViewMenu && (
                  <div className="view-menu">
                    {['Card', 'Table', 'Timeline', 'Kanban'].map(v => (
                      <div key={v} className={`view-option ${v === importAs ? 'active' : ''}`}
                        onClick={() => { setImportAs(v); setShowViewMenu(false) }}>
                        {v} {v === importAs && '✓'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

// ── SCREEN 5: Enrichment confirmation ───────────────────────
function EnrichConfirm({ onNext, onSkip }) {
  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body" style={{ filter: 'blur(2px)', pointerEvents: 'none' }}>
        <Sidebar />
      </div>
      <Overlay onClose={() => {}}>
        <div className="modal enrich-confirm-modal">
          <div className="enrich-icon-row">
            <div className="enrich-spark-icon">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#EEF0FF"/>
                <path d="M18 8l2.5 7h7.5l-6 4.5 2.5 7-6.5-4.5L11.5 26.5l2.5-7L8 15h7.5L18 8z" fill="#4262FF"/>
              </svg>
            </div>
          </div>
          <h2 className="enrich-title">Enrich your backlog with Miro Insights</h2>
          <p className="enrich-desc">
            Your imported Jira items will automatically be enriched with customer intelligence from Miro Insights — including customer mentions, estimated revenue impact, and company coverage.
          </p>
          <div className="enrich-columns-preview">
            {[
              { icon: '#', label: 'Mentions', desc: 'Customer references' },
              { icon: '#', label: 'Customers', desc: 'Accounts impacted' },
              { icon: '#', label: 'Est. Revenue', desc: 'ARR at stake' },
              { icon: '≡', label: 'Companies', desc: 'Company names' },
            ].map(col => (
              <div key={col.label} className="enrich-col-chip">
                <span className="enrich-col-icon">{col.icon}</span>
                <div>
                  <div className="enrich-col-label">{col.label}</div>
                  <div className="enrich-col-desc">{col.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="enrich-refresh-note">
            <span className="refresh-icon">↻</span>
            <span>Data refreshes automatically as new insights flow in — no manual updates needed.</span>
          </div>
          <div className="enrich-actions">
            <button className="btn-outline" onClick={onSkip}>Skip for now</button>
            <button className="btn-primary enrich-cta" onClick={onNext}>Enable enrichment</button>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

// ── SCREEN 6: Enrichment start (table + generating toast) ────
function EnrichmentStart({ onNext }) {
  const [toastVisible, setToastVisible] = useState(true)
  const [panelRow, setPanelRow] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setToastVisible(false)
      setTimeout(onNext, 400)
    }, 2800)
    return () => clearTimeout(t)
  }, [onNext])

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body">
        <Sidebar />
        <div className="board-content">
          <div className="board-toolbar">
            <span className="toolbar-icon">↺</span><span className="toolbar-icon">▤</span>
            <span className="toolbar-icon">▽</span><span className="toolbar-icon">↕</span>
            <span className="toolbar-icon">⊞</span><span className="toolbar-icon">🔗</span>
          </div>
          <div className="table-panel-layout">
            <EnrichedTableView enriching onOpenPanel={setPanelRow} panelRow={panelRow} />
            {panelRow !== null && <SidePanel row={tableRows[panelRow]} onClose={() => setPanelRow(null)} />}
          </div>
          {toastVisible && (
            <div className="generating-toast">
              <button className="toast-close" onClick={() => setToastVisible(false)}>✕</button>
              <div className="toast-title">
                <div className="spinner" />
                Generating insights
              </div>
              <div className="toast-sub">Our AI surfaces key insights typically within 30–60 seconds.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── SCREEN 7: Enriched table ─────────────────────────────────
function EnrichedTable({ onRestart }) {
  const [panelRow, setPanelRow] = useState(null)

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body">
        <Sidebar />
        <div className="board-content">
          <div className="board-toolbar">
            <span className="toolbar-icon">↺</span><span className="toolbar-icon">▤</span>
            <span className="toolbar-icon">▽</span><span className="toolbar-icon">↕</span>
            <span className="toolbar-icon">⊞</span><span className="toolbar-icon">🔗</span>
          </div>
          <div className="table-panel-layout">
            <EnrichedTableView enriching={false} onOpenPanel={setPanelRow} panelRow={panelRow} />
            {panelRow !== null && <SidePanel row={tableRows[panelRow]} onClose={() => setPanelRow(null)} />}
          </div>
          <div className="restart-hint" onClick={onRestart}>↩ Restart prototype</div>
        </div>
      </div>
    </div>
  )
}

// ── Shared enriched table view ───────────────────────────────
const tableRows = [
  {
    summary: 'Log in to the application, I need a user-…',
    fullTitle: 'Design the user interface for the login page.',
    status: 'To do', priority: 'High', assignee: 'Emily Joh…', assigner: 'Brent Tay…',
    mentions: 47, customers: 31, revenue: '$2.1M', companies: 'Stripe, Figma, +12',
    panelMentions: 135, panelCustomers: 10, panelRevenue: '$325K',
    panelCompanies: ['Apple', 'Google', 'Notion', '+2'],
    panelSummary: 'Customers want a faster, more modern mobile experience — especially a simpler checkout. Improving this flow is strongly supported across segments and could boost mobile conversion and reduce churn.',
    feedback: [
      { type: 'Problem', stars: 2, quote: '"The app technically works, but every tap feels like it\'s thinking hard before responding."', author: 'John Butter', date: '1 month ago' },
      { type: 'Problem', stars: 1, quote: '"Login takes 8+ seconds on mobile. We\'ve had users abandon signup entirely."', author: 'Sarah Kim', date: '3 weeks ago' },
      { type: 'Request', stars: 4, quote: '"Would love SSO support — our team logs in 10+ times a day and it\'s painful."', author: 'Marcus Lee', date: '2 weeks ago' },
    ],
  },
  {
    summary: 'Registering for an account, I need clear wir…',
    fullTitle: 'Create wireframes for the registration process.',
    status: 'To do', priority: 'High', assignee: 'Sophia W…', assigner: 'Brent Tay…',
    mentions: 38, customers: 24, revenue: '$1.8M', companies: 'Notion, Slack, +9',
    panelMentions: 98, panelCustomers: 14, panelRevenue: '$210K',
    panelCompanies: ['Figma', 'Linear', 'Vercel', '+3'],
    panelSummary: 'Registration friction is causing significant drop-off for enterprise accounts. Users report confusion at the team invite step and struggle with email verification delays.',
    feedback: [
      { type: 'Problem', stars: 2, quote: '"We lost 3 teammates during onboarding because the invite email never arrived."', author: 'Priya Patel', date: '2 months ago' },
      { type: 'Request', stars: 3, quote: '"Please add Google/GitHub OAuth. Manual registration feels outdated."', author: 'Dan Rowe', date: '5 weeks ago' },
    ],
  },
  {
    summary: 'Reset password, I need a user flow diagra…',
    fullTitle: 'Develop a user flow diagram for account recovery.',
    status: 'To do', priority: 'High', assignee: 'Olivia Br…', assigner: 'Brent Tay…',
    mentions: 29, customers: 18, revenue: '$980K', companies: 'Linear, Vercel, +7',
    panelMentions: 72, panelCustomers: 8, panelRevenue: '$180K',
    panelCompanies: ['Stripe', 'Intercom', '+4'],
    panelSummary: 'Password reset is a consistent pain point. Users report the reset link expiring too quickly and confusion about which email address is associated with their account.',
    feedback: [
      { type: 'Problem', stars: 1, quote: '"Reset link expired before I could use it. Had to request 4 times."', author: 'Tara Singh', date: '1 month ago' },
      { type: 'Problem', stars: 2, quote: '"No indication of which email the link was sent to. Very confusing."', author: 'Leo Chen', date: '3 weeks ago' },
    ],
  },
  {
    summary: 'Developing features for authentication, I n…',
    fullTitle: 'Write user stories for the authentication feature.',
    status: 'To do', priority: 'High', assignee: 'Ava Davis', assigner: 'Brent Tay…',
    mentions: 22, customers: 15, revenue: '$740K', companies: 'Loom, Canva, +5',
    panelMentions: 55, panelCustomers: 7, panelRevenue: '$140K',
    panelCompanies: ['Loom', 'Canva', '+3'],
    panelSummary: 'Enterprise customers are pushing for MFA and SAML SSO. Several deals are stalled pending these auth capabilities, particularly in the financial services segment.',
    feedback: [
      { type: 'Request', stars: 4, quote: '"We need SAML SSO before we can roll this out company-wide. It\'s a blocker."', author: 'James O\'Brien', date: '6 weeks ago' },
      { type: 'Problem', stars: 2, quote: '"Session timeouts are too aggressive — users are getting logged out mid-work."', author: 'Nadia Kowalski', date: '1 month ago' },
    ],
  },
  {
    summary: 'Authentication methods, I need to co…',
    fullTitle: 'Conduct a competitive analysis of authentication methods.',
    status: 'To do', priority: 'High', assignee: 'Ryan Eldr…', assigner: 'Brent Tay…',
    mentions: 18, customers: 11, revenue: '$620K', companies: 'Miro, Asana, +4',
    panelMentions: 44, panelCustomers: 6, panelRevenue: '$115K',
    panelCompanies: ['Asana', 'Monday', '+2'],
    panelSummary: 'Customers frequently compare auth options to competitors. Passkeys and biometric login are emerging requests, especially from mobile-first teams.',
    feedback: [
      { type: 'Request', stars: 5, quote: '"Competitors offer Face ID login. Would love to see that here too."', author: 'Anna Flores', date: '2 weeks ago' },
    ],
  },
  {
    summary: 'Discuss security, I want to set up a me…',
    fullTitle: 'Set up a meeting to discuss security protocols.',
    status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Chance C…',
    mentions: 14, customers: 9, revenue: '$410K', companies: 'Jira, GitHub, +3',
    panelMentions: 32, panelCustomers: 5, panelRevenue: '$90K',
    panelCompanies: ['GitHub', 'GitLab', '+1'],
    panelSummary: 'Security audit requirements are driving requests for detailed logs, IP allowlisting, and admin controls. Enterprise IT teams want more visibility into user activity.',
    feedback: [
      { type: 'Problem', stars: 2, quote: '"We can\'t pass our SOC2 audit without audit logs. This is urgent for us."', author: 'Chris Walton', date: '3 months ago' },
    ],
  },
  {
    summary: 'For user testing, I need to draft a plan…',
    fullTitle: 'Draft a plan for user testing the authentication process.',
    status: 'To do', priority: 'Medium', assignee: 'Sophia W…', assigner: 'Chance C…',
    mentions: 11, customers: 7, revenue: '$290K', companies: 'Trello, Basecamp',
    panelMentions: 28, panelCustomers: 4, panelRevenue: '$75K',
    panelCompanies: ['Trello', 'Basecamp'],
    panelSummary: 'Usability testing reveals users struggle with the authentication flow on first use. Clear progress indicators and inline error messages would significantly reduce support tickets.',
    feedback: [
      { type: 'Problem', stars: 3, quote: '"First-time login was confusing — no indication of what step I was on."', author: 'Maya Johansson', date: '2 months ago' },
    ],
  },
  {
    summary: 'Passwords, I want to research best pr…',
    fullTitle: 'Research best practices for password management.',
    status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Chance C…',
    mentions: 9, customers: 6, revenue: '$220K', companies: 'Dropbox, +2',
    panelMentions: 22, panelCustomers: 4, panelRevenue: '$60K',
    panelCompanies: ['Dropbox', '1Password', '+1'],
    panelSummary: 'Password complexity rules are frustrating users. Many request a password strength meter and support for password manager autofill, which currently breaks in some browsers.',
    feedback: [
      { type: 'Problem', stars: 2, quote: '"Your password rules rejected my password manager\'s generated password. Absurd."', author: 'Ben Carter', date: '5 weeks ago' },
    ],
  },
  {
    summary: 'APIs, I need to create a checklist so…',
    fullTitle: 'Create a checklist for API documentation.',
    status: 'To do', priority: 'Medium', assignee: 'Ava Davis', assigner: 'Chance C…',
    mentions: 8, customers: 5, revenue: '$190K', companies: 'Zapier, +1',
    panelMentions: 19, panelCustomers: 3, panelRevenue: '$50K',
    panelCompanies: ['Zapier', 'Make'],
    panelSummary: 'API key management is lacking — developers want scoped tokens, rotation policies, and usage dashboards. Several integration partners have flagged this as a blocker.',
    feedback: [
      { type: 'Request', stars: 4, quote: '"We need scoped API keys before we can recommend this to our clients."', author: 'Sophie Turner', date: '1 month ago' },
    ],
  },
  {
    summary: 'Security features, I need to outline…',
    fullTitle: 'Outline the requirements for multi-factor authentication.',
    status: 'To do', priority: 'Medium', assignee: 'Ryan Eldr…', assigner: 'Chance C…',
    mentions: 6, customers: 4, revenue: '$130K', companies: 'Postman',
    panelMentions: 15, panelCustomers: 3, panelRevenue: '$40K',
    panelCompanies: ['Postman', 'Insomnia'],
    panelSummary: 'MFA adoption is low because the current TOTP setup is cumbersome. Users want push notification MFA and backup codes that are easier to manage.',
    feedback: [
      { type: 'Problem', stars: 2, quote: '"Lost access to my account when my phone broke — backup codes weren\'t clear."', author: 'Tom Nakamura', date: '2 months ago' },
    ],
  },
  {
    summary: 'The user dashboard, I need to develop…',
    fullTitle: 'Develop a prototype for the user dashboard.',
    status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Chance C…',
    mentions: 5, customers: 3, revenue: '$95K', companies: 'Retool',
    panelMentions: 12, panelCustomers: 2, panelRevenue: '$30K',
    panelCompanies: ['Retool'],
    panelSummary: 'The user dashboard lacks the quick-access shortcuts and activity feed that power users rely on. Customers request a customizable home screen with pinned items.',
    feedback: [
      { type: 'Request', stars: 4, quote: '"I want to pin my most-used views to the top. Navigation takes too many clicks."', author: 'Isla Brooks', date: '3 weeks ago' },
    ],
  },
  {
    summary: 'Support staff, I need to create a guide on…',
    fullTitle: 'Compile feedback from stakeholders on the authentication experience.',
    status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Chance C…',
    mentions: 4, customers: 3, revenue: '$80K', companies: 'Intercom',
    panelMentions: 10, panelCustomers: 2, panelRevenue: '$25K',
    panelCompanies: ['Intercom'],
    panelSummary: 'Support volume around authentication has increased 40% QoQ. Most tickets relate to locked accounts and session management confusion. A self-service unlock flow would reduce load.',
    feedback: [
      { type: 'Problem', stars: 1, quote: '"Got locked out with no way to recover without contacting support. Took 2 days."', author: 'Carlos Vega', date: '6 weeks ago' },
    ],
  },
]

// ── Row context menu ─────────────────────────────────────────
function RowMenu({ rowIndex, onOpenPanel, onClose }) {
  return (
    <div className="row-ctx-menu" onMouseLeave={onClose}>
      <div className="row-ctx-item" onClick={() => { onOpenPanel(rowIndex); onClose() }}>
        <span className="row-ctx-icon">⊟</span> Open side panel
      </div>
      <div className="row-ctx-item">
        <span className="row-ctx-icon">✎</span> Edit
      </div>
      <div className="row-ctx-item">
        <span className="row-ctx-icon">⊕</span> Insert row above
      </div>
      <div className="row-ctx-item">
        <span className="row-ctx-icon">⊕</span> Insert row below
      </div>
    </div>
  )
}

// ── Side panel ───────────────────────────────────────────────
function SidePanel({ row, onClose }) {
  const [tab, setTab] = useState('Insights')
  const [feedbackFilter, setFeedbackFilter] = useState('All')

  return (
    <div className="side-panel">
      <div className="sp-header">
        <span className="sp-title" title={row.fullTitle}>{row.fullTitle}</span>
        <div className="sp-header-actions">
          <button className="sp-icon-btn">⤢</button>
          <button className="sp-icon-btn">🔗</button>
          <button className="sp-icon-btn" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="sp-tabs">
        {['Details', 'Comments', 'Insights'].map(t => (
          <button key={t} className={`sp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="sp-body">
        {tab === 'Details' && (
          <div className="sp-placeholder">
            <div className="sp-field"><span className="sp-field-label">Status</span><span className="status-tag">To do</span></div>
            <div className="sp-field"><span className="sp-field-label">Priority</span><span className="priority-badge p-high">High</span></div>
            <div className="sp-field"><span className="sp-field-label">Assignee</span><span>{row.assignee}</span></div>
            <div className="sp-field"><span className="sp-field-label">Description</span><span className="sp-desc-text">No description added yet.</span></div>
          </div>
        )}
        {tab === 'Comments' && (
          <div className="sp-placeholder sp-empty">
            <div className="sp-empty-icon">💬</div>
            <div>No comments yet</div>
          </div>
        )}
        {tab === 'Insights' && (
          <div className="sp-insights">
            <div className="sp-section">
              <div className="sp-section-title">Summary</div>
              <p className="sp-summary-text">{row.panelSummary}</p>
            </div>
            <div className="sp-section">
              <div className="sp-section-title">Impact estimates</div>
              <div className="sp-impact-grid">
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{row.panelMentions}</div>
                  <div className="sp-impact-label">Total Mentions</div>
                </div>
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{row.panelCustomers}</div>
                  <div className="sp-impact-label">Unique Customers</div>
                </div>
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{row.panelRevenue}</div>
                  <div className="sp-impact-label">Est. Revenue Impact</div>
                </div>
              </div>
            </div>
            <div className="sp-section">
              <div className="sp-section-title">Top impacted customers</div>
              <div className="sp-customer-chips">
                {row.panelCompanies.map(c => (
                  <span key={c} className="sp-company-chip">{c}</span>
                ))}
              </div>
            </div>
            <div className="sp-section sp-feedback-section">
              <div className="sp-feedback-header">
                <div className="sp-section-title">Feedback</div>
                <select className="sp-filter-select" value={feedbackFilter} onChange={e => setFeedbackFilter(e.target.value)}>
                  <option>All</option>
                  <option>Problem</option>
                  <option>Request</option>
                </select>
              </div>
              <div className="sp-feedback-list">
                {row.feedback
                  .filter(f => feedbackFilter === 'All' || f.type === feedbackFilter)
                  .map((f, i) => (
                    <div key={i} className="sp-feedback-card">
                      <div className="sp-feedback-top">
                        <span className={`sp-feedback-type sp-type-${f.type.toLowerCase()}`}>{f.type} ⓘ</span>
                        <button className="sp-fb-more">⋮</button>
                      </div>
                      <div className="sp-stars">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={s <= f.stars ? 'star on' : 'star off'}>★</span>
                        ))}
                      </div>
                      <div className="sp-quote">{f.quote}</div>
                      <div className="sp-author">{f.author}</div>
                      <div className="sp-date">Added {f.date}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EnrichedTableView({ enriching, onOpenPanel, panelRow }) {
  const [hoveredRow, setHoveredRow] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const cols = ['Status', 'Priority', 'Assignee', 'Assigner', 'Mentions', 'Customers', 'Est. Revenue', 'Companies']
  const enrichedCols = ['Mentions', 'Customers', 'Est. Revenue', 'Companies']

  return (
    <div className="backlog-table-wrap">
      <table className="backlog-table enriched">
        <thead>
          <tr>
            <th className="row-num-col"></th>
            <th className="summary-col"></th>
            {cols.map(c => (
              <th key={c} className={enrichedCols.includes(c) ? 'enriched-col' : ''}>
                {enrichedCols.includes(c) && <span className="enriched-col-indicator" />}
                {c === 'Mentions' || c === 'Customers' || c === 'Est. Revenue' ? '# ' : c === 'Companies' ? '≡ ' : ''}
                {c}
              </th>
            ))}
            <th className="add-col">+</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, i) => (
            <tr
              key={i}
              className={panelRow === i ? 'row-selected' : ''}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => { setHoveredRow(null); setMenuRow(null) }}
            >
              <td className="row-num-col">
                <div className="row-num-cell">
                  {menuRow === i ? (
                    <RowMenu rowIndex={i} onOpenPanel={onOpenPanel} onClose={() => setMenuRow(null)} />
                  ) : null}
                  {hoveredRow === i ? (
                    <button className="row-menu-btn" onClick={() => setMenuRow(i)}>•••</button>
                  ) : (
                    <span className="row-num">{i + 1}</span>
                  )}
                </div>
              </td>
              <td className="summary-col">{row.summary}</td>
              <td><span className="status-tag">{row.status}</span></td>
              <td><span className={`priority-badge p-${row.priority.toLowerCase()}`}>{row.priority}</span></td>
              <td><span className="avatar av-row">{row.assignee[0]}</span> {row.assignee}</td>
              <td><span className="avatar av-row">{row.assigner[0]}</span> {row.assigner}</td>
              <td className="enriched-col">{enriching ? <span className="loading-cell" /> : <span className="insight-num">{row.mentions}</span>}</td>
              <td className="enriched-col">{enriching ? <span className="loading-cell" /> : <span className="insight-num">{row.customers}</span>}</td>
              <td className="enriched-col">{enriching ? <span className="loading-cell" /> : <span className="insight-rev">{row.revenue}</span>}</td>
              <td className="enriched-col">{enriching ? <span className="loading-cell" /> : <span className="insight-companies">{row.companies}</span>}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
