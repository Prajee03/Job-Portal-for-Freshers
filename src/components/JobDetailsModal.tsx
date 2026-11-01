import React from 'react';
import { JobRole, UserProfile } from '../types';
import { calculateJobMatch } from '../utils/matchEngine';
import { CompanyBadge, CultureSceneCard } from './BrandVisuals';

interface JobDetailsModalProps {
  job: JobRole | null;
  profile: UserProfile;
  isSaved: boolean;
  isApplied: boolean;
  onClose: () => void;
  onToggleSave: (jobId: string) => void;
  onShareJob: (job: JobRole) => void;
  onOpenFastApply: (job: JobRole) => void;
  onQuickAddSkill: (skill: string) => void;
  onGoToTracker: () => void;
}

export function JobDetailsModal({
  job,
  profile,
  isSaved,
  isApplied,
  onClose,
  onToggleSave,
  onShareJob,
  onOpenFastApply,
  onQuickAddSkill,
  onGoToTracker,
}: JobDetailsModalProps) {
  if (!job) return null;

  const match = calculateJobMatch(job, profile);

  return (
    <div
      className="fixed inset-0 z-40 bg-background overflow-y-auto flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-details-heading"
    >
      {/* Compact Sticky Top Bar */}
      <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 bg-surface/90 backdrop-blur-md border-b border-outline-variant/25 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-2 -ml-2 rounded-lg flex items-center gap-2 text-sm font-medium text-on-surface hover:text-primary transition-colors whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          <span>Back to Roles</span>
        </button>

        <span className="font-display font-semibold text-sm text-on-surface truncate">
          {job.companyFull}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            aria-label={isSaved ? 'Remove from saved roles' : 'Save role'}
            className={`min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center transition-colors ${
              isSaved ? 'text-primary bg-primary-fixed/50' : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[21px] ${
                isSaved ? 'material-symbols-filled' : ''
              }`}
            >
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onShareJob(job)}
            aria-label="Share job link"
            className="min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Role Narrative */}
        <div className="lg:col-span-7 space-y-6">
          {/* Role Overview */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-4">
            <div className="flex items-start gap-4">
              <CompanyBadge iconName={job.iconName} accent={job.brandAccent} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                  <span className="font-semibold text-on-surface">{job.companyFull}</span>
                  {job.verifiedFresher && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-secondary font-semibold">
                        <span className="material-symbols-outlined material-symbols-filled text-[14px]">
                          verified
                        </span>
                        Verified Graduate Employer
                      </span>
                    </>
                  )}
                </div>
                <h1
                  id="job-details-heading"
                  className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mt-1"
                >
                  {job.title}
                </h1>
                <p className="text-sm font-semibold text-primary mt-0.5">{job.cohortSubtitle}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">
                  location_on
                </span>
                {job.location}
              </span>
              <span aria-hidden="true">·</span>
              <span>{job.startDate}</span>
              <span aria-hidden="true">·</span>
              <span>{job.cohortSize}</span>
              <span aria-hidden="true">·</span>
              <span>Posted {job.postedAgo}</span>
            </div>
          </section>

          {/* Why It's Exceptional for New Grads */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">
                rocket_launch
              </span>
              <h2 className="font-display font-bold text-lg text-on-surface">
                Why It’s Exceptional for New Grads
              </h2>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {job.fresherHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3.5 ${idx === 0 ? 'pb-4' : idx === job.fresherHighlights.length - 1 ? 'pt-4' : 'py-4'}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-on-surface">
                      {item.title}
                    </h3>
                    <p className="text-sm text-on-surface-variant mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Role Responsibilities */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-3.5">
            <h2 className="font-display font-bold text-lg text-on-surface">
              What You’ll Actually Do
            </h2>
            <ul className="space-y-2.5 text-sm text-on-surface-variant leading-relaxed">
              {job.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">
                    check
                  </span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-3.5">
            <h2 className="font-display font-bold text-lg text-on-surface">
              Candidate Qualifications
            </h2>
            <ul className="space-y-2.5 text-sm text-on-surface-variant leading-relaxed">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary mt-0.5 shrink-0">
                    task_alt
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right Column: Compensation, Live Skill Alignment & Culture */}
        <div className="lg:col-span-5 space-y-6">
          {/* Compensation & Total Reward Transparency */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display font-bold text-base text-on-surface">
                Compensation & Equity
              </h2>
              <span className="text-xs font-semibold text-secondary">Verified Transparent</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-3xl text-on-surface tracking-tight tabular-nums">
                {job.salaryDisplay}
              </span>
              <span className="text-sm text-on-surface-variant">/ base year</span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20 text-sm">
              <div>
                <p className="text-xs text-on-surface-variant">Sign-on / Setup</p>
                <p className="font-display font-semibold text-on-surface tabular-nums mt-0.5">
                  {job.signOnBonus}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Equity & Upside</p>
                <p className="font-display font-semibold text-on-surface mt-0.5">
                  {job.equityGrant}
                </p>
              </div>
            </div>
          </section>

          {/* Algorithmic Profile Alignment */}
          <section className="bg-surface-container-low rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold text-base text-on-surface">
                  Profile Alignment
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Computed live from your skills & capstones
                </p>
              </div>
              <span className="font-display font-bold text-xl text-secondary tabular-nums">
                {match.score}% Match
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
              <div
                className="h-full rounded-full bg-secondary transition-all duration-300"
                style={{ width: `${match.score}%` }}
              />
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <p className="text-xs font-semibold text-secondary mb-1.5">
                  You already bring ({match.matchedSkills.length}/{job.requiredSkills.length})
                </p>
                <p className="text-sm text-on-surface font-medium">
                  {match.matchedSkills.length > 0
                    ? match.matchedSkills.join(' · ')
                    : 'Add matching skills below to update alignment'}
                </p>
              </div>

              {match.missingSkills.length > 0 && (
                <div className="pt-2 border-t border-outline-variant/25">
                  <p className="text-xs font-semibold text-on-surface-variant mb-1.5">
                    Have any of these skills? Tap to add to your profile:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.missingSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => onQuickAddSkill(skill)}
                        className="min-h-[36px] px-3 py-1 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-semibold text-primary hover:bg-primary-fixed/40 transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-outline-variant/25">
                <p className="text-xs font-semibold text-tertiary-container mb-1">
                  Taught on the job with 1-on-1 mentor
                </p>
                <p className="text-sm text-on-surface-variant">
                  {match.mentoredSkills.join(' · ')}
                </p>
              </div>
            </div>
          </section>

          {/* Team & Culture Pods */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/25 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-on-surface">
                Engineering Environment
              </h2>
              <span className="text-xs text-on-surface-variant">{job.workMode}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CultureSceneCard label={job.officeHubName} variant="hub" />
              <CultureSceneCard label={job.peerPodName} variant="pod" />
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/25 px-4 py-3 pb-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="font-display font-bold text-sm text-on-surface">{job.title}</p>
            <p className="text-xs text-on-surface-variant tabular-nums">
              {job.salaryDisplay} · {match.score}% Profile Alignment
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              className="min-w-[48px] min-h-[48px] px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isSaved ? 'material-symbols-filled text-primary' : ''
                }`}
              >
                {isSaved ? 'bookmark' : 'bookmark_border'}
              </span>
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {isApplied ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToTracker();
                }}
                className="flex-1 sm:flex-initial sm:min-w-[260px] min-h-[48px] px-5 rounded-xl bg-secondary text-on-secondary font-display font-semibold text-sm flex items-center justify-center gap-2 hover:bg-on-secondary-container transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                <span>Applied · View in Tracker</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenFastApply(job)}
                className="flex-1 sm:flex-initial sm:min-w-[260px] min-h-[48px] px-5 rounded-xl bg-primary text-on-primary font-display font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.99] transition-all shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined material-symbols-filled text-[20px]">
                  bolt
                </span>
                <span>Fast Apply with LaunchGrad</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
