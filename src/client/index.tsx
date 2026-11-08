import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { Backup, Catalog, LocalSkill, MutationResult, SearchResults, StartJobResult, UpdateCheck, UpdateJob } from '../types.js'
import { LOCALE_NAMESPACE, PANEL_ID } from '../types.js'
import { createApi } from './contracts.js'
import type { ClientApi, ClientContext, ClientLocale } from './contracts.js'
import { en, zh } from './messages.js'
import type { Translate } from './messages.js'
import { bytes, Empty, errorText, Icon, Loader, Notice, rootLabel, time } from './components.js'
import { BackupsPanel, DiscoverPanel, SkillCard } from './panels.js'
import { BatchUpdateDialog, InstallDialog, LocalInstallDialog, MoveDialog, PurgeDialog, RestoreDialog, SkillDialog, WellKnownInstallDialog } from './dialogs.js'
import { JobsPanel } from './jobs.js'
import css from './styles.css'

export const name = 'skillre-skills-manager-client'
export const inject = ['slots', 'locale', 'connection']
interface PageProps { api: ClientApi; localeService: ClientLocale; t: Translate }
type Tab = 'local' | 'discover' | 'updates' | 'jobs' | 'backups'
interface InstallRequest { source: string; name: string; skillId?: string }

/**
 * The manager is a Settings section, not a sidebar panel: DSH's left rail keeps
 * its own navigation and every skill operation lives one Settings click away.
 */
