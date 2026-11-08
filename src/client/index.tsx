import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type { Backup, Catalog, LocalSkill, MutationResult, SearchResults, StartJobResult, UpdateCheck, UpdateJob } from '../types.js'
import { LOCALE_NAMESPACE, PANEL_ID } from '../types.js'
import { createApi } from './contracts.js'
import type { ClientApi, ClientContext, ClientLocale } from './contracts.js'
import { en, zh } from './messages.js'
import type { Translate } from './messages.js'
import { bytes, Empty, errorText, Icon, Loader, Notice, ProgressBar, rootLabel, time } from './components.js'
import { BackupsPanel, DiscoverPanel, SkillCard } from './panels.js'
import { BatchUpdateDialog, InstallDialog, LocalInstallDialog, MoveDialog, PurgeDialog, RestoreDialog, SkillDialog, WellKnownInstallDialog } from './dialogs.js'
import { JobsPanel } from './jobs.js'
import css from './styles.css'

export const name = 'skillre-skills-manager-client'
export const inject = ['slots', 'locale', 'connection']
interface PageProps { api: ClientApi; localeService: ClientLocale; t: Translate }
type Tab = 'local' | 'discover' | 'updates' | 'jobs' | 'backups'
type Overview = 'all' | 'updates' | 'readonly'
interface InstallRequest { source: string; name: string; skillId?: string }

const TABS: Tab[] = ['local', 'discover', 'updates', 'jobs', 'backups']

/**
 * The manager is a Settings section, not a sidebar panel: DSH's left rail keeps
 * its own navigation and every skill operation lives one Settings click away.
 *
 * The surface deliberately reuses the Settings design language of the running
 * DSH build: one heading that matches the navigation label, a tertiary intro,
 * settings cards (--dsw-alias-settings-card-*), underline tabs and native
 * buttons/inputs. Nothing here invents a second visual system next to the
 * shell it is rendered in.
 */
