import React, { useState } from 'react';
import { JobRole, UserProfile } from '../types';
import { calculateJobMatch } from '../utils/matchEngine';
import { CompanyBadge } from './BrandVisuals';

interface SavedViewProps {
  jobs: JobRole[];
  savedJobIds: string[];
  savedNotes: Record<string, string>;
  appliedJobIds: Set<string>;
  profile: UserProfile;
  onSelectJob: (job: JobRole) => void;
  onOpenFastApply: (job: JobRole) => void;
  onToggleSave: (jobId: string) => void;
  onUpdateNote: (jobId: string, note: string) => void;
  onExploreRoles: () => void;
}

export function SavedView({
  jobs,
  savedJobIds,
  savedNotes,
  appliedJobIds,
  profile,
  onSelectJob,
  onOpenFastApply,
  onToggleSave,
  onUpdateNote,
  onExploreRoles,
}: SavedViewProps) {
  const [compareMode, setCompareMode] = useState(false);

  const savedJobs = savedJobIds
    .map((id) => jobs.find((j) => j.id === id))
    .filter((j): j is JobRole => Boolean(j));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">Shortlist & Compensation Matrix</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mt-0.5">
            Saved Graduate Roles
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 tabular-nums">
            {savedJobs.length} {savedJobs.length === 1 ? 'role' : 'roles'} bookmarked for review
          </p>
        </div>

        {savedJobs.length >= 2 && (
          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className={`min-h-[44px] px-4 rounded-xl font-display font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap self-start sm:self-auto ${
              compareMode
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest border border-outline-variant/35 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
            <span>{compareMode ? 'Exit Comparison Table' : 'Compare Side-by-Side'}</span>
          </button>
        )}
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/30 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">bookmark_add</span>
          </div>
          <h2 className="font-display font-bold text-lg text-on-surface">
            Your saved shortlist is empty
          </h2>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto">
            Bookmark entry-level roles while browsing Discover to track application notes and
            compare base pay, sign-on bonuses, and mentorship side-by-side.
          </p>
          <button
            type="button"
            onClick={onExploreRoles}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs inline-flex items-center gap-1.5"
          >
            <span>Explore Curated Roles</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      ) : compareMode ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant/25 bg-surface-container-low/60">
                <th className="p-4 text-xs font-semibold text-on-surface-variant w-44">
                  Comparison Criteria
                </th>
                {savedJobs.map((job) => (
                  <th key={job.id} className="p-4 align-top">
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="text-left group"
                    >
                      <p className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-on-surface-variant font-normal">{job.company}</p>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm">
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">
                  Profile Match
                </td>
                {savedJobs.map((job) => {
                  const m = calculateJobMatch(job, profile);
                  return (
                    <td key={job.id} className="p-4 font-bold text-secondary tabular-nums">
                      {m.score}% Match
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">Base Salary</td>
                {savedJobs.map((job) => (
                  <td key={job.id} className="p-4 font-semibold text-on-surface tabular-nums">
                    {job.salaryDisplay}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">
                  Sign-on / Relocation
                </td>
                {savedJobs.map((job) => (
                  <td key={job.id} className="p-4 text-on-surface tabular-nums">
                    {job.signOnBonus}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">
                  Equity & Stipend
                </td>
                {savedJobs.map((job) => (
                  <td key={job.id} className="p-4 text-on-surface-variant">
                    {job.equityGrant} · {job.annualStipend}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">
                  Location & Mode
                </td>
                {savedJobs.map((job) => (
                  <td key={job.id} className="p-4 text-on-surface-variant">
                    {job.location}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-xs font-semibold text-on-surface-variant">Action</td>
                {savedJobs.map((job) => {
                  const applied = appliedJobIds.has(job.id);
                  return (
                    <td key={job.id} className="p-4">
                      <button
                        type="button"
                        onClick={() => onOpenFastApply(job)}
                        className={`min-h-[40px] px-3.5 rounded-xl font-display font-semibold text-xs whitespace-nowrap ${
                          applied
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-primary text-on-primary hover:bg-primary-container'
                        }`}
                      >
                        {applied ? 'Applied' : 'Fast Apply'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedJobs.map((job) => {
            const match = calculateJobMatch(job, profile);
            const applied = appliedJobIds.has(job.id);
            const note = savedNotes[job.id] || '';

            return (
              <article
                key={job.id}
                className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => onSelectJob(job)}
                      className="flex items-center gap-3.5 cursor-pointer group min-w-0"
                    >
                      <CompanyBadge iconName={job.iconName} accent={job.brandAccent} />
                      <div className="min-w-0">
                        <h2 className="font-display font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                          {job.title}
                        </h2>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {job.companyFull} · {job.location}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleSave(job.id)}
                      title="Remove from Saved"
                      className="min-w-[40px] min-h-[40px] rounded-xl text-primary bg-primary-fixed/40 hover:bg-primary-fixed flex items-center justify-center transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined material-symbols-filled text-[20px]">
                        bookmark
                      </span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
                    <span className="font-bold text-on-surface tabular-nums">
                      {job.salaryDisplay}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-secondary font-semibold tabular-nums">
                      {match.score}% Match
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{job.startDate}</span>
                  </div>

                  <label className="block pt-1">
                    <span className="text-[11px] font-semibold text-on-surface-variant block mb-1">
                      Personal Prep / Referral Note
                    </span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => onUpdateNote(job.id, e.target.value)}
                      placeholder="Add a reminder (e.g. Reach out to UW alum on team)..."
                      className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenFastApply(job)}
                    className={`flex-1 min-h-[44px] px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                      applied
                        ? 'bg-secondary/15 text-secondary'
                        : 'bg-primary text-on-primary hover:bg-primary-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {applied ? 'check_circle' : 'bolt'}
                    </span>
                    <span>{applied ? 'Applied' : 'Fast Apply'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="min-h-[44px] px-4 rounded-xl bg-surface-container text-primary font-display font-semibold text-xs hover:bg-surface-container-high transition-colors whitespace-nowrap"
                  >
                    Full Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
