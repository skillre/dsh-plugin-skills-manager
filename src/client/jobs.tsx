import React from 'react'
import type { SkillRoot, UpdateJob, UpdateJobItem } from '../types.js'
import type { Translate } from './messages.js'
import { Empty, Icon, ProgressBar, rootLabel, time } from './components.js'

const jobStatusKey: Record<UpdateJob['status'], string> = { running: 'jobStatusRunning', completed: 'jobStatusCompleted', failed: 'jobStatusFailed', cancelled: 'jobStatusCancelled' }
const itemStatusKey: Record<UpdateJobItem['status'], string> = { pending: 'jobItemPending', running: 'jobItemRunning', updated: 'jobItemUpdated', failed: 'jobItemFailed', skipped: 'jobItemSkipped', cancelled: 'jobItemCancelled' }
const phaseKey: Record<string, string> = { queued: 'phaseQueued', resolve: 'phaseResolve', download: 'phaseDownload', verify: 'phaseVerify', backup: 'phaseBackup', install: 'phaseInstall', done: 'phaseDone' }

function itemTone(status: UpdateJobItem['status']): string {
  return status === 'updated' ? 'skm-badge-success' : status === 'failed' ? 'skm-badge-error' : status === 'running' ? 'skm-badge-update' : ''
}
function jobTone(status: UpdateJob['status']): string {
  return status === 'running' ? 'skm-badge-update' : status === 'completed' ? 'skm-badge-success' : status === 'failed' ? 'skm-badge-error' : ''
}

export interface JobsPanelProps {
  jobs: UpdateJob[]
  roots: SkillRoot[]
  t: Translate
  locale: string
  onCancel(jobId: string): void
  onRetry(job: UpdateJob): void
  onOpenSkill(id: string): void
}

export function JobsPanel({ jobs, roots, t, locale, onCancel, onRetry, onOpenSkill }: JobsPanelProps): React.JSX.Element {
  if (jobs.length === 0) return <Empty title={t('jobsEmpty')} body={t('jobsEmptyBody')} icon="list"/>
  return <div className="skm-list">{jobs.map(job => {
    const running = job.status === 'running'
    return <article className="skm-card skm-job" key={job.id} data-job-status={job.status}>
      <div className="skm-card-main">
        <div className="skm-card-head">
          <strong className="skm-result-name">{job.kind === 'update' ? t('jobSingle', { name: job.items[0]?.name ?? '' }) : t('jobBatch', { count: job.total })}</strong>
          <span className={`skm-badge ${jobTone(job.status)}`}>{t(jobStatusKey[job.status])}</span>
          {running && <span className="skm-hint skm-job-percent">{t('jobProgress', { percent: job.progress })}</span>}
        </div>
        <ProgressBar value={job.progress} label={t('jobProgress', { percent: job.progress })}/>
        <div className="skm-meta skm-job-meta">
          <span>{t('jobCounts', { updated: job.succeeded, failed: job.failed, skipped: job.skipped, cancelled: job.cancelled })}</span>
          {job.startedAt && <span>{t('jobStartedAt', { time: time(job.startedAt, locale) })}</span>}
          {job.finishedAt && <span>{t('jobFinishedAt', { time: time(job.finishedAt, locale) })}</span>}
        </div>
        <ul className="skm-job-items">{job.items.map(item => <li className="skm-job-item" key={item.id} data-status={item.status}>
          <div className="skm-job-item-head">
            <span className="skm-job-name">{item.name}</span>
            <span className={`skm-badge ${itemTone(item.status)}`}>{t(itemStatusKey[item.status])}</span>
            {item.status === 'running' && <span className="skm-hint">{t('jobProgress', { percent: item.progress })} · {t(phaseKey[item.phase ?? 'queued'] ?? 'phaseQueued')}</span>}
            {item.status !== 'running' && item.status !== 'pending' && item.message && !item.error && <span className="skm-hint">{item.message}</span>}
            <button className="skm-button skm-button-quiet skm-job-open" type="button" aria-label={`${t('jobViewSkill')} ${item.name}`} title={t('jobViewSkill')} onClick={() => onOpenSkill(item.id)}><Icon name="info" size={13}/></button>
          </div>
          {item.status === 'running' && <ProgressBar value={item.progress} label={`${item.name} ${t('jobProgress', { percent: item.progress })}`}/>}
          {item.error && <p className="skm-hint skm-job-error" role="status">{item.error}</p>}
          <div className="skm-meta">
            <span className="skm-mono">{item.entry}</span>
            {rootLabel(roots.find(root => root.id === item.rootId), t) && <span>{rootLabel(roots.find(root => root.id === item.rootId), t)}</span>}
            {item.backupId && <span className="skm-mono">{t('jobBackup', { id: item.backupId.slice(0, 8) })}</span>}
            {item.commit && <span className="skm-mono">{item.commit.slice(0, 8)}</span>}
          </div>
        </li>)}</ul>
        {running && <div className="skm-job-actions"><button className="skm-button skm-button-quiet" type="button" disabled={!!job.cancelRequested} onClick={() => onCancel(job.id)}><Icon name="close" size={13}/>{job.cancelRequested ? t('jobCancelRequested') : t('jobCancel')}</button></div>}
        {!running && job.failed > 0 && <div className="skm-job-actions"><button className="skm-button" type="button" onClick={() => onRetry(job)}><Icon name="refresh" size={13}/>{t('jobRetry')}</button></div>}
      </div>
    </article>
  })}</div>
}
