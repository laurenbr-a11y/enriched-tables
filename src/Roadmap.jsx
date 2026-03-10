import { useState, useRef, useEffect, useCallback } from 'react'

// ── Constants ──────────────────────────────────────────────
const ROW_HEIGHT = 44
const GROUP_HEIGHT = 48
const MONTH_WIDTH = 290
const TODAY = new Date('2026-03-09')
const MONTHS = [
  { year: 2026, month: 0, label: 'January 2026' },
  { year: 2026, month: 1, label: 'February 2026' },
  { year: 2026, month: 2, label: 'March 2026' },
  { year: 2026, month: 3, label: 'April 2026' },
  { year: 2026, month: 4, label: 'May 2026' },
  { year: 2026, month: 5, label: 'June 2026' },
]
const TIMELINE_START = new Date('2026-01-01')
const TIMELINE_END = new Date('2026-06-30')
const TOTAL_DAYS = Math.ceil((TIMELINE_END - TIMELINE_START) / 86400000) + 1
const TOTAL_WIDTH = MONTHS.length * MONTH_WIDTH

const GROUP_COLORS = ['#7B5EA7', '#5B9BD5', '#4CAF50']
const LIGHT_COLORS = ['#C5B8E8', '#A8CFEF', '#A8DFBA']

const PRIORITY_COLORS = { High: '#E53935', Medium: '#FB8C00', Low: '#43A047' }
const STATUS_COLORS = { Done: '#43A047', 'In Progress': '#1E88E5', 'To Do': '#9E9E9E', 'To do': '#9E9E9E' }

const INITIAL_GROUPS = [
  { id: 'g1', name: 'Authentication', colorIndex: 0, expanded: true, items: [
    { id: 'r1', name: 'Login UI Design',    start: '2026-01-05', end: '2026-01-25', priority: 'High',   status: 'Done',        effort: 15, deps: [], parentId: null },
    { id: 'r2', name: 'Registration Flow',  start: '2026-01-15', end: '2026-02-10', priority: 'High',   status: 'In Progress', effort: 20, deps: ['r1'], parentId: null },
    { id: 'r3', name: 'Password Recovery',  start: '2026-02-01', end: '2026-02-22', priority: 'High',   status: 'In Progress', effort: 14, deps: ['r2'], parentId: null },
    { id: 'r4', name: 'MFA Implementation', start: '2026-02-15', end: '2026-03-20', priority: 'High',   status: 'To do',       effort: 28, deps: ['r1'], parentId: null },
  ]},
  { id: 'g2', name: 'Core Experience', colorIndex: 1, expanded: true, items: [
    { id: 'r5', name: 'User Dashboard',    start: '2026-01-08', end: '2026-02-14', priority: 'High',   status: 'In Progress', effort: 30, deps: [], parentId: null },
    { id: 'r6', name: 'Backlog View',      start: '2026-02-01', end: '2026-03-15', priority: 'High',   status: 'In Progress', effort: 35, deps: ['r5'], parentId: null },
    { id: 'r7', name: 'Roadmap View',      start: '2026-03-01', end: '2026-04-30', priority: 'Medium', status: 'To do',       effort: 45, deps: ['r6'], parentId: null },
    { id: 'r8', name: 'API Documentation', start: '2026-03-15', end: '2026-04-15', priority: 'Medium', status: 'To do',       effort: 20, deps: [], parentId: null },
  ]},
  { id: 'g3', name: 'Integrations', colorIndex: 2, expanded: true, items: [
    { id: 'r9',  name: 'Jira Sync',       start: '2026-02-15', end: '2026-03-31', priority: 'High',   status: 'To do', effort: 35, deps: [], parentId: null },
    { id: 'r10', name: 'CSV Import',      start: '2026-03-01', end: '2026-03-31', priority: 'Medium', status: 'To do', effort: 20, deps: ['r9'], parentId: null },
    { id: 'r11', name: 'Webhook Support', start: '2026-04-01', end: '2026-05-15', priority: 'Low',    status: 'To do', effort: 35, deps: ['r9'], parentId: null },
  ]},
]

// ── Helpers ────────────────────────────────────────────────
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function dateToX(date) {
  const days = Math.floor((date - TIMELINE_START) / 86400000)
  return (days / TOTAL_DAYS) * TOTAL_WIDTH
}

