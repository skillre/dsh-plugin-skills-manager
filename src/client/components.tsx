import React, { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import type { LocalSkill, SkillRoot } from '../types.js'
import type { Translate } from './messages.js'

export function Icon({ name = 'book', size = 18, spin = false }: { name?: string; size?: number; spin?: boolean }): React.JSX.Element {
  const paths: Record<string, ReactNode> = {
    book: <><path d="M12 6.5C9.5 4.8 6.5 4.3 3 5v14c3.5-.7 6.5-.2 9 1.5C14.5 18.8 17.5 18.3 21 19V5c-3.5-.7-6.5-.2-9 1.5Z"/><path d="M12 6.5v14M6 9h3M6 12h3M15 9h3M15 12h3"/></>,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 7a7 7 0 0 1 11.8-1L20 9M4 15l2.1 3A7 7 0 0 0 18 17"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    down: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></>,
    up: <><path d="M12 17V3m-5 5 5-5 5 5M4 17v4h16v-4"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    warning: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 17h.01"/></>,
    arrow: <path d="m9 5 7 7-7 7"/>,
    back: <path d="m15 5-7 7 7 7"/>,
    archive: <><path d="M4 8h16v13H4V8Z"/><path d="M3 3h18v5H3V3ZM9 12h6"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></>,
    restore: <><path d="M3 4v6h6"/><path d="M3 10a9 9 0 1 1 1 8M12 7v5l3 2"/></>,
    link: <><path d="m10 14 4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l2-2a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(2 0) scale(.85)"/></>,
    move: <><path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={spin ? 'skm-spinner' : undefined}>{paths[name] ?? paths.book}</svg>
}
export function Loader({ text }: { text: string }): React.JSX.Element { return <div className="skm-loader" role="status"><Icon name="refresh" spin/>{text}</div> }
export function Empty({ title, body, children }: { title: string; body: string; children?: ReactNode }): React.JSX.Element {
  return <div className="skm-empty"><p className="skm-empty-title">{title}</p><p className="skm-empty-body">{body}</p>{children}</div>
}
export function Notice({ text, kind = 'info', onClose }: { text: string; kind?: string; onClose?: () => void }): React.JSX.Element {
  return <div className={`skm-notice skm-notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}><Icon name={kind === 'success' ? 'check' : kind === 'error' || kind === 'warning' ? 'warning' : 'lock'} size={16}/><span className="skm-notice-message">{text}</span>{onClose && <button className="skm-close" type="button" aria-label="×" onClick={onClose}><Icon name="close" size={14}/></button>}</div>
}
export function Steps({ steps, active }: { steps: string[]; active: number }): React.JSX.Element {
  return <ol className="skm-steps" aria-label={steps.join(' · ')}>{steps.map((label, index) => <li key={`${index}-${label}`} className={`skm-step${index === active ? ' skm-step-active' : index < active ? ' skm-step-done' : ''}`} aria-current={index === active ? 'step' : undefined}><span className="skm-step-index">{index < active ? <Icon name="check" size={11}/> : index + 1}</span><span className="skm-step-label">{label}</span></li>)}</ol>
}
export function StatusBadge({ skill, t }: { skill: LocalSkill; t: Translate }): React.JSX.Element {
  const status = !skill.valid ? 'invalid' : !skill.writable ? 'protected' : skill.check?.status ?? (skill.source ? 'unchecked' : 'untracked')
  const labels: Record<string, string> = { invalid: 'invalid', protected: 'protected', update: 'update', latest: 'latest', error: 'checkError', untracked: 'untracked', unchecked: 'unchecked' }
  return <span className={`skm-badge ${status === 'update' ? 'skm-badge-update' : status === 'latest' ? 'skm-badge-success' : status === 'error' || status === 'invalid' ? 'skm-badge-error' : ''}`}>{status === 'protected' && <Icon name="lock" size={10}/>} {t(labels[status] ?? 'unchecked')}</span>
}
export function ProgressBar({ value, label }: { value: number; label?: string }): React.JSX.Element {
  const percent = Math.max(0, Math.min(100, Math.round(value)))
  return <div className="skm-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={label}><div className="skm-progress-bar" style={{ width: `${percent}%` }}/></div>
}
export function rootLabel(root: SkillRoot | undefined, t: Translate): string { return root ? t(`root.${root.source}`) : '' }
export function bytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}
export function time(value: string, locale: string): string { return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
export function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error) }
export function Dialog({ title, t, children, footer, onClose, small = false, alert = false }: { title: string; t: Translate; children: ReactNode; footer?: ReactNode; onClose: () => void; small?: boolean; alert?: boolean }): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const root = ref.current
    // Focus the first control of the body (or the element that asked for it);
    // never park the ring on the close button just because it comes first.
    const body = root?.querySelector<HTMLElement>('.skm-modal-body')
    const first = body?.querySelector<HTMLElement>('[data-autofocus], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled)') ?? root?.querySelector<HTMLElement>('[data-autofocus]')
    ;(first ?? root)?.focus()
    return () => { if (previous?.isConnected) previous.focus() }
  }, [])
  return <div className="skm-backdrop" onPointerDown={event => { if (event.target === event.currentTarget) onClose() }}><div ref={ref} className={`skm-modal ${small ? 'skm-modal-small' : ''}`} role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return }
    if (event.key !== 'Tab') return
    const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]') ?? [])
    const first = nodes[0], last = nodes[nodes.length - 1]
    if (!first) { event.preventDefault(); ref.current?.focus() }
    else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }}><header className="skm-modal-header"><h2 id={titleId}>{title}</h2><button type="button" className="skm-close" aria-label={t('close')} onClick={onClose}><Icon name="close"/></button></header><div className="skm-modal-body">{children}</div>{footer && <footer className="skm-modal-footer">{footer}</footer>}</div></div>
}
