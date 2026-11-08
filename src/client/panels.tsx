import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Backup, Catalog, LocalSkill, SearchResults, SkillRoot } from '../types.js'
import type { Translate } from './messages.js'
import { bytes, Empty, Icon, Loader, Notice, rootLabel, StatusBadge, time } from './components.js'

/**
 * Panels that used to be inline JSX inside the page component. Splitting them
 * keeps the page an orchestrator (state, jobs, dialogs) and lets each panel own
 * the transient state it alone needs. Every card reuses the Settings card
 * contract of the host build: one clickable content block plus a quiet action
 * footer, so a list item never invents buttons on top of its own link.
 */

export interface DiscoverPanelProps {
  t: Translate
  locale: string
  writable: boolean
  disabled: boolean
  modalOpen: boolean
  search(query: string): Promise<SearchResults>
  onReview(hit: { source: string; name: string; skillId?: string }): void
  onWellKnown(): void
  onError(message: string): void
}

const EXAMPLES = ['browser', 'typescript', 'design', 'testing']

export function DiscoverPanel({ t, locale, writable, disabled, modalOpen, search, onReview, onWellKnown, onError }: DiscoverPanelProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const alive = useRef(true)
  const life = useRef(new AbortController())
  useEffect(() => {
    alive.current = true
    if (life.current.signal.aborted) life.current = new AbortController()
    return () => { alive.current = false; life.current.abort() }
  }, [])
  const run = useCallback(async (value: string): Promise<void> => {
    const trimmed = value.trim()
    if (!trimmed || busy) return
    setQuery(value); setBusy(true); setError('')
    try {
      const value = await search(trimmed)
      if (alive.current) setResults(value)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught)
      if (alive.current) { setError(message); onError(message) }
    }
    finally { if (alive.current) setBusy(false) }
  }, [busy, onError, search])
  const blocked = disabled || modalOpen
  return <>
    <div className="skm-panel-actions">
      <button className="skm-button" type="button" disabled={blocked || !writable} onClick={onWellKnown}><Icon name="down" size={15}/>{t('fromWellKnown')}</button>
    </div>
    <div className="skm-search-block">
      <form className="skm-search-row" onSubmit={event => { event.preventDefault(); void run(query) }}>
        <label className="skm-search skm-search-wide"><Icon name="search" size={16}/><input className="skm-search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} maxLength={200}/></label>
        <button type="submit" className="skm-button skm-button-primary" disabled={busy || !query.trim()}><Icon name={busy ? 'refresh' : 'search'} size={15} spin={busy}/>{t('searchButton')}</button>
      </form>
      <p className="skm-hint">{t('searchHint')}</p>
      <div className="skm-examples"><span className="skm-hint">{t('popular')}</span>{EXAMPLES.map(value => <button type="button" className="skm-example" key={value} disabled={busy} onClick={() => void run(value)}>{value}</button>)}</div>
    </div>
    {error && <><Notice text={error} kind="error"/><p className="skm-hint">{t('searchUnavailable')}</p></>}
    {busy ? <Loader text={`${t('search')}…`}/> : results ? results.items.length ? <div className="skm-list">{results.items.map((hit, index) => <article className="skm-card" key={`${hit.id}-${index}`}>
      <div className="skm-card-body">
        <div className="skm-card-head"><span className="skm-card-title">{hit.name}</span></div>
        <div className="skm-card-meta"><span className="skm-identity">{hit.repository}</span><span className="skm-meta-text">{t('downloads', { count: new Intl.NumberFormat(locale).format(hit.installs) })}</span></div>
      </div>
      <div className="skm-card-foot">
        <a className="skm-link-button skm-link" href={hit.url} target="_blank" rel="noopener noreferrer">{t('resultOpen')} ↗</a>
        <button className="skm-button skm-button-primary skm-button-small" type="button" disabled={blocked || !writable} onClick={() => onReview({ source: hit.repository, name: hit.name, ...(hit.skillId ? { skillId: hit.skillId } : {}) })}>{t('inspectInstall')}<Icon name="arrow" size={13}/></button>
      </div>
    </article>)}</div> : <Empty title={t('searchEmpty')} body={t('searchHint')}/> : <Empty title={t('searchPrompt')} body={t('searchPromptBody')}/>}
  </>
}

export interface SkillCardProps {
  skill: LocalSkill
  root: SkillRoot | undefined
  t: Translate
  disabled: boolean
  jobActive: boolean
  onOpen(action: 'detail' | 'update' | 'remove'): void
}

