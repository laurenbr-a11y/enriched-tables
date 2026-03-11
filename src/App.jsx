import { useState, useEffect } from 'react'
import './App.css'
import RoadmapView from './Roadmap'
import TeamContextButton from './TeamContextButton'

// ── Steps ──────────────────────────────────────────────────
// 0: Home
// 1: Templates gallery
// 2: Blueprint detail
// 3: Backlog (empty, import dropdown)
// 4: Jira import modal
// 5: Jira sync setup
// 6: Enrichment confirm modal
// 7: Enrichment start (table + toast)
// 8: Enriched table (columns filled)
// 9: Roadmap view

export default function App() {
  const [step, setStep] = useState(0)
  const [spaceName, setSpaceName] = useState(null)
  const [teamContext, setTeamContext] = useState('')
  const [importMethod, setImportMethod] = useState('jira')
  const next = () => setStep(s => s + 1)
  const goto = (n) => setStep(n)
  const goHome = () => goto(0)

  return (
    <div className="app">
      {step === 0 && <HomeScreen onNext={next} spaceName={spaceName} onOpenSpace={() => goto(spaceName ? 3 : 1)} onOpenMiroInsights={() => goto(10)} />}
      {step === 1 && <TemplatesScreen onNext={next} onBack={() => goto(0)} />}
      {step === 2 && <BlueprintDetail onNext={(name) => { setSpaceName(name); next() }} onBack={() => goto(1)} />}
      {step === 3 && <BacklogEmpty onImport={(method) => { setImportMethod(method); goto(4) }} spaceName={spaceName} onGoHome={goHome} />}
      {step === 4 && (importMethod === 'csv'
        ? <CsvImport onNext={() => goto(6)} onClose={() => goto(3)} />
        : <JiraImport onNext={() => goto(6)} onClose={() => goto(3)} />
      )}
      {step === 6 && <EnrichStep onNext={next} onSkip={() => goto(3)} />}
      {step === 7 && <EnrichmentStart onNext={next} />}
      {step === 8 && <EnrichedTable onRestart={() => goto(0)} onGoRoadmap={() => goto(9)} spaceName={spaceName} onGoHome={goHome} teamContext={teamContext} onUpdateContext={setTeamContext} />}
      {step === 9 && <RoadmapView onGoBacklog={() => goto(8)} spaceName={spaceName} onGoHome={goHome} backlogRows={tableRows} PanelComponent={SidePanel} teamContext={teamContext} onUpdateContext={setTeamContext} />}
      {step === 10 && <EnrichedTable rows={miroInsightsRows} spaceName="Miro Insights Roadmap" onGoHome={goHome} onRestart={() => goto(0)} onGoRoadmap={() => goto(11)} teamContext={teamContext} onUpdateContext={setTeamContext} />}
      {step === 11 && <RoadmapView spaceName="Miro Insights Roadmap" onGoHome={goHome} onGoBacklog={() => goto(10)} backlogRows={miroInsightsRows} PanelComponent={SidePanel} teamContext={teamContext} onUpdateContext={setTeamContext} />}
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

function Sidebar({ active = 'Backlog', onNav = () => {}, spaceName, onGoHome, collapsed, onToggle }) {
  const items = [
    { icon: '⊞', label: 'Overview' },
    { icon: '▤', label: 'Backlog' },
    { icon: '↔', label: 'Roadmap' },
  ]
  return (
    <div className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-hamburger" onClick={onToggle}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      {!collapsed && (
        <div className="sidebar-inner">
          {onGoHome && (
            <div className="sidebar-home-link" onClick={onGoHome}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
                <path d="M7 1.5L1.5 6.5V12.5H5.5V9H8.5V12.5H12.5V6.5L7 1.5Z" fill="#666"/>
              </svg>
              Home
            </div>
          )}
          <div className="sidebar-project">
            <strong>{spaceName || 'Product Roadmap'}</strong>
            <span className="sidebar-meta">1 member</span>
          </div>
          <div className="sidebar-section-label">Roadmap Planning</div>
          {items.map(it => (
            <div
              key={it.label}
              className={`sidebar-item ${it.label === active ? 'active' : ''}`}
              onClick={() => onNav(it.label)}
              style={{ cursor: 'pointer' }}
            >
              <span className="sidebar-icon">{it.icon}</span>
              {it.label}
            </div>
          ))}
        </div>
      )}
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
function HomeScreen({ onNext, spaceName, onOpenSpace, onOpenMiroInsights }) {
  const boards = [
    { icon: '📋', name: 'Miro Insights Roadmap', mod: 'Today', space: 'Miro Insights…', owner: 'Lauren Brucato', badge: 'Internal', clickable: true },
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
        <div className="home-nav-item home-space-item" onClick={onOpenMiroInsights}>
          <span className="home-space-dot" />
          Miro Insights Roadmap
        </div>
        {spaceName && (
          <div className="home-nav-item home-space-item" onClick={onOpenSpace}>
            <span className="home-space-dot" style={{ background: '#5B9BD5' }} />
            {spaceName}
          </div>
        )}
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
                <tr key={b.name} onClick={b.clickable ? onOpenMiroInsights : undefined} style={b.clickable ? { cursor: 'pointer' } : {}}>
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
  const [showNaming, setShowNaming] = useState(false)
  const [name, setName] = useState('Product Roadmap')
  const boards = ['How it works', 'Backlog', 'Roadmap']
  const icons = ['ℹ', '▤', '↔']
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
            <p className="blueprint-meta">This Blueprint creates a Space with 3 boards:</p>
            <div className="blueprint-boards">
              <div className="blueprint-section-label">Overview</div>
              <div className="blueprint-board active"><span>ℹ</span> How it works</div>
              <div className="blueprint-section-label">Planning and Prioritization</div>
              {boards.slice(1).map((b, i) => (
                <div key={b} className="blueprint-board"><span>{icons[i + 1]}</span> {b}</div>
              ))}
            </div>
            <button className="btn-use-blueprint" onClick={() => setShowNaming(true)}>Use Blueprint</button>
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
      {showNaming && (
        <div className="overlay" onClick={() => setShowNaming(false)}>
          <div className="naming-modal" onClick={e => e.stopPropagation()}>
            <div className="naming-modal-icon">🗂</div>
            <h3 className="naming-modal-title">Name your space</h3>
            <p className="naming-modal-sub">Choose a name for your new Product Roadmap space.</p>
            <input
              className="naming-modal-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onNext(name.trim()) }}
              autoFocus
              placeholder="e.g. Product Roadmap Q2"
            />
            <div className="naming-modal-actions">
              <button className="btn-outline" onClick={() => setShowNaming(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => { if (name.trim()) onNext(name.trim()) }}>
                Create Space
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SCREEN 3: Backlog (empty table, import dropdown) ─────────
function BacklogEmpty({ onImport, spaceName, onGoHome }) {
  const [showImportMenu, setShowImportMenu] = useState(false)
  const cols = ['Title', 'Description', 'Status', 'Priority', 'Assignee']
  const rows = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title={spaceName || 'Product Roadmap'} />
      <div className="board-body">
        <Sidebar spaceName={spaceName} onGoHome={onGoHome} />
        <div className="board-content">
          <div className="board-toolbar">
            <span className="toolbar-icon">↺</span>
            <span className="toolbar-icon">▤</span>
            <span className="toolbar-icon">▽</span>
            <span className="toolbar-icon">↕</span>
            <span className="toolbar-icon">⊞</span>
            <span className="toolbar-icon" style={{ position: 'relative' }} onClick={() => setShowImportMenu(v => !v)}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1.5v8M4.5 4.5l3-3 3 3M2.5 10.5v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {showImportMenu && (
                <div className="import-dropdown-v2">
                  <div className="import-option-v2" onClick={() => onImport('jira')}>
                    <div className="import-icon-v2 jira-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect width="20" height="20" rx="4" fill="#0052CC"/>
                        <path d="M10 3.5L6 10l4 6.5L14 10 10 3.5z" fill="#fff" opacity=".9"/>
                        <path d="M10 3.5L6 10h8L10 3.5z" fill="#fff"/>
                      </svg>
                    </div>
                    <span className="import-label-v2">Jira</span>
                  </div>
                  <div className="import-divider" />
                  <div className="import-option-v2 csv-option" onClick={() => onImport('csv')}>
                    <div className="import-icon-v2 csv-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect width="20" height="20" rx="4" fill="#f0f0f0"/>
                        <path d="M5 7h10M5 10h10M5 13h6" stroke="#555" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="import-label-v2">Upload .CSV</span>
                  </div>
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
            <button className="btn-primary jira-import-only-btn" onClick={onNext}>
              Import{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

// ── SCREEN 4b: CSV import ────────────────────────────────────
function CsvImport({ onNext, onClose }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)

  const simulateFile = () => setFile({ name: 'backlog.csv', rows: 24 })

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body">
        <Sidebar />
        <div className="board-content" style={{ filter: 'blur(1px)', pointerEvents: 'none' }} />
      </div>
      <Overlay onClose={onClose}>
        <div className="modal csv-modal">
          <div className="modal-titlebar">
            <h2>Import from CSV</h2>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="csv-body">
            {!file ? (
              <div
                className={`csv-dropzone${dragging ? ' csv-dropzone--over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); simulateFile() }}
                onClick={simulateFile}
              >
                <div className="csv-drop-icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="6" y="4" width="28" height="36" rx="3" fill="#F0F2FF" stroke="#C8D0FF" strokeWidth="1.5"/>
                    <rect x="10" y="4" width="28" height="36" rx="3" fill="#fff" stroke="#C8D0FF" strokeWidth="1.5"/>
                    <path d="M18 18h12M18 23h12M18 28h8" stroke="#8896CC" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="36" cy="36" r="9" fill="#4262FF"/>
                    <path d="M36 31v10M31.5 36.5l4.5 4.5 4.5-4.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="csv-drop-title">Drag &amp; drop your CSV file here</div>
                <div className="csv-drop-or">— or —</div>
                <button className="btn-outline csv-browse-btn" onClick={(e) => { e.stopPropagation(); simulateFile() }}>
                  Browse files
                </button>
                <div className="csv-format-hint">
                  <strong>Required columns:</strong> Title, Description &nbsp;·&nbsp; <strong>Optional:</strong> Status, Priority, Assignee
                </div>
              </div>
            ) : (
              <div className="csv-file-ready">
                <div className="csv-file-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="2" y="2" width="28" height="28" rx="4" fill="#F0F2FF" stroke="#C8D0FF" strokeWidth="1.5"/>
                    <path d="M9 13h14M9 17h14M9 21h9" stroke="#4262FF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="csv-file-info">
                  <div className="csv-file-name">{file.name}</div>
                  <div className="csv-file-meta">{file.rows} rows detected · Ready to import</div>
                </div>
                <button className="csv-file-remove" onClick={() => setFile(null)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="csv-footer">
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary" disabled={!file} onClick={onNext} style={{ opacity: file ? 1 : 0.4 }}>
              Import →
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

// ── SCREEN 5: Jira sync setup ────────────────────────────────
function JiraSyncSetup({ onNext, onSkip }) {
  const [frequency, setFrequency] = useState('realtime')
  const [filterScope, setFilterScope] = useState('current')

  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body" style={{ filter: 'blur(2px)', pointerEvents: 'none' }}>
        <Sidebar />
      </div>
      <Overlay onClose={() => {}}>
        <div className="modal sync-modal">
          <div className="sync-modal-header">
            <div className="sync-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="#EEF0FF"/>
                <path d="M28 20A8 8 0 1 1 20 12" stroke="#4262FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 12l3.5 3.5L20 19" stroke="#4262FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="20" r="2.5" fill="#4262FF"/>
              </svg>
            </div>
            <h2 className="sync-title">Keep your backlog in sync with Jira</h2>
            <p className="sync-desc">
              New Jira items matching your filter will appear in your backlog automatically — so you never have to import again.
            </p>
          </div>

          <div className="sync-filter-preview">
            <div className="sync-filter-label">Syncing from</div>
            <div className="sync-filter-pill">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{flexShrink:0}}>
                <rect width="20" height="20" rx="4" fill="#0052CC"/>
                <path d="M10 3.5L6 10l4 6.5L14 10 10 3.5z" fill="#fff" opacity=".9"/>
                <path d="M10 3.5L6 10h8L10 3.5z" fill="#fff"/>
              </svg>
              <span>https://miro.atlassian.net</span>
              <span className="sync-filter-divider">·</span>
              <span className="sync-filter-query">All open issues · EPC, TSK, BUG</span>
            </div>
          </div>

          <div className="sync-options">
            <div className="sync-option-label">What to sync</div>
            <div className="sync-radio-group">
              {[
                { val: 'current', label: 'Items matching current filter', sub: 'All open issues from EPC-1234, TSK-1234, BUG-1234' },
                { val: 'all',     label: 'All new items in this project',  sub: 'Any issue created in miro.atlassian.net going forward' },
              ].map(opt => (
                <label key={opt.val} className={`sync-radio-item ${filterScope === opt.val ? 'selected' : ''}`}>
                  <input type="radio" name="scope" value={opt.val} checked={filterScope === opt.val} onChange={() => setFilterScope(opt.val)} />
                  <div>
                    <div className="sync-radio-label">{opt.label}</div>
                    <div className="sync-radio-sub">{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="sync-option-label" style={{marginTop: 16}}>Sync frequency</div>
            <div className="sync-freq-group">
              {[
                { val: 'realtime', label: 'Real-time', sub: 'Items appear as soon as they match' },
                { val: 'daily',    label: 'Daily',     sub: 'Synced once per day at 9am' },
              ].map(opt => (
                <label key={opt.val} className={`sync-radio-item ${frequency === opt.val ? 'selected' : ''}`}>
                  <input type="radio" name="freq" value={opt.val} checked={frequency === opt.val} onChange={() => setFrequency(opt.val)} />
                  <div>
                    <div className="sync-radio-label">{opt.label}</div>
                    <div className="sync-radio-sub">{opt.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="sync-actions">
            <button className="btn-outline" onClick={onSkip}>Import without sync</button>
            <button className="btn-primary sync-cta" onClick={onNext}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
                <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M7 2l2.5 2.5L7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Enable sync
            </button>
          </div>
        </div>
      </Overlay>
    </div>
  )
}

// ── SCREEN 6: Enrichment confirmation ───────────────────────
// ── SCREEN 6: Enrich step wrapper (toggles between has/no Insights) ──
function EnrichStep({ onNext, onSkip }) {
  const [hasInsights, setHasInsights] = useState(true)
  return (
    <div className="board-screen">
      <MiroTopbar showBoard title="Product Roadmap" />
      <div className="board-body" style={{ filter: 'blur(2px)', pointerEvents: 'none' }}>
        <Sidebar />
      </div>
      <Overlay onClose={() => {}}>
        <div className="modal enrich-confirm-modal">
          <div className="proto-toggle">
            <span className="proto-toggle-label">Demo</span>
            <button className={`proto-toggle-btn${hasInsights ? ' proto-toggle-btn--active' : ''}`} onClick={() => setHasInsights(true)}>Has Insights</button>
            <button className={`proto-toggle-btn${!hasInsights ? ' proto-toggle-btn--active' : ''}`} onClick={() => setHasInsights(false)}>No Insights</button>
          </div>
          {hasInsights
            ? <EnrichConfirmView onNext={onNext} onSkip={onSkip} />
            : <InsightsUpsellView onMaybeLater={onSkip} />
          }
        </div>
      </Overlay>
    </div>
  )
}

function EnrichConfirmView({ onNext, onSkip }) {
  return (
    <>
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
        Your imported items will automatically be enriched with customer intelligence — mentions, estimated revenue impact, company coverage, and more.
      </p>
      <div className="enrich-col-tags">
        {['Mentions', 'Customers', 'Est. Revenue', 'Companies'].map(c => (
          <span key={c} className="enrich-col-tag">{c}</span>
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
    </>
  )
}

function InsightsUpsellView({ onMaybeLater }) {
  const demoRows = [
    { name: 'Login redesign', mentions: '47', rev: '$320K', co: '12' },
    { name: 'API rate limits', mentions: '31', rev: '$180K', co: '8' },
    { name: 'Dashboard filters', mentions: '24', rev: '$95K', co: '5' },
  ]
  return (
    <>
      <div className="enrich-icon-row">
        <div className="enrich-spark-icon" style={{ background: '#F3EEFF' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#F3EEFF"/>
            <path d="M18 8l2.5 7h7.5l-6 4.5 2.5 7-6.5-4.5L11.5 26.5l2.5-7L8 15h7.5L18 8z" fill="#7B5EA7"/>
          </svg>
        </div>
      </div>
      <div className="upsell-badge">Miro Insights · Add-on</div>
      <h2 className="enrich-title">See which features customers need most</h2>
      <p className="enrich-desc">
        Miro Insights enriches your backlog with AI-powered customer signals — mentions, revenue at stake, and impacted accounts — so every priority call is evidence-based.
      </p>
      <div className="upsell-demo-preview">
        <div className="udp-frame">
          <div className="udp-row udp-header">
            <div className="udp-cell udp-name-col">Feature</div>
            <div className="udp-cell udp-enriched-col">Mentions</div>
            <div className="udp-cell udp-enriched-col">Est. Revenue</div>
            <div className="udp-cell udp-enriched-col">Companies</div>
          </div>
          {demoRows.map((row, i) => (
            <div key={i} className="udp-row">
              <div className="udp-cell udp-name-col">{row.name}</div>
              <div className={`udp-cell udp-enriched-col udp-fill udp-d${i}`}>{row.mentions}</div>
              <div className={`udp-cell udp-enriched-col udp-fill udp-d${i + 3}`}>{row.rev}</div>
              <div className={`udp-cell udp-enriched-col udp-fill udp-d${i + 6}`}>{row.co}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="enrich-actions">
        <button className="btn-outline" onClick={onMaybeLater}>Maybe later</button>
        <a className="btn-primary enrich-cta" href="https://miro.com/contact/" target="_blank" rel="noreferrer">
          Request demo →
        </a>
      </div>
    </>
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
            <span className="toolbar-icon">⊞</span><span className="toolbar-icon"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1.5v8M4.5 4.5l3-3 3 3M2.5 10.5v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          </div>
          <div className="table-panel-layout">
            <EnrichedTableView enriching onOpenPanel={setPanelRow} panelRow={panelRow} />
            {panelRow !== null && <SidePanel row={tableRows[panelRow]} rowIndex={panelRow} onClose={() => setPanelRow(null)} />}
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
function EnrichedTable({ onRestart, onGoRoadmap, spaceName, onGoHome, rows = tableRows, teamContext, onUpdateContext }) {
  const [panelRow, setPanelRow] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="board-screen board-screen--v2">
      <Sidebar active="Backlog" onNav={(label) => { if (label === 'Roadmap' && onGoRoadmap) onGoRoadmap() }} spaceName={spaceName} onGoHome={onGoHome} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
      <div className="board-right">
        <MiroTopbar showBoard title={spaceName || 'Product Roadmap'} />
        <div className="board-content">
          <div className="board-toolbar">
            <span className="toolbar-icon">↺</span><span className="toolbar-icon">▤</span>
            <span className="toolbar-icon">▽</span><span className="toolbar-icon">↕</span>
            <span className="toolbar-icon">⊞</span><span className="toolbar-icon"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 1.5v8M4.5 4.5l3-3 3 3M2.5 10.5v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
            <span style={{ width: 1, background: '#e8e8e8', height: 20, margin: '0 6px', flexShrink: 0 }} />
            <TeamContextButton teamContext={teamContext} onUpdateContext={onUpdateContext} />
          </div>
          <div className="table-panel-layout">
            <EnrichedTableView enriching={false} onOpenPanel={setPanelRow} panelRow={panelRow} rows={rows} />
            {panelRow !== null && <SidePanel row={rows[panelRow]} rowIndex={panelRow} onClose={() => setPanelRow(null)} />}
          </div>
          <div className="restart-hint" onClick={onRestart}>↩ Restart prototype</div>
        </div>
      </div>
    </div>
  )
}

// ── Feedback data generation ─────────────────────────────────
const FB_AUTHORS = [
  ['John Butter','ProductHunt'],['Sarah Kim','Stripe'],['Marcus Lee','Figma'],['Priya Patel','Notion'],
  ['Dan Rowe','Linear'],['Tara Singh','Vercel'],['Leo Chen','Loom'],['Anna Flores','Canva'],
  ['Chris Walton','GitHub'],['Maya Johansson','Slack'],['Ben Carter','Dropbox'],['Sophie Turner','Zapier'],
  ['Tom Nakamura','Intercom'],['Isla Brooks','HubSpot'],['Carlos Vega','Salesforce'],['Wei Zhang','Atlassian'],
  ['Fatima Al-Hassan','Meta'],['Ryan Park','Apple'],['Elena Morozova','Google'],['James O\'Brien','Zendesk'],
  ['Nadia Kowalski','Asana'],['David Osei','Retool'],['Chloe Martin','Monday'],['Arjun Sharma','GitLab'],
  ['Mei Lin','Postman'],['Lucas Müller','Basecamp'],['Aisha Diallo','Trello'],['Oliver Smith','1Password'],
  ['Nina Johansson','Miro'],['Kwame Mensah','Alpha Industries'],
]
const FB_QUOTES_PROBLEM = [
  '"The app technically works, but every tap feels like it\'s thinking hard before responding."',
  '"Login takes 8+ seconds on mobile. We\'ve had users abandon signup entirely."',
  '"Session timeouts are too aggressive — users are getting logged out mid-work."',
  '"The search results take forever to load. Unusable on 4G connections."',
  '"Notifications are delayed by hours sometimes. Critical for our team workflows."',
  '"We can\'t pass our SOC2 audit without audit logs. This is blocking our enterprise deal."',
  '"First-time login was confusing — no indication of what step I was on."',
  '"Your password rules rejected my password manager\'s generated password. Absurd."',
  '"Lost access to my account when my phone broke — backup codes weren\'t explained."',
  '"Got locked out with no way to recover without contacting support. Took 2 days."',
  '"The import job silently failed with no error message. We lost 3 hours of work."',
  '"Bulk operations freeze the UI entirely. Need background processing for large datasets."',
  '"The mobile experience is an afterthought. Key features are buried 5 taps deep."',
  '"Export to CSV corrupts special characters. Our data team has raised this repeatedly."',
  '"The date picker doesn\'t support timezones. International teams are constantly confused."',
  '"Auto-save stops working after 20 minutes. Lost a week of configuration changes."',
  '"Keyboard shortcuts are undocumented and inconsistent across different sections."',
  '"The onboarding wizard skips enterprise SSO setup entirely — a major oversight."',
  '"Dashboard widgets don\'t load in Firefox. We have a significant Firefox user base."',
  '"Webhook delivery fails silently when our endpoint is temporarily unavailable."',
  '"The API rate limits are too low for our automation use case. No burst allowance."',
  '"Comments disappear after editing. We\'ve lost critical stakeholder feedback."',
  '"The filter state resets on page reload. Extremely frustrating for daily users."',
  '"Integrations break whenever you push updates. No versioning or deprecation notice."',
  '"The mobile app crashes when switching between large projects on low-memory devices."',
]
const FB_QUOTES_REQUEST = [
  '"Would love SSO support — our team logs in 10+ times a day and it\'s painful."',
  '"Please add Google/GitHub OAuth. Manual registration feels outdated."',
  '"We need SAML SSO before we can roll this out company-wide. It\'s a blocker."',
  '"Competitors offer Face ID login. Would love to see that here too."',
  '"We need scoped API keys before we can recommend this to our clients."',
  '"I want to pin my most-used views to the top. Navigation takes too many clicks."',
  '"Would love a Slack integration — we\'d never miss an update if alerts came there."',
  '"Dark mode would make a huge difference for our late-night on-call engineers."',
  '"Can we get a read-only share link? Great for sharing progress with external stakeholders."',
  '"Bulk editing rows would save us hours every week. We manage hundreds of items."',
  '"An audit log for admin actions is critical for our compliance requirements."',
  '"Would love to see Kanban and Gantt views — the table is great but we need more."',
  '"Conditional formatting on cells would help our team spot issues at a glance."',
  '"Please add support for custom fields — we need to track data unique to our workflow."',
  '"A mobile app would be a game-changer. Our field team can\'t use the web version easily."',
  '"We\'d love an API for reading table data — would save us building manual exports."',
  '"Two-way Jira sync would eliminate the duplicate data entry our team does daily."',
  '"Add support for @mentions in comments — we\'re constantly missing important threads."',
  '"Would love to set row-level permissions. Some data shouldn\'t be visible to all teammates."',
  '"Zapier integration would open up a huge number of automation possibilities for us."',
  '"Please add recurring task support. We have the same standup items every week."',
  '"A changelog or activity feed per row would help us track the history of each item."',
  '"Guest access with limited permissions would let us loop in external partners."',
  '"Inline formula support (like SUM, AVERAGE) would replace a lot of our spreadsheet work."',
  '"Video walkthrough support in cards would help our support team document solutions."',
]
const FB_QUOTES_PRAISE = [
  '"The new table view is exactly what we needed. Migrated our whole team off Notion."',
  '"Import from Jira worked flawlessly. Saved us a full day of manual work."',
  '"The enrichment with customer data is genuinely game-changing for prioritization."',
  '"Best onboarding I\'ve experienced for a B2B tool. Everything just clicked."',
  '"The speed improvements in the last release are noticeable. Great engineering."',
  '"Our entire product team lives in this now. The visibility it gives us is unmatched."',
  '"The insights panel alone justifies the price. We cancelled two other tools."',
  '"Incredibly fast for large datasets. Handles our 10k-row backlog without breaking a sweat."',
  '"The collaboration features are top-notch. Real-time editing is seamless."',
  '"The customer company data surfacing is brilliant. Prioritized 3 features immediately."',
]
const FB_SOURCES = ['Call','Call','Call','Ticket','Ticket','Message','Other']
const FB_ROLES = ['Product Manager','Product Manager','Engineer','Designer','Executive','Customer Success','Sales']
const FB_SEGMENTS = ['Enterprise','Enterprise','Mid-market','Mid-market','SMB']
const FB_CALL_PARTS = ['Zach Brown','Emily Johnson','Sarah Kim','Marcus Lee','Brent Taylor']
const FB_INTERVIEW_CYCLES = ['Q1 2025','Q2 2025','Q3 2025','Q4 2024']
const FB_DATES = ['1 week ago','2 weeks ago','3 weeks ago','1 month ago','6 weeks ago','2 months ago','3 months ago','4 months ago']

function pick(arr, n) { return arr[n % arr.length] }
function seededInt(seed, max) { return ((seed * 1664525 + 1013904223) & 0x7fffffff) % max }

function generateFeedback(rowSeed, count = 50) {
  const items = []
  for (let i = 0; i < count; i++) {
    const s = rowSeed * 100 + i
    const typeRoll = seededInt(s, 10)
    const type = typeRoll < 4 ? 'Problem' : typeRoll < 7 ? 'Request' : 'Praise'
    const quotes = type === 'Problem' ? FB_QUOTES_PROBLEM : type === 'Request' ? FB_QUOTES_REQUEST : FB_QUOTES_PRAISE
    const [author, company] = FB_AUTHORS[(s * 7 + i * 3) % FB_AUTHORS.length]
    items.push({
      type,
      stars: type === 'Problem' ? (seededInt(s+1, 3) + 1) : type === 'Praise' ? (seededInt(s+2, 2) + 4) : (seededInt(s+3, 3) + 2),
      quote: quotes[seededInt(s+4, quotes.length)],
      author,
      company,
      date: FB_DATES[seededInt(s+5, FB_DATES.length)],
      source: FB_SOURCES[seededInt(s+6, FB_SOURCES.length)],
      role: FB_ROLES[seededInt(s+7, FB_ROLES.length)],
      segment: FB_SEGMENTS[seededInt(s+8, FB_SEGMENTS.length)],
      callParticipant: FB_CALL_PARTS[seededInt(s+9, FB_CALL_PARTS.length)],
      interviewCycle: FB_INTERVIEW_CYCLES[seededInt(s+10, FB_INTERVIEW_CYCLES.length)],
    })
  }
  return items
}

// ── Shared enriched table view ───────────────────────────────
const tableRows = [
  { summary: 'Log in to the application, I need a user-…', fullTitle: 'Design the user interface for the login page.', status: 'To do', priority: 'High', assignee: 'Emily Joh…', assigner: 'Brent Tay…', mentions: 47, customers: 31, revenue: '$2.1M', companies: 'Stripe, Figma, +12', panelMentions: 135, panelCustomers: 10, panelRevenue: '$325K', panelCompanies: ['Apple', 'Google', 'Notion', '+2'], panelSummary: 'Customers want a faster, more modern mobile experience — especially a simpler checkout. Improving this flow is strongly supported across segments and could boost mobile conversion and reduce churn.' },
  { summary: 'Registering for an account, I need clear wir…', fullTitle: 'Create wireframes for the registration process.', status: 'To do', priority: 'High', assignee: 'Sophia W…', assigner: 'Brent Tay…', mentions: 38, customers: 24, revenue: '$1.8M', companies: 'Notion, Slack, +9', panelMentions: 98, panelCustomers: 14, panelRevenue: '$210K', panelCompanies: ['Figma', 'Linear', 'Vercel', '+3'], panelSummary: 'Registration friction is causing significant drop-off for enterprise accounts. Users report confusion at the team invite step and struggle with email verification delays.' },
  { summary: 'Reset password, I need a user flow diagra…', fullTitle: 'Develop a user flow diagram for account recovery.', status: 'To do', priority: 'High', assignee: 'Olivia Br…', assigner: 'Brent Tay…', mentions: 29, customers: 18, revenue: '$980K', companies: 'Linear, Vercel, +7', panelMentions: 72, panelCustomers: 8, panelRevenue: '$180K', panelCompanies: ['Stripe', 'Intercom', '+4'], panelSummary: 'Password reset is a consistent pain point. Users report the reset link expiring too quickly and confusion about which email address is associated with their account.' },
  { summary: 'Developing features for authentication, I n…', fullTitle: 'Write user stories for the authentication feature.', status: 'To do', priority: 'High', assignee: 'Ava Davis', assigner: 'Brent Tay…', mentions: 22, customers: 15, revenue: '$740K', companies: 'Loom, Canva, +5', panelMentions: 55, panelCustomers: 7, panelRevenue: '$140K', panelCompanies: ['Loom', 'Canva', '+3'], panelSummary: 'Enterprise customers are pushing for MFA and SAML SSO. Several deals are stalled pending these auth capabilities, particularly in the financial services segment.' },
  { summary: 'Authentication methods, I need to co…', fullTitle: 'Conduct a competitive analysis of authentication methods.', status: 'To do', priority: 'High', assignee: 'Ryan Eldr…', assigner: 'Brent Tay…', mentions: 18, customers: 11, revenue: '$620K', companies: 'Miro, Asana, +4', panelMentions: 44, panelCustomers: 6, panelRevenue: '$115K', panelCompanies: ['Asana', 'Monday', '+2'], panelSummary: 'Customers frequently compare auth options to competitors. Passkeys and biometric login are emerging requests, especially from mobile-first teams.' },
  { summary: 'Discuss security, I want to set up a me…', fullTitle: 'Set up a meeting to discuss security protocols.', status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Chance C…', mentions: 14, customers: 9, revenue: '$410K', companies: 'Jira, GitHub, +3', panelMentions: 32, panelCustomers: 5, panelRevenue: '$90K', panelCompanies: ['GitHub', 'GitLab', '+1'], panelSummary: 'Security audit requirements are driving requests for detailed logs, IP allowlisting, and admin controls. Enterprise IT teams want more visibility into user activity.' },
  { summary: 'For user testing, I need to draft a plan…', fullTitle: 'Draft a plan for user testing the authentication process.', status: 'To do', priority: 'Medium', assignee: 'Sophia W…', assigner: 'Chance C…', mentions: 11, customers: 7, revenue: '$290K', companies: 'Trello, Basecamp', panelMentions: 28, panelCustomers: 4, panelRevenue: '$75K', panelCompanies: ['Trello', 'Basecamp'], panelSummary: 'Usability testing reveals users struggle with the authentication flow on first use. Clear progress indicators and inline error messages would significantly reduce support tickets.' },
  { summary: 'Passwords, I want to research best pr…', fullTitle: 'Research best practices for password management.', status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Chance C…', mentions: 9, customers: 6, revenue: '$220K', companies: 'Dropbox, +2', panelMentions: 22, panelCustomers: 4, panelRevenue: '$60K', panelCompanies: ['Dropbox', '1Password', '+1'], panelSummary: 'Password complexity rules are frustrating users. Many request a password strength meter and support for password manager autofill, which currently breaks in some browsers.' },
  { summary: 'APIs, I need to create a checklist so…', fullTitle: 'Create a checklist for API documentation.', status: 'To do', priority: 'Medium', assignee: 'Ava Davis', assigner: 'Chance C…', mentions: 8, customers: 5, revenue: '$190K', companies: 'Zapier, +1', panelMentions: 19, panelCustomers: 3, panelRevenue: '$50K', panelCompanies: ['Zapier', 'Make'], panelSummary: 'API key management is lacking — developers want scoped tokens, rotation policies, and usage dashboards. Several integration partners have flagged this as a blocker.' },
  { summary: 'Security features, I need to outline…', fullTitle: 'Outline the requirements for multi-factor authentication.', status: 'To do', priority: 'Medium', assignee: 'Ryan Eldr…', assigner: 'Chance C…', mentions: 6, customers: 4, revenue: '$130K', companies: 'Postman', panelMentions: 15, panelCustomers: 3, panelRevenue: '$40K', panelCompanies: ['Postman', 'Insomnia'], panelSummary: 'MFA adoption is low because the current TOTP setup is cumbersome. Users want push notification MFA and backup codes that are easier to manage.' },
  { summary: 'The user dashboard, I need to develop…', fullTitle: 'Develop a prototype for the user dashboard.', status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Chance C…', mentions: 5, customers: 3, revenue: '$95K', companies: 'Retool', panelMentions: 12, panelCustomers: 2, panelRevenue: '$30K', panelCompanies: ['Retool'], panelSummary: 'The user dashboard lacks the quick-access shortcuts and activity feed that power users rely on. Customers request a customizable home screen with pinned items.' },
  { summary: 'Support staff, I need to create a guide on…', fullTitle: 'Compile feedback from stakeholders on the authentication experience.', status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Chance C…', mentions: 4, customers: 3, revenue: '$80K', companies: 'Intercom', panelMentions: 10, panelCustomers: 2, panelRevenue: '$25K', panelCompanies: ['Intercom'], panelSummary: 'Support volume around authentication has increased 40% QoQ. Most tickets relate to locked accounts and session management confusion. A self-service unlock flow would reduce load.' },
]

// Assign varied statuses and feedback to tableRows
const TABLE_STATUSES = ['Done','Done','In Progress','In Progress','To Do','To Do','To Do','Idea','Idea','To Do','To Do','To Do']
tableRows.forEach((row, i) => { row.status = TABLE_STATUSES[i] || 'To Do'; row.feedback = generateFeedback(i) })

const miroInsightsRows = [
  // High fidelity (good context, panelMentions >= 70)
  { summary: 'Auto-group customer feedback by theme using ML…', fullTitle: 'AI-powered feedback clustering', status: 'In Progress', priority: 'High', assignee: 'Emily Joh…', assigner: 'Brent Tay…', mentions: 89, customers: 54, revenue: '$3.2M', companies: 'Stripe, Figma, +18', panelMentions: 210, panelCustomers: 42, panelRevenue: '$890K', panelCompanies: ['Stripe', 'Figma', 'Notion', '+8'], panelSummary: 'Teams waste hours manually tagging and grouping feedback. An AI-powered clustering system would automatically surface themes across thousands of data points, dramatically reducing time-to-insight and improving signal quality for roadmap decisions.' },
  { summary: 'Live dashboard showing customer sentiment trends…', fullTitle: 'Real-time insights dashboard', status: 'In Progress', priority: 'High', assignee: 'Sophia W…', assigner: 'Brent Tay…', mentions: 74, customers: 47, revenue: '$2.8M', companies: 'Notion, Slack, +14', panelMentions: 185, panelCustomers: 38, panelRevenue: '$720K', panelCompanies: ['Linear', 'Vercel', 'Loom', '+6'], panelSummary: 'PMs currently export data to spreadsheets to see trends. A real-time dashboard would surface velocity, sentiment shifts, and emerging themes as they happen, enabling faster response to customer signals.' },
  { summary: 'Bi-directional sync between Miro backlog and Jira…', fullTitle: 'Jira two-way sync', status: 'To do', priority: 'High', assignee: 'Olivia Br…', assigner: 'Brent Tay…', mentions: 68, customers: 41, revenue: '$2.4M', companies: 'Atlassian, +12', panelMentions: 160, panelCustomers: 33, panelRevenue: '$580K', panelCompanies: ['Atlassian', 'GitHub', 'Linear', '+5'], panelSummary: 'Teams using both Miro and Jira are doing double data entry. Two-way sync would eliminate that by keeping backlog items, status, and priorities in sync without manual intervention.' },
  { summary: 'Import feedback from CSV, Intercom, or Zendesk…', fullTitle: 'Bulk feedback import', status: 'To do', priority: 'High', assignee: 'Ava Davis', assigner: 'Brent Tay…', mentions: 61, customers: 38, revenue: '$2.1M', companies: 'Zendesk, Intercom, +10', panelMentions: 145, panelCustomers: 29, panelRevenue: '$490K', panelCompanies: ['Zendesk', 'Intercom', 'HubSpot', '+4'], panelSummary: 'Most customers have existing feedback in Zendesk, Intercom, or spreadsheets. A robust import tool would let them bring historical data in without starting from scratch, accelerating time-to-value.' },
  { summary: 'Score each feature request by estimated revenue impact…', fullTitle: 'Revenue impact scoring', status: 'To do', priority: 'High', assignee: 'Ryan Eldr…', assigner: 'Brent Tay…', mentions: 55, customers: 34, revenue: '$1.9M', companies: 'Salesforce, +9', panelMentions: 130, panelCustomers: 26, panelRevenue: '$420K', panelCompanies: ['Salesforce', 'HubSpot', 'Stripe', '+3'], panelSummary: 'Revenue impact is the top missing metric for roadmap prioritization. Customers want to see which items are tied to expansion ARR, renewal risk, or new logo deals — not just raw mention counts.' },
  { summary: 'One-click export of insights report for leadership…', fullTitle: 'Stakeholder report generation', status: 'To do', priority: 'High', assignee: 'Emily Joh…', assigner: 'Chance C…', mentions: 47, customers: 29, revenue: '$1.6M', companies: 'Google, Meta, +8', panelMentions: 110, panelCustomers: 22, panelRevenue: '$360K', panelCompanies: ['Google', 'Meta', 'Apple', '+3'], panelSummary: 'PMs spend 2–3 hours preparing insights summaries for leadership reviews. Automated report generation with customizable templates would eliminate this and ensure consistent storytelling from data.' },
  { summary: 'Merge duplicate or near-duplicate feedback automatically…', fullTitle: 'Feedback deduplication engine', status: 'In Progress', priority: 'Medium', assignee: 'Sophia W…', assigner: 'Chance C…', mentions: 39, customers: 24, revenue: '$1.3M', companies: 'Figma, Linear, +7', panelMentions: 95, panelCustomers: 19, panelRevenue: '$290K', panelCompanies: ['Figma', 'Linear', 'Notion', '+2'], panelSummary: 'Duplicate feedback inflates mention counts and distorts prioritization. Smart deduplication using semantic similarity would surface truer signal and reduce the manual cleanup that teams currently do before each planning cycle.' },
  { summary: 'Filter all insights by customer segment, tier, or ARR…', fullTitle: 'Customer segment filtering', status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Chance C…', mentions: 33, customers: 20, revenue: '$1.1M', companies: 'Stripe, +6', panelMentions: 80, panelCustomers: 16, panelRevenue: '$240K', panelCompanies: ['Stripe', 'Figma', 'Canva', '+2'], panelSummary: 'Enterprise and SMB customers have fundamentally different needs. Segment filtering would let PMs instantly see which issues are blocking their top accounts versus long-tail users, enabling more targeted prioritization.' },
  // Medium fidelity (weak context, panelMentions 28–69)
  { summary: 'Alert PM when new feedback matches a roadmap item…', fullTitle: 'Slack digest notifications', status: 'To do', priority: 'Medium', assignee: 'Ava Davis', assigner: 'Chance C…', mentions: 28, customers: 17, revenue: '$890K', companies: 'Slack, +5', panelMentions: 65, panelCustomers: 13, panelRevenue: '$190K', panelCompanies: ['Slack', 'Notion', '+2'], panelSummary: 'PMs miss new feedback because they have to proactively check the board. Slack digests would push a daily or real-time summary of new matched feedback, keeping teams informed without extra effort.' },
  { summary: 'Identify rising feedback themes over time…', fullTitle: 'Trend detection and alerts', status: 'To do', priority: 'Medium', assignee: 'Ryan Eldr…', assigner: 'Chance C…', mentions: 24, customers: 15, revenue: '$760K', companies: 'Asana, +4', panelMentions: 58, panelCustomers: 11, panelRevenue: '$160K', panelCompanies: ['Asana', 'Monday', '+1'], panelSummary: 'Teams want early warning when a new pain point starts accelerating. Trend detection would surface items with rapidly increasing mentions before they become crises.' },
  { summary: 'Add custom attributes to backlog items and insights…', fullTitle: 'Custom data fields', status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Chance C…', mentions: 21, customers: 13, revenue: '$640K', companies: 'Notion, +3', panelMentions: 50, panelCustomers: 10, panelRevenue: '$135K', panelCompanies: ['Notion', 'Coda', '+1'], panelSummary: 'Different teams track different metadata. Custom fields would let teams define their own dimensions — release quarter, team owner, customer tier — without being limited to the default schema.' },
  { summary: 'Aggregate insights across multiple Miro boards…', fullTitle: 'Multi-board rollup view', status: 'To do', priority: 'Medium', assignee: 'Sophia W…', assigner: 'Brent Tay…', mentions: 18, customers: 11, revenue: '$520K', companies: 'Miro, +3', panelMentions: 44, panelCustomers: 9, panelRevenue: '$115K', panelCompanies: ['Various', '+3'], panelSummary: 'Large organizations run multiple product boards in parallel. A rollup view would aggregate insights across boards, giving leadership a portfolio-level view of customer demand.' },
  { summary: 'REST API for programmatic access to insights data…', fullTitle: 'Insights API', status: 'To do', priority: 'Medium', assignee: 'Olivia Br…', assigner: 'Brent Tay…', mentions: 16, customers: 10, revenue: '$470K', companies: 'GitHub, +2', panelMentions: 39, panelCustomers: 8, panelRevenue: '$100K', panelCompanies: ['GitHub', 'Vercel', '+1'], panelSummary: 'Technical teams want to pull insights data into their own BI tools and data warehouses. An API would unlock integrations with Looker, Tableau, and custom dashboards without waiting for native connectors.' },
  { summary: 'Suggest priority ranking based on customer signals…', fullTitle: 'Auto-priority suggestions', status: 'To do', priority: 'Low', assignee: 'Ava Davis', assigner: 'Brent Tay…', mentions: 14, customers: 9, revenue: '$390K', companies: 'Linear, +2', panelMentions: 35, panelCustomers: 7, panelRevenue: '$85K', panelCompanies: ['Linear', 'Height', '+1'], panelSummary: 'PMs spend significant time manually re-ranking items each sprint. Auto-priority would surface a suggested ordering based on a combination of revenue impact, mention velocity, and strategic tags.' },
  { summary: 'Inline commenting and annotation on insight cards…', fullTitle: 'Team collaboration on insights', status: 'To do', priority: 'Low', assignee: 'Ryan Eldr…', assigner: 'Brent Tay…', mentions: 12, customers: 8, revenue: '$320K', companies: 'Figma, +2', panelMentions: 30, panelCustomers: 6, panelRevenue: '$75K', panelCompanies: ['Figma', 'Miro'], panelSummary: 'Insights are consumed in isolation. Adding inline comments would let PMs and stakeholders discuss specific findings in context, reducing the back-and-forth in separate Slack threads.' },
  { summary: 'Remove Miro branding from exported reports…', fullTitle: 'White-label report exports', status: 'To do', priority: 'Low', assignee: 'Emily Joh…', assigner: 'Brent Tay…', mentions: 11, customers: 7, revenue: '$280K', companies: 'Enterprise, +1', panelMentions: 28, panelCustomers: 5, panelRevenue: '$65K', panelCompanies: ['Large Enterprise', '+2'], panelSummary: 'Enterprise customers want to present insights reports externally to clients or boards without Miro branding. White-labeling is a table-stakes feature for enterprise deals.' },
  // Low fidelity (missing context, panelMentions < 28)
  { summary: 'Mobile experience improvements…', fullTitle: 'Mobile app', status: 'To do', priority: 'Medium', assignee: 'Sophia W…', assigner: 'Chance C…', mentions: 9, customers: 5, revenue: '$180K', companies: 'Various', panelMentions: 22, panelCustomers: 4, panelRevenue: '$50K', panelCompanies: ['Various'], panelSummary: 'Customers have requested mobile access.' },
  { summary: 'Notification improvements…', fullTitle: 'Notifications', status: 'To do', priority: 'Low', assignee: 'Olivia Br…', assigner: 'Chance C…', mentions: 8, customers: 5, revenue: '$150K', companies: 'Various', panelMentions: 19, panelCustomers: 4, panelRevenue: '$42K', panelCompanies: ['Various'], panelSummary: 'Users want better notifications.' },
  { summary: 'Improve performance across the app…', fullTitle: 'Performance optimisation', status: 'To do', priority: 'Medium', assignee: 'Ava Davis', assigner: 'Chance C…', mentions: 7, customers: 4, revenue: '$120K', companies: 'Various', panelMentions: 17, panelCustomers: 3, panelRevenue: '$38K', panelCompanies: ['Various'], panelSummary: 'App feels slow sometimes.' },
  { summary: 'Search functionality…', fullTitle: 'Global search', status: 'To do', priority: 'Medium', assignee: 'Ryan Eldr…', assigner: 'Chance C…', mentions: 6, customers: 4, revenue: '$100K', companies: 'Various', panelMentions: 15, panelCustomers: 3, panelRevenue: '$32K', panelCompanies: ['Various'], panelSummary: 'Search needs work.' },
  { summary: 'Dark mode for the interface…', fullTitle: 'Dark mode', status: 'To do', priority: 'Low', assignee: 'Emily Joh…', assigner: 'Brent Tay…', mentions: 6, customers: 4, revenue: '$90K', companies: 'Various', panelMentions: 14, panelCustomers: 3, panelRevenue: '$28K', panelCompanies: ['Various'], panelSummary: '' },
  { summary: 'Settings and preferences page…', fullTitle: 'Settings page redesign', status: 'To do', priority: 'Low', assignee: 'Sophia W…', assigner: 'Brent Tay…', mentions: 5, customers: 3, revenue: '$75K', companies: 'Various', panelMentions: 12, panelCustomers: 2, panelRevenue: '$22K', panelCompanies: ['Various'], panelSummary: '' },
  { summary: 'Integration work…', fullTitle: 'Integrations', status: 'To do', priority: 'Low', assignee: 'Olivia Br…', assigner: 'Brent Tay…', mentions: 5, customers: 3, revenue: '$65K', companies: 'Various', panelMentions: 11, panelCustomers: 2, panelRevenue: '$19K', panelCompanies: ['Various'], panelSummary: '' },
  { summary: 'Export features…', fullTitle: 'Export', status: 'To do', priority: 'Low', assignee: 'Ava Davis', assigner: 'Brent Tay…', mentions: 4, customers: 3, revenue: '$55K', companies: 'Various', panelMentions: 10, panelCustomers: 2, panelRevenue: '$16K', panelCompanies: ['Various'], panelSummary: '' },
  { summary: 'Onboarding flow for new users…', fullTitle: 'Onboarding flow', status: 'To do', priority: 'Medium', assignee: 'Ryan Eldr…', assigner: 'Brent Tay…', mentions: 4, customers: 2, revenue: '$45K', companies: 'Various', panelMentions: 9, panelCustomers: 2, panelRevenue: '$13K', panelCompanies: ['Various'], panelSummary: '' },
  { summary: 'Accessibility improvements…', fullTitle: 'Accessibility', status: 'To do', priority: 'Medium', assignee: 'Emily Joh…', assigner: 'Brent Tay…', mentions: 3, customers: 2, revenue: '$35K', companies: 'Various', panelMentions: 7, panelCustomers: 1, panelRevenue: '$10K', panelCompanies: ['Various'], panelSummary: '' },
]
const INSIGHTS_STATUSES = ['In Progress','In Progress','Done','Done','In Progress','To Do','In Progress','To Do','To Do','To Do','To Do','To Do','Idea','To Do','Idea','To Do','Idea','Idea','To Do','To Do','Idea','Idea','To Do','To Do','To Do']
miroInsightsRows.forEach((row, i) => { row.status = INSIGHTS_STATUSES[i] || row.status; row.feedback = generateFeedback(i + 25) })

// ── Row context menu ─────────────────────────────────────────
function RowMenu({ rowIndex, onOpenPanel, onClose, onOpenComments, onOpenInsights }) {
  const item = (icon, label, onClick, highlight) => (
    <div className={`row-ctx-item${highlight ? ' row-ctx-item--highlight' : ''}`} onClick={() => { onClick?.(); onClose() }}>
      <span className="row-ctx-icon">{icon}</span> {label}
    </div>
  )
  return (
    <div className="row-ctx-menu" onMouseLeave={onClose}>
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>,
        'Open side panel', () => onOpenPanel(rowIndex), true
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
        'Comments', () => { onOpenPanel(rowIndex); onOpenComments?.() }
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.6 3.5L7 9.5l-3.1 1.5.6-3.5L2 5l3.5-.5L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
        'Enrichment', () => { onOpenPanel(rowIndex); onOpenInsights?.() }
      )}
      <div className="row-ctx-divider" />
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="8" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 8V6.5H7v-1M10.5 8V6.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
        'Add child'
      )}
      {item(
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 6v1.5H7v1M10.5 6v1.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
        'Add parent'
      )}
    </div>
  )
}

// ── Feedback filter popover ───────────────────────────────────
const ALL_COMPANIES = ['Apple','Google','Notion','Stripe','Figma','Linear','Vercel','Loom','Canva','Miro','Asana','Atlassian','Slack','Dropbox','Zapier','Intercom','HubSpot','Salesforce','Zendesk','Meta','ProductHunt','GitHub','GitLab','Postman','Retool','Monday','Basecamp','Trello','1Password','Alpha Industries']
const ALL_ROLES = ['Product Manager','Engineer','Designer','Executive','Customer Success','Sales']

function FeedbackFilter({ filters, onChange }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('main')
  const [companySearch, setCompanySearch] = useState('')

  const toggle = (key, value) => {
    const next = new Set(filters[key])
    next.has(value) ? next.delete(value) : next.add(value)
    onChange({ ...filters, [key]: next })
  }

  const activeCount = Object.values(filters).reduce((sum, s) => sum + s.size, 0)

  const filteredCompanies = ALL_COMPANIES.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  )

  return (
    <div className="fb-filter-wrap">
      <button className={`fb-filter-btn ${activeCount > 0 ? 'active' : ''}`} onClick={() => { setOpen(v => !v); setView('main') }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        {activeCount > 0 && <span className="fb-filter-badge">{activeCount}</span>}
      </button>
      {open && (
        <div className="fb-filter-dropdown">
          {view === 'main' && (
            <>
              <div className="fb-filter-heading">Filter by</div>
              {[{k:'sources',label:'Source'},{k:'companies',label:'Company'},{k:'roles',label:'User Role'},{k:'others',label:'Other'}].map(f => (
                <div key={f.k} className="fb-filter-row" onClick={() => setView(f.k)}>
                  <span>{f.label}</span>
                  <div className="fb-filter-row-right">
                    {filters[f.k].size > 0 && <span className="fb-filter-active-count">{filters[f.k].size}</span>}
                    <span className="fb-chevron">›</span>
                  </div>
                </div>
              ))}
              {activeCount > 0 && (
                <button className="fb-clear-btn" onClick={() => onChange({ sources: new Set(), companies: new Set(), roles: new Set(), others: new Set() })}>
                  Clear all
                </button>
              )}
            </>
          )}
          {view === 'sources' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('main')}>‹ Source</div>
              {['Call','Ticket','Message','Other'].map(s => (
                <label key={s} className="fb-filter-check">
                  <input type="checkbox" checked={filters.sources.has(s)} onChange={() => toggle('sources', s)} />
                  {s}
                </label>
              ))}
            </>
          )}
          {view === 'companies' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('main')}>‹ Company</div>
              <input className="fb-company-search" placeholder="Search companies…" value={companySearch} onChange={e => setCompanySearch(e.target.value)} autoFocus />
              <div className="fb-company-list">
                {filteredCompanies.map(c => (
                  <label key={c} className="fb-filter-check">
                    <input type="checkbox" checked={filters.companies.has(c)} onChange={() => toggle('companies', c)} />
                    {c}
                  </label>
                ))}
              </div>
            </>
          )}
          {view === 'roles' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('main')}>‹ User Role</div>
              {ALL_ROLES.map(r => (
                <label key={r} className="fb-filter-check">
                  <input type="checkbox" checked={filters.roles.has(r)} onChange={() => toggle('roles', r)} />
                  {r}
                </label>
              ))}
            </>
          )}
          {view === 'others' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('main')}>‹ Other</div>
              {[
                { label: 'Call participant', sub: 'others-cp', prefix: 'cp:' },
                { label: 'Segment',          sub: 'others-seg', prefix: 'seg:' },
                { label: 'Interview cycle',  sub: 'others-ic', prefix: 'ic:' },
              ].map(f => {
                const count = [...filters.others].filter(o => o.startsWith(f.prefix)).length
                return (
                  <div key={f.sub} className="fb-filter-row" onClick={() => setView(f.sub)}>
                    <span>{f.label}</span>
                    <div className="fb-filter-row-right">
                      {count > 0 && <span className="fb-filter-active-count">{count}</span>}
                      <span className="fb-chevron">›</span>
                    </div>
                  </div>
                )
              })}
            </>
          )}
          {view === 'others-cp' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('others')}>‹ Call participant</div>
              {FB_CALL_PARTS.map(p => (
                <label key={p} className="fb-filter-check">
                  <input type="checkbox" checked={filters.others.has('cp:'+p)} onChange={() => toggle('others', 'cp:'+p)} />
                  {p}
                </label>
              ))}
            </>
          )}
          {view === 'others-seg' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('others')}>‹ Segment</div>
              {['Enterprise','Mid-market','SMB'].map(seg => (
                <label key={seg} className="fb-filter-check">
                  <input type="checkbox" checked={filters.others.has('seg:'+seg)} onChange={() => toggle('others', 'seg:'+seg)} />
                  {seg}
                </label>
              ))}
            </>
          )}
          {view === 'others-ic' && (
            <>
              <div className="fb-filter-back" onClick={() => setView('others')}>‹ Interview cycle</div>
              {FB_INTERVIEW_CYCLES.map(ic => (
                <label key={ic} className="fb-filter-check">
                  <input type="checkbox" checked={filters.others.has('ic:'+ic)} onChange={() => toggle('others', 'ic:'+ic)} />
                  {ic}
                </label>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Feedback detail helpers ───────────────────────────────────
const MIRO_REPS = ['Daniel Coronado', 'Emma Walsh', 'Tyler Nguyen']

function generateCallTranscript(feedback) {
  const repName = MIRO_REPS[(feedback.author.charCodeAt(0) + (feedback.author.charCodeAt(1) || 0)) % MIRO_REPS.length]
  const raw = feedback.quote.replace(/^["""]|["""]$/g, '')
  return [
    { speaker: repName, isMiro: true, time: '00:44', text: `Hi ${feedback.author.split(' ')[0]}! I help support some of our key accounts here at Miro — I wanted to connect and hear how the product is working for your team. Are there things that feel like friction or areas you'd love to see improve?` },
    { speaker: feedback.author, isMiro: false, time: '01:19', text: `Yeah, happy to chat. We use Miro pretty regularly — it's helpful overall but there are definitely some things that slow us down.` },
    { speaker: repName, isMiro: true, time: '01:52', text: `That's great context. What would you say is the biggest pain point for your team right now?` },
    { speaker: feedback.author, isMiro: false, time: '02:20', text: raw },
    { speaker: repName, isMiro: true, time: '03:08', text: `That's a really clear pain point — thank you. How often does this come up? Is it a recurring blocker or more situational?` },
    { speaker: feedback.author, isMiro: false, time: '03:34', text: `It comes up regularly, especially during our planning cycles. We've tried workarounds but nothing really sticks.` },
    { speaker: repName, isMiro: true, time: '04:02', text: `This is exactly the kind of signal the product team needs to hear. I'll make sure it gets captured. Is there anything else you'd want us to prioritize?` },
    { speaker: feedback.author, isMiro: false, time: '04:28', text: `Just smoother core workflows. We want to stay on Miro long term — any improvement here would matter a lot to us.` },
  ]
}

function generateTicketThread(feedback) {
  const raw = feedback.quote.replace(/^["""]|["""]$/g, '')
  return [
    { speaker: feedback.author, isMiro: false, time: feedback.date, text: raw },
    { speaker: 'Support (Miro)', isMiro: true, time: '2 days ago', text: `Thanks for reaching out, ${feedback.author.split(' ')[0]}! We've logged this and shared it with the product team. Could you share your setup — browser, board size, or any steps to reproduce?` },
    { speaker: feedback.author, isMiro: false, time: '1 day ago', text: `We're on Chrome, latest version. Board has 200+ items. It's consistently slow whenever more than 5 people are collaborating at once.` },
    { speaker: 'Support (Miro)', isMiro: true, time: '18 hours ago', text: `Thank you! I've escalated this to our engineering team. We'll follow up once we have an update. As a temporary workaround, reducing simultaneous editors can help.` },
  ]
}

function generateMessageThread(feedback) {
  const raw = feedback.quote.replace(/^["""]|["""]$/g, '')
  return [
    { speaker: feedback.author, isMiro: false, time: '10:14 AM', text: raw },
    { speaker: 'You (Miro)', isMiro: true, time: '10:22 AM', text: `Hey ${feedback.author.split(' ')[0]}, thanks for flagging this! That's really useful context. Would you be open to a short call so we can dig into it more?` },
    { speaker: feedback.author, isMiro: false, time: '10:35 AM', text: `Sure, I can do Thursday or Friday. It's been a significant issue for our team so I'm happy to share more detail.` },
    { speaker: 'You (Miro)', isMiro: true, time: '10:41 AM', text: `Friday works great — I'll send a calendar invite. This kind of feedback directly shapes what we build next.` },
  ]
}

function FeedbackDetail({ feedback, onBack }) {
  const isCall = feedback.source === 'Call'
  const isTicket = feedback.source === 'Ticket'
  const middleTab = isCall ? 'Conversation' : isTicket ? 'Thread' : 'Messages'
  const [innerTab, setInnerTab] = useState(middleTab)
  const [searchQuery, setSearchQuery] = useState('')

  const firstName = feedback.author.split(' ')[0]
  const lastName = feedback.author.split(' ').slice(1).join(' ')
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '_')}`

  const title = isCall
    ? `Call with ${feedback.author}`
    : isTicket
      ? `Ticket from ${feedback.author}`
      : `Message from ${feedback.author}`

  const thread = isCall
    ? generateCallTranscript(feedback)
    : isTicket
      ? generateTicketThread(feedback)
      : generateMessageThread(feedback)

  const TopIcon = () => isCall ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9.5C2 5.36 5.36 2 9.5 2S17 5.36 17 9.5c0 1.3-.33 2.52-.9 3.57L17 16l-2.93-.9A7.45 7.45 0 019.5 17C5.36 17 2 13.64 2 9.5z" stroke="#111" strokeWidth="1.4" strokeLinejoin="round"/><circle cx="6.5" cy="9.5" r=".8" fill="#111"/><circle cx="9.5" cy="9.5" r=".8" fill="#111"/><circle cx="12.5" cy="9.5" r=".8" fill="#111"/></svg>
  ) : isTicket ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="#111" strokeWidth="1.4"/><path d="M5 6h8M5 9h8M5 12h5" stroke="#111" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 4h12a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0115 14H5l-3.5 2.5V5.5A1.5 1.5 0 013 4z" stroke="#111" strokeWidth="1.4" strokeLinejoin="round"/></svg>
  )

  return (
    <div className="fd-panel">
      <div className="fd-topbar">
        <button className="fd-back-btn" onClick={onBack}>
          <TopIcon />
          <span>Feedback</span>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="sp-icon-btn">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2v10h10V9M8 2h4v4M13 1L7 7" stroke="#555" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="fd-add-btn">+ Add to board</button>
        </div>
      </div>
      <div className="fd-body">
        <h1 className="fd-title">{title}</h1>
        <div className="fd-person-row">
          <div className="fd-avatar">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#C8972B"/><circle cx="20" cy="16" r="6.5" fill="#fff" fillOpacity="0.85"/><ellipse cx="20" cy="31" rx="10" ry="6.5" fill="#fff" fillOpacity="0.85"/></svg>
          </div>
          <div>
            <div className="fd-person-name">
              {username} [[unknown]]
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#777' }}><rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 4l5.5 3.5L12 4" stroke="currentColor" strokeWidth="1.2"/></svg>
            </div>
            <div className="fd-person-meta">{feedback.role || 'Product Manager'} at {feedback.company.toUpperCase()}</div>
          </div>
        </div>
        <div className="fd-divider" />
        <div className="fd-inner-tabs">
          {['Summary', middleTab, 'Details'].map(t => (
            <button key={t} className={`fd-inner-tab ${innerTab === t ? 'active' : ''}`} onClick={() => setInnerTab(t)}>{t}</button>
          ))}
        </div>

        {innerTab === 'Summary' && (
          <div className="fd-details">
            <p className="fd-summary-text">{feedback.author} from {feedback.company} {isCall ? 'discussed' : isTicket ? 'reported' : 'messaged about'} issues with their workflow: <em>{feedback.quote.replace(/^["""]|["""]$/g, '')}</em></p>
            <div className="fd-meta-row"><span className="fd-meta-label">Source</span><span className="fd-meta-value">{feedback.source}</span></div>
            <div className="fd-meta-row"><span className="fd-meta-label">Date</span><span className="fd-meta-value">{feedback.date}</span></div>
            <div className="fd-meta-row"><span className="fd-meta-label">Company</span><span className="fd-meta-value">{feedback.company}</span></div>
            {feedback.role && <div className="fd-meta-row"><span className="fd-meta-label">Role</span><span className="fd-meta-value">{feedback.role}</span></div>}
          </div>
        )}

        {innerTab === middleTab && (
          <div>
            {isCall && (
              <div className="fd-search-row">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ margin: '0 8px', flexShrink: 0 }}><circle cx="5.5" cy="5.5" r="4" stroke="#aaa" strokeWidth="1.3"/><path d="M9 9l2.5 2.5" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round"/></svg>
                <input className="fd-search-input" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                <button className="fd-nav-btn">∧</button>
                <button className="fd-nav-btn">∨</button>
              </div>
            )}
            <div className="fd-transcript">
              {thread.map((turn, i) => (
                <div key={i} className={`fd-turn ${turn.isMiro ? 'fd-turn--miro' : 'fd-turn--customer'}`}>
                  <div className="fd-turn-header">
                    <strong className="fd-turn-speaker">{turn.speaker}</strong>
                    <span className="fd-turn-time">{turn.time}</span>
                    {turn.isMiro && (
                      <button className="fd-copy-btn" title="Copy">
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="4.5" y="4.5" width="8.5" height="8.5" rx="1.5" stroke="#777" strokeWidth="1.2"/><path d="M3 10.5V2.5A1 1 0 014 1.5h8" stroke="#777" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                  <p className="fd-turn-text">{turn.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {innerTab === 'Details' && (
          <div className="fd-details">
            <div className="fd-meta-row"><span className="fd-meta-label">Author</span><span className="fd-meta-value">{feedback.author}</span></div>
            <div className="fd-meta-row"><span className="fd-meta-label">Company</span><span className="fd-meta-value">{feedback.company}</span></div>
            {feedback.role && <div className="fd-meta-row"><span className="fd-meta-label">Role</span><span className="fd-meta-value">{feedback.role}</span></div>}
            <div className="fd-meta-row"><span className="fd-meta-label">Source</span><span className="fd-meta-value">{feedback.source}</span></div>
            <div className="fd-meta-row"><span className="fd-meta-label">Date</span><span className="fd-meta-value">{feedback.date}</span></div>
            <div className="fd-meta-row"><span className="fd-meta-label">Type</span><span className={`sp-feedback-type sp-type-${feedback.type.toLowerCase()}`}>{feedback.type}</span></div>
            {feedback.segment && <div className="fd-meta-row"><span className="fd-meta-label">Segment</span><span className="fd-meta-value">{feedback.segment}</span></div>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Side panel ───────────────────────────────────────────────
function SidePanel({ row, onClose, rowIndex = 0 }) {
  const [tab, setTab] = useState('Details')
  const [filters, setFilters] = useState({ sources: new Set(), companies: new Set(), roles: new Set(), others: new Set() })
  const [sort, setSort] = useState('newest')

  const [rejectingIdx, setRejectingIdx] = useState(new Set())
  const [rejectedIdx, setRejectedIdx] = useState(new Set())
  const [rejectReasons, setRejectReasons] = useState({})
  const [selectedFeedback, setSelectedFeedback] = useState(null)

  // Reset tab and selected feedback whenever the displayed row changes
  useEffect(() => { setTab('Details'); setSelectedFeedback(null) }, [row])

  const panelId = `PT-${300 + rowIndex}`
  const jiraId = `PT-${100 + rowIndex * 2}`

  const startDate = (() => {
    const d = new Date('2025-09-01')
    d.setDate(d.getDate() + rowIndex * 14)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
  })()
  const endDate = (() => {
    const d = new Date('2025-09-01')
    d.setDate(d.getDate() + rowIndex * 14 + 49 + rowIndex * 7)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
  })()

  const BRAND_COLORS = {
    Stripe: '#635BFF', Figma: '#F24E1E', Notion: '#000', Linear: '#5E6AD2',
    Vercel: '#24292F', Slack: '#4A154B', GitHub: '#24292F', Dropbox: '#0061FF',
    Apple: '#555', Google: '#4285F4', Facebook: '#1877F2', AWS: '#FF9900',
    YouTube: '#FF0000', Twitter: '#1DA1F2', LinkedIn: '#0A66C2', Miro: '#4262FF',
    Atlassian: '#0052CC', HubSpot: '#FF7A59', Salesforce: '#00A1E0',
    Zendesk: '#03363D', Intercom: '#286EFA', Canva: '#00C4CC', Loom: '#625DF5',
    Asana: '#F06A6A', Monday: '#FF3D57', Postman: '#FF6C37', Retool: '#3D3D3D',
    Trello: '#0079BF', GitLab: '#FC6D26', Zapier: '#FF4A00', Basecamp: '#1D2D35',
    Various: '#888', Enterprise: '#555',
  }

  const companies = row.panelCompanies || []
  const regularCompanies = companies.filter(c => !c.startsWith('+'))
  const overflowItem = companies.find(c => c.startsWith('+'))

  const DATE_ORDER = ['1 week ago','2 weeks ago','3 weeks ago','1 month ago','6 weeks ago','2 months ago','3 months ago','4 months ago']

  const visibleFeedback = row.feedback.map((f, i) => ({ ...f, _idx: i })).filter(f => {
    if (rejectedIdx.has(f._idx)) return false
    if (filters.sources.size > 0 && !filters.sources.has(f.source)) return false
    if (filters.companies.size > 0 && !filters.companies.has(f.company)) return false
    if (filters.roles.size > 0 && !filters.roles.has(f.role)) return false
    if (filters.others.size > 0) {
      const cpMatch = [...filters.others].filter(o => o.startsWith('cp:')).map(o => o.slice(3))
      const segMatch = [...filters.others].filter(o => o.startsWith('seg:')).map(o => o.slice(4))
      const icMatch = [...filters.others].filter(o => o.startsWith('ic:')).map(o => o.slice(3))
      if (cpMatch.length > 0 && !cpMatch.includes(f.callParticipant)) return false
      if (segMatch.length > 0 && !segMatch.includes(f.segment)) return false
      if (icMatch.length > 0 && !icMatch.includes(f.interviewCycle)) return false
    }
    return true
  }).sort((a, b) => {
    const ai = DATE_ORDER.indexOf(a.date), bi = DATE_ORDER.indexOf(b.date)
    return sort === 'newest' ? ai - bi : bi - ai
  })

  const activeFilterCount = Object.values(filters).reduce((s, set) => s + set.size, 0)

  return (
    <div className="side-panel">
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5l1.4 2.8 3.1.45-2.25 2.2.53 3.1L6.5 8.6l-2.78 1.45.53-3.1L2 4.75l3.1-.45L6.5 1.5z" stroke="#4262FF" strokeWidth="1.2" fill="#4262FF" fillOpacity="0.15" strokeLinejoin="round"/></svg>
          <span className="sp-title">{tab === 'Jira' ? jiraId : panelId}</span>
        </div>
        <div className="sp-header-actions">
          <button className="sp-icon-btn">⤢</button>
          <button className="sp-icon-btn">🔗</button>
          <button className="sp-icon-btn" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="sp-tabs">
        {['Details', 'Jira', 'Insights', 'Comments'].map(t => (
          <button
            key={t}
            className={`sp-tab ${(tab === t && !selectedFeedback) || (t === 'Insights' && selectedFeedback) ? 'active' : ''}`}
            onClick={() => { setTab(t); setSelectedFeedback(null) }}
          >{t}</button>
        ))}
      </div>
      <div className="sp-body">
        {tab === 'Details' && (
          <div className="sp-placeholder">
            <div className="sp-field">
              <span className="sp-field-label">Title</span>
              <span style={{ fontSize: 13, color: '#333', lineHeight: 1.4 }}>{row.fullTitle}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={statusClass(row.status)}>{row.status}</span>
                <button className="sp-edit-btn" title="Edit status">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7.5 1.5l2 2-5.5 5.5H2v-2L7.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">Start date</span>
              <span className="sp-date-chip">{startDate}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">End date</span>
              <span className="sp-date-chip">{endDate}</span>
            </div>
          </div>
        )}
        {tab === 'Jira' && (
          <div className="sp-jira-form">
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Issue type</div>
              <div className="sp-jira-select-wrap">
                <select className="sp-jira-select"><option value="">Select an option</option></select>
              </div>
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Priority</div>
              <div className="sp-jira-select-wrap">
                <select className="sp-jira-select"><option value="">Select an option</option></select>
              </div>
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Summary</div>
              <input className="sp-jira-input" type="text" placeholder="Placeholder Text" />
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Description</div>
              <textarea className="sp-jira-input sp-jira-textarea" placeholder="Placeholder Text" />
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Assignee</div>
              <input className="sp-jira-input" type="text" placeholder="Placeholder Text" />
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Reporter</div>
              <input className="sp-jira-input" type="text" placeholder="Placeholder Text" />
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Epic</div>
              <input className="sp-jira-input" type="text" placeholder="Placeholder Text" />
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Teams</div>
              <div className="sp-jira-select-wrap">
                <select className="sp-jira-select"><option value="">Select an option</option></select>
              </div>
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Start date</div>
              <div className="sp-jira-date-wrap">
                <input className="sp-jira-input" type="text" placeholder="Select a date" readOnly />
                <span className="sp-jira-calendar-icon">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="10" rx="2" stroke="#aaa" strokeWidth="1.2"/><path d="M1 5h11M4 1v2M9 1v2" stroke="#aaa" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
              </div>
            </div>
            <div className="sp-jira-field-group">
              <div className="sp-jira-label">Stream</div>
              <input className="sp-jira-input" type="text" placeholder="Placeholder Text" />
            </div>
          </div>
        )}
        {tab === 'Insights' && selectedFeedback && (
          <FeedbackDetail feedback={selectedFeedback} onBack={() => setSelectedFeedback(null)} />
        )}
        {tab === 'Insights' && !selectedFeedback && (
          <div className="sp-insights">
            <div className="sp-section">
              <div className="sp-section-title">Summary</div>
              <p className="sp-summary-text">{row.panelSummary}</p>
              {(() => {
                const issue = row.panelMentions >= 70 ? null : row.panelMentions >= 28 ? 'weak' : 'missing'
                if (!issue) return null
                if (issue === 'missing') return (
                  <div className="ctx-callout ctx-callout--error">
                    <div className="ctx-callout-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#C00" strokeWidth="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke="#C00" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="ctx-callout-body">
                      <div className="ctx-callout-title">Missing Title or Description</div>
                      <div className="ctx-callout-text">Enrichment requires a clear title and description to match customer feedback. Add context to enable insights for this item.</div>
                      <button className="ctx-callout-action">Add description →</button>
                    </div>
                  </div>
                )
                return (
                  <div className="ctx-callout ctx-callout--warn">
                    <div className="ctx-callout-icon">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="#9A6000" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 6v3.5M8 11v1" stroke="#9A6000" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <div className="ctx-callout-body">
                      <div className="ctx-callout-title">Low-confidence enrichment</div>
                      <div className="ctx-callout-text">The title or description may be too brief to reliably match customer feedback. Improving context will increase matching accuracy.</div>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="sp-section">
              <div className="sp-section-title">Top impacted customers</div>
              <div className="sp-brand-chips">
                {regularCompanies.map(c => (
                  <span key={c} className="sp-brand-chip" style={{ background: BRAND_COLORS[c] || '#888' }} title={c}>
                    {c.slice(0, 2).toUpperCase()}
                  </span>
                ))}
                {overflowItem && <span className="sp-brand-overflow">{overflowItem}</span>}
              </div>
            </div>
            <div className="sp-section">
              <div className="sp-section-title">Status</div>
              <div className="sp-stats-row">
                <div className="sp-stat-item">
                  <div className="sp-stat-num">{row.panelMentions}</div>
                  <div className="sp-stat-label">Total Mentions</div>
                </div>
                <div className="sp-stat-item sp-stat-item--bordered">
                  <div className="sp-stat-num">{row.panelCustomers}</div>
                  <div className="sp-stat-label">Unique Customers</div>
                </div>
              </div>
              <div className="sp-revenue-stat">
                <div className="sp-stat-label">Est. Revenue Impact</div>
                <div className="sp-revenue-num">{row.panelRevenue}</div>
              </div>
            </div>
            <div className="sp-section sp-feedback-section">
              <div className="sp-feedback-toolbar">
                <div className="sp-section-title">Feedback <span className="sp-fb-count">{visibleFeedback.length}</span></div>
                <div className="sp-feedback-controls">
                  <div className="sp-sort-select-wrap">
                    <select className="sp-sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </div>
                  <FeedbackFilter filters={filters} onChange={setFilters} />
                </div>
              </div>
              {activeFilterCount > 0 && (
                <div className="sp-active-filters">
                  {[...filters.sources].map(s => <span key={s} className="sp-filter-chip">Source: {s} <button onClick={() => { const n = new Set(filters.sources); n.delete(s); setFilters({...filters, sources: n}) }}>✕</button></span>)}
                  {[...filters.companies].map(c => <span key={c} className="sp-filter-chip">Company: {c} <button onClick={() => { const n = new Set(filters.companies); n.delete(c); setFilters({...filters, companies: n}) }}>✕</button></span>)}
                  {[...filters.roles].map(r => <span key={r} className="sp-filter-chip">Role: {r} <button onClick={() => { const n = new Set(filters.roles); n.delete(r); setFilters({...filters, roles: n}) }}>✕</button></span>)}
                  {[...filters.others].map(o => { const label = o.startsWith('cp:') ? o.slice(3) : o.startsWith('seg:') ? o.slice(4) : o.slice(3); return <span key={o} className="sp-filter-chip">{label} <button onClick={() => { const n = new Set(filters.others); n.delete(o); setFilters({...filters, others: n}) }}>✕</button></span> })}
                </div>
              )}
              <div className="sp-feedback-list">
                {visibleFeedback.length === 0 && (
                  <div className="sp-fb-empty">No feedback matches the current filters.</div>
                )}
                {visibleFeedback.map((f, i) => {
                  const idx = f._idx
                  const isRejecting = rejectingIdx.has(idx)

                  if (isRejecting) {
                    return (
                      <div key={i} className="sp-feedback-card sp-card-rejecting">
                        <div className="sp-reject-icon">
                          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                            <circle cx="11" cy="11" r="9.5" stroke="#C00" strokeWidth="1.5"/>
                            <line x1="4.5" y1="4.5" x2="17.5" y2="17.5" stroke="#C00" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <p className="sp-reject-msg">This will remove the feedback segment from enrichment and impact metrics.</p>
                        <textarea
                          className="sp-reject-reason"
                          placeholder="Tell us why you're removing this (optional)"
                          value={rejectReasons[idx] || ''}
                          onChange={e => setRejectReasons(prev => ({ ...prev, [idx]: e.target.value }))}
                        />
                        <div className="sp-reject-actions">
                          <button className="btn-outline sp-reject-cancel" onClick={() => {
                            const n = new Set(rejectingIdx); n.delete(idx); setRejectingIdx(n)
                          }}>Cancel</button>
                          <button className="sp-reject-confirm" onClick={() => {
                            const nr = new Set(rejectedIdx); nr.add(idx)
                            setRejectedIdx(nr)
                            const n = new Set(rejectingIdx); n.delete(idx); setRejectingIdx(n)
                          }}>Remove feedback</button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={i} className={`sp-feedback-card sp-card-${f.type.toLowerCase()}`} style={{ cursor: 'pointer' }} onClick={() => setSelectedFeedback(f)}>
                      <div className="sp-feedback-top">
                        <span className={`sp-feedback-type sp-type-${f.type.toLowerCase()}`}>
                          {f.type === 'Problem' ? 'User problem' : f.type === 'Request' ? 'User request' : 'User praise'} ⓘ
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <button className="sp-reject-btn" title="Reject feedback" onClick={(e) => {
                            e.stopPropagation()
                            const n = new Set(rejectingIdx); n.add(idx); setRejectingIdx(n)
                          }}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <circle cx="7" cy="7" r="6" stroke="#aaa" strokeWidth="1.3"/>
                              <line x1="2.5" y1="2.5" x2="11.5" y2="11.5" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <button className="sp-fb-more" onClick={e => e.stopPropagation()}>⋮</button>
                        </div>
                      </div>
                      <div className="sp-stars">
                        {[1,2,3,4,5].map(s => <span key={s} className={s <= f.stars ? 'star on' : 'star off'}>★</span>)}
                      </div>
                      <div className="sp-quote">{f.quote}</div>
                      <div className="sp-author-row">{f.author}, {f.company}</div>
                      <div className="sp-card-footer">
                        <span className="sp-card-tag sp-date">{f.date}</span>
                        <span className="sp-card-tag sp-tag-source">{f.source}</span>
                        <span className="sp-card-tag">{f.role}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        {tab === 'Comments' && (
          <div className="sp-placeholder sp-empty">
            <div className="sp-empty-icon">💬</div>
            <div>No comments yet</div>
          </div>
        )}
      </div>
    </div>
  )
}

const statusClass = (s) => {
  if (s === 'Done') return 'status-tag status-done'
  if (s === 'In Progress') return 'status-tag status-inprogress'
  if (s === 'Idea') return 'status-tag status-idea'
  return 'status-tag'
}

const WarnTriangle = () => (
  <svg className="cell-warn-icon" width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.5 1.5L12 11.5H1L6.5 1.5Z" fill="#FFF3CD" stroke="#E6A800" strokeWidth="1.2" strokeLinejoin="round"/>
    <path d="M6.5 5.5v2.5" stroke="#9A6000" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="6.5" cy="9.5" r="0.6" fill="#9A6000"/>
  </svg>
)

function EnrichedTableView({ enriching, onOpenPanel, panelRow, rows = tableRows }) {
  const [hoveredRow, setHoveredRow] = useState(null)
  const [menuRow, setMenuRow] = useState(null)
  const [readOnlyTip, setReadOnlyTip] = useState(null) // { x, y }
  const cols = ['Status', 'Priority', 'Assignee', 'Assigner', 'Mentions', 'Customers', 'Est. Revenue', 'Companies']
  const enrichedCols = ['Mentions', 'Customers', 'Est. Revenue', 'Companies']

  const showReadOnly = (e) => {
    setReadOnlyTip({ x: e.clientX + 10, y: e.clientY + 14 })
    setTimeout(() => setReadOnlyTip(null), 1800)
  }

  const enrichedCell = (row, rowIdx, content) => {
    const lowConf = row.panelMentions < 70
    return (
      <td
        className={`enriched-col${lowConf ? ' enriched-col--warn' : ''}`}
        onClick={showReadOnly}
      >
        {enriching ? <span className="loading-cell" /> : (
          <span className="enriched-cell-inner">
            {lowConf && (
              <span
                className="cell-warn-icon-wrap"
                onClick={(e) => { e.stopPropagation(); onOpenPanel(rowIdx) }}
                title="Low-confidence enrichment — click to view details"
              >
                <WarnTriangle />
              </span>
            )}
            {content}
          </span>
        )}
      </td>
    )
  }

  return (
    <div className="backlog-table-wrap" onClick={() => setReadOnlyTip(null)}>
      {readOnlyTip && (
        <div className="cell-readonly-tip" style={{ left: readOnlyTip.x, top: readOnlyTip.y }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="#888" strokeWidth="1.3"/>
            <path d="M4 4.5h4M4 6h2.5" stroke="#888" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          Read only
        </div>
      )}
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
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`table-row-clickable${panelRow === i ? ' row-selected' : ''}`}
              onClick={() => onOpenPanel(i)}
              onMouseEnter={() => setHoveredRow(i)}
              onMouseLeave={() => { setHoveredRow(null); setMenuRow(null) }}
            >
              <td className="row-num-col">
                <div className="row-num-cell">
                  {menuRow === i ? (
                    <RowMenu rowIndex={i} onOpenPanel={onOpenPanel} onClose={() => setMenuRow(null)} />
                  ) : null}
                  {hoveredRow === i ? (
                    <button className="row-menu-btn" onClick={(e) => { e.stopPropagation(); setMenuRow(i) }}>•••</button>
                  ) : (
                    <span className="row-num">{i + 1}</span>
                  )}
                </div>
              </td>
              <td className="summary-col" onClick={showReadOnly}>{row.summary}</td>
              <td onClick={showReadOnly}><span className={statusClass(row.status)}>{row.status}</span></td>
              <td onClick={showReadOnly}><span className={`priority-badge p-${row.priority.toLowerCase()}`}>{row.priority}</span></td>
              <td onClick={showReadOnly}><span className="avatar av-row">{row.assignee[0]}</span> {row.assignee}</td>
              <td onClick={showReadOnly}><span className="avatar av-row">{row.assigner[0]}</span> {row.assigner}</td>
              {enrichedCell(row, i, <span className="insight-num">{row.mentions}</span>)}
              {enrichedCell(row, i, <span className="insight-num">{row.customers}</span>)}
              {enrichedCell(row, i, <span className="insight-rev">{row.revenue}</span>)}
              {enrichedCell(row, i, <span className="insight-companies">{row.companies}</span>)}
              <td />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
