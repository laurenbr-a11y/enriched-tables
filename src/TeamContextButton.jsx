import { useState } from 'react'

export default function TeamContextButton({ teamContext, onUpdateContext }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleOpen = () => {
    setDraft(teamContext || '')
    setConfirmed(false)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setConfirmed(false)
  }

  const handleSave = () => {
    if (!draft.trim()) return
    onUpdateContext(draft.trim())
    setConfirmed(true)
    setTimeout(() => {
      setOpen(false)
      setConfirmed(false)
    }, 2800)
  }

  return (
    <div className="tcb-wrap">
      <button className={`tcb-btn${teamContext ? ' tcb-btn--set' : ''}`} onClick={open ? handleClose : handleOpen}>
        {teamContext ? (
          <>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="6.5" cy="6.5" r="2.5" fill="currentColor" opacity=".35"/>
              <circle cx="6.5" cy="6.5" r="1" fill="currentColor"/>
            </svg>
            Team context
            <span className="tcb-dot" />
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
              <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
              <circle cx="6.5" cy="6.5" r="1" fill="currentColor" opacity=".5"/>
            </svg>
            Add team context
          </>
        )}
      </button>

      {open && (
        <div className="tcb-popover">
          {!confirmed ? (
            <>
              <div className="tcb-head">
                <div className="tcb-title">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke="#4262FF" strokeWidth="1.4"/>
                    <circle cx="7" cy="7" r="2.8" fill="#4262FF" opacity=".25"/>
                    <circle cx="7" cy="7" r="1.1" fill="#4262FF"/>
                  </svg>
                  Team context
                </div>
                <button className="tcb-x" onClick={handleClose}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
              <p className="tcb-desc">
                The AI uses your team's ownership and goals to find the most relevant signals in customer feedback and surface high-confidence insights.
              </p>
              <label className="tcb-label">Ownership &amp; goals</label>
              <textarea
                className="tcb-textarea"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="e.g., We own the onboarding experience. Our goal is to reduce time-to-value for new enterprise customers and improve activation rates."
                rows={4}
                autoFocus
              />
              <div className="tcb-actions">
                <button className="btn-outline" style={{ fontSize: 12, padding: '5px 14px' }} onClick={handleClose}>Cancel</button>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12, padding: '5px 14px' }}
                  onClick={handleSave}
                  disabled={!draft.trim()}
                >
                  Save context
                </button>
              </div>
            </>
          ) : (
            <div className="tcb-confirmed">
              <div className="tcb-confirmed-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10.5l4 4 8-8" stroke="#4CAF50" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="tcb-confirmed-title">Context saved</div>
              <p className="tcb-confirmed-desc">
                The AI will now use this to find the best signals and surface insights aligned with your team's goals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