export function SkillsPage({ api, localeService, t }: PageProps): React.JSX.Element {
  const localeState = useSyncExternalStore(listener => localeService.subscribe(listener), () => localeService.getSnapshot(), () => localeService.getSnapshot())
  const locale = localeState.active
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [tab, setTab] = useState<Tab>('local')
  const [overview, setOverview] = useState<Overview>('all')
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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const readonlyOnly = overview === 'readonly'
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
  const readOnlyCount = catalog ? catalog.skills.filter(skill => !skill.writable).length : 0
  const runningJob = jobs.find(job => job.status === 'running')
  const jobActive = !!runningJob
  const visible = (catalog?.skills ?? []).filter(skill => (tab !== 'updates' || skill.check?.status === 'update') && (!readonlyOnly || !skill.writable) && (location === 'all' || skill.rootId === location) && `${skill.name} ${skill.description} ${skill.source?.repository ?? ''}`.toLowerCase().includes(filter.toLowerCase().trim()))
  const filtered = !!filter.trim() || location !== 'all' || readonlyOnly
  function resetView(): void { setFilter(''); setLocation('all'); setOverview('all') }
  function showOverview(next: Overview): void {
    if (!catalog) return
    if (next === 'updates') { setOverview('all'); setFilter(''); setLocation('all'); setTab('updates'); return }
    if (next === 'readonly') { setOverview('readonly'); setFilter(''); setLocation('all'); setTab('local'); return }
    resetView()
    setTab('local')
  }
  function selectTab(next: Tab): void {
    if (next !== 'local') setOverview('all')
    setTab(next)
  }
  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number): void {
    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight': nextIndex = (index + 1) % TABS.length; break
      case 'ArrowLeft': nextIndex = (index - 1 + TABS.length) % TABS.length; break
      case 'Home': nextIndex = 0; break
      case 'End': nextIndex = TABS.length - 1; break
      default: return
    }
    event.preventDefault()
    const next = TABS[nextIndex] as Tab
    selectTab(next)
    tabRefs.current[nextIndex]?.focus()
  }
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
    setTab('local'); setOverview('all'); setFilter(name); setLocation('all')
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
  const checking = busy === t('checking')
  return <section className="skm-page" aria-label={t('title')}><style>{css}</style><div className="skm-wrap">
    <header className="skm-header">
      <div className="skm-heading">
        <h2 className="skm-title">{t('title')}</h2>
        <p className="skm-intro">{t('settingsIntro')}</p>
      </div>
      <div className="skm-actions">
        <button className="skm-button" type="button" disabled={disabled || modalOpen || !catalog || jobActive} onClick={() => void checkUpdates()}><Icon name="refresh" size={15} spin={checking}/>{checking ? t('checking') : t('check')}</button>
        <button className="skm-button" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setLocal(true)}><Icon name="down" size={15}/>{t('fromLocal')}</button>
        <button className="skm-button skm-button-primary" type="button" disabled={disabled || modalOpen || !writable} onClick={() => setInstall({ source: '', name: '' })}><Icon name="plus" size={15}/>{t('fromRepo')}</button>
      </div>
    </header>
    <div className="skm-overview" role="group" aria-label={t('overview')}>
      <button className={`skm-tile${tab === 'local' && !readonlyOnly ? ' skm-tile-active' : ''}`} type="button" aria-pressed={tab === 'local' && !readonlyOnly} disabled={!catalog} onClick={() => showOverview('all')}>
        <span className="skm-tile-value">{catalog ? catalog.skills.length : '—'}</span>
        <span className="skm-tile-label">{t('found')}</span>
      </button>
      <button className={`skm-tile${tab === 'updates' ? ' skm-tile-active' : ''}`} type="button" aria-pressed={tab === 'updates'} disabled={!catalog} onClick={() => showOverview('updates')}>
        <span className={`skm-tile-value${updates.length && anyChecked ? ' skm-tile-accent' : ''}`}>{anyChecked ? updates.length : '—'}</span>
        <span className="skm-tile-label">{t('available')}</span>
      </button>
      <button className={`skm-tile${tab === 'local' && readonlyOnly ? ' skm-tile-active' : ''}`} type="button" aria-pressed={tab === 'local' && readonlyOnly} disabled={!catalog} onClick={() => showOverview('readonly')}>
        <span className="skm-tile-value">{catalog ? readOnlyCount : '—'}</span>
        <span className="skm-tile-label">{t('readonly')}</span>
      </button>
    </div>
    {runningJob && <div className="skm-status" role="status"><Icon name="refresh" size={14} spin/><span className="skm-status-text">{t('jobStatusRunning')} · {t('jobProgress', { percent: runningJob.progress })}</span><ProgressBar value={runningJob.progress} label={t('jobProgress', { percent: runningJob.progress })}/></div>}
    <div className="skm-tabs" role="tablist" aria-label={t('title')}>{TABS.map((item, index) => <button type="button" className="skm-tab" id={`skm-tab-${item}`} key={item} role="tab" aria-selected={tab === item} aria-controls="skm-panel" tabIndex={tab === item ? 0 : -1} ref={element => { tabRefs.current[index] = element }} onClick={() => selectTab(item)} onKeyDown={event => onTabKeyDown(event, index)}>{t(item)}{item === 'jobs' && runningJob && <span className="skm-tab-meta">{t('jobProgress', { percent: runningJob.progress })}</span>}</button>)}</div>
    {notice && <Notice text={notice.text} kind={notice.kind} onClose={() => setNotice(null)}/>}
    {catalog && !catalog.mutationsAllowed && <Notice text={t('readOnlyMode')}/>}
    {catalog?.warnings.length ? <details className="skm-notice skm-notice-warning"><summary>{t('warningTitle')} · {catalog.warnings.length}</summary><ul className="skm-warning-list">{catalog.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details> : null}
    {catalog?.truncated && <Notice text={t('truncated')} kind="warning"/>}
    <div role="tabpanel" id="skm-panel" aria-labelledby={`skm-tab-${tab}`} className="skm-panel">
      {(tab === 'local' || tab === 'updates' || tab === 'backups') && <div className="skm-toolbar">
        {tab !== 'backups' && <label className="skm-search"><Icon name="search" size={16}/><input className="skm-search-input" value={filter} onChange={event => setFilter(event.target.value)} placeholder={t('filter')} aria-label={t('filter')}/></label>}
        {tab !== 'backups' && <select className="skm-select skm-location" value={location} onChange={event => setLocation(event.target.value)} aria-label={t('location')}><option value="all">{t('allRoots')}</option>{catalog?.roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)}</option>)}</select>}
        <select className="skm-select skm-scope" value={workspaceId} onChange={event => setWorkspaceId(event.target.value)} disabled={!!busy || modalOpen || loading} aria-label={t('scope')}><option value="">{t('global')}</option>{catalog?.workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}</select>
        {readonlyOnly && tab === 'local' && <button type="button" className="skm-chip" onClick={() => setOverview('all')} aria-label={`${t('clearFilter')}: ${t('readonly')}`}>{t('readonly')}<Icon name="close" size={11}/></button>}
        {tab === 'updates' && updates.length > 0 && <button className="skm-button skm-button-primary skm-toolbar-primary" type="button" disabled={disabled || modalOpen || !writable || jobActive} onClick={() => setPendingBatch(updates)}><Icon name="up" size={14}/>{t('updateAll')} ({updates.length})</button>}
        <button className="skm-icon-button skm-toolbar-refresh" type="button" aria-label={t('rescan')} title={t('rescanHint')} disabled={disabled || modalOpen} onClick={() => { if (tab === 'backups') void readBackups(); else void reload() }}><Icon name="refresh" size={16}/></button>
      </div>}
      {(tab === 'local' || tab === 'updates') && <>
        {loading && !catalog ? <Loader text={t('loading')}/> : !catalog ? <Empty title={t('requestFailed')} body={t('retry')}><button className="skm-button" type="button" onClick={() => void reload()}>{t('retry')}</button></Empty> : visible.length ? <div className="skm-list" aria-busy={loading || !!busy}>{visible.map(skill => <SkillCard key={skill.id} skill={skill} root={catalog.roots.find(root => root.id === skill.rootId)} t={t} disabled={disabled || modalOpen} jobActive={jobActive} onOpen={action => setSelected({ skill, action })}/>)}</div> : <div className="skm-empty">
          <p className="skm-empty-title">{t(filtered ? 'noMatches' : tab === 'updates' ? 'updatesEmpty' : 'empty')}</p>
          <p className="skm-empty-body">{t(filtered ? 'noMatchesBody' : tab === 'updates' ? 'updatesEmptyBody' : 'emptyBody')}</p>
          {tab === 'local' && writable && !filter && location === 'all' && !readonlyOnly && <button className="skm-add-button" type="button" onClick={() => setInstall({ source: '', name: '' })}><Icon name="plus" size={16}/>{t('fromRepo')}</button>}
          {tab === 'updates' && <button className="skm-button" type="button" disabled={disabled || modalOpen || jobActive} onClick={() => void checkUpdates()}><Icon name="refresh" size={15} spin={checking}/>{t('check')}</button>}
          {readonlyOnly && <button className="skm-button" type="button" onClick={() => setOverview('all')}>{t('clearFilter')}</button>}
        </div>}
      </>}
      {tab === 'discover' && <DiscoverPanel t={t} locale={locale} writable={writable} disabled={disabled} modalOpen={modalOpen} search={search} onReview={hit => setInstall(hit)} onWellKnown={() => setWellKnown(true)} onError={text => setNotice({ text, kind: 'error' })}/>}
      {tab === 'jobs' && <JobsPanel jobs={jobs} roots={catalog?.roots ?? []} t={t} locale={locale} onCancel={id => void cancelJob(id)} onRetry={job => void retryJob(job)} onOpenSkill={openJobSkill}/>}
      {tab === 'backups' && <BackupsPanel t={t} locale={locale} catalog={catalog} backups={backups} loading={backupLoading} disabled={disabled} modalOpen={modalOpen} onRestore={backup => setRestore(backup)} onPurge={value => setPurge(value)}/>}
    </div>
    <p className="skm-hint skm-safety">{t('safeNote')}</p>
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
