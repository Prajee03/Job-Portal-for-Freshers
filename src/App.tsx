/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './components/AppShell';
import { DiscoverView } from './components/DiscoverView';
import { FastApplyDrawer } from './components/FastApplyDrawer';
import { JobDetailsModal } from './components/JobDetailsModal';
import { ProfileView } from './components/ProfileView';
import { SavedView } from './components/SavedView';
import { TrackerView } from './components/TrackerView';
import {
  ASSESSMENT_QUESTIONS,
  GRADUATE_COHORTS,
  INITIAL_STATE,
  JOB_ROLES,
  STAR_FLASHCARDS,
} from './data/seedData';
import {
  AppNotification,
  ApplicationStage,
  AssessmentQuestion,
  GraduateCohort,
  JobRole,
  LaunchGradState,
  StarFlashcard,
  TabRoute,
  UserProfile,
} from './types';

const LOCAL_CACHE_KEY = 'launchgrad_state_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabRoute>('discover');
  const [jobs, setJobs] = useState<JobRole[]>(JOB_ROLES);
  const [cohorts, setCohorts] = useState<GraduateCohort[]>(GRADUATE_COHORTS);
  const [flashcards, setFlashcards] = useState<StarFlashcard[]>(STAR_FLASHCARDS);
  const [assessmentQuestions, setAssessmentQuestions] =
    useState<AssessmentQuestion[]>(ASSESSMENT_QUESTIONS);

  const [appState, setAppState] = useState<LaunchGradState>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) return JSON.parse(cached) as LaunchGradState;
    } catch {
      // ignore localStorage read errors
    }
    return INITIAL_STATE;
  });

  const [selectedJob, setSelectedJob] = useState<JobRole | null>(null);
  const [fastApplyJob, setFastApplyJob] = useState<JobRole | null>(null);
  const [openAddProjectModal, setOpenAddProjectModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Load persisted full-stack state from Express server on mount
  useEffect(() => {
    let active = true;
    fetch('/api/bootstrap')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (data.jobs) setJobs(data.jobs);
        if (data.cohorts) setCohorts(data.cohorts);
        if (data.flashcards) setFlashcards(data.flashcards);
        if (data.assessmentQuestions) setAssessmentQuestions(data.assessmentQuestions);
        if (data.state) {
          setAppState(data.state);
          try {
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data.state));
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        // Fallback to local state if offline
      });
    return () => {
      active = false;
    };
  }, []);

  const persistState = useCallback((updater: (prev: LaunchGradState) => LaunchGradState) => {
    setAppState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      }).catch(() => {});
      return next;
    });
  }, []);

  const appliedJobIds = useMemo(
    () => new Set(appState.applications.map((a) => a.jobId)),
    [appState.applications]
  );

  const handleToggleSave = useCallback(
    (jobId: string) => {
      const currentlySaved = appState.savedJobIds.includes(jobId);
      persistState((prev) => ({
        ...prev,
        savedJobIds: currentlySaved
          ? prev.savedJobIds.filter((id) => id !== jobId)
          : [jobId, ...prev.savedJobIds],
      }));
      showToast(currentlySaved ? 'Removed from Saved Roles' : 'Saved to your shortlist');
    },
    [appState.savedJobIds, persistState, showToast]
  );

  const handleUpdateSavedNote = useCallback(
    (jobId: string, note: string) => {
      persistState((prev) => ({
        ...prev,
        savedNotes: {
          ...prev.savedNotes,
          [jobId]: note,
        },
      }));
    },
    [persistState]
  );

  const handleShareJob = useCallback(
    (job: JobRole) => {
      const shareUrl = `${window.location.origin}/?role=${job.id}`;
      if (navigator.share) {
        navigator
          .share({
            title: `${job.title} — ${job.companyFull}`,
            text: `Check out this ${job.cohortSubtitle} role (${job.salaryDisplay}) on LaunchGrad.`,
            url: shareUrl,
          })
          .catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl).catch(() => {});
        showToast('Role link copied to clipboard');
      }
    },
    [showToast]
  );

  const handleSubmitFastApplication = useCallback(
    async (payload: {
      jobId: string;
      resumeUsed: string;
      attachedProjectTitle?: string;
      recruiterNote?: string;
      email: string;
      phone: string;
    }) => {
      const job = jobs.find((j) => j.id === payload.jobId);
      try {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            setAppState(data.state);
            localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data.state));
            showToast(`Application delivered to ${job?.company || 'Recruiting'}!`);
            return;
          }
        }
      } catch {
        // Offline local fallback
      }

      const todayLabel = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      persistState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          email: payload.email,
          phone: payload.phone,
        },
        applications: [
          {
            id: `app-${Date.now()}`,
            jobId: payload.jobId,
            stage: 'applied',
            stepNumber: 1,
            stageLabel: 'Stage 1: Application Review',
            appliedDate: todayLabel,
            statusBannerIcon: 'check_circle',
            statusBannerText: `Fast Application delivered to ${job?.company || 'Recruiting'}`,
            resumeUsed: payload.resumeUsed,
            attachedProjectTitle: payload.attachedProjectTitle,
            recruiterNote: payload.recruiterNote,
            interviewNotes: {},
          },
          ...prev.applications,
        ],
      }));
      showToast(`Application delivered to ${job?.company || 'Recruiting'}!`);
    },
    [jobs, persistState, showToast]
  );

  const handleQuickAddSkill = useCallback(
    (skill: string) => {
      persistState((prev) => {
        if (prev.profile.verifiedSkills.includes(skill)) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            verifiedSkills: [...prev.profile.verifiedSkills, skill],
          },
        };
      });
      showToast(`Added "${skill}" to Verified Skills — Match updated!`);
    },
    [persistState, showToast]
  );

  const handleUpdateProfile = useCallback(
    (nextProfile: UserProfile) => {
      persistState((prev) => ({
        ...prev,
        profile: nextProfile,
      }));
    },
    [persistState]
  );

  const handleSaveInterviewNote = useCallback(
    (appId: string, questionId: string, note: string) => {
      persistState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === appId
            ? {
                ...a,
                interviewNotes: {
                  ...a.interviewNotes,
                  [questionId]: note,
                },
              }
            : a
        ),
      }));
    },
    [persistState]
  );

  const handleAdvanceApplicationStage = useCallback(
    (appId: string, nextStage: ApplicationStage, score?: number) => {
      persistState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) => {
          if (a.id !== appId) return a;
          const targetJob = jobs.find((j) => j.id === a.jobId);
          if (nextStage === 'interview') {
            return {
              ...a,
              stage: 'interview',
              stepNumber: 3,
              stageLabel: 'Stage 3: Final Loop',
              statusBannerIcon: 'event_upcoming',
              statusBannerText: `Assessment Passed (${score ?? 90}%) — Final Loop Unlocked`,
              assessmentScore: score,
            };
          }
          if (nextStage === 'offers') {
            return {
              ...a,
              stage: 'offers',
              stepNumber: 4,
              stageLabel: 'Stage 4: Official Offer',
              statusBannerIcon: 'verified',
              statusBannerText: `Offer Letter Received ($${(
                targetJob?.salaryMin ?? 92000
              ).toLocaleString()}/yr)`,
              urgencyRightText: 'New Offer',
              offerDetails: a.offerDetails || {
                baseSalary: targetJob?.salaryMin ?? 92000,
                signOnBonus: 8000,
                equityValue: 20000,
                relocationStipend: 2500,
                expiresLabel: 'Next Friday',
                accepted: false,
              },
            };
          }
          return a;
        }),
      }));
    },
    [jobs, persistState]
  );

  const handleAcceptOffer = useCallback(
    (appId: string) => {
      persistState((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          availabilityStatus: 'Offer Accepted',
        },
        applications: prev.applications.map((a) =>
          a.id === appId && a.offerDetails
            ? {
                ...a,
                statusBannerText: `Offer Signed ($${a.offerDetails.baseSalary.toLocaleString()}/yr)`,
                urgencyRightText: 'Signed',
                offerDetails: {
                  ...a.offerDetails,
                  accepted: true,
                },
              }
            : a
        ),
      }));
      showToast('Congratulations! Official graduate offer signed & accepted.');
    },
    [persistState, showToast]
  );

  const handleToggleMasteredFlashcard = useCallback(
    (cardId: string) => {
      persistState((prev) => {
        const exists = prev.masteredFlashcardIds.includes(cardId);
        return {
          ...prev,
          masteredFlashcardIds: exists
            ? prev.masteredFlashcardIds.filter((id) => id !== cardId)
            : [...prev.masteredFlashcardIds, cardId],
        };
      });
    },
    [persistState]
  );

  const handlePassToolkitQuiz = useCallback(() => {
    persistState((prev) => {
      const nextSkills = prev.profile.verifiedSkills.includes('API Idempotency')
        ? prev.profile.verifiedSkills
        : [...prev.profile.verifiedSkills, 'API Idempotency'];
      return {
        ...prev,
        completedToolkitQuiz: true,
        profile: {
          ...prev.profile,
          verifiedSkills: nextSkills,
        },
      };
    });
    showToast('Earned "API Idempotency" Verified Skill badge!');
  }, [persistState, showToast]);

  const handleSelectNotification = useCallback(
    (notif: AppNotification) => {
      persistState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notif.id ? { ...n, read: true } : n
        ),
      }));
      setActiveTab(notif.targetTab);
      if (notif.targetJobId && notif.targetTab === 'discover') {
        const found = jobs.find((j) => j.id === notif.targetJobId);
        if (found) setSelectedJob(found);
      }
    },
    [jobs, persistState]
  );

  const handleMarkAllRead = useCallback(() => {
    persistState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, [persistState]);

  return (
    <>
      <AppShell
        activeTab={activeTab}
        savedCount={appState.savedJobIds.length}
        trackerCount={appState.applications.length}
        notifications={appState.notifications}
        toastMessage={toastMessage}
        onSelectTab={(tab) => {
          setSelectedJob(null);
          setActiveTab(tab);
        }}
        onSelectNotification={handleSelectNotification}
        onMarkAllRead={handleMarkAllRead}
      >
        {activeTab === 'discover' && (
          <DiscoverView
            jobs={jobs}
            cohorts={cohorts}
            profile={appState.profile}
            savedJobIds={appState.savedJobIds}
            appliedJobIds={appliedJobIds}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenFastApply={(job) => setFastApplyJob(job)}
            onToggleSave={handleToggleSave}
            onOpenAddProject={() => {
              setActiveTab('profile');
              setOpenAddProjectModal(true);
            }}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            jobs={jobs}
            savedJobIds={appState.savedJobIds}
            savedNotes={appState.savedNotes}
            appliedJobIds={appliedJobIds}
            profile={appState.profile}
            onSelectJob={(job) => setSelectedJob(job)}
            onOpenFastApply={(job) => setFastApplyJob(job)}
            onToggleSave={handleToggleSave}
            onUpdateNote={handleUpdateSavedNote}
            onExploreRoles={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'tracker' && (
          <TrackerView
            applications={appState.applications}
            jobs={jobs}
            profile={appState.profile}
            flashcards={flashcards}
            assessmentQuestions={assessmentQuestions}
            masteredFlashcardIds={appState.masteredFlashcardIds}
            onSelectJob={(job) => setSelectedJob(job)}
            onSaveInterviewNote={handleSaveInterviewNote}
            onAdvanceApplicationStage={handleAdvanceApplicationStage}
            onAcceptOffer={handleAcceptOffer}
            onToggleMasteredFlashcard={handleToggleMasteredFlashcard}
            onPassToolkitQuiz={handlePassToolkitQuiz}
            onShowToast={showToast}
            onExploreRoles={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={appState.profile}
            showAddProjectExternal={openAddProjectModal}
            onCloseAddProjectExternal={() => setOpenAddProjectModal(false)}
            onUpdateProfile={handleUpdateProfile}
            onShowToast={showToast}
          />
        )}
      </AppShell>

      {/* Full Job Details Overlay */}
      <JobDetailsModal
        job={selectedJob}
        profile={appState.profile}
        isSaved={selectedJob ? appState.savedJobIds.includes(selectedJob.id) : false}
        isApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
        onClose={() => setSelectedJob(null)}
        onToggleSave={handleToggleSave}
        onShareJob={handleShareJob}
        onOpenFastApply={(job) => setFastApplyJob(job)}
        onQuickAddSkill={handleQuickAddSkill}
        onGoToTracker={() => setActiveTab('tracker')}
      />

      {/* 1-Tap Fast Apply Sheet */}
      <FastApplyDrawer
        job={fastApplyJob}
        profile={appState.profile}
        isOpen={Boolean(fastApplyJob)}
        alreadyApplied={fastApplyJob ? appliedJobIds.has(fastApplyJob.id) : false}
        onClose={() => setFastApplyJob(null)}
        onSubmitApplication={handleSubmitFastApplication}
        onGoToTracker={() => {
          setSelectedJob(null);
          setActiveTab('tracker');
        }}
      />
    </>
  );
}