function xToDate(x) {
  const days = Math.round((x / TOTAL_WIDTH) * TOTAL_DAYS)
  const d = new Date(TIMELINE_START)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(date) {
  const d = typeof date === 'string' ? parseDate(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function addDays(dateStr, days) {
  const d = parseDate(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function diffDays(startStr, endStr) {
  return Math.ceil((parseDate(endStr) - parseDate(startStr)) / 86400000)
}

function todayX() {
  return dateToX(TODAY)
}

// ── Fake feedback data ─────────────────────────────────────
const ITEM_INSIGHTS = {
  r1: { mentions: 47, revenue: '$2.1M', customers: 31, summary: 'Login UI improvements are widely requested. Users want clearer error states and faster load times on mobile.' },
  r2: { mentions: 38, revenue: '$1.8M', customers: 24, summary: 'Registration friction causes enterprise drop-off. Team invite and email verification steps are pain points.' },
  r3: { mentions: 29, revenue: '$980K', customers: 18, summary: 'Password reset links expire too quickly. Users confuse which email is tied to their account.' },
  r4: { mentions: 22, revenue: '$740K', customers: 15, summary: 'MFA and SAML SSO are deal blockers for financial services segment.' },
  r5: { mentions: 18, revenue: '$620K', customers: 11, summary: 'Dashboard lacks quick-access shortcuts and activity feed. Users want customizable home screens.' },
  r6: { mentions: 35, revenue: '$1.5M', customers: 28, summary: 'Backlog view needs bulk editing, conditional formatting, and column resizing to compete with Notion.' },
  r7: { mentions: 41, revenue: '$1.9M', customers: 32, summary: 'Roadmap view is a top-requested feature. Teams want Gantt, swimlanes, and dependency arrows.' },
  r8: { mentions: 14, revenue: '$410K', customers: 9, summary: 'API documentation quality directly impacts developer onboarding and partner integrations.' },
  r9: { mentions: 27, revenue: '$1.1M', customers: 19, summary: 'Jira sync would eliminate duplicate data entry for teams already using Atlassian tools.' },
  r10: { mentions: 19, revenue: '$680K', customers: 13, summary: 'CSV import is requested by SMBs migrating from spreadsheets. Special char encoding is a pain point.' },
  r11: { mentions: 12, revenue: '$390K', customers: 8, summary: 'Webhook support enables automation workflows that replace multiple manual processes.' },
}

function generateFakeFeedback(itemId, count = 10) {
  const names = ['John Butter','Sarah Kim','Marcus Lee','Priya Patel','Dan Rowe','Tara Singh','Leo Chen','Anna Flores','Chris Walton','Maya Johansson']
  const companies = ['Stripe','Figma','Notion','Linear','Vercel','Loom','Canva','GitHub','Slack','Dropbox']
  const types = ['Problem','Request','Praise']
  const quotes = [
    '"The current flow is too slow for our team daily use."',
    '"Would love to see this improved in the next release."',
    '"This feature saved us hours of manual work."',
    '"We need this before we can recommend you to our clients."',
    '"Best update in months — the team is thrilled."',
    '"Critical blocker for our enterprise rollout."',
    '"Our power users have been asking for this forever."',
    '"Competitors have this already — we need to catch up."',
    '"Just implemented and already saving us time."',
    '"This would unlock so many workflows for us."',
  ]
  return Array.from({ length: count }, (_, i) => ({
    type: types[(i + itemId.charCodeAt(1)) % 3],
    quote: quotes[i % quotes.length],
    author: names[i % names.length],
    company: companies[i % companies.length],
    date: ['1 week ago', '2 weeks ago', '1 month ago', '3 months ago'][i % 4],
    source: ['Call', 'Ticket', 'Message'][i % 3],
  }))
}

// ── Convert backlog rows → Gantt groups ─────────────────────
function rowsToGroups(rows) {
  const nonIdea = rows.filter(r => r.status !== 'Idea')
  const byPri = {
    High: nonIdea.filter(r => r.priority === 'High'),
    Medium: nonIdea.filter(r => r.priority === 'Medium'),
    Low: nonIdea.filter(r => !r.priority || r.priority === 'Low'),
  }
  let counter = 0
  const toItem = (row) => {
    const i = counter++
    const s = row.status
    let startOff, dur
    if (s === 'Done') {
      startOff = (i * 6) % 42; dur = 14 + (i % 3) * 7
    } else if (s === 'In Progress') {
      startOff = 32 + (i * 9) % 28; dur = 21 + (i % 4) * 7
    } else {
      startOff = 58 + (i * 11) % 52; dur = 14 + (i % 5) * 7
    }
    return {
      id: 'br' + (i + 100),
      name: (row.fullTitle || row.summary || 'Item').replace(/[…\.]+$/, '').trim().slice(0, 40),
      start: addDays('2026-01-01', startOff),
      end: addDays('2026-01-01', startOff + Math.min(dur, 55)),
      priority: row.priority || 'Medium',
      status: s, effort: dur, deps: [], parentId: null, _row: row,
    }
  }
  return [
    byPri.High.length  && { id: 'g1', name: 'High Priority',   colorIndex: 0, expanded: true, items: byPri.High.map(toItem) },
    byPri.Medium.length && { id: 'g2', name: 'Medium Priority', colorIndex: 1, expanded: true, items: byPri.Medium.map(toItem) },
    byPri.Low.length   && { id: 'g3', name: 'Low Priority',    colorIndex: 2, expanded: true, items: byPri.Low.map(toItem) },
  ].filter(Boolean)
}

// ── Row context menu for roadmap left panel ─────────────────
function RdmRowMenu({ item, onOpenPanel, onClose, onIndent, onOutdent }) {
  const menuItem = (icon, label, onClick, highlight) => (
    <div className={`row-ctx-item${highlight ? ' row-ctx-item--highlight' : ''}`} onClick={() => { onClick?.(); onClose() }}>
      <span className="row-ctx-icon">{icon}</span> {label}
    </div>
  )
  return (
    <div className="row-ctx-menu rdm-row-ctx-menu" onMouseLeave={onClose}>
      {menuItem(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4" y1="7.5" x2="10" y2="7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="4" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>, 'Open side panel', onOpenPanel, true)}
      {menuItem(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>, 'Comments', onOpenPanel)}
      {menuItem(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.6 3.5L7 9.5l-3.1 1.5.6-3.5L2 5l3.5-.5L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>, 'Enrichment', onOpenPanel)}
      <div className="row-ctx-divider" />
      {menuItem(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="8" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="2" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 8V6.5H7v-1M10.5 8V6.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, 'Add child', onIndent)}
      {menuItem(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="8" y="2" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="4" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 6v1.5H7v1M10.5 6v1.5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>, 'Add parent', onOutdent)}
    </div>
  )
}

// ── Inline SidePanel for Roadmap ───────────────────────────
function RoadmapSidePanel({ item, groupColor, onClose }) {
  const [tab, setTab] = useState('Insights')
  const ins = ITEM_INSIGHTS[item.id] || { mentions: 5, revenue: '$100K', customers: 3, summary: 'No insights available.' }
  const feedback = generateFakeFeedback(item.id, 10)

  return (
    <div className="side-panel" style={{ zIndex: 40 }}>
      <div className="sp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, overflow: 'hidden' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: groupColor, flexShrink: 0 }} />
          <div className="sp-title">{item.name}</div>
        </div>
        <div className="sp-header-actions">
          <div className="sp-icon-btn" onClick={onClose}>✕</div>
        </div>
      </div>
      <div className="sp-tabs">
        {['Details', 'Comments', 'Insights'].map(t => (
          <div key={t} className={`sp-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>
        ))}
      </div>
      <div className="sp-body">
        {tab === 'Details' && (
          <div className="sp-placeholder">
            <div className="sp-field">
              <span className="sp-field-label">Status</span>
              <span className="status-tag">{item.status}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">Priority</span>
              <span className="priority-badge" style={{ background: item.priority === 'High' ? '#FFE8E8' : item.priority === 'Medium' ? '#FFF0D0' : '#E8F5E9', color: item.priority === 'High' ? '#C00' : item.priority === 'Medium' ? '#A05000' : '#2E7D32' }}>{item.priority}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">Start</span>
              <span>{formatDate(item.start)}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">End</span>
              <span>{formatDate(item.end)}</span>
            </div>
            <div className="sp-field">
              <span className="sp-field-label">Effort</span>
              <span>{item.effort} days</span>
            </div>
          </div>
        )}
        {tab === 'Comments' && (
          <div className="sp-placeholder">
            <div className="sp-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, color: '#aaa', fontSize: 14 }}>
              <div style={{ fontSize: 28 }}>💬</div>
              <div>No comments yet</div>
            </div>
          </div>
        )}
        {tab === 'Insights' && (
          <div className="sp-insights">
            <div className="sp-section">
              <div className="sp-section-title">Summary</div>
              <p className="sp-summary-text">{ins.summary}</p>
            </div>
            <div className="sp-section">
              <div className="sp-section-title">Impact</div>
              <div className="sp-impact-grid">
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{ins.mentions}</div>
                  <div className="sp-impact-label">Customer mentions</div>
                </div>
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{ins.customers}</div>
                  <div className="sp-impact-label">Accounts impacted</div>
                </div>
                <div className="sp-impact-item">
                  <div className="sp-impact-num">{ins.revenue}</div>
                  <div className="sp-impact-label">Est. revenue</div>
                </div>
              </div>
            </div>
            <div className="sp-section sp-feedback-section">
              <div className="sp-feedback-header">
                <div className="sp-section-title">Customer Feedback</div>
              </div>
              <div className="sp-feedback-list">
                {feedback.map((fb, i) => (
                  <div key={i} className="sp-feedback-card">
                    <div className="sp-feedback-top">
                      <span className={`sp-feedback-type sp-type-${fb.type.toLowerCase()}`}>{fb.type}</span>
                      <span className="sp-date">{fb.date}</span>
                    </div>
                    <div className="sp-quote">{fb.quote}</div>
                    <div className="sp-author-row">
                      <strong className="sp-author">{fb.author}</strong> · {fb.company}
                    </div>
                    <div className="sp-card-footer">
                      <span className={`sp-card-tag sp-tag-source`}>{fb.source}</span>
                    </div>
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

// ── Bar Popover ────────────────────────────────────────────
function BarPopover({ item, groupColor, pos, onClose, onUpdateItem, onOpenPanel }) {
  const [effort, setEffort] = useState(String(item.effort))
  const [confirm, setConfirm] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleEffortChange = (val) => {
    setEffort(val)
    const days = parseInt(val, 10)
    if (!isNaN(days) && days > 0) {
      const newEnd = addDays(item.start, days)
      onUpdateItem(item.id, { effort: days, end: newEnd })
      setConfirm(true)
      setTimeout(() => setConfirm(false), 2000)
    }
  }

  const style = {
    top: Math.min(pos.y, window.innerHeight - 320),
    left: Math.min(pos.x, window.innerWidth - 300),
  }

  return (
    <div className="bar-popover" ref={ref} style={style}>
      <div className="bar-popover-title">{item.name}</div>
      <div className="bar-popover-field">
        <span className="status-tag">{item.status}</span>
        <span className="priority-badge" style={{ background: item.priority === 'High' ? '#FFE8E8' : item.priority === 'Medium' ? '#FFF0D0' : '#E8F5E9', color: item.priority === 'High' ? '#C00' : item.priority === 'Medium' ? '#A05000' : '#2E7D32' }}>{item.priority}</span>
      </div>
      <div className="bar-popover-field">
        <span style={{ color: '#888', fontSize: 12 }}>Start:</span>
        <span style={{ fontSize: 13 }}>{formatDate(item.start)}</span>
      </div>
      <div className="bar-popover-field">
        <span style={{ color: '#888', fontSize: 12 }}>End:</span>
        <span style={{ fontSize: 13 }}>{formatDate(item.end)}</span>
      </div>
      <div className="bar-popover-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <span style={{ color: '#888', fontSize: 12 }}>Effort (days)</span>
        <input
          className="bar-popover-input"
          type="number"
          min="1"
          value={effort}
          onChange={e => handleEffortChange(e.target.value)}
          style={{ width: 70, fontSize: 13, border: '1px solid #ddd', borderRadius: 5, padding: '4px 8px' }}
        />
        {confirm && <div className="bar-popover-confirm">End date updated ✓</div>}
      </div>
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 12, fontSize: 13, padding: '8px 0' }}
        onClick={() => { onOpenPanel(item); onClose() }}
      >
        Open side panel
      </button>
    </div>
  )
}

// ── Main RoadmapView ───────────────────────────────────────
export default function RoadmapView({ onGoBacklog, spaceName, onGoHome, backlogRows, PanelComponent }) {
  const [groups, setGroups] = useState(() => backlogRows ? rowsToGroups(backlogRows) : INITIAL_GROUPS)
  const [colorMode, setColorMode] = useState('Group') // Group | Priority | Status
  const [popover, setPopover] = useState(null) // { item, groupColor, pos }
  const [panelItem, setPanelItem] = useState(null) // item for side panel
  const [newBarId, setNewBarId] = useState(null)
  const [ghostBar, setGhostBar] = useState(null) // { rowId, x, width }
  const rightRef = useRef(null)
  let idCounter = useRef(100)

  // Drag-to-nest state
  const [dragging, setDragging] = useState(null)  // { itemId, groupId }
  const [dragOver, setDragOver] = useState(null)   // itemId
  const [hoveredItem, setHoveredItem] = useState(null)
  const [menuItem, setMenuItem] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Scroll to today on mount
  useEffect(() => {
    if (rightRef.current) {
      const tx = todayX()
      rightRef.current.scrollLeft = Math.max(0, tx - 200)
    }
  }, [])

  // ── Flat list of all items with y-positions (with nesting) ──
  const flatRows = []
  let yOffset = 0
  groups.forEach(g => {
    flatRows.push({ type: 'group', group: g, y: yOffset })
    yOffset += GROUP_HEIGHT
    if (g.expanded) {
      const roots = g.items.filter(i => !i.parentId)
      const getKids = (pid) => g.items.filter(i => i.parentId === pid)
      roots.forEach(item => {
        const kids = getKids(item.id)
        flatRows.push({ type: 'item', item, group: g, y: yOffset, depth: 0, childCount: kids.length })
        yOffset += ROW_HEIGHT
        kids.forEach(child => {
          flatRows.push({ type: 'item', item: child, group: g, y: yOffset, depth: 1 })
          yOffset += ROW_HEIGHT
        })
      })
    }
  })
  const totalHeight = yOffset

  // Get item by id across all groups
  const getItem = (id) => {
    for (const g of groups) {
      const item = g.items.find(i => i.id === id)
      if (item) return { item, group: g }
    }
    return null
  }

  // Get bar color
  const getBarColor = (item, group) => {
    if (colorMode === 'Priority') return PRIORITY_COLORS[item.priority] || '#9E9E9E'
    if (colorMode === 'Status') return STATUS_COLORS[item.status] || '#9E9E9E'
    return GROUP_COLORS[group.colorIndex]
  }

  // Update item across groups
  const updateItem = (itemId, changes) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(it => it.id === itemId ? { ...it, ...changes } : it),
    })))
  }

  // Toggle group expand
  const toggleGroup = (gId) => {
    setGroups(prev => prev.map(g => g.id === gId ? { ...g, expanded: !g.expanded } : g))
  }

  // Add item to group
  const addItem = (gId) => {
    const id = 'r' + (++idCounter.current)
    const start = TODAY.toISOString().slice(0, 10)
    const end = addDays(start, 14)
    const newItem = { id, name: 'New item', start, end, priority: 'Medium', status: 'To do', effort: 14, deps: [], parentId: null }
    setGroups(prev => prev.map(g => g.id === gId ? { ...g, items: [...g.items, newItem] } : g))
    setNewBarId(id)
    setTimeout(() => setNewBarId(null), 2500)
    // Scroll to today
    if (rightRef.current) {
      rightRef.current.scrollLeft = Math.max(0, todayX() - 200)
    }
  }

  // Click on empty timeline row area
  const handleRowClick = (e, gId, rowEl) => {
    if (e.target.closest('.rdm-bar')) return
    const rect = rowEl.getBoundingClientRect()
    const x = e.clientX - rect.left + (rightRef.current?.scrollLeft || 0)
    const clickDate = xToDate(x).toISOString().slice(0, 10)
    const id = 'r' + (++idCounter.current)
    const end = addDays(clickDate, 14)
    const newItem = { id, name: 'New item', start: clickDate, end, priority: 'Medium', status: 'To do', effort: 14, deps: [], parentId: null }
    setGroups(prev => prev.map(g => g.id === gId ? { ...g, items: [...g.items, newItem] } : g))
    setNewBarId(id)
    setTimeout(() => setNewBarId(null), 2500)
  }

  // Indent/outdent item (demo)
  const indentItem = (itemId) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(it => it.id === itemId ? { ...it, name: it.name.startsWith('  ') ? it.name : '  ' + it.name } : it),
    })))
  }
  const outdentItem = (itemId) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(it => it.id === itemId ? { ...it, name: it.name.replace(/^  /, '') } : it),
    })))
  }

  // Color mode cycle
  const cycleColorMode = () => {
    setColorMode(m => m === 'Group' ? 'Priority' : m === 'Priority' ? 'Status' : 'Group')
  }

  // ── Drag-to-nest handlers ──────────────────────────────────
  const handleDragStart = (e, itemId, groupId) => {
    setDragging({ itemId, groupId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, itemId) => {
    e.preventDefault()
    if (dragging && dragging.itemId !== itemId) {
      setDragOver(itemId)
    }
  }

  const handleDrop = (e, targetItemId, targetGroupId) => {
    e.preventDefault()
    if (!dragging) return
    const { itemId: draggedId, groupId: draggedGroupId } = dragging

    if (draggedId === targetItemId) {
      setDragging(null)
      setDragOver(null)
      return
    }

    // Find target item — don't allow nesting if target is already a child
    let targetItem = null
    for (const g of groups) {
      const found = g.items.find(i => i.id === targetItemId)
      if (found) { targetItem = found; break }
    }
    if (!targetItem) { setDragging(null); setDragOver(null); return }

    // Don't allow dropping onto a child (B already has a parentId)
    if (targetItem.parentId) {
      setDragging(null)
      setDragOver(null)
      return
    }

    // Don't allow dropping a parent-item onto one of its own children
    // (targetItemId must not be a child of draggedId)
    let draggedItem = null
    for (const g of groups) {
      const found = g.items.find(i => i.id === draggedId)
      if (found) { draggedItem = found; break }
    }
    if (draggedItem && draggedItem.parentId === null) {
      // draggedId is a root; check if targetItemId is one of its children
      for (const g of groups) {
        const isChild = g.items.some(i => i.id === targetItemId && i.parentId === draggedId)
        if (isChild) {
          setDragging(null)
          setDragOver(null)
          return
        }
      }
    }

    // Set dragged item's parentId = targetItemId
    setGroups(prev => prev.map(g => ({
      ...g,
      items: g.items.map(it => it.id === draggedId ? { ...it, parentId: targetItemId } : it),
    })))

    setDragging(null)
    setDragOver(null)
  }

  const handleDragEnd = () => {
    setDragging(null)
    setDragOver(null)
  }

  // ── Compute parent bars (all items including children) ─────
  const parentBars = groups.map(g => {
    if (!g.expanded || g.items.length === 0) return null
    const starts = g.items.map(i => parseDate(i.start))
    const ends = g.items.map(i => parseDate(i.end))
    const minStart = new Date(Math.min(...starts))
    const maxEnd = new Date(Math.max(...ends))
    return { group: g, minStart, maxEnd }
  })

  const HEADER_HEIGHT = 56 // month header height

  return (
    <div className="roadmap-page">
      {/* Sidebar (full height) */}
      <div className={`sidebar${sidebarCollapsed ? ' sidebar--collapsed' : ''}`} style={{ zIndex: 2 }}>
        <div className="sidebar-hamburger" onClick={() => setSidebarCollapsed(c => !c)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        {!sidebarCollapsed && (
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
            {[{icon:'⊞',label:'Overview'},{icon:'▤',label:'Backlog'},{icon:'↔',label:'Roadmap'}].map(it => (
              <div
                key={it.label}
                className={`sidebar-item ${it.label === 'Roadmap' ? 'active' : ''}`}
                onClick={it.label === 'Backlog' ? onGoBacklog : undefined}
                style={{ cursor: it.label === 'Backlog' ? 'pointer' : 'default' }}
              >
                <span className="sidebar-icon">{it.icon}</span>
                {it.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right column: topbar + toolbar + gantt */}
      <div className="rdm-right-col">
      {/* Topbar */}
      <div className="rdm-topbar">
        <div className="topbar-left">
          <div className="miro-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="#FFD02F"/>
              <path d="M19.5 7h-3l-4 6.5L10 7H7l4.5 7L7 21h3l2.5-4.5 2.5 4.5h3l-4.5-7L19.5 7z" fill="#050038"/>
            </svg>
          </div>
          <span className="topbar-board">{spaceName || 'Product Roadmap'}</span>
          <span className="badge-internal">Internal</span>
          <span className="topbar-menu-btn" style={{ color: '#888', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>⋮</span>
          <button className="btn-outline" style={{ fontSize: 12, padding: '5px 12px' }}>Go to canvas</button>
        </div>
        <div className="topbar-right">
          <span style={{ fontSize: 18, color: '#888', cursor: 'pointer', padding: '0 4px' }}>🔔</span>
          <span style={{ fontSize: 18, color: '#888', cursor: 'pointer', padding: '0 4px' }}>⋮</span>
          <div className="avatar" style={{ background: '#4262FF' }}>L</div>
          <button className="btn-share">Share</button>
        </div>
      </div>

      {/* Secondary toolbar */}
      <div className="rdm-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="rdm-synced-btn">↻ Synced</button>
          {['⊞','▤','▽','↕','🔗','⊿'].map(icon => (
            <span key={icon} className="toolbar-icon">{icon}</span>
          ))}
          <span style={{ width: 1, background: '#e8e8e8', height: 20, margin: '0 4px' }} />
          <button className="btn-outline-sm">Months ▾</button>
          <span className="toolbar-icon">📅</span>
          <span className="toolbar-icon">⊡</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-outline-sm rdm-colorby-btn" onClick={cycleColorMode}>
            Color by: {colorMode} ▾
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="roadmap-layout">

        {/* Left panel */}
        <div className="rdm-left">
          {/* Header cell matching month header height */}
          <div className="rdm-header-cell">
            <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Items</span>
          </div>

          {flatRows.map((flatRow, idx) => {
            if (flatRow.type === 'group') {
              const g = flatRow.group
              return (
                <div key={g.id}>
                  <div className="rdm-group-row" style={{ height: GROUP_HEIGHT }}>
                    <button className="rdm-expand-btn" onClick={() => toggleGroup(g.id)}>
                      {g.expanded ? '▾' : '▸'}
                    </button>
                    <span
                      className="rdm-group-label"
                      style={{ background: GROUP_COLORS[g.colorIndex] }}
                    >
                      {g.name}
                    </span>
                    <button className="rdm-add-btn" onClick={() => addItem(g.id)}>+</button>
                  </div>
                </div>
              )
            }

            if (flatRow.type === 'item') {
              const { item, group: g, depth, childCount } = flatRow
              const isChild = depth === 1
              const isParentWithKids = depth === 0 && childCount > 0

              return (
                <div
                  key={item.id}
                  className={`rdm-item-row${isChild ? ' rdm-item-row--child' : ''}`}
                  style={{
                    height: ROW_HEIGHT,
                    opacity: dragging?.itemId === item.id ? 0.4 : 1,
                    background: dragOver === item.id ? '#e8f0fe' : undefined,
                    outline: dragOver === item.id ? '2px dashed #4262FF' : undefined,
                    outlineOffset: dragOver === item.id ? '-2px' : undefined,
                    paddingLeft: isChild ? 44 : undefined,
                    position: 'relative',
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id, g.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id, g.id)}
                  onDragLeave={() => setDragOver(null)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => { setHoveredItem(null); setMenuItem(null) }}
                >
                  <div className="rdm-row-num-cell">
                    {menuItem === item.id ? (
                      <RdmRowMenu
                        item={item}
                        onOpenPanel={() => { setPanelItem(item); setMenuItem(null) }}
                        onClose={() => setMenuItem(null)}
                        onIndent={() => indentItem(item.id)}
                        onOutdent={() => outdentItem(item.id)}
                      />
                    ) : null}
                    {hoveredItem === item.id ? (
                      <button className="row-menu-btn" onClick={() => setMenuItem(item.id)}>•••</button>
                    ) : (
                      isChild
                        ? <span style={{ color: '#bbb', fontSize: 10 }}>•</span>
                        : isParentWithKids
                          ? <span style={{ color: '#666', fontSize: 11 }}>▾</span>
                          : null
                    )}
                  </div>
                  <span className="rdm-item-name">{item.name.trim()}</span>
                </div>
              )
            }

            return null
          })}
        </div>

        {/* Right panel — scrollable timeline */}
        <div className="rdm-right-wrap" ref={rightRef}>
          <div className="rdm-timeline" style={{ width: TOTAL_WIDTH, minWidth: TOTAL_WIDTH }}>
            {/* Month headers */}
            <div className="rdm-month-header">
              <div className="rdm-months-row">
                {MONTHS.map(m => (
                  <div key={m.label} className="rdm-month-cell" style={{ width: MONTH_WIDTH }}>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="rdm-grid" style={{ position: 'relative', height: totalHeight }}>
              {/* Month vertical lines */}
              {MONTHS.map((m, i) => (
                <div
                  key={i}
                  className="rdm-month-line"
                  style={{ left: i * MONTH_WIDTH, top: 0, bottom: 0 }}
                />
              ))}

              {/* Today line */}
              <div className="rdm-today-line" style={{ left: todayX() }}>
                <div className="rdm-today-dot" />
                <div className="rdm-today-label">Today</div>
              </div>

              {/* Row backgrounds + bars — iterate flatRows for correct y positions */}
              {(() => {
                // Group rows (backgrounds + parent bars)
                const groupEls = groups.map((g, gi) => {
                  const pb = parentBars[gi]
                  const groupRowData = flatRows.find(r => r.type === 'group' && r.group.id === g.id)
                  const groupY = groupRowData ? groupRowData.y : 0

                  return (
                    <div key={g.id + '-grp'}>
                      {/* Group row background */}
                      <div
                        className="rdm-grid-group-row"
                        style={{ position: 'absolute', top: groupY, left: 0, right: 0, height: GROUP_HEIGHT }}
                      >
                        {/* Parent bar spanning all group items */}
                        {pb && g.expanded && (() => {
                          const x1 = dateToX(pb.minStart)
                          const x2 = dateToX(pb.maxEnd)
                          return (
                            <div
                              className="rdm-parent-bar"
                              style={{
                                left: x1,
                                width: Math.max(4, x2 - x1),
                                background: GROUP_COLORS[g.colorIndex],
                              }}
                            />
                          )
                        })()}
                      </div>
                    </div>
                  )
                })

                // Item rows (bars)
                const itemEls = flatRows.filter(r => r.type === 'item').map(flatRow => {
                  const { item, group: g, y: itemY, depth, childCount } = flatRow
                  const isChild = depth === 1
                  const isParentWithKids = depth === 0 && (childCount || 0) > 0

                  // For parent items with children, show spanning bar instead of regular bar
                  if (isParentWithKids) {
                    // Compute span from all children's dates
                    const kids = g.items.filter(i => i.parentId === item.id)
                    if (kids.length > 0) {
                      const childStarts = kids.map(k => parseDate(k.start))
                      const childEnds = kids.map(k => parseDate(k.end))
                      const minStart = new Date(Math.min(...childStarts))
                      const maxEnd = new Date(Math.max(...childEnds))
                      const spanX1 = dateToX(minStart)
                      const spanX2 = dateToX(maxEnd)
                      const spanW = Math.max(4, spanX2 - spanX1)
                      const barColor = getBarColor(item, g)

                      return (
                        <div
                          key={item.id}
                          className="rdm-grid-item-row"
                          style={{ position: 'absolute', top: itemY, left: 0, right: 0, height: ROW_HEIGHT, cursor: 'default' }}
                        >
                          {/* Spanning parent bar */}
                          <div
                            style={{
                              position: 'absolute',
                              left: spanX1,
                              width: spanW,
                              height: 12,
                              top: 18,
                              borderRadius: 3,
                              background: barColor,
                              opacity: 0.65,
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      )
                    }
                  }

                  // Regular bar (childless root or child)
                  const x1 = dateToX(parseDate(item.start))
                  const x2 = dateToX(parseDate(item.end))
                  const barW = Math.max(4, x2 - x1)
                  const barColor = getBarColor(item, g)

                  return (
                    <div
                      key={item.id}
                      className="rdm-grid-item-row"
                      style={{ position: 'absolute', top: itemY, left: 0, right: 0, height: ROW_HEIGHT, cursor: 'crosshair' }}
                      onClick={(e) => {
                        if (!e.target.closest('.rdm-bar')) {
                          handleRowClick(e, g.id, e.currentTarget)
                        }
                      }}
                      onMouseMove={(e) => {
                        if (e.target.closest('.rdm-bar')) {
                          setGhostBar(null)
                          return
                        }
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left + (rightRef.current?.scrollLeft || 0)
                        const snappedDate = xToDate(x)
                        const ghostX = dateToX(snappedDate)
                        const ghostEnd = new Date(snappedDate)
                        ghostEnd.setDate(ghostEnd.getDate() + 7)
                        const ghostW = dateToX(ghostEnd) - ghostX
                        setGhostBar({ rowId: item.id, x: ghostX, width: ghostW })
                      }}
                      onMouseLeave={() => setGhostBar(null)}
                    >
                      {/* Ghost bar */}
                      {ghostBar && ghostBar.rowId === item.id && (
                        <div
                          className="rdm-ghost-bar"
                          style={{ left: ghostBar.x, width: ghostBar.width }}
                        />
                      )}

                      {/* Main bar */}
                      <div
                        className={`rdm-bar${newBarId === item.id ? ' rdm-bar-new' : ''}`}
                        style={{ left: x1, width: barW, background: barColor, position: 'absolute' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setPopover({ item, groupColor: GROUP_COLORS[g.colorIndex], pos: { x: e.clientX, y: e.clientY } })
                        }}
                      >
                        <span className="rdm-bar-label">{item.name.trim()}</span>
                        {barW > 120 && (
                          <span className="rdm-bar-dates">{formatDate(item.start)}</span>
                        )}
                        {barW > 200 && (
                          <span className="rdm-bar-dates">→ {formatDate(item.end)}</span>
                        )}
                      </div>
                    </div>
                  )
                })

                return [...groupEls, ...itemEls]
              })()}

            </div>
          </div>
        </div>

        {/* Side panel */}
        {panelItem && PanelComponent && (() => {
          const found = getItem(panelItem.id)
          const currentItem = found ? found.item : panelItem
          const row = currentItem._row
          if (!row) return null
          return (
            <div style={{ width: 420, flexShrink: 0, position: 'relative', borderLeft: '1px solid #e8e8e8' }}>
              <PanelComponent row={row} onClose={() => setPanelItem(null)} />
            </div>
          )
        })()}
      </div>

      {/* Bar popover */}
      {popover && (
        <BarPopover
          item={popover.item}
          groupColor={popover.groupColor}
          pos={popover.pos}
          onClose={() => setPopover(null)}
          onUpdateItem={updateItem}
          onOpenPanel={(item) => { setPanelItem(item); setPopover(null) }}
        />
      )}
      </div>{/* end rdm-right-col */}
    </div>
  )
}

// ── Sidebar for Roadmap (reused from App, with Roadmap active) ─
export function RoadmapSidebar({ onGoBacklog }) {
  const items = [
    { icon: '⊞', label: 'Overview' },
    { icon: '▤', label: 'Backlog' },
    { icon: '↔', label: 'Roadmap', isActive: true },
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-project">
        <strong>Product Roadmap</strong>
        <span className="sidebar-meta">1 member</span>
      </div>
      <div className="sidebar-section-label">Roadmap Planning</div>
      {items.map(it => (
        <div
          key={it.label}
          className={`sidebar-item ${it.isActive ? 'active' : ''}`}
          onClick={it.label === 'Backlog' ? onGoBacklog : undefined}
          style={it.label === 'Backlog' ? { cursor: 'pointer' } : {}}
        >
          <span className="sidebar-icon">{it.icon}</span>
          {it.label}
        </div>
      ))}
    </div>
  )
}
