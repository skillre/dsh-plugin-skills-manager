import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { Backup, BatchUpdateResult, Catalog, LocalSkill, MutationResult, SearchResults, UpdateCheck } from '../types.js'
import { LOCALE_NAMESPACE, PANEL_ID } from '../types.js'
import { createApi } from './contracts.js'
import type { ClientApi, ClientContext, ClientLocale } from './contracts.js'
import { en, zh } from './messages.js'
import type { Translate } from './messages.js'
import { bytes, Empty, errorText, Icon, Loader, Notice, rootLabel, StatusBadge, time } from './components.js'
import { BatchUpdateDialog, InstallDialog, LocalInstallDialog, MoveDialog, PurgeDialog, RestoreDialog, SkillDialog, WellKnownInstallDialog } from './dialogs.js'
import css from './styles.css'

export const name = 'skillre-skills-manager-client'
export const inject = ['slots', 'locale', 'connection']
interface PageProps { api: ClientApi; localeService: ClientLocale; t: Translate }
type Tab = 'local' | 'discover' | 'updates' | 'backups'
export function SkillsPage({ api, localeService, t }: PageProps): React.JSX.Element {
  const localeState = useSyncExternalStore(listener => localeService.subscribe(listener), () => localeService.getSnapshot(), () => localeService.getSnapshot())
  const locale = localeState.active
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [tab, setTab] = useState<Tab>('local')
  const [workspaceId, setWorkspaceId] = useState('')
  const [location, setLocation] = useState('all')
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<{ text: string; kind: string } | null>(null)
  const [install, setInstall] = useState<{ source: string; name: string } | null>(null)
  const [selected, setSelected] = useState<{ skill: LocalSkill; action: 'detail' | 'update' | 'remove' } | null>(null)
  const [restore, setRestore] = useState<Backup | null>(null)
  const [move, setMove] = useState<LocalSkill | null>(null)
  const [pendingBatch, setPendingBatch] = useState<LocalSkill[] | null>(null)
  const [purge, setPurge] = useState<{ rootId: string; backup?: Backup; count: number } | null>(null)
  const [local, setLocal] = useState(false)
  const [wellKnown, setWellKnown] = useState(false)
  const alive = useRef(true)
  const life = useRef(new AbortController())
  const sequence = useRef(0)
  const backupSequence = useRef(0)
  const scope = workspaceId ? { workspaceId } : {}
  const readBackups = useCallback(async () => {
    const seq = ++backupSequence.current
    setBackupLoading(true)
    try {
      const value = await api.call<Backup[]>({ action: 'backups', ...(workspaceId ? { workspaceId } : {}) }, life.current.signal)
      if (alive.current && seq === backupSequence.current) setBackups(value)
    } catch (error) { if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: 'error' }) }
    finally { if (alive.current && seq === backupSequence.current) setBackupLoading(false) }
  }, [api, workspaceId])
  const reload = useCallback(async () => {
    const seq = ++sequence.current
    setLoading(true)
    try {
      const value = await api.call<Catalog>({ action: 'list', ...(workspaceId ? { workspaceId } : {}) }, life.current.signal)
      if (alive.current && seq === sequence.current) setCatalog(value)
    } catch (error) { if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: 'error' }) }
    finally { if (alive.current && seq === sequence.current) setLoading(false) }
  }, [api, workspaceId])
  useEffect(() => {
    alive.current = true
    life.current = new AbortController()
    setLocation('all'); setBackups([])
    void reload()
    return () => { alive.current = false; life.current.abort(); sequence.current++; backupSequence.current++ }
  }, [reload])
  useEffect(() => { if (tab === 'backups') void readBackups() }, [tab, readBackups])
  async function checkUpdates(): Promise<void> {
    if (busy || loading) return
    setBusy(t('checking')); setNotice(null)
    try {
      const checks = await api.call<UpdateCheck[]>({ action: 'check', ...scope }, life.current.signal)
      if (alive.current) setNotice({ text: t('checkingDone', { updates: checks.filter(item => item.status === 'update').length, latest: checks.filter(item => item.status === 'latest').length, untracked: checks.filter(item => item.status === 'untracked').length, errors: checks.filter(item => item.status === 'error').length }), kind: checks.some(item => item.status === 'error') ? 'warning' : 'success' })
      await reload()
    } catch (error) { if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: 'error' }) }
    finally { if (alive.current) setBusy('') }
  }
  async function search(value = query): Promise<void> {
    if (!value.trim() || busy) return
    setQuery(value); setBusy(t('search')); setNotice(null)
    try {
      const results = await api.call<SearchResults>({ action: 'search', query: value.trim(), limit: 24 }, life.current.signal)
      if (alive.current) setSearchResults(results)
    } catch (error) { if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: 'error' }) }
    finally { if (alive.current) setBusy('') }
  }
  function mutated(result: MutationResult): void {
    if (!alive.current) return
    setInstall(null); setSelected(null); setRestore(null); setMove(null); setLocal(false); setPendingBatch(null); setPurge(null); setWellKnown(false)
    const labels: Record<MutationResult['action'], string> = { install: 'installed', update: 'updated', remove: 'removed', restore: 'restored', 'restore-to': 'restored', move: 'moved', 'install-local': 'localInstalled', 'well-known-install': 'wellKnownDone' }
    setNotice(result.warning ? { text: `${t(labels[result.action], { name: result.name })} ${result.warning}`, kind: 'warning' } : { text: t(labels[result.action], { name: result.name }), kind: 'success' })
  }
  function batchDone(result: BatchUpdateResult): void {
    if (!alive.current) return
    setPendingBatch(null)
    setNotice({ text: t('batchResult', { updated: result.updated, skipped: result.skipped, failed: result.failed }), kind: result.failed ? 'warning' : 'success' })
    void reload()
  }
  function purged(removed: number, freedBytes: number): void {
    if (!alive.current) return
    setPurge(null)
    setNotice({ text: t('purged', { count: removed, bytes: bytes(freedBytes) }), kind: 'success' })
    void readBackups()
  }
  function settled(): void { if (alive.current) { void reload(); if (tab === 'backups') void readBackups() } }
  const modalOpen = !!install || !!selected || !!restore
  const disabled = !!busy || loading
  const writable = !!catalog?.roots.some(root => root.writable)
  const updates = catalog?.skills.filter(skill => skill.check?.status === 'update') ?? []
  const anyChecked = catalog?.skills.some(skill => !!skill.check) ?? false
  const visible = (catalog?.skills ?? []).filter(skill => (tab !== 'updates' || skill.check?.status === 'update') && (location === 'all' || skill.rootId === location) && `${skill.name} ${skill.description} ${skill.source?.repository ?? ''}`.toLowerCase().includes(filter.toLowerCase().trim()))
  const common = catalog ? { api, t, locale, catalog, workspaceId, onBusy: (value: boolean, label?: string) => { if (alive.current) setBusy(value ? label ?? t('loading') : '') }, onMutated: mutated, onError: (text: string) => { if (alive.current) setNotice({ text, kind: 'error' }) }, onSettled: settled } : null
  return <section className="skm-page" aria-label={t('title')}><style>{css}</style><div className="skm-wrap">
    <header className="skm-header"><div><div className="skm-title-row"><div className="skm-title-mark"><Icon name="book" size={24}/></div><h1 className="skm-title">{t('title')}</h1></div><p className="skm-subtitle">{t('subtitle')}</p></div><div className="skm-actions">
      <button className="skm-button skm-button-quiet" type="button" aria-label={t('refresh')} title={t('refresh')} disabled={disabled || modalOpen} onClick={() => { void reload(); if (tab === 'backups') void readBackups() }}><Icon name="refresh"/></button>
      <button className="skm-button" type="button" disabled={disabled || modalOpen || !catalog} onClick={() => void checkUpdates()}><Icon name="refresh" spin={!!busy && busy === t('checking')}/>{busy === t('checking') ? t('checking') : t('check')}</button>
      <button className="skm-button" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setLocal(true)}><Icon name="down" size={16}/>{t('fromLocal')}</button>
      <button className="skm-button skm-button-primary" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setInstall({ source: '', name: '' })}><Icon name="plus" size={16}/>{t('fromRepo')}</button>
    </div></header>
    <div className="skm-stats" aria-label={t('metadata')}><div className="skm-stat"><span className="skm-stat-label">{t('found')}</span><span className="skm-stat-value">{catalog ? catalog.skills.length : '—'}</span></div><div className="skm-stat skm-stat-accent"><span className="skm-stat-label">{t('available')}</span><span className="skm-stat-value">{anyChecked ? updates.length : '—'}</span></div><div className="skm-stat"><span className="skm-stat-label">{t('readonly')}</span><span className="skm-stat-value">{catalog ? catalog.skills.filter(skill => !skill.writable).length : '—'}</span></div></div>
    <div className="skm-tabs" role="tablist" aria-label={t('title')}>{(['local', 'discover', 'updates', 'backups'] as Tab[]).map(item => <button type="button" className="skm-tab" id={`skm-tab-${item}`} key={item} role="tab" aria-selected={tab === item} aria-controls={`skm-panel-${item}`} onClick={() => setTab(item)}>{t(item)}{item === 'updates' && updates.length > 0 && <span className="skm-count">{updates.length}</span>}</button>)}</div>
    {notice && <Notice text={notice.text} kind={notice.kind} onClose={() => setNotice(null)}/>}
    {catalog && !catalog.mutationsAllowed && <Notice text={t('readOnlyMode')}/>}
    {catalog?.warnings.length ? <details className="skm-notice skm-notice-warning"><summary>{t('warningTitle')} · {catalog.warnings.length}</summary><ul className="skm-warning-list">{catalog.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details> : null}
    {catalog?.truncated && <Notice text={t('truncated')} kind="warning"/>}
    <div role="tabpanel" id={`skm-panel-${tab}`} aria-labelledby={`skm-tab-${tab}`}>
      {(tab === 'local' || tab === 'updates' || tab === 'backups') && <div className="skm-toolbar">
        {tab !== 'backups' && <input className="skm-input skm-filter" value={filter} onChange={event => setFilter(event.target.value)} placeholder={t('filter')} aria-label={t('filter')}/>}
        <select className="skm-select skm-scope" value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} disabled={!!busy || modalOpen || loading} aria-label={t('scope')}><option value="">{t('global')}</option>{catalog?.workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}</select>
        {tab !== 'backups' && <select className="skm-select skm-location" value={location} onChange={event => setLocation(event.target.value)} aria-label={t('location')}><option value="all">{t('allRoots')}</option>{catalog?.roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)}</option>)}</select>}
      </div>}
      {(tab === 'local' || tab === 'updates') && <>
        {loading && !catalog ? <Loader text={t('loading')}/> : !catalog ? <Empty title={t('requestFailed')} body={t('retry')}><button className="skm-button" onClick={() => void reload()}>{t('retry')}</button></Empty> : visible.length ? <div className="skm-list" aria-busy={loading || !!busy}>{visible.map(skill => <article className="skm-card" key={skill.id}><div className="skm-card-mark"><Icon name={skill.writable ? 'book' : 'lock'} size={17}/></div><div className="skm-card-main"><div className="skm-card-head"><button type="button" className="skm-link-button" disabled={disabled || modalOpen} onClick={() => setSelected({ skill, action: 'detail' })}>{skill.name}</button><StatusBadge skill={skill} t={t}/></div><p className="skm-description">{skill.description || skill.issue}</p><div className="skm-meta"><span>{rootLabel(catalog.roots.find(root => root.id === skill.rootId), t)}</span>{skill.source && <span className="skm-mono">{skill.source.repository}</span>}{skill.source?.commit && skill.source.commit !== 'unknown' && <span className="skm-mono">{skill.source.commit.slice(0, 8)}</span>}</div>{skill.check?.status === 'error' && <p className="skm-hint" role="status">{skill.check.message}</p>}</div><div className="skm-card-actions">{skill.check?.status === 'update' && skill.writable && <button type="button" className="skm-button" disabled={disabled || modalOpen} onClick={() => setSelected({ skill, action: 'update' })}><Icon name="up" size={13}/>{t('updateButton')}</button>}{skill.writable && <button type="button" className="skm-button skm-button-quiet skm-button-danger" aria-label={`${t('remove')} ${skill.name}`} title={`${t('remove')} ${skill.name}`} disabled={disabled || modalOpen} onClick={() => setSelected({ skill, action: 'remove' })}><Icon name="trash" size={15}/></button>}</div></article>)}</div> : <Empty title={filter || location !== 'all' ? t('noMatches') : t(tab === 'updates' ? 'updatesEmpty' : 'empty')} body={t(tab === 'updates' ? 'updatesEmptyBody' : 'emptyBody')} icon={tab === 'updates' ? 'refresh' : 'book'}>{writable && tab === 'local' && !filter && <button className="skm-button skm-button-primary" onClick={() => setInstall({ source: '', name: '' })}>{t('install')}</button>}</Empty>}
      </>}
      {tab === 'discover' && <><div className="skm-toolbar"><button className="skm-button" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setWellKnown(true)}><Icon name="down" size={15}/>{t('fromWellKnown')}</button></div><div className="skm-search-area"><form className="skm-search-form" onSubmit={event => { event.preventDefault(); void search() }}><input className="skm-input" value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} aria-label={t('search')} maxLength={200}/><button type="submit" className="skm-button skm-button-primary" disabled={!!busy || !query.trim()}><Icon name={busy ? 'refresh' : 'search'} spin={!!busy}/>{t('searchButton')}</button></form><p className="skm-hint">{t('searchHint')}</p><div className="skm-examples"><span className="skm-hint">{t('popular')}</span>{['browser', 'typescript', 'design', 'testing'].map(value => <button type="button" className="skm-example" key={value} disabled={!!busy} onClick={() => void search(value)}>{value}</button>)}</div></div>
        {busy ? <Loader text={`${t('search')}…`}/> : searchResults ? searchResults.items.length ? <div className="skm-results">{searchResults.items.map((hit, index) => <article className="skm-result" key={`${hit.id}-${index}`}><div className="skm-card-head"><Icon name="book" size={17}/><strong className="skm-result-name">{hit.name}</strong></div><div className="skm-meta skm-mono">{hit.repository}</div><div className="skm-result-foot"><span className="skm-hint">{t('downloads', { count: new Intl.NumberFormat(locale).format(hit.installs) })}</span><button className="skm-button" type="button" disabled={disabled || !writable || modalOpen} onClick={() => setInstall({ source: hit.repository, name: hit.name })}>{t('inspectInstall')}<Icon name="arrow" size={13}/></button></div></article>)}</div> : <Empty title={t('searchEmpty')} body={t('searchHint')} icon="search"/> : <Empty title={t('searchPrompt')} body={t('searchPromptBody')} icon="search"/>}
      </>}
      {tab === 'backups' && <>{backupLoading ? <Loader text={t('loading')}/> : backups.length ? <>{new Set(backups.map(backup => backup.rootId)).size === 1 && <div className="skm-toolbar"><button className="skm-button" type="button" disabled={disabled || modalOpen} onClick={() => setPurge({ rootId: backups[0]!.rootId, count: backups.length })}><Icon name="trash" size={15}/>{t('purgeAllTitle')}</button></div>}<div className="skm-list">{backups.map(backup => <article className="skm-card" key={`${backup.rootId}-${backup.id}`}><div className="skm-card-mark skm-backup-icon"><Icon name="archive"/></div><div className="skm-card-main"><div className="skm-card-head"><strong className="skm-result-name">{backup.name}</strong><span className="skm-badge">{t(backup.action === 'update' ? 'backupActionUpdate' : 'backupActionRemove')}</span></div><div className="skm-meta" style={{ marginTop: 7 }}><span>{time(backup.createdAt, locale)}</span><span>{rootLabel(catalog?.roots.find(root => root.id === backup.rootId), t)}</span>{typeof backup.sizeBytes === 'number' && <span>{bytes(backup.sizeBytes)} · {backup.fileCount ?? 0}</span>}{backup.source && <span className="skm-mono">{backup.source.repository}</span>}</div></div><button className="skm-button" type="button" disabled={disabled || !catalog?.roots.find(root => root.id === backup.rootId)?.writable || modalOpen} onClick={() => setRestore(backup)}><Icon name="restore" size={15}/>{t('restore')}</button><button className="skm-button skm-button-quiet skm-button-danger" type="button" aria-label={`${t('purgeTitle')} ${backup.name}`} title={t('purgeTitle')} disabled={disabled || modalOpen || !catalog?.roots.some(root => root.id === backup.rootId && root.writable)} onClick={() => setPurge({ rootId: backup.rootId, backup, count: 1 })}><Icon name="trash" size={15}/></button></article>)}</div></> : <Empty title={t('backupEmpty')} body={t('backupEmptyBody')} icon="archive"/>}<p className="skm-hint">{t('preserved')}</p></>}
    </div>
    <footer className="skm-footer"><Icon name="lock" size={12}/><span>{t('safeNote')}</span></footer>
  </div>
    {install && common && <InstallDialog {...common} initialSource={install.source} preferredName={install.name} onClose={() => setInstall(null)}/>}
    {selected && common && <SkillDialog {...common} skill={selected.skill} initialAction={selected.action} onClose={() => setSelected(null)} onMove={skill => { setSelected(null); setMove(skill) }}/>}
    {restore && common && <RestoreDialog {...common} backup={restore} onClose={() => setRestore(null)}/>}
    {move && common && <MoveDialog {...common} skill={move} onClose={() => setMove(null)}/>}
    {pendingBatch && common && <BatchUpdateDialog {...common} skills={pendingBatch} onBatch={batchDone} onClose={() => setPendingBatch(null)}/>}
    {purge && common && <PurgeDialog {...common} rootId={purge.rootId} backup={purge.backup} count={purge.count} onPurged={purged} onClose={() => setPurge(null)}/>}
    {local && common && <LocalInstallDialog {...common} onClose={() => setLocal(false)}/>}
    {wellKnown && common && <WellKnownInstallDialog {...common} onClose={() => setWellKnown(false)}/>}
  </section>
}
export function apply(rawContext: Context): void {
  const ctx = rawContext as unknown as ClientContext
  const lifetime = new AbortController()
  ctx.effect(() => () => lifetime.abort())
  ctx.locale.register(LOCALE_NAMESPACE, 'en', en)
  ctx.locale.register(LOCALE_NAMESPACE, 'zh', zh)
  const t = ctx.locale.bind(LOCALE_NAMESPACE)
  const api = createApi(ctx, lifetime.signal)
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 24, label: () => t('nav') }, ({ size }: { size: number; active: boolean }) => <Icon name="book" size={size}/>))
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID }, () => <SkillsPage api={api} localeService={ctx.locale} t={t}/>))
}
