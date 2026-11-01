import React, { useEffect, useState } from 'react';
import {
  ApplicationRecord,
  AssessmentQuestion,
  JobRole,
  StarFlashcard,
} from '../types';

/* 1. Interview Prep Guide Modal */
export function PrepGuideModal({
  app,
  job,
  onClose,
  onSaveNote,
}: {
  app: ApplicationRecord;
  job: JobRole;
  onClose: () => void;
  onSaveNote: (appId: string, questionId: string, note: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">{job.company} · Final Loop Prep</p>
            <h3 className="font-display font-bold text-lg text-on-surface">
              Role-Specific Interview Guide ({job.prepQuestions.length} Prompts)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {job.prepQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span className="font-bold text-primary">
                  0{idx + 1}. {q.type} Prompt
                </span>
                <span>Saved automatically</span>
              </div>
              <p className="font-display font-semibold text-sm text-on-surface leading-snug">
                {q.question}
              </p>
              <p className="text-xs text-on-surface-variant bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20">
                <strong className="text-secondary">Coach Tip:</strong> {q.hint}
              </p>
              <textarea
                rows={2}
                value={app.interviewNotes[q.id] || ''}
                onChange={(e) => onSaveNote(app.id, q.id, e.target.value)}
                placeholder="Jot down your key talking points or capstone metrics here..."
                className="w-full p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/35 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 2. Virtual Interview Call Check-in Modal */
export function InterviewLobbyModal({
  job,
  onClose,
  onMarkCompleted,
}: {
  job: JobRole;
  onClose: () => void;
  onMarkCompleted: () => void;
}) {
  const [micReady, setMicReady] = useState(true);
  const [camReady, setCamReady] = useState(true);
  const [scratchpad, setScratchpad] = useState(
    '1. How are new grads matched with their first 4-month rotation pod?\n2. What defines an exceptional first 90 days for an Associate Engineer?'
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-secondary">Virtual Interview Greenroom</p>
            <h3 className="font-display font-bold text-lg text-on-surface">
              {job.company} · Final Round Loop
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="rounded-2xl bg-inverse-surface text-inverse-on-surface p-5 flex flex-col items-center justify-center gap-3 min-h-[160px]">
            <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-white font-display font-bold text-lg">
              AC
            </div>
            <p className="text-xs text-inverse-on-surface/80">
              {camReady ? 'Camera preview ready (1080p HD)' : 'Camera muted'} ·{' '}
              {micReady ? 'Audio input nominal' : 'Microphone muted'}
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMicReady((v) => !v)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  micReady ? 'bg-white/15 text-white' : 'bg-error text-on-error'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {micReady ? 'mic' : 'mic_off'}
                </span>
                <span>{micReady ? 'Mic On' : 'Muted'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCamReady((v) => !v)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                  camReady ? 'bg-white/15 text-white' : 'bg-error text-on-error'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">
                  {camReady ? 'videocam' : 'videocam_off'}
                </span>
                <span>{camReady ? 'Video On' : 'Hidden'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-low text-xs space-y-1.5">
            <p className="font-semibold text-on-surface">Session Agenda (45 mins)</p>
            <p className="text-on-surface-variant">
              00–10m: Capstone Architecture Walkthrough · 10–35m: Collaborative React Pairing ·
              35–45m: Reverse Q&A with Staff Mentor
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-on-surface-variant block mb-1">
              Questions to Ask Your Interviewer
            </span>
            <textarea
              rows={3}
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/35 text-xs text-on-surface focus:outline-none focus:border-primary resize-none"
            />
          </label>
        </div>

        <div className="px-5 py-3.5 border-t border-outline-variant/25 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
          >
            Close Lobby
          </button>
          <button
            type="button"
            onClick={() => {
              onMarkCompleted();
              onClose();
            }}
            className="min-h-[44px] px-5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs flex items-center gap-1.5 hover:bg-primary-container"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Log Interview Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* 3. Interactive Technical Assessment Simulator */
export function AssessmentSimulatorModal({
  title,
  subtitle,
  questions,
  onClose,
  onCompleteScore,
}: {
  title: string;
  subtitle: string;
  questions: AssessmentQuestion[];
  onClose: () => void;
  onCompleteScore: (scorePercent: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [submitted]);

  const currentQ = questions[currentIdx];
  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const correctCount = questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const scorePercent = Math.round((correctCount / questions.length) * 100);

  const handleFinish = () => {
    setSubmitted(true);
    onCompleteScore(scorePercent);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary">{subtitle}</p>
            <h3 className="font-display font-bold text-lg text-on-surface">{title}</h3>
          </div>
          <div className="flex items-center gap-3">
            {!submitted && (
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-container text-on-surface tabular-nums">
                {mins}:{secs}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {!submitted ? (
            <>
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{currentQ.topic}</span>
                <span className="tabular-nums">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              <p className="font-display font-semibold text-base text-on-surface leading-snug">
                {currentQ.prompt}
              </p>

              {currentQ.codeSnippet && (
                <pre className="p-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-mono text-xs overflow-x-auto">
                  {currentQ.codeSnippet}
                </pre>
              )}

              <div className="space-y-2">
                {currentQ.options.map((opt, idx) => {
                  const chosen = selectedAnswers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: idx }))
                      }
                      className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors flex items-start gap-3 ${
                        chosen
                          ? 'bg-primary-fixed/40 border-primary text-on-surface font-semibold'
                          : 'bg-surface-container-low/60 border-outline-variant/30 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold mt-0.5 text-primary">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-secondary-fixed/25 border border-secondary/20 text-center space-y-1.5">
                <p className="text-xs font-bold text-secondary">Assessment Verified</p>
                <p className="font-display font-bold text-3xl text-on-surface tabular-nums">
                  {scorePercent}% Score ({correctCount}/{questions.length})
                </p>
                <p className="text-xs text-on-surface-variant">
                  {scorePercent >= 75
                    ? 'Strong benchmark pass! Your pipeline status & verified skills have been updated.'
                    : 'Review the explanations below and retry anytime to sharpen your readiness.'}
                </p>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => {
                  const userAns = selectedAnswers[q.id];
                  const passed = userAns === q.correctIndex;
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-on-surface">
                          Q{i + 1}. {q.topic}
                        </span>
                        <span className={passed ? 'text-secondary' : 'text-error'}>
                          {passed ? 'Correct' : 'Review'}
                        </span>
                      </div>
                      <p className="text-on-surface-variant">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-outline-variant/25 flex items-center justify-between gap-3">
          {!submitted ? (
            <>
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                className="min-h-[44px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="min-h-[44px] px-5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="min-h-[44px] px-5 rounded-xl bg-secondary text-on-secondary font-display font-semibold text-xs"
                >
                  Submit & Grade Assessment
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full min-h-[44px] rounded-xl bg-primary text-on-primary font-display font-semibold text-xs"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* 4. Official Offer Review & Grad Salary Negotiation Modal */
export function OfferPackageModal({
  app,
  job,
  candidateName,
  onClose,
  onAcceptOffer,
  onCopyScript,
}: {
  app: ApplicationRecord | null;
  job: JobRole | null;
  candidateName: string;
  onClose: () => void;
  onAcceptOffer?: (appId: string) => void;
  onCopyScript: (text: string) => void;
}) {
  const baseOffer = app?.offerDetails?.baseSalary ?? 82000;
  const signOn = app?.offerDetails?.signOnBonus ?? 5000;
  const equity = app?.offerDetails?.equityValue ?? 12000;
  const stipend = app?.offerDetails?.relocationStipend ?? 1800;

  const [targetBase, setTargetBase] = useState<number>(baseOffer + 6000);

  const totalYearOne = baseOffer + signOn + Math.round(equity / 4) + stipend;
  const companyLabel = job?.company || 'Partner Studio';
  const roleLabel = job?.title || 'Junior Product Engineer';

  const negotiationScript = `Hi ${companyLabel} Recruiting Team,\n\nThank you so much for extending the ${roleLabel} offer! Speaking with the mentorship leads made ${companyLabel} my top choice for launching my career.\n\nBased on my verified capstone work and market benchmarks for 2025 cohorts, would there be flexibility to adjust the base salary to $${targetBase.toLocaleString()}? If we can align there, I am excited to sign immediately.\n\nWarm regards,\n${candidateName}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-secondary">
              {app ? `${companyLabel} · Official Offer Letter` : 'Grad Compensation & Negotiation Builder'}
            </p>
            <h3 className="font-display font-bold text-lg text-on-surface">{roleLabel}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Year 1 Total Comp Breakdown */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/25 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">
                Estimated Year-1 Total Value
              </span>
              <span className="font-display font-bold text-2xl text-secondary tabular-nums">
                ${totalYearOne.toLocaleString()}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-outline-variant/20 text-xs">
              <div>
                <p className="text-on-surface-variant">Base Salary</p>
                <p className="font-bold text-on-surface tabular-nums mt-0.5">
                  ${baseOffer.toLocaleString()}/yr
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">Sign-on Grant</p>
                <p className="font-bold text-on-surface tabular-nums mt-0.5">
                  ${signOn.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">Yr-1 Equity Vest</p>
                <p className="font-bold text-on-surface tabular-nums mt-0.5">
                  ${Math.round(equity / 4).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-on-surface-variant">Setup Stipend</p>
                <p className="font-bold text-on-surface tabular-nums mt-0.5">
                  ${stipend.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Grad Counter-Offer Script Builder */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface">
                Polite New-Grad Negotiation Counter Target
              </span>
              <span className="text-xs font-bold text-primary tabular-nums">
                Ask: ${targetBase.toLocaleString()}/yr (+$
                {(targetBase - baseOffer).toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min={baseOffer}
              max={baseOffer + 15000}
              step={1000}
              value={targetBase}
              onChange={(e) => setTargetBase(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="relative">
              <textarea
                readOnly
                rows={6}
                value={negotiationScript}
                className="w-full p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/35 text-xs text-on-surface leading-relaxed resize-none"
              />
              <button
                type="button"
                onClick={() => onCopyScript(negotiationScript)}
                className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-xs font-semibold text-primary hover:bg-primary-fixed/40 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Copy Email</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-outline-variant/25 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
          >
            Close
          </button>
          {app && onAcceptOffer && (
            <button
              type="button"
              disabled={Boolean(app.offerDetails?.accepted)}
              onClick={() => {
                onAcceptOffer(app.id);
                onClose();
              }}
              className="min-h-[44px] px-5 rounded-xl bg-secondary text-on-secondary font-display font-semibold text-xs flex items-center gap-1.5 hover:bg-on-secondary-container disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>
                {app.offerDetails?.accepted ? 'Offer Signed & Accepted' : 'Sign & Accept Offer'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* 5. STAR Behavioral Flashcards Modal */
export function StarFlashcardsModal({
  flashcards,
  masteredIds,
  onToggleMastered,
  onClose,
}: {
  flashcards: StarFlashcard[];
  masteredIds: string[];
  onToggleMastered: (cardId: string) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = flashcards[idx];
  const isMastered = masteredIds.includes(card.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-primary tabular-nums">
              STAR Behavioral Deck · {masteredIds.length}/{flashcards.length} Mastered
            </p>
            <h3 className="font-display font-bold text-lg text-on-surface">{card.category}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
            <span className="text-xs font-semibold text-on-surface-variant tabular-nums">
              Card {idx + 1} of {flashcards.length}
            </span>
            <p className="font-display font-bold text-base sm:text-lg text-on-surface leading-snug">
              “{card.prompt}”
            </p>
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="min-h-[40px] px-4 rounded-xl bg-primary text-on-primary text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">visibility</span>
                <span>Reveal Sample STAR Breakdown</span>
              </button>
            ) : (
              <div className="pt-3 border-t border-outline-variant/25 space-y-2.5 text-xs leading-relaxed">
                <p>
                  <strong className="text-primary">Situation:</strong> {card.situation}
                </p>
                <p>
                  <strong className="text-primary">Task:</strong> {card.task}
                </p>
                <p>
                  <strong className="text-primary">Action:</strong> {card.action}
                </p>
                <p>
                  <strong className="text-secondary">Result:</strong> {card.result}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-outline-variant/25 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                setIdx((i) => (i - 1 + flashcards.length) % flashcards.length);
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => {
                setRevealed(false);
                setIdx((i) => (i + 1) % flashcards.length);
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
            >
              Next
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleMastered(card.id)}
            className={`min-h-[44px] px-4 rounded-xl text-xs font-display font-semibold flex items-center gap-1.5 ${
              isMastered
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary-fixed text-primary hover:bg-primary-fixed-dim/50'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">
              {isMastered ? 'check_circle' : 'bookmark_check'}
            </span>
            <span>{isMastered ? 'Mastered' : 'Mark Mastered'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