export function SkillCard({ skill, root, t, disabled, jobActive, onOpen }: SkillCardProps): React.JSX.Element {
  const open = (action: 'detail' | 'update' | 'remove') => { if (!disabled) onOpen(action) }
  return <article className="skm-card" data-invalid={skill.valid ? undefined : 'true'}>
    <button type="button" className="skm-card-content" disabled={disabled} onClick={() => open('detail')}>
      <span className="skm-card-head"><span className="skm-card-title">{skill.name}</span><StatusBadge skill={skill} t={t}/></span>
      <span className="skm-card-desc">{skill.description || skill.issue}</span>
      <span className="skm-card-meta">
        <span className="skm-meta-text">{rootLabel(root, t)}</span>
        {skill.source && <span className="skm-identity">{skill.source.repository}</span>}
        {skill.source?.commit && skill.source.commit !== 'unknown' && <span className="skm-identity">{skill.source.commit.slice(0, 8)}</span>}
      </span>
    </button>
    {skill.check?.status === 'error' && <p className="skm-card-error skm-card-error-outside" role="status">{skill.check.message}</p>}
    <div className="skm-card-foot">
      <div className="skm-card-actions">
        <button type="button" className="skm-link-button" aria-label={`${t('viewDetails')} ${skill.name}`} disabled={disabled} onClick={() => open('detail')}>{t('viewDetails')}</button>
        {skill.check?.status === 'update' && skill.writable && <button type="button" className="skm-link-button skm-link-accent" disabled={disabled || jobActive} onClick={() => open('update')}>{t('updateButton')}</button>}
        {skill.writable && <button type="button" className="skm-link-button skm-link-danger" aria-label={`${t('remove')} ${skill.name}`} disabled={disabled} onClick={() => open('remove')}>{t('remove')}</button>}
      </div>
    </div>
  </article>
}

export interface BackupsPanelProps {
  t: Translate
  locale: string
  catalog: Catalog | null
  backups: Backup[]
  loading: boolean
  disabled: boolean
  modalOpen: boolean
  onRestore(backup: Backup): void
  onPurge(state: { rootId: string; backup?: Backup | undefined; count: number }): void
}

export function BackupsPanel({ t, locale, catalog, backups, loading, disabled, modalOpen, onRestore, onPurge }: BackupsPanelProps): React.JSX.Element {
  if (loading) return <Loader text={t('loading')}/>
  if (!backups.length) return <><Empty title={t('backupEmpty')} body={t('backupEmptyBody')}/><p className="skm-hint">{t('preserved')}</p></>
  const blocked = disabled || modalOpen
  const singleRoot = new Set(backups.map(backup => backup.rootId)).size === 1
  return <>
    {singleRoot && <div className="skm-panel-actions"><button className="skm-button" type="button" disabled={blocked} onClick={() => onPurge({ rootId: backups[0]!.rootId, count: backups.length })}><Icon name="trash" size={15}/>{t('purgeAllTitle')}</button></div>}
    <p className="skm-hint">{t('backupHint')}</p>
    <div className="skm-list">{backups.map(backup => {
      const root = catalog?.roots.find(item => item.id === backup.rootId)
      const backupPath = root ? `${root.path}/.skills-manager/backups/${backup.id}` : ''
      return <article className="skm-card" key={`${backup.rootId}-${backup.id}`}>
        <div className="skm-card-body">
          <div className="skm-card-head"><span className="skm-card-title">{backup.name}</span><span className="skm-badge">{t(backup.action === 'update' ? 'backupActionUpdate' : 'backupActionRemove')}</span></div>
          <div className="skm-card-meta">
            <span className="skm-meta-text">{time(backup.createdAt, locale)}</span>
            <span className="skm-meta-text">{rootLabel(root, t)}</span>
            {typeof backup.sizeBytes === 'number' && <span className="skm-meta-text">{bytes(backup.sizeBytes)} · {t('files', { count: backup.fileCount ?? 0 })}</span>}
            {backup.source && <span className="skm-identity">{backup.source.repository}</span>}
          </div>
          {backupPath && <p className="skm-card-path skm-mono" title={backupPath}>{backupPath}</p>}
        </div>
        <div className="skm-card-foot">
          <div className="skm-card-actions">
            <button className="skm-link-button skm-link-accent" type="button" disabled={blocked || !root?.writable} onClick={() => onRestore(backup)}>{t('restore')}</button>
            <button className="skm-link-button skm-link-danger" type="button" aria-label={`${t('deleteBackup')} ${backup.name}`} disabled={blocked || !root?.writable} onClick={() => onPurge({ rootId: backup.rootId, backup, count: 1 })}>{t('deleteBackup')}</button>
          </div>
        </div>
      </article>
    })}</div>
    <p className="skm-hint">{t('preserved')}</p>
  </>
}
