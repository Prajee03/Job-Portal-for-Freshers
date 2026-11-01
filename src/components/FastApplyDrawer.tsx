import React, { useEffect, useState } from 'react';
import { JobRole, UserProfile } from '../types';

interface FastApplyDrawerProps {
  job: JobRole | null;
  profile: UserProfile;
  isOpen: boolean;
  alreadyApplied: boolean;
  onClose: () => void;
  onSubmitApplication: (payload: {
    jobId: string;
    resumeUsed: string;
    attachedProjectTitle?: string;
    recruiterNote?: string;
    email: string;
    phone: string;
  }) => Promise<void>;
  onGoToTracker: () => void;
}

export function FastApplyDrawer({
  job,
  profile,
  isOpen,
  alreadyApplied,
  onClose,
  onSubmitApplication,
  onGoToTracker,
}: FastApplyDrawerProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(profile.activeResumeId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    profile.projects[0]?.id || ''
  );
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [recruiterNote, setRecruiterNote] = useState('');
  const [submittingStep, setSubmittingStep] = useState<'idle' | 'verifying' | 'sending'>('idle');

  useEffect(() => {
    setSelectedResumeId(profile.activeResumeId || profile.resumes[0]?.id || '');
    setSelectedProjectId(profile.projects[0]?.id || '');
    setEmail(profile.email);
    setPhone(profile.phone);
    setRecruiterNote('');
    setSubmittingStep('idle');
  }, [job?.id, isOpen, profile]);

  if (!isOpen || !job) return null;

  const currentResume =
    profile.resumes.find((r) => r.id === selectedResumeId) || profile.resumes[0];
  const currentProject = profile.projects.find((p) => p.id === selectedProjectId);

  const handleCycleResume = () => {
    if (profile.resumes.length <= 1) return;
    const idx = profile.resumes.findIndex((r) => r.id === currentResume?.id);
    const next = profile.resumes[(idx + 1) % profile.resumes.length];
    setSelectedResumeId(next.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyApplied) {
      onClose();
      onGoToTracker();
      return;
    }
    setSubmittingStep('verifying');
    await new Promise((r) => setTimeout(r, 450));
    setSubmittingStep('sending');
    await new Promise((r) => setTimeout(r, 450));
    await onSubmitApplication({
      jobId: job.id,
      resumeUsed: currentResume?.filename || 'Alex_Chen_SWE_Resume.pdf',
      attachedProjectTitle: currentProject?.title,
      recruiterNote: recruiterNote.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
    });
    setSubmittingStep('idle');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-apply-title"
    >
      <div
        className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[88dvh] pb-safe overflow-hidden"
      >
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-outline-variant" />
        </div>

        <div className="px-5 pt-3 pb-3.5 border-b border-outline-variant/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <div className="min-w-0">
              <h3
                id="fast-apply-title"
                className="font-display font-bold text-base text-on-surface truncate"
              >
                1-Tap Fast Application
              </h3>
              <p className="text-xs text-on-surface-variant truncate">
                Direct routing to {job.company} Recruiting · {job.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fast apply drawer"
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Verified Resume Selector */}
          <div className="bg-surface-container-low rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">
                LaunchGrad Verified Resume
              </span>
              {profile.resumes.length > 1 && (
                <button
                  type="button"
                  onClick={handleCycleResume}
                  className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                >
                  Switch Resume ({profile.resumes.length})
                </button>
              )}
            </div>
            {currentResume && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/25">
                <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm text-on-surface truncate">
                    {currentResume.filename}
                  </p>
                  <p className="text-xs text-on-surface-variant tabular-nums">
                    {currentResume.updatedLabel} · ATS Score {currentResume.atsScore}/100
                  </p>
                </div>
                <span className="material-symbols-outlined material-symbols-filled text-secondary text-[20px]">
                  check_circle
                </span>
              </div>
            )}
          </div>

          {/* Attached Capstone Artifact */}
          {profile.projects.length > 0 && (
            <div className="bg-surface-container-low rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Attached Capstone Artifact
                </span>
                <span className="text-xs font-medium text-secondary">Auto-Synced</span>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {profile.projects.map((proj) => {
                  const active = proj.id === selectedProjectId;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setSelectedProjectId(proj.id)}
                      className={`text-left p-3 rounded-lg border transition-colors min-w-[210px] flex-1 ${
                        active
                          ? 'bg-surface-container-lowest border-primary shadow-2xs'
                          : 'bg-surface-container-lowest/60 border-outline-variant/30 hover:border-outline'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-semibold text-sm text-on-surface truncate">
                          {proj.title}
                        </span>
                        {active && (
                          <span className="material-symbols-outlined text-primary text-[16px]">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">
                        {proj.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold text-on-surface-variant block mb-1">
                University / Direct Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-on-surface-variant block mb-1">
                Phone Number
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:border-primary tabular-nums"
              />
            </label>
          </div>

          {/* Optional Note to Recruiter */}
          <label className="block">
            <span className="text-xs font-semibold text-on-surface-variant block mb-1">
              Optional Note for {job.company} Hiring Lead
            </span>
            <textarea
              rows={2}
              maxLength={240}
              value={recruiterNote}
              onChange={(e) => setRecruiterNote(e.target.value)}
              placeholder={`e.g., Excited about ${job.cohortSubtitle}—built real-time systems in my UW capstone!`}
              className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary resize-none"
            />
          </label>

          {/* Fresher SLA Guarantee */}
          <div className="flex items-start gap-2 text-xs text-on-surface-variant bg-secondary-fixed/20 rounded-lg p-2.5">
            <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">
              verified_user
            </span>
            <p>
              {job.company} guarantees a human recruiter review within{' '}
              <strong className="text-on-surface">5 business days</strong> for verified LaunchGrad
              candidates.
            </p>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-outline-variant/25 bg-surface-container-lowest">
          <button
            type="submit"
            disabled={submittingStep !== 'idle'}
            className={`w-full min-h-[48px] px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-sm ${
              alreadyApplied
                ? 'bg-secondary text-on-secondary hover:bg-on-secondary-container'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            } disabled:opacity-75`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {alreadyApplied ? 'assignment_turned_in' : 'send'}
            </span>
            <span className="whitespace-nowrap">
              {alreadyApplied
                ? 'Already Applied · View in Tracker'
                : submittingStep === 'verifying'
                ? 'Verifying graduate credentials...'
                : submittingStep === 'sending'
                ? `Transmitting packet to ${job.company} ATS...`
                : 'Submit Application'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