export function SkillsPage({ api, localeService, t }: PageProps): React.JSX.Element {
  const localeState = useSyncExternalStore(listener => localeService.subscribe(listener), () => localeService.getSnapshot(), () => localeService.getSnapshot())
  const locale = localeState.active
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [tab, setTab] = useState<Tab>('local')
  const [workspaceId, setWorkspaceId] = useState('')
  const [location, setLocation] = useState('all')
  const [filter, setFilter] = useState('')
  const [backups, setBackups] = useState<Backup[]>([])
  const [jobs, setJobs] = useState<UpdateJob[]>([])
  const [loading, setLoading] = useState(true)
  const [backupLoading, setBackupLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState<{ text: string; kind: string } | null>(null)
  const [install, setInstall] = useState<InstallRequest | null>(null)
  const [selected, setSelected] = useState<{ skill: LocalSkill; action: 'detail' | 'update' | 'remove' } | null>(null)
  const [restore, setRestore] = useState<Backup | null>(null)
  const [move, setMove] = useState<LocalSkill | null>(null)
  const [pendingBatch, setPendingBatch] = useState<LocalSkill[] | null>(null)
  const [purge, setPurge] = useState<{ rootId: string; backup?: Backup | undefined; count: number } | null>(null)
  const [local, setLocal] = useState(false)
  const [wellKnown, setWellKnown] = useState(false)
  const alive = useRef(true)
  const life = useRef(new AbortController())
  const sequence = useRef(0)
  const backupSequence = useRef(0)
  const jobsRef = useRef<UpdateJob[]>([])
  const wasRunning = useRef(false)
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
  const loadJobs = useCallback(async () => {
    try {
      const value = await api.call<UpdateJob[]>({ action: 'job-list' }, life.current.signal)
      if (alive.current) setJobs(value)
    } catch { /* Background polling stays quiet; the jobs tab shows the last known state. */ }
  }, [api])
  useEffect(() => {
    alive.current = true
    life.current = new AbortController()
    setLocation('all'); setBackups([])
    void reload()
    void loadJobs()
    return () => { alive.current = false; life.current.abort(); sequence.current++; backupSequence.current++ }
  }, [reload, loadJobs])
  useEffect(() => { jobsRef.current = jobs }, [jobs])
  useEffect(() => {
    const timer = setInterval(() => {
      if (alive.current && jobsRef.current.some(job => job.status === 'running')) void loadJobs()
    }, 700)
    return () => clearInterval(timer)
  }, [loadJobs])
  useEffect(() => {
    const running = jobs.some(job => job.status === 'running')
    if (wasRunning.current && !running) {
      void reload()
      const finished = jobs.find(job => job.status !== 'running' && job.finishedAt)
      if (finished && alive.current) {
        const title = finished.kind === 'update' ? (finished.items[0]?.name ?? t('jobs')) : t('jobBatch', { count: finished.total })
        setNotice({ text: `${title} · ${t('jobCounts', { updated: finished.succeeded, failed: finished.failed, skipped: finished.skipped, cancelled: finished.cancelled })}`, kind: finished.failed > 0 ? 'warning' : 'success' })
      }
    }
    wasRunning.current = running
  }, [jobs, reload, t])
  useEffect(() => { if (tab === 'jobs') void loadJobs() }, [tab, loadJobs])
  useEffect(() => { if (tab === 'backups') void readBackups() }, [tab, readBackups])
  const disabled = !!busy || loading
  const modalOpen = !!install || !!selected || !!restore
  const writable = !!catalog?.roots.some(root => root.writable)
  const updates = catalog?.skills.filter(skill => skill.check?.status === 'update') ?? []
  const anyChecked = catalog?.skills.some(skill => !!skill.check) ?? false
  const runningJob = jobs.find(job => job.status === 'running')
  const jobActive = !!runningJob
  const visible = (catalog?.skills ?? []).filter(skill => (tab !== 'updates' || skill.check?.status === 'update') && (location === 'all' || skill.rootId === location) && `${skill.name} ${skill.description} ${skill.source?.repository ?? ''}`.toLowerCase().includes(filter.toLowerCase().trim()))
  async function checkUpdates(): Promise<void> {
    if (busy || loading || jobActive) return
    setBusy(t('checking')); setNotice(null)
    try {
      const checks = await api.call<UpdateCheck[]>({ action: 'check', ...scope }, life.current.signal)
      if (alive.current) setNotice({ text: t('checkingDone', { updates: checks.filter(item => item.status === 'update').length, latest: checks.filter(item => item.status === 'latest').length, untracked: checks.filter(item => item.status === 'untracked').length, errors: checks.filter(item => item.status === 'error').length }), kind: checks.some(item => item.status === 'error') ? 'warning' : 'success' })
      await reload()
    } catch (error) { if (alive.current && !life.current.signal.aborted) setNotice({ text: errorText(error), kind: 'error' }) }
    finally { if (alive.current) setBusy('') }
  }
  const search = useCallback((query: string) => api.call<SearchResults>({ action: 'search', query, limit: 24 }, life.current.signal), [api])
  function revealSkill(name: string): void {
    // A freshly installed skill must be visible immediately: jump to the list
    // that contains it and narrow the filter to its name.
    setTab('local'); setFilter(name); setLocation('all')
  }
  function mutated(result: MutationResult): void {
    if (!alive.current) return
    setInstall(null); setSelected(null); setRestore(null); setMove(null); setLocal(false); setPendingBatch(null); setPurge(null); setWellKnown(false)
    const labels: Record<MutationResult['action'], string> = { install: 'installed', update: 'updated', remove: 'removed', restore: 'restored', 'restore-to': 'restored', move: 'moved', 'install-local': 'localInstalled', 'well-known-install': 'wellKnownDone' }
    setNotice(result.warning ? { text: `${t(labels[result.action], { name: result.name })} ${result.warning}`, kind: 'warning' } : { text: t(labels[result.action], { name: result.name }), kind: 'success' })
    if (result.action === 'install' || result.action === 'install-local' || result.action === 'well-known-install') revealSkill(result.name)
    else void reload()
  }
  function jobStarted(): void {
    if (!alive.current) return
    setSelected(null); setPendingBatch(null)
    setTab('jobs')
    setNotice({ text: t('jobStarted'), kind: 'success' })
    void loadJobs()
  }
  async function cancelJob(jobId: string): Promise<void> {
    try { await api.call<UpdateJob>({ action: 'job-cancel', id: jobId }, life.current.signal); await loadJobs() }
    catch (error) { if (alive.current) setNotice({ text: errorText(error), kind: 'error' }) }
  }
  async function retryJob(job: UpdateJob): Promise<void> {
    const ids = job.items.filter(item => item.status === 'failed').map(item => item.id)
    if (!ids.length) return
    try { await api.call<StartJobResult>({ action: 'update-batch-start', ids }, life.current.signal); jobStarted() }
    catch (error) { if (alive.current) setNotice({ text: errorText(error), kind: 'error' }) }
  }
  function openJobSkill(id: string): void {
    const skill = catalog?.skills.find(item => item.id === id)
    if (skill) setSelected({ skill, action: 'detail' })
    else setNotice({ text: t('jobSkillGone'), kind: 'warning' })
  }
  function purged(removed: number, freedBytes: number): void {
    if (!alive.current) return
    setPurge(null)
    setNotice({ text: t('purged', { count: removed, bytes: bytes(freedBytes) }), kind: 'success' })
    void readBackups()
  }
  function settled(): void { if (alive.current) { void reload(); if (tab === 'backups') void readBackups() } }
  const common = catalog ? { api, t, locale, catalog, workspaceId, jobActive, onJobStarted: jobStarted, onBusy: (value: boolean, label?: string) => { if (alive.current) setBusy(value ? label ?? t('loading') : '') }, onMutated: mutated, onError: (text: string) => { if (alive.current) setNotice({ text, kind: 'error' }) }, onSettled: settled } : null
  return <section className="skm-page" aria-label={t('title')}><style>{css}</style><div className="skm-wrap">
    <header className="skm-header">
      <div className="skm-heading">
        <h1 className="skm-title">{t('title')}</h1>
        <p className="skm-subtitle">{t('settingsIntro')}</p>
      </div>
      <div className="skm-actions">
        <button className="skm-button" type="button" disabled={disabled || modalOpen || !catalog || jobActive} onClick={() => void checkUpdates()}><Icon name="refresh" spin={busy === t('checking')}/>{busy === t('checking') ? t('checking') : t('check')}</button>
        {jobs.length > 0 && <button className="skm-button" type="button" disabled={disabled || modalOpen} onClick={() => setTab('jobs')}><Icon name="list" size={15}/>{t('jobs')}{runningJob ? ` · ${t('jobProgress', { percent: runningJob.progress })}` : ''}</button>}
        {updates.length > 0 && <button className="skm-button skm-button-primary" type="button" disabled={disabled || modalOpen || !writable || jobActive} onClick={() => setPendingBatch(updates)}><Icon name="up" size={15}/>{t('updateAll')} ({updates.length})</button>}
        <button className="skm-button" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setLocal(true)}><Icon name="down" size={16}/>{t('fromLocal')}</button>
        <button className="skm-button skm-button-primary" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setInstall({ source: '', name: '' })}><Icon name="plus" size={16}/>{t('fromRepo')}</button>
      </div>
    </header>
    <div className="skm-stats" aria-label={t('metadata')}>
      <div className="skm-stat"><span className="skm-stat-label">{t('found')}</span><span className="skm-stat-value">{catalog ? catalog.skills.length : '—'}</span></div>
      <div className="skm-stat skm-stat-accent"><span className="skm-stat-label">{t('available')}</span><span className="skm-stat-value">{anyChecked ? updates.length : '—'}</span></div>
      <div className="skm-stat"><span className="skm-stat-label">{t('readonly')}</span><span className="skm-stat-value">{catalog ? catalog.skills.filter(skill => !skill.writable).length : '—'}</span></div>
    </div>
    <div className="skm-tabs" role="tablist" aria-label={t('title')}>{(['local', 'discover', 'updates', 'jobs', 'backups'] as Tab[]).map(item => <button type="button" className="skm-tab" id={`skm-tab-${item}`} key={item} role="tab" aria-selected={tab === item} aria-controls={`skm-panel-${item}`} onClick={() => setTab(item)}>{t(item)}{item === 'updates' && updates.length > 0 && <span className="skm-count">{updates.length}</span>}{item === 'jobs' && runningJob && <span className="skm-count">{t('jobProgress', { percent: runningJob.progress })}</span>}</button>)}</div>
    {notice && <Notice text={notice.text} kind={notice.kind} onClose={() => setNotice(null)}/>}
    {catalog && !catalog.mutationsAllowed && <Notice text={t('readOnlyMode')}/>}
    {catalog?.warnings.length ? <details className="skm-notice skm-notice-warning"><summary>{t('warningTitle')} · {catalog.warnings.length}</summary><ul className="skm-warning-list">{catalog.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details> : null}
    {catalog?.truncated && <Notice text={t('truncated')} kind="warning"/>}
    <div role="tabpanel" id={`skm-panel-${tab}`} aria-labelledby={`skm-tab-${tab}`}>
      {(tab === 'local' || tab === 'updates' || tab === 'backups') && <div className="skm-toolbar">
        <button className="skm-button skm-button-quiet skm-rescan" type="button" aria-label={t('rescan')} title={t('rescanHint')} disabled={disabled || modalOpen} onClick={() => { if (tab === 'backups') void readBackups(); else void reload() }}><Icon name="refresh" size={16}/></button>
        {tab !== 'backups' && <input className="skm-input skm-filter" value={filter} onChange={event => setFilter(event.target.value)} placeholder={t('filter')} aria-label={t('filter')}/>}
        <select className="skm-select skm-scope" value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} disabled={!!busy || modalOpen || loading} aria-label={t('scope')}><option value="">{t('global')}</option>{catalog?.workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}</select>
        {tab !== 'backups' && <select className="skm-select skm-location" value={location} onChange={event => setLocation(event.target.value)} aria-label={t('location')}><option value="all">{t('allRoots')}</option>{catalog?.roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)}</option>)}</select>}
      </div>}
      {(tab === 'local' || tab === 'updates') && <>
        {loading && !catalog ? <Loader text={t('loading')}/> : !catalog ? <Empty title={t('requestFailed')} body={t('retry')}><button className="skm-button" onClick={() => void reload()}>{t('retry')}</button></Empty> : visible.length ? <div className="skm-list" aria-busy={loading || !!busy}>{visible.map(skill => <SkillCard key={skill.id} skill={skill} root={catalog.roots.find(root => root.id === skill.rootId)} t={t} disabled={disabled || modalOpen} jobActive={jobActive} onOpen={action => setSelected({ skill, action })}/>)}</div> : <Empty title={filter || location !== 'all' ? t('noMatches') : t(tab === 'updates' ? 'updatesEmpty' : 'empty')} body={t(tab === 'updates' ? 'updatesEmptyBody' : 'emptyBody')} icon={tab === 'updates' ? 'refresh' : 'book'}>{writable && tab === 'local' && !filter && <button className="skm-button skm-button-primary" onClick={() => setInstall({ source: '', name: '' })}>{t('install')}</button>}</Empty>}
      </>}
      {tab === 'discover' && <DiscoverPanel t={t} locale={locale} writable={writable} disabled={disabled} modalOpen={modalOpen} search={search} onReview={hit => setInstall(hit)} onWellKnown={() => setWellKnown(true)} onError={text => setNotice({ text, kind: 'error' })}/>}
      {tab === 'jobs' && <JobsPanel jobs={jobs} roots={catalog?.roots ?? []} t={t} locale={locale} onCancel={id => void cancelJob(id)} onRetry={job => void retryJob(job)} onOpenSkill={openJobSkill}/>}
      {tab === 'backups' && <BackupsPanel t={t} locale={locale} catalog={catalog} backups={backups} loading={backupLoading} disabled={disabled} modalOpen={modalOpen} onRestore={backup => setRestore(backup)} onPurge={value => setPurge(value)}/>}
    </div>
    <footer className="skm-footer"><Icon name="lock" size={12}/><span>{t('safeNote')}</span></footer>
  </div>
    {install && common && <InstallDialog {...common} initialSource={install.source} preferredName={install.name} preferredSkillId={install.skillId} onOpenInstalled={skill => { setInstall(null); setSelected({ skill, action: 'detail' }) }} onClose={() => setInstall(null)}/>}
    {selected && common && <SkillDialog {...common} skill={selected.skill} initialAction={selected.action} onClose={() => setSelected(null)} onMove={skill => { setSelected(null); setMove(skill) }}/>}
    {restore && common && <RestoreDialog {...common} backup={restore} onClose={() => setRestore(null)}/>}
    {move && common && <MoveDialog {...common} skill={move} onClose={() => setMove(null)}/>}
    {pendingBatch && common && <BatchUpdateDialog {...common} skills={pendingBatch} onClose={() => setPendingBatch(null)}/>}
    {purge && common && <PurgeDialog {...common} rootId={purge.rootId} backup={purge.backup} count={purge.count} onPurged={purged} onClose={() => setPurge(null)}/>}
    {local && common && <LocalInstallDialog {...common} onClose={() => setLocal(false)}/>}
    {wellKnown && common && <WellKnownInstallDialog {...common} onClose={() => setWellKnown(false)}/>}
  </section>
}
export function apply(rawContext: Context): void {
  const ctx = rawContext as unknown as ClientContext
  const lifetime = new AbortController()
  ctx.effect(() => () => lifetime.abort())
  // Dictionaries must leave with the plugin Fiber: the locale service refuses a
  // second registration for the same namespace and locale, so a leaked first
  // registration makes every later activation of this plugin fail.
  ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, { en, zh }), 'skillre-skills-manager client dictionaries')
  const t = ctx.locale.bind(LOCALE_NAMESPACE)
  const api = createApi(ctx, lifetime.signal)
  // One Settings section, no sidebar panel: the settings shell renders the
  // active section and re-reads every registration label whenever the section
  // ledger or the locale revision changes, so the thunk keeps the nav localized.
  ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({ name: 'settings.section', id: PANEL_ID, order: 25, label: () => t('nav') }, () => <SkillsPage api={api} localeService={ctx.locale} t={t}/>)), 'skillre-skills-manager settings section')
  // The optional navigation glyph is addressed by the matching section id: an
  // unmatched id never renders, and the shell keeps its default glyph without it.
  ctx.effect(() => ctx.slots.inject('settings.section.icon', () => ctx.slots.register({ name: 'settings.section.icon', id: PANEL_ID, order: 25 }, ({ size }: { size: number; active: boolean }) => <Icon name="book" size={size}/>)), 'skillre-skills-manager settings icon')
}
