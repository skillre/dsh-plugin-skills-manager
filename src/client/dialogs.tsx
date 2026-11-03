import React, { useEffect, useRef, useState } from 'react'
import type { Backup, BatchUpdateResult, Catalog, LocalSkill, MutationResult, RemotePreview, RepositoryInfo, RepositorySkill, SkillDetail, SkillDiff, UpdateCheck, WellKnownInspect, WellKnownSkillEntry } from '../types.js'
import type { ClientApi } from './contracts.js'
import type { Translate } from './messages.js'
import { bytes, Dialog, errorText, Icon, Loader, Notice, rootLabel, StatusBadge, time } from './components.js'

interface CommonProps {
  api: ClientApi
  t: Translate
  locale: string
  catalog: Catalog
  workspaceId: string
  onClose(): void
  onBusy(busy: boolean, label?: string): void
  onMutated(result: MutationResult): void
  onError(message: string): void
  onSettled(): void
}
const scope = (workspaceId: string) => workspaceId ? { workspaceId } : {}
function SourceLink({ repository, revision, t }: { repository: string; revision?: string | undefined; t: Translate }): React.JSX.Element {
  if (!revision) return <></>
  return <a className="skm-source-link" href={`https://github.com/${repository}/tree/${encodeURIComponent(revision)}`} target="_blank" rel="noopener noreferrer">{t('sourceLink')} ↗</a>
}
export function InstallDialog({ initialSource, preferredName, ...props }: CommonProps & { initialSource: string; preferredName: string }): React.JSX.Element {
  const { api, t, catalog, workspaceId } = props
  const [source, setSource] = useState(initialSource)
  const [ref, setRef] = useState('')
  const [repository, setRepository] = useState<RepositoryInfo | null>(null)
  const [preview, setPreview] = useState<RemotePreview | null>(null)
  const roots = catalog.roots.filter(root => root.writable)
  const [rootId, setRootId] = useState(roots.find(root => root.source === 'user-agents')?.id ?? roots[0]?.id ?? '')
  const [trusted, setTrusted] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function inspect(): Promise<void> {
    if (!source.trim() || busy) return
    setBusy('inspecting'); setError(''); setTrusted(false); setPreview(null)
    try {
      const value = await api.call<RepositoryInfo>({ action: 'inspect', source: source.trim(), ...(ref.trim() ? { ref: ref.trim() } : {}), ...scope(workspaceId) }, life.current.signal)
      if (alive.current) setRepository(value)
    } catch (error) { if (alive.current) setError(errorText(error)) }
    finally { if (alive.current) setBusy('') }
  }
  async function select(skill: RepositorySkill): Promise<void> {
    if (!repository || busy) return
    setBusy('loading'); setError(''); setTrusted(false)
    try {
      const value = await api.call<RemotePreview>({ action: 'preview', source: repository.repository, ref: repository.ref, commit: repository.commit, skillPath: skill.skillPath, ...scope(workspaceId) }, life.current.signal)
      if (alive.current) setPreview(value)
    } catch (error) { if (alive.current) setError(errorText(error)) }
    finally { if (alive.current) setBusy('') }
  }
  async function install(): Promise<void> {
    if (!preview || !trusted || !rootId || busy) return
    setBusy('installing'); setError(''); props.onBusy(true, t('installing'))
    try {
      const result = await api.call<MutationResult>({ action: 'install', rootId, source: preview.repository, ref: preview.ref, commit: preview.commit, skillPath: preview.skill.skillPath, ...scope(workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(''); props.onBusy(false); props.onSettled() }
  }
  return <Dialog title={preview ? `${t('install')} · ${preview.skill.name}` : t('fromRepo')} t={t} onClose={close} footer={<>
    <button type="button" className="skm-button skm-button-quiet" onClick={() => { if (preview && !busy) { setPreview(null); setTrusted(false) } else if (repository && !busy) setRepository(null); else close() }}>{preview || repository ? t('back') : t('cancel')}</button>
    {preview ? <button type="button" className="skm-button skm-button-primary" onClick={() => void install()} disabled={!trusted || !rootId || !!busy}><Icon name={busy === 'installing' ? 'refresh' : 'down'} spin={busy === 'installing'}/>{busy === 'installing' ? t('installing') : t('install')}</button> : !repository ? <button type="button" className="skm-button skm-button-primary" onClick={() => void inspect()} disabled={!source.trim() || !!busy}><Icon name={busy ? 'refresh' : 'search'} spin={!!busy}/>{busy ? t('inspecting') : t('inspect')}</button> : null}
  </>}>
    {error && <Notice text={error} kind="error"/>}
    {!repository && !preview && <form className="skm-form-grid" onSubmit={event => { event.preventDefault(); void inspect() }}>
      <label className="skm-field skm-full"><span className="skm-field-label">{t('repository')}</span><input className="skm-input" value={source} onChange={event => setSource(event.target.value)} placeholder={t('repoPlaceholder')} autoComplete="off" spellCheck={false} disabled={!!busy} data-autofocus maxLength={400}/></label>
      <label className="skm-field skm-full"><span className="skm-field-label">{t('branch')}</span><input className="skm-input" value={ref} onChange={event => setRef(event.target.value)} placeholder="HEAD" autoComplete="off" spellCheck={false} disabled={!!busy} maxLength={200}/><span className="skm-hint">{t('refHint')}</span></label>
      <button type="submit" hidden/>
    </form>}
    {repository && !preview && <>
      <div className="skm-meta"><span className="skm-mono">{repository.repository}</span><span>{repository.ref}</span><span className="skm-mono">{repository.commit.slice(0, 12)}</span></div>
      <div className="skm-section-title">{t('chooseSkill')}<span className="skm-count">{repository.skills.length}</span></div>
      {busy && <Loader text={t('loading')}/>}
      {!busy && <div className="skm-skill-options">{[...repository.skills].sort((a, b) => Number(b.name === preferredName) - Number(a.name === preferredName)).map(skill => <button type="button" className="skm-skill-option" key={skill.skillPath} disabled={!!busy} onClick={() => void select(skill)}><Icon name="book"/><span className="skm-skill-option-main"><strong>{skill.name}</strong><span className="skm-description">{skill.description}</span><span className="skm-mono skm-hint">{skill.skillPath}</span></span><Icon name="arrow" size={16}/></button>)}</div>}
      {!repository.skills.length && <Notice text={t('noRepoSkills')} kind="warning"/>}
      {repository.truncated && <Notice text={t('truncated')} kind="warning"/>}
      {repository.warnings.length > 0 && <details className="skm-hint"><summary>{t('warningTitle')}</summary><ul className="skm-warning-list">{repository.warnings.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
    </>}
    {preview && <>
      <p className="skm-plain-text">{preview.skill.description}</p>
      <div className="skm-meta"><span className="skm-mono">{preview.repository}</span><span>{preview.ref}</span><span className="skm-mono">{preview.commit.slice(0, 12)}</span><SourceLink repository={preview.repository} revision={preview.commit} t={t}/></div>
      <div className="skm-section-title">{t('instructions')}</div><pre className="skm-code">{preview.content}</pre>
      <div className="skm-section-title">{t('resources')}<span className="skm-hint">{t('files', { count: preview.files.length })} · {bytes(preview.totalBytes)}</span></div>
      <ul className="skm-file-list">{preview.files.map(file => <li key={file.path}><span className="skm-mono">{file.path}</span><span>{bytes(file.bytes)}</span></li>)}</ul>
      <label className="skm-field" style={{ marginTop: 18 }}><span className="skm-field-label">{t('target')}</span><select className="skm-select" value={rootId} onChange={event => setRootId(event.target.value)} disabled={!!busy}>{!roots.length && <option value="">{t('selectLocation')}</option>}{roots.map(root => <option value={root.id} key={root.id}>{rootLabel(root, t)} · {root.path}</option>)}</select></label>
      {!roots.length && <Notice text={t('noWritable')} kind="warning"/>}
      <label className="skm-checkbox"><input type="checkbox" checked={trusted} onChange={event => setTrusted(event.target.checked)} disabled={!!busy}/><span>{t('trust')}<span className="skm-checkbox-hint">{t('trustHint')}</span></span></label>
    </>}
  </Dialog>
}
export function SkillDialog({ skill, initialAction, onMove, ...props }: CommonProps & { skill: LocalSkill; initialAction: 'detail' | 'update' | 'remove'; onMove?: (skill: LocalSkill) => void }): React.JSX.Element {
  const { api, t, locale, workspaceId } = props
  const [detail, setDetail] = useState<SkillDetail | null>(null)
  const [mode, setMode] = useState<'detail' | 'update' | 'remove'>(initialAction === 'update' ? 'detail' : initialAction)
  const [busy, setBusy] = useState('loading')
  const [error, setError] = useState('')
  const [overwrite, setOverwrite] = useState(false)
  const [permanent, setPermanent] = useState(false)
  const [diff, setDiff] = useState<SkillDiff | null>(null)
  const [diffError, setDiffError] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const life = useRef(new AbortController())
  const alive = useRef(true)
  const initialized = useRef(false)
  useEffect(() => {
    alive.current = true; if (life.current.signal.aborted) life.current = new AbortController()
    void load(initialAction === 'update')
    return () => { alive.current = false; life.current.abort(); if (copyTimer.current) clearTimeout(copyTimer.current) }
  }, [skill.id])
  function close(): void { life.current.abort(); props.onClose() }
  async function load(update = false): Promise<void> {
    setBusy('loading'); setError(''); setOverwrite(false); setPermanent(false); setDiff(null); setDiffError(''); setCopied(false)
    try {
      let value = await api.call<SkillDetail>({ action: 'detail', id: skill.id, ...scope(workspaceId) }, life.current.signal)
      if (update && value.skill.source && value.skill.writable) {
        const checks = await api.call<UpdateCheck[]>({ action: 'check', id: skill.id, ...scope(workspaceId) }, life.current.signal)
        const checked = checks[0]
        if (!checked || checked.status === 'error' || checked.status === 'untracked' || checked.status === 'protected') throw new Error(checked?.message ?? t('noSource'))
        value = { ...value, skill: { ...value.skill, check: checked } }
        if (checked.status === 'update') {
          try {
            const comparison = await api.call<SkillDiff>({ action: 'diff', id: skill.id, ...scope(workspaceId) }, life.current.signal)
            if (alive.current) setDiff(comparison)
          } catch (error) { if (alive.current) setDiffError(errorText(error)) }
        }
      }
      if (alive.current) {
        setDetail(value)
        if (update) setMode('update')
        initialized.current = true
      }
    } catch (error) { if (alive.current) setError(errorText(error)) }
    finally { if (alive.current) setBusy('') }
  }
  async function checkUpdate(): Promise<void> { if (!busy) await load(true) }
  async function copyPath(): Promise<void> {
    const path = detail?.skill.path
    if (!path || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(path)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => { if (alive.current) setCopied(false) }, 1600)
    } catch { if (alive.current) setError(t('copyFailed')) }
  }
  async function mutate(): Promise<void> {
    if (!detail || !detail.skill.writable || busy || mode === 'detail' || (mode === 'update' && detail.locallyModified && !overwrite)) return
    setBusy(mode === 'update' ? 'updating' : 'removing'); setError(''); props.onBusy(true, t(mode === 'update' ? 'updating' : 'removing'))
    try {
      const result = await api.call<MutationResult>(mode === 'remove' ? { action: 'remove', id: skill.id, expectedFingerprint: detail.fingerprint, ...(permanent ? { permanent: true } : {}), ...scope(workspaceId) } : { action: 'update', id: skill.id, expectedFingerprint: detail.fingerprint, ...(detail.skill.check?.latestCommit ? { commit: detail.skill.check.latestCommit } : {}), overwriteModified: overwrite, ...scope(workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(''); props.onBusy(false); props.onSettled() }
  }
  const title = mode === 'remove' ? t('removeTitle') : mode === 'update' ? t('updateTitle') : `${t('details')} · ${skill.name}`
  const canUpdate = !!detail?.skill.source && detail.skill.writable && detail.skill.format === 'directory'
  return <Dialog title={title} t={t} onClose={close} alert={mode !== 'detail'} footer={<>
    {mode !== 'detail' ? <><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={() => { if (!busy) { setMode('detail'); setOverwrite(false); setError('') } else close() }}>{t('cancel')}</button><button type="button" className={`skm-button ${mode === 'remove' ? 'skm-button-danger' : 'skm-button-primary'}`} disabled={!detail || !detail.skill.writable || !!busy || (mode === 'update' && !!detail.locallyModified && !overwrite) || (mode === 'update' && detail.skill.check?.status === 'latest' && !detail.locallyModified)} onClick={() => void mutate()}><Icon name={busy ? 'refresh' : mode === 'remove' ? 'trash' : 'up'} spin={!!busy}/>{busy ? t(busy) : t(mode === 'remove' ? 'confirmRemove' : 'confirmUpdate')}</button></> : <>
      <button type="button" className="skm-button skm-button-quiet" onClick={close}>{t('close')}</button>
      {detail?.skill.writable && detail.skill.format !== 'registry' && onMove && <button type="button" className="skm-button" onClick={() => onMove(detail.skill)} disabled={!!busy}><Icon name="move" size={15}/>{t('moveButton')}</button>}
      {detail?.skill.writable && <button type="button" className="skm-button skm-button-danger" onClick={() => { setMode('remove'); setError('') }} disabled={!!busy}><Icon name="trash" size={15}/>{t('remove')}</button>}
      {canUpdate && <button type="button" className="skm-button skm-button-primary" onClick={() => void checkUpdate()} disabled={!!busy}><Icon name={busy ? 'refresh' : detail.skill.check?.status === 'update' ? 'up' : 'refresh'} spin={!!busy}/>{busy ? t(busy) : detail.skill.check?.status === 'update' ? t('updateButton') : t('check')}</button>}
    </>}
  </>}>
    {error && <><Notice text={error} kind="error"/><button type="button" className="skm-button" onClick={() => { setMode('detail'); void load() }} disabled={!!busy}>{t('retry')}</button></>}
    {busy === 'loading' && <Loader text={t('loading')}/>}
    {detail && mode !== 'detail' && <>
      <p className="skm-plain-text">{t(mode === 'remove' ? 'removeBody' : 'updateBody')}</p>
      <div className="skm-card"><div className="skm-card-mark"><Icon name="book"/></div><div className="skm-card-main"><strong className="skm-result-name">{detail.skill.name}</strong><p className="skm-description">{detail.skill.description}</p><div className="skm-meta"><span>{t('files', { count: detail.files.length })}</span><span>{bytes(detail.totalBytes)}</span></div><div className="skm-hint skm-mono">{detail.skill.path}</div></div></div>
      {mode === 'update' && (detail.skill.check?.latestCommit || detail.skill.check?.latestDigest) && <div className="skm-detail-grid"><div className="skm-detail-item"><div className="skm-detail-label">{t('source')}</div><div className="skm-detail-value skm-mono">{detail.skill.source?.repository}</div></div><div className="skm-detail-item"><div className="skm-detail-label">{t('revision')}</div><div className="skm-detail-value skm-mono">{detail.skill.check?.latestCommit ? detail.skill.check.latestCommit.slice(0, 12) : detail.skill.check?.latestDigest?.slice(7, 19) ?? ''}</div></div></div>}
      {mode === 'update' && detail.skill.check?.status === 'latest' && !detail.locallyModified && <Notice text={t('latest')} kind="success"/>}
      {mode === 'update' && detail.locallyModified && <><Notice text={`${t('modified')} · ${t('modifiedBody')}`} kind="warning"/><label className="skm-checkbox"><input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.target.checked)} disabled={!!busy}/><span>{t('overwrite')}</span></label></>}
      {mode === 'update' && diff && <><div className="skm-section-title">{t('diffTitle')}<span className="skm-hint">{t('diffAdded')} {diff.added} · {t('diffRemoved')} {diff.removed} · {t('diffChanged')} {diff.changed} · {t('diffUnchanged')} {diff.unchanged}</span></div>{diff.added + diff.removed + diff.changed === 0 ? <p className="skm-hint">{t('diffEmpty')}</p> : <ul className="skm-file-list">{diff.files.filter(file => file.status !== 'unchanged').slice(0, 200).map(file => <li key={file.path}><span className="skm-mono">{file.path}</span><span>{t(file.status === 'added' ? 'diffAdded' : file.status === 'removed' ? 'diffRemoved' : 'diffChanged')}</span></li>)}</ul>}</>}
      {mode === 'update' && diffError && <p className="skm-hint">{t('diffFailed')}: {diffError}</p>}
      {mode === 'remove' && <label className="skm-checkbox"><input type="checkbox" checked={permanent} onChange={event => setPermanent(event.target.checked)} disabled={!!busy}/><span>{t('permanentDelete')}</span></label>}
      {mode === 'remove' && permanent && <Notice text={t('permanentWarning')} kind="warning"/>}
    </>}
    {detail && mode === 'detail' && <>
      <p className="skm-plain-text">{detail.skill.description}</p>
      <div className="skm-detail-grid">
        <div className="skm-detail-item"><div className="skm-detail-label">{t('location')}</div><div className="skm-detail-value">{rootLabel(props.catalog.roots.find(root => root.id === detail.skill.rootId), t)}</div></div>
        <div className="skm-detail-item"><div className="skm-detail-label">{t('revision')}</div><div className="skm-detail-value skm-mono">{detail.skill.source?.kind === 'well-known' ? detail.skill.source.digest ? `${t('digest')} ${detail.skill.source.digest.slice(7, 19)}` : t('localOnly') : detail.skill.source?.commit && detail.skill.source.commit !== 'unknown' ? detail.skill.source.commit.slice(0, 12) : detail.skill.source?.imported ? t('cliImported') : t('localOnly')}</div></div>
        <div className="skm-detail-item"><div className="skm-detail-label">{t('updateStatus')}</div><div className="skm-detail-value skm-status-cell"><StatusBadge skill={detail.skill} t={t}/>{detail.skill.check?.checkedAt && <span className="skm-hint">{time(detail.skill.check.checkedAt, locale)}</span>}</div></div>
        <div className="skm-detail-item"><div className="skm-detail-label">{t('model')}</div><div className="skm-detail-value">{t(detail.skill.modelInvocable ? 'enabled' : 'disabled')}</div></div>
        <div className="skm-detail-item"><div className="skm-detail-label">{t('user')}</div><div className="skm-detail-value">{t(detail.skill.userInvocable ? 'enabled' : 'disabled')}</div></div>
      </div>
      <div className="skm-path-row"><span className="skm-hint skm-mono">{detail.skill.path}</span><button type="button" className="skm-button skm-button-quiet skm-copy-button" onClick={() => void copyPath()} aria-label={t('copyPath')} title={t('copyPath')}>{copied ? <><Icon name="check" size={13}/>{t('pathCopied')}</> : <Icon name="copy" size={14}/>}</button></div>
      {detail.skill.source?.kind === 'well-known' && <div className="skm-meta" style={{ marginTop: 9 }}><span className="skm-mono">{detail.skill.source.repository}</span>{detail.skill.source.sourceBaseUrl && <a className="skm-source-link" href={detail.skill.source.sourceBaseUrl} target="_blank" rel="noopener noreferrer">{t('sourceSite')} ↗</a>}</div>}
      {detail.skill.source && detail.skill.source.kind !== 'well-known' && <div className="skm-meta" style={{ marginTop: 9 }}><span className="skm-mono">{detail.skill.source.repository}</span>{detail.skill.source.ref && <span>{detail.skill.source.ref}</span>}<SourceLink repository={detail.skill.source.repository} revision={detail.skill.source.commit && detail.skill.source.commit !== 'unknown' ? detail.skill.source.commit : detail.skill.source.ref} t={t}/></div>}
      {detail.locallyModified && <Notice text={`${t('modified')} · ${t('modifiedBody')}`} kind="warning"/>}
      {!detail.skill.source && detail.skill.origin && <Notice text={t('externalSourceBody', { source: detail.skill.origin.label })}/>}
      {!detail.skill.source && !detail.skill.origin && detail.skill.writable && <Notice text={t('noSource')}/>}
      {detail.skill.issue && <Notice text={detail.skill.issue} kind="warning"/>}
      <div className="skm-section-title">{t('instructions')}</div><pre className="skm-code">{detail.content}</pre>
      {detail.files.length > 0 && <><div className="skm-section-title">{t('resources')}<span className="skm-hint">{t('files', { count: detail.files.length })} · {bytes(detail.totalBytes)}</span></div><ul className="skm-file-list">{detail.files.map(file => <li key={file.path}><span className="skm-mono">{file.path}</span><span>{bytes(file.bytes)}</span></li>)}</ul></>}
    </>}
  </Dialog>
}
export function RestoreDialog({ backup, ...props }: CommonProps & { backup: Backup }): React.JSX.Element {
  const { t } = props
  const writableRoots = props.catalog.roots.filter(root => root.writable)
  const originalWritable = props.catalog.roots.find(root => root.id === backup.rootId)?.writable ?? false
  const [target, setTarget] = useState(originalWritable ? backup.rootId : writableRoots[0]?.id ?? backup.rootId)
  const [entry, setEntry] = useState(backup.entry)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  const sameRoot = target === backup.rootId
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function restore(): Promise<void> {
    if (busy) return
    setBusy(true); setError(''); props.onBusy(true, t('restoring'))
    try {
      const name = entry.trim()
      const result = await props.api.call<MutationResult>(sameRoot
        ? { action: 'restore', rootId: backup.rootId, backupId: backup.id, ...scope(props.workspaceId) }
        : { action: 'restore-to', fromRootId: backup.rootId, backupId: backup.id, toRootId: target, ...(name && name !== backup.entry ? { entry: name } : {}), ...scope(props.workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(false); props.onBusy(false); props.onSettled() }
  }
  return <Dialog title={t('restoreTitle')} t={t} alert onClose={close} footer={<><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={close}>{t('cancel')}</button><button type="button" className="skm-button skm-button-primary" disabled={busy || !target} onClick={() => void restore()}><Icon name={busy ? 'refresh' : 'restore'} spin={busy}/>{t(busy ? 'restoring' : 'confirmRestore')}</button></>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{sameRoot ? t('restoreBody') : t('restoreToBody')}</p><div className="skm-card"><div className="skm-card-mark skm-backup-icon"><Icon name="archive"/></div><div className="skm-card-main"><strong>{backup.name}</strong><div className="skm-hint">{time(backup.createdAt, props.locale)}</div><div className="skm-hint">{rootLabel(props.catalog.roots.find(root => root.id === backup.rootId), t)}</div></div></div>
    <label className="skm-field"><span className="skm-field-label">{t('restoreTarget')}</span><select className="skm-select" value={target} onChange={event => setTarget(event.target.value)} disabled={busy}>{writableRoots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)} · {root.path}</option>)}</select></label>
    {!sameRoot && <label className="skm-field"><span className="skm-field-label">{t('restoreName')}</span><input className="skm-input" value={entry} onChange={event => setEntry(event.target.value)} disabled={busy} maxLength={200}/></label>}
  </Dialog>
}

export function MoveDialog({ skill, ...props }: CommonProps & { skill: LocalSkill }): React.JSX.Element {
  const { t } = props
  const roots = props.catalog.roots.filter(root => root.writable)
  const [target, setTarget] = useState(roots[0]?.id ?? skill.rootId)
  const [entry, setEntry] = useState(skill.entry)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function move(): Promise<void> {
    if (busy || !target) return
    setBusy(true); setError(''); props.onBusy(true, t('moving'))
    try {
      const name = entry.trim()
      const result = await props.api.call<MutationResult>({ action: 'move', id: skill.id, rootId: target, ...(name && name !== skill.entry ? { entry: name } : {}), ...scope(props.workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(false); props.onBusy(false); props.onSettled() }
  }
  return <Dialog title={t('moveTitle')} t={t} onClose={close} footer={<><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={close}>{t('cancel')}</button><button type="button" className="skm-button skm-button-primary" disabled={busy || !target} onClick={() => void move()}><Icon name={busy ? 'refresh' : 'move'} spin={busy}/>{t(busy ? 'moving' : 'moveButton')}</button></>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{t('moveBody')}</p><div className="skm-hint skm-mono">{skill.path}</div>
    <label className="skm-field"><span className="skm-field-label">{t('moveRoot')}</span><select className="skm-select" value={target} onChange={event => setTarget(event.target.value)} disabled={busy}>{roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)} · {root.path}</option>)}</select></label>
    <label className="skm-field"><span className="skm-field-label">{t('moveName')}</span><input className="skm-input" value={entry} onChange={event => setEntry(event.target.value)} disabled={busy} maxLength={200}/></label>
  </Dialog>
}

export function BatchUpdateDialog({ skills, onBatch, ...props }: CommonProps & { skills: LocalSkill[]; onBatch(result: BatchUpdateResult): void }): React.JSX.Element {
  const { t } = props
  const [overwrite, setOverwrite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function run(): Promise<void> {
    if (busy) return
    setBusy(true); setError(''); props.onBusy(true, t('batchRunning'))
    try {
      const result = await props.api.call<BatchUpdateResult>({ action: 'update-batch', ids: skills.map(skill => skill.id), ...(overwrite ? { overwriteModified: true } : {}), ...scope(props.workspaceId) }, life.current.signal)
      onBatch(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(false); props.onBusy(false) }
  }
  return <Dialog title={t('batchTitle')} t={t} alert onClose={close} footer={<><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={close}>{t('cancel')}</button><button type="button" className="skm-button skm-button-primary" disabled={busy || skills.length === 0} onClick={() => void run()}><Icon name={busy ? 'refresh' : 'up'} spin={busy}/>{t(busy ? 'batchRunning' : 'confirmUpdate')}</button></>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{t('batchBody')}</p><ul className="skm-file-list">{skills.map(skill => <li key={skill.id}><span className="skm-mono">{skill.name}</span><span>{rootLabel(props.catalog.roots.find(root => root.id === skill.rootId), t)}</span></li>)}</ul>
    <label className="skm-checkbox"><input type="checkbox" checked={overwrite} onChange={event => setOverwrite(event.target.checked)} disabled={busy}/><span>{t('batchOverwrite')}</span></label>
  </Dialog>
}

export function PurgeDialog({ rootId, backup, count, onPurged, ...props }: CommonProps & { rootId: string; backup?: Backup | undefined; count: number; onPurged(removed: number, freedBytes: number): void }): React.JSX.Element {
  const { t } = props
  const [keep, setKeep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function purge(): Promise<void> {
    if (busy) return
    setBusy(true); setError(''); props.onBusy(true, t('purgeButton'))
    try {
      const result = await props.api.call<{ removed: number; freedBytes: number }>(backup ? { action: 'purge-backup', rootId, backupId: backup.id, ...scope(props.workspaceId) } : { action: 'purge-backups', rootId, keep, ...scope(props.workspaceId) }, life.current.signal)
      onPurged(result.removed, result.freedBytes)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(false); props.onBusy(false) }
  }
  return <Dialog title={backup ? t('purgeTitle') : t('purgeAllTitle')} t={t} alert onClose={close} footer={<><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={close}>{t('cancel')}</button><button type="button" className={`skm-button ${backup ? 'skm-button-danger' : 'skm-button-primary'}`} disabled={busy} onClick={() => void purge()}><Icon name={busy ? 'refresh' : 'trash'} spin={busy}/>{t(busy ? 'purgeButton' : 'purgeButton')}</button></>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{backup ? t('purgeBody') : t('purgeAllBody', { keep })}</p>
    {backup ? <div className="skm-card"><div className="skm-card-mark skm-backup-icon"><Icon name="archive"/></div><div className="skm-card-main"><strong>{backup.name}</strong><div className="skm-hint">{time(backup.createdAt, props.locale)} · {rootLabel(props.catalog.roots.find(root => root.id === backup.rootId), t)}</div></div></div>
      : <><p className="skm-hint">{t('backupEmptyBody')}</p><label className="skm-field"><span className="skm-field-label">{t('purgeKeep')}</span><input className="skm-input" type="number" min={0} max={10000} value={keep} onChange={event => setKeep(Math.max(0, Math.min(10000, Number(event.target.value) || 0)))} disabled={busy}/></label></>}
  </Dialog>
}

export function LocalInstallDialog({ ...props }: CommonProps): React.JSX.Element {
  const { t } = props
  const roots = props.catalog.roots.filter(root => root.writable)
  const [path, setPath] = useState('')
  const [rootId, setRootId] = useState(roots[0]?.id ?? '')
  const [trusted, setTrusted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  async function install(): Promise<void> {
    if (busy || !path.trim() || !rootId || !trusted) return
    setBusy(true); setError(''); props.onBusy(true, t('installing'))
    try {
      const result = await props.api.call<MutationResult>({ action: 'install-local', rootId, path: path.trim(), ...scope(props.workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(false); props.onBusy(false); props.onSettled() }
  }
  return <Dialog title={t('localTitle')} t={t} onClose={close} footer={<><button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={close}>{t('cancel')}</button><button type="button" className="skm-button skm-button-primary" disabled={busy || !path.trim() || !rootId || !trusted} onClick={() => void install()}><Icon name={busy ? 'refresh' : 'down'} spin={busy}/>{t(busy ? 'installing' : 'localButton')}</button></>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{t('localBody')}</p>
    <label className="skm-field"><span className="skm-field-label">{t('localPath')}</span><input className="skm-input" value={path} onChange={event => setPath(event.target.value)} placeholder={t('localPlaceholder')} autoComplete="off" spellCheck={false} disabled={busy} maxLength={4096}/></label>
    <label className="skm-field"><span className="skm-field-label">{t('target')}</span><select className="skm-select" value={rootId} onChange={event => setRootId(event.target.value)} disabled={busy}>{roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)} · {root.path}</option>)}</select></label>
    <label className="skm-checkbox"><input type="checkbox" checked={trusted} onChange={event => setTrusted(event.target.checked)} disabled={busy}/><span>{t('localTrust')}</span></label>
    <p className="skm-hint">{t('localHint')}</p>
  </Dialog>
}

export function WellKnownInstallDialog({ ...props }: CommonProps): React.JSX.Element {
  const { t } = props
  const roots = props.catalog.roots.filter(root => root.writable)
  const [source, setSource] = useState('')
  const [inspect, setInspect] = useState<WellKnownInspect | null>(null)
  const [picked, setPicked] = useState<WellKnownSkillEntry | null>(null)
  const [rootId, setRootId] = useState(roots[0]?.id ?? '')
  const [trusted, setTrusted] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const life = useRef(new AbortController())
  const alive = useRef(true)
  useEffect(() => { alive.current = true; if (life.current.signal.aborted) life.current = new AbortController(); return () => { alive.current = false; life.current.abort() } }, [])
  function close(): void { life.current.abort(); props.onClose() }
  function reset(): void { setPicked(null); setTrusted(false); setError('') }
  async function readSource(): Promise<void> {
    if (busy || !source.trim()) return
    setBusy('inspect'); setError(''); setInspect(null); reset()
    try {
      const value = await props.api.call<WellKnownInspect>({ action: 'well-known-inspect', source: source.trim(), ...scope(props.workspaceId) }, life.current.signal)
      if (alive.current) setInspect(value)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy('') }
  }
  async function install(): Promise<void> {
    if (busy || !inspect || !picked || !rootId || !trusted) return
    setBusy('install'); setError(''); props.onBusy(true, t('installing'))
    try {
      const result = await props.api.call<MutationResult>({ action: 'well-known-install', rootId, source: inspect.baseUrl, name: picked.name, ...scope(props.workspaceId) }, life.current.signal)
      props.onMutated(result)
    } catch (error) { const message = errorText(error); if (alive.current) setError(message); props.onError(message) }
    finally { if (alive.current) setBusy(''); props.onBusy(false); props.onSettled() }
  }
  return <Dialog title={t('wellKnownTitle')} t={t} onClose={close} footer={<>
    <button type="button" className="skm-button skm-button-quiet" data-autofocus onClick={() => { if (picked) reset(); else close() }} disabled={busy === 'install'}>{picked ? t('back') : t('cancel')}</button>
    {!inspect ? <button type="button" className="skm-button skm-button-primary" disabled={!!busy || !source.trim()} onClick={() => void readSource()}><Icon name={busy === 'inspect' ? 'refresh' : 'search'} spin={busy === 'inspect'}/>{t('wellKnownInspect')}</button>
      : <button type="button" className="skm-button skm-button-primary" disabled={!!busy || !picked || !rootId || !trusted || picked.type !== 'archive'} onClick={() => void install()}><Icon name={busy === 'install' ? 'refresh' : 'down'} spin={busy === 'install'}/>{t('wellKnownInstall')}</button>}
  </>}>
    {error && <Notice text={error} kind="error"/>}<p className="skm-plain-text">{t('wellKnownBody')}</p>
    {!inspect ? <label className="skm-field"><span className="skm-field-label">{t('source')}</span><input className="skm-input" value={source} onChange={event => setSource(event.target.value)} placeholder={t('wellKnownPlaceholder')} autoComplete="off" spellCheck={false} disabled={!!busy} maxLength={400}/></label>
      : !picked ? <>{inspect.warnings.map((warning, index) => <Notice key={index} text={warning} kind="warning"/>)}<div className="skm-section-title">{t('wellKnownSkills')}<span className="skm-count">{inspect.skills.length}</span></div><div className="skm-skill-options">{inspect.skills.map(entry => <button type="button" className="skm-skill-option" key={entry.name} disabled={entry.type !== 'archive'} onClick={() => setPicked(entry)}><Icon name={entry.type === 'archive' ? 'book' : 'lock'}/><span className="skm-skill-option-main"><strong>{entry.name}</strong><span className="skm-description">{entry.description ?? ''}</span><span className="skm-mono skm-hint">{entry.type === 'archive' ? entry.digest.slice(7, 19) : t('wellKnownUnsupported')}</span></span><Icon name="arrow" size={16}/></button>)}</div></>
        : <><div className="skm-card"><div className="skm-card-mark"><Icon name="book"/></div><div className="skm-card-main"><strong>{picked.name}</strong><p className="skm-description">{picked.description ?? ''}</p><div className="skm-meta"><span className="skm-mono">{inspect.label}</span><span className="skm-mono">{picked.digest.slice(7, 19)}</span></div></div></div>
          <label className="skm-field"><span className="skm-field-label">{t('target')}</span><select className="skm-select" value={rootId} onChange={event => setRootId(event.target.value)} disabled={!!busy}>{roots.map(root => <option key={root.id} value={root.id}>{rootLabel(root, t)} · {root.path}</option>)}</select></label>
          <label className="skm-checkbox"><input type="checkbox" checked={trusted} onChange={event => setTrusted(event.target.checked)} disabled={!!busy}/><span>{t('trust')}</span></label>
          <p className="skm-hint">{t('wellKnownHint')}</p></>}
  </Dialog>
}
