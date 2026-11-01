import React, { useState } from 'react';
import {
  ApplicationRecord,
  ApplicationStage,
  AssessmentQuestion,
  JobRole,
  StarFlashcard,
  UserProfile,
} from '../types';
import { calculateJobMatch } from '../utils/matchEngine';
import { CompanyBadge } from './BrandVisuals';
import {
  AssessmentSimulatorModal,
  InterviewLobbyModal,
  OfferPackageModal,
  PrepGuideModal,
  StarFlashcardsModal,
} from './ToolkitModals';

interface TrackerViewProps {
  applications: ApplicationRecord[];
  jobs: JobRole[];
  profile: UserProfile;
  flashcards: StarFlashcard[];
  assessmentQuestions: AssessmentQuestion[];
  masteredFlashcardIds: string[];
  onSelectJob: (job: JobRole) => void;
  onSaveInterviewNote: (appId: string, questionId: string, note: string) => void;
  onAdvanceApplicationStage: (appId: string, nextStage: ApplicationStage, score?: number) => void;
  onAcceptOffer: (appId: string) => void;
  onToggleMasteredFlashcard: (cardId: string) => void;
  onPassToolkitQuiz: () => void;
  onShowToast: (msg: string) => void;
  onExploreRoles: () => void;
}

export function TrackerView({
  applications,
  jobs,
  profile,
  flashcards,
  assessmentQuestions,
  masteredFlashcardIds,
  onSelectJob,
  onSaveInterviewNote,
  onAdvanceApplicationStage,
  onAcceptOffer,
  onToggleMasteredFlashcard,
  onPassToolkitQuiz,
  onShowToast,
  onExploreRoles,
}: TrackerViewProps) {
  const [stageFilter, setStageFilter] = useState<'all' | ApplicationStage>('all');
  const [prepTarget, setPrepTarget] = useState<{ app: ApplicationRecord; job: JobRole } | null>(
    null
  );
  const [lobbyTarget, setLobbyTarget] = useState<{ app: ApplicationRecord; job: JobRole } | null>(
    null
  );
  const [assessmentTarget, setAssessmentTarget] = useState<{
    mode: 'application' | 'toolkit';
    app?: ApplicationRecord;
    job?: JobRole;
  } | null>(null);
  const [offerTarget, setOfferTarget] = useState<{
    app: ApplicationRecord | null;
    job: JobRole | null;
  } | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  const counts = {
    all: applications.length,
    applied: applications.filter((a) => a.stage === 'applied').length,
    assessment: applications.filter((a) => a.stage === 'assessment').length,
    interview: applications.filter((a) => a.stage === 'interview').length,
    offers: applications.filter((a) => a.stage === 'offers').length,
  };

  const filteredApps = applications.filter((a) =>
    stageFilter === 'all' ? true : a.stage === stageFilter
  );

  const filterTabs: { key: 'all' | ApplicationStage; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'applied', label: 'Applied', count: counts.applied },
    { key: 'assessment', label: 'Assessment', count: counts.assessment },
    { key: 'interview', label: 'Interview', count: counts.interview },
    { key: 'offers', label: 'Offers', count: counts.offers },
  ];

  const handleCopyScript = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    onShowToast('Negotiation email copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* Header Overview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-primary">Live Pipeline Tracker</p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mt-0.5">
              My Applications
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 tabular-nums">
              {counts.all - counts.offers} Active in Pipeline · {counts.offers}{' '}
              {counts.offers === 1 ? 'Offer' : 'Offers'} Received
            </p>
          </div>
        </div>

        {/* Segmented Pipeline Stage Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {filterTabs.map((tab) => {
            const active = stageFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStageFilter(tab.key)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 border ${
                  active
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/35 hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`tabular-nums text-[11px] font-bold ${
                    active ? 'text-on-primary/90' : 'text-outline'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Layout: 2-Column on Desktop (Pipeline Feed + Fresher Toolkit) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {filteredApps.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 text-center space-y-3">
              <span className="material-symbols-outlined text-outline text-[34px]">
                assignment_turned_in
              </span>
              <h2 className="font-display font-bold text-base text-on-surface">
                No applications in this stage yet
              </h2>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">
                Use 1-Tap Fast Apply on any graduate cohort role or view all pipeline stages.
              </p>
              <div className="flex justify-center gap-2">
                {stageFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setStageFilter('all')}
                    className="min-h-[42px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
                  >
                    Show All Stages
                  </button>
                )}
                <button
                  type="button"
                  onClick={onExploreRoles}
                  className="min-h-[42px] px-4 rounded-xl bg-primary text-on-primary text-xs font-display font-semibold"
                >
                  Browse Roles
                </button>
              </div>
            </div>
          ) : (
            filteredApps.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              if (!job) return null;
              const match = calculateJobMatch(job, profile);

              const barActiveColor =
                app.stage === 'offers'
                  ? 'bg-secondary'
                  : app.stage === 'assessment'
                  ? 'bg-tertiary-fixed-dim'
                  : 'bg-primary';

              return (
                <article
                  key={app.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 space-y-4"
                >
                  {/* Top Header */}
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
                          {job.company} · {job.location}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap tabular-nums">
                      {app.stage === 'offers'
                        ? app.offerDetails?.accepted
                          ? 'Signed & Accepted'
                          : 'Offer Ready'
                        : app.stage === 'applied'
                        ? `Applied ${app.appliedDate}`
                        : `${match.score}% Match`}
                    </span>
                  </div>

                  {/* 4-Step Segmented Pipeline Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-semibold ${
                          app.stage === 'offers'
                            ? 'text-secondary'
                            : app.stage === 'assessment'
                            ? 'text-tertiary-container'
                            : 'text-primary'
                        }`}
                      >
                        {app.stageLabel}
                      </span>
                      <span className="text-on-surface-variant tabular-nums">
                        Step {app.stepNumber} of 4
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`rounded-full transition-colors ${
                            step <= app.stepNumber ? barActiveColor : 'bg-surface-container-high'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Status Callout Row */}
                  <div
                    className={`p-3 rounded-xl flex items-center justify-between gap-2 text-xs ${
                      app.stage === 'offers'
                        ? 'bg-secondary-container/35 text-on-secondary-fixed'
                        : app.stage === 'assessment'
                        ? 'bg-tertiary-fixed/35 text-on-tertiary-fixed'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-[18px] shrink-0 text-primary">
                        {app.statusBannerIcon}
                      </span>
                      <span className="font-semibold truncate">{app.statusBannerText}</span>
                    </div>
                    {app.urgencyRightText && (
                      <span className="font-bold text-secondary whitespace-nowrap">
                        {app.urgencyRightText}
                      </span>
                    )}
                  </div>

                  {/* Stage-Specific Functional Actions */}
                  {app.stage === 'interview' && (
                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setPrepTarget({ app, job })}
                        className="min-h-[44px] px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">quiz</span>
                        <span>Prep Guide ({job.prepQuestions.length} Qs)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLobbyTarget({ app, job })}
                        className="min-h-[44px] px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">videocam</span>
                        <span>Join Call Lobby</span>
                      </button>
                    </div>
                  )}

                  {app.stage === 'assessment' && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setAssessmentTarget({ mode: 'application', app, job })
                        }
                        className="w-full min-h-[44px] px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        <span>Start Technical Assessment (15m)</span>
                      </button>
                    </div>
                  )}

                  {app.stage === 'offers' && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setOfferTarget({ app, job })}
                        className="w-full min-h-[44px] px-4 rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                      >
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>
                          {app.offerDetails?.accepted
                            ? 'View Signed Offer Package'
                            : 'Review Offer & Negotiation Calculator'}
                        </span>
                      </button>
                    </div>
                  )}

                  {app.stage === 'applied' && (
                    <div className="flex items-center justify-between pt-1 text-xs text-on-surface-variant">
                      <span className="truncate">
                        Packet: {app.resumeUsed}
                        {app.attachedProjectTitle ? ` · ${app.attachedProjectTitle}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectJob(job)}
                        className="font-semibold text-primary hover:underline whitespace-nowrap ml-2"
                      >
                        Role Spec
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Column: Supportive Fresher Interview Toolkit */}
        <aside className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-on-surface">
              Graduate Interview Toolkit
            </h2>
            <span className="text-xs font-semibold text-primary">Interactive Prep</span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setShowFlashcards(true)}
              className="w-full text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">style</span>
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-on-surface truncate group-hover:text-primary transition-colors">
                    STAR Method Flashcards
                  </p>
                  <p className="text-xs text-on-surface-variant truncate tabular-nums">
                    {masteredFlashcardIds.length}/{flashcards.length} behavioral scenarios mastered
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>

            <button
              type="button"
              onClick={() => setOfferTarget({ app: null, job: null })}
              className="w-full text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed/60 flex items-center justify-center text-on-secondary-fixed-variant shrink-0">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-on-surface truncate group-hover:text-secondary transition-colors">
                    Salary Negotiation Script
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    Entry-level counter-offer email builder
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAssessmentTarget({ mode: 'toolkit' })}
              className="w-full text-left p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shrink-0">
                  <span className="material-symbols-outlined text-[20px]">terminal</span>
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-on-surface truncate group-hover:text-tertiary transition-colors">
                    Practice Coding & SQL Quiz
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    15-minute timed engineering benchmark
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>
          </div>
        </aside>
      </div>

      {/* Modals */}
      {prepTarget && (
        <PrepGuideModal
          app={
            applications.find((a) => a.id === prepTarget.app.id) || prepTarget.app
          }
          job={prepTarget.job}
          onClose={() => setPrepTarget(null)}
          onSaveNote={onSaveInterviewNote}
        />
      )}

      {lobbyTarget && (
        <InterviewLobbyModal
          job={lobbyTarget.job}
          onClose={() => setLobbyTarget(null)}
          onMarkCompleted={() => {
            onAdvanceApplicationStage(lobbyTarget.app.id, 'offers');
            onShowToast(`Interview logged! ${lobbyTarget.job.company} moved to Offer review.`);
          }}
        />
      )}

      {assessmentTarget && (
        <AssessmentSimulatorModal
          title={
            assessmentTarget.job
              ? `${assessmentTarget.job.company} Technical Assessment`
              : 'Graduate Engineering Benchmark'
          }
          subtitle={
            assessmentTarget.job
              ? assessmentTarget.job.title
              : 'Verified Skill Readiness Practice'
          }
          questions={assessmentQuestions}
          onClose={() => setAssessmentTarget(null)}
          onCompleteScore={(score) => {
            if (assessmentTarget.mode === 'application' && assessmentTarget.app) {
              if (score >= 50) {
                onAdvanceApplicationStage(assessmentTarget.app.id, 'interview', score);
                onShowToast(
                  `Scored ${score}%! Advanced ${assessmentTarget.job?.company} to Interview stage.`
                );
              }
            } else if (score >= 75) {
              onPassToolkitQuiz();
            }
          }}
        />
      )}

      {offerTarget && (
        <OfferPackageModal
          app={
            offerTarget.app
              ? applications.find((a) => a.id === offerTarget.app?.id) || offerTarget.app
              : null
          }
          job={offerTarget.job}
          candidateName={profile.name}
          onClose={() => setOfferTarget(null)}
          onAcceptOffer={offerTarget.app ? onAcceptOffer : undefined}
          onCopyScript={handleCopyScript}
        />
      )}

      {showFlashcards && (
        <StarFlashcardsModal
          flashcards={flashcards}
          masteredIds={masteredFlashcardIds}
          onToggleMastered={onToggleMasteredFlashcard}
          onClose={() => setShowFlashcards(false)}
        />
      )}
    </div>
  );
}
