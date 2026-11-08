import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Backup, Catalog, LocalSkill, SearchResults, SkillRoot } from '../types.js'
import type { Translate } from './messages.js'
import { bytes, Empty, Icon, Loader, Notice, rootLabel, StatusBadge, time } from './components.js'

/**
 * Panels that used to be inline JSX inside the page component. Splitting them
 * keeps the page an orchestrator (state, jobs, dialogs) and lets each panel own
 * the transient state it alone needs.
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
    <div className="skm-toolbar">
      <button className="skm-button" type="button" disabled={blocked || !writable} onClick={onWellKnown}><Icon name="down" size={15}/>{t('fromWellKnown')}</button>
    </div>
    <div className="skm-search-area">
      <form className="skm-search-form" onSubmit={event => { event.preventDefault(); void run(query) }}>
        <input className="skm-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} maxLength={200}/>
        <button type="submit" className="skm-button skm-button-primary" disabled={busy || !query.trim()}><Icon name={busy ? 'refresh' : 'search'} spin={busy}/>{t('searchButton')}</button>
      </form>
      <p className="skm-hint">{t('searchHint')}</p>
      <div className="skm-examples"><span className="skm-hint">{t('popular')}</span>{EXAMPLES.map(value => <button type="button" className="skm-example" key={value} disabled={busy} onClick={() => void run(value)}>{value}</button>)}</div>
    </div>
    {error && <><Notice text={error} kind="error"/><p className="skm-hint">{t('searchUnavailable')}</p></>}
    {busy ? <Loader text={`${t('search')}…`}/> : results ? results.items.length ? <div className="skm-results">{results.items.map((hit, index) => <article className="skm-result" key={`${hit.id}-${index}`}><div className="skm-card-head"><Icon name="book" size={17}/><strong className="skm-result-name">{hit.name}</strong></div><div className="skm-meta skm-mono">{hit.repository}</div><div className="skm-result-foot"><span className="skm-hint">{t('downloads', { count: new Intl.NumberFormat(locale).format(hit.installs) })}</span><div className="skm-result-actions"><a className="skm-source-link" href={hit.url} target="_blank" rel="noopener noreferrer">{t('resultOpen')} ↗</a><button className="skm-button skm-button-primary" type="button" disabled={blocked || !writable} onClick={() => onReview({ source: hit.repository, name: hit.name, ...(hit.skillId ? { skillId: hit.skillId } : {}) })}>{t('inspectInstall')}<Icon name="arrow" size={13}/></button></div></div></article>)}</div> : <Empty title={t('searchEmpty')} body={t('searchHint')} icon="search"/> : <Empty title={t('searchPrompt')} body={t('searchPromptBody')} icon="search"/>}
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
  return <article className="skm-card">
    <div className="skm-card-mark"><Icon name={skill.writable ? 'book' : 'lock'} size={17}/></div>
    <div className="skm-card-main skm-card-open" title={t('viewDetails')} onClick={() => open('detail')}>
      <div className="skm-card-head">
        <button type="button" className="skm-link-button" disabled={disabled} onClick={() => open('detail')}>{skill.name}</button>
        <StatusBadge skill={skill} t={t}/>
      </div>
      <p className="skm-description">{skill.description || skill.issue}</p>
      <div className="skm-meta">
        <span>{rootLabel(root, t)}</span>
        {skill.source && <span className="skm-mono">{skill.source.repository}</span>}
        {skill.source?.commit && skill.source.commit !== 'unknown' && <span className="skm-mono">{skill.source.commit.slice(0, 8)}</span>}
      </div>
      {skill.check?.status === 'error' && <p className="skm-hint" role="status">{skill.check.message}</p>}
    </div>
    <div className="skm-card-actions">
      <button type="button" className="skm-button skm-button-quiet" aria-label={`${t('viewDetails')} ${skill.name}`} title={t('viewDetails')} disabled={disabled} onClick={() => open('detail')}><Icon name="info" size={15}/></button>
      {skill.check?.status === 'update' && skill.writable && <button type="button" className="skm-button" disabled={disabled || jobActive} onClick={() => open('update')}><Icon name="up" size={13}/>{t('updateButton')}</button>}
      {skill.writable && <button type="button" className="skm-button skm-button-quiet skm-button-danger" aria-label={`${t('remove')} ${skill.name}`} title={`${t('remove')} ${skill.name}`} disabled={disabled} onClick={() => open('remove')}><Icon name="trash" size={15}/></button>}
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
  if (!backups.length) return <><Empty title={t('backupEmpty')} body={t('backupEmptyBody')} icon="archive"/><p className="skm-hint">{t('preserved')}</p></>
  const blocked = disabled || modalOpen
  const singleRoot = new Set(backups.map(backup => backup.rootId)).size === 1
  return <>
    <p className="skm-hint">{t('backupHint')}</p>
    {singleRoot && <div className="skm-toolbar"><button className="skm-button" type="button" disabled={blocked} onClick={() => onPurge({ rootId: backups[0]!.rootId, count: backups.length })}><Icon name="trash" size={15}/>{t('purgeAllTitle')}</button></div>}
    <div className="skm-list">{backups.map(backup => {
      const root = catalog?.roots.find(item => item.id === backup.rootId)
      const backupPath = root ? `${root.path}/.skills-manager/backups/${backup.id}` : ''
      return <article className="skm-card" key={`${backup.rootId}-${backup.id}`}>
        <div className="skm-card-mark skm-backup-icon"><Icon name="archive"/></div>
        <div className="skm-card-main">
          <div className="skm-card-head"><strong className="skm-result-name">{backup.name}</strong><span className="skm-badge">{t(backup.action === 'update' ? 'backupActionUpdate' : 'backupActionRemove')}</span></div>
          <div className="skm-meta" style={{ marginTop: 7 }}>
            <span>{time(backup.createdAt, locale)}</span>
            <span>{rootLabel(root, t)}</span>
            {typeof backup.sizeBytes === 'number' && <span>{bytes(backup.sizeBytes)} · {backup.fileCount ?? 0}</span>}
            {backup.source && <span className="skm-mono">{backup.source.repository}</span>}
            {backupPath && <span className="skm-mono skm-path-ellipsis" title={backupPath}>{backupPath}</span>}
          </div>
        </div>
        <button className="skm-button" type="button" disabled={blocked || !root?.writable} onClick={() => onRestore(backup)}><Icon name="restore" size={15}/>{t('restore')}</button>
        <button className="skm-button skm-button-quiet skm-button-danger" type="button" aria-label={`${t('deleteBackup')} ${backup.name}`} title={t('deleteBackup')} disabled={blocked || !root?.writable} onClick={() => onPurge({ rootId: backup.rootId, backup, count: 1 })}><Icon name="trash" size={15}/></button>
      </article>
    })}</div>
    <p className="skm-hint">{t('preserved')}</p>
  </>
}
