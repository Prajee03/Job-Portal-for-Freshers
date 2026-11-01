import React, { useMemo, useState } from 'react';
import {
  GraduateCohort,
  JobRole,
  RoleCategory,
  UserProfile,
  WorkMode,
} from '../types';
import { calculateJobMatch } from '../utils/matchEngine';
import { CompanyBadge } from './BrandVisuals';

interface DiscoverViewProps {
  jobs: JobRole[];
  cohorts: GraduateCohort[];
  profile: UserProfile;
  savedJobIds: string[];
  appliedJobIds: Set<string>;
  onSelectJob: (job: JobRole) => void;
  onOpenFastApply: (job: JobRole) => void;
  onToggleSave: (jobId: string) => void;
  onOpenAddProject: () => void;
}

type QuickChipKey = 'zeroExp' | 'quickApply' | 'internToHire' | 'remote' | 'campusDrive';

export function DiscoverView({
  jobs,
  cohorts,
  profile,
  savedJobIds,
  appliedJobIds,
  onSelectJob,
  onOpenFastApply,
  onToggleSave,
  onOpenAddProject,
}: DiscoverViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChips, setActiveChips] = useState<Set<QuickChipKey>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory | 'All'>('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode | 'All'>('All');
  const [minSalary, setMinSalary] = useState<number>(70000);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');
  const [showAllCohorts, setShowAllCohorts] = useState(false);

  const toggleChip = (key: QuickChipKey) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveChips(new Set());
    setSelectedCategory('All');
    setSelectedWorkMode('All');
    setMinSalary(70000);
    setSortBy('match');
  };

  const enrichedJobs = useMemo(() => {
    return jobs
      .map((job) => ({
        job,
        match: calculateJobMatch(job, profile),
      }))
      .filter(({ job }) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const hay = [
            job.title,
            job.company,
            job.location,
            job.category,
            job.cohortSubtitle,
            ...job.requiredSkills,
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (activeChips.has('zeroExp') && !job.zeroExpRequired) return false;
        if (activeChips.has('quickApply') && !job.quickApply) return false;
        if (activeChips.has('internToHire') && !job.internToHire) return false;
        if (activeChips.has('remote') && job.workMode !== 'Remote') return false;
        if (activeChips.has('campusDrive') && !job.campusDrive) return false;
        if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
        if (selectedWorkMode !== 'All' && job.workMode !== selectedWorkMode) return false;
        if (job.salaryMax < minSalary) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.match.score - a.match.score;
        if (sortBy === 'salary') return b.job.salaryMax - a.job.salaryMax;
        return 0;
      });
  }, [
    jobs,
    profile,
    searchQuery,
    activeChips,
    selectedCategory,
    selectedWorkMode,
    minSalary,
    sortBy,
  ]);

  const firstName = profile.name.split(' ')[0] || 'Grad';
  const visibleCohorts = showAllCohorts ? cohorts : cohorts.slice(0, 3);

  const chipDefinitions: { key: QuickChipKey; label: string }[] = [
    { key: 'zeroExp', label: 'Zero Experience Required' },
    { key: 'quickApply', label: 'Quick Apply (< 2 mins)' },
    { key: 'internToHire', label: 'Paid Intern-to-Hire' },
    { key: 'remote', label: 'Remote Friendly' },
    { key: 'campusDrive', label: 'Campus Drive' },
  ];

  const activeFilterCount =
    activeChips.size +
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedWorkMode !== 'All' ? 1 : 0) +
    (minSalary > 70000 ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Hero & Search Controls */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-primary tracking-wide">
              Early Career Launchpad · Class of {profile.gradYear}
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight mt-0.5">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              <strong className="text-primary font-semibold tabular-nums">
                {enrichedJobs.length} curated graduate cohorts
              </strong>{' '}
              ranked live against your {profile.verifiedSkills.length} verified skills
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'match' | 'salary' | 'recent')}
              className="h-10 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="match">Highest Skill Match</option>
              <option value="salary">Highest Base Salary</option>
              <option value="recent">Recently Posted</option>
            </select>
          </div>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 flex items-center bg-surface-container-lowest rounded-xl border border-outline-variant/35 px-3.5 h-12 focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-outline text-[20px] mr-2.5">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, companies, or skills (e.g. React, APM, Python)..."
              className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAdvancedFilters((v) => !v)}
            aria-expanded={showAdvancedFilters}
            aria-label="Toggle advanced filters"
            className={`min-h-[48px] px-4 rounded-xl font-display font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              showAdvancedFilters || activeFilterCount > 0
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-lowest border border-outline-variant/35 text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">tune</span>
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="tabular-nums">({activeFilterCount})</span>
            )}
          </button>
        </div>

        {/* Collapsible Advanced Filter Drawer */}
        {showAdvancedFilters && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Discipline Track
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Engineering', 'Design', 'Data', 'Product'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">
                Work Arrangement
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['All', 'Remote', 'Hybrid', 'On-site'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSelectedWorkMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                      selectedWorkMode === mode
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Min Base Salary
                </span>
                <span className="text-xs font-bold text-primary tabular-nums">
                  ${Math.round(minSalary / 1000)}k+/yr
                </span>
              </div>
              <input
                type="range"
                min={70000}
                max={110000}
                step={5000}
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-outline tabular-nums mt-1">
                <span>$70k</span>
                <span>$90k</span>
                <span>$110k</span>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Filter Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {chipDefinitions.map((chip) => {
            const selected = activeChips.has(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => toggleChip(chip.key)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                  selected
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/35 hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="min-h-[40px] px-3 py-2 text-xs font-semibold text-primary hover:underline whitespace-nowrap shrink-0"
            >
              Reset all
            </button>
          )}
        </div>
      </section>

      {/* Trending Graduate Cohorts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-on-surface">
            Trending Graduate Cohorts
          </h2>
          <button
            type="button"
            onClick={() => setShowAllCohorts((v) => !v)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5 whitespace-nowrap"
          >
            <span>{showAllCohorts ? 'Show compact' : `View all (${cohorts.length})`}</span>
            <span className="material-symbols-outlined text-[16px]">
              {showAllCohorts ? 'expand_less' : 'chevron_right'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCohorts.map((cohort) => {
            const linkedJob = jobs.find((j) => j.id === cohort.jobId);
            return (
              <button
                key={cohort.id}
                type="button"
                onClick={() => linkedJob && onSelectJob(linkedJob)}
                className="text-left p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-on-surface-variant">
                    <span className="font-semibold text-primary">{cohort.statusTag}</span>
                    <span>{cohort.startLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-display font-bold text-sm text-primary shrink-0">
                      {cohort.code}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                        {cohort.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant truncate">
                        {cohort.organization}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-secondary tabular-nums">
                    {cohort.compSummary}
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Capstone Profile Accelerator Banner */}
      {profile.projects.length < 3 && (
        <section className="rounded-2xl bg-primary-container text-on-primary p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="text-xs font-semibold text-primary-fixed tracking-wide">
              Profile Accelerator · +15 High-Match Roles
            </p>
            <h3 className="font-display font-bold text-lg text-on-primary">
              Boost your match score by linking another capstone or hackathon repo
            </h3>
            <p className="text-sm text-on-primary-container leading-relaxed">
              Hiring managers weigh verified student repositories heavily for Class of{' '}
              {profile.gradYear} shortlists.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddProject}
            className="min-h-[44px] px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-display font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 active:scale-[0.99] transition-all whitespace-nowrap shrink-0"
          >
            <span>Add Project Link</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </section>
      )}

      {/* Curated Entry-Level Roles Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-on-surface">
            Curated Entry-Level Roles
          </h2>
          <span className="text-xs text-on-surface-variant tabular-nums">
            Showing {enrichedJobs.length} of {jobs.length} roles
          </span>
        </div>

        {enrichedJobs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 text-center space-y-3">
            <span className="material-symbols-outlined text-outline text-[36px]">
              manage_search
            </span>
            <h3 className="font-display font-bold text-base text-on-surface">
              No graduate roles match those exact filters
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto">
              Try lowering the minimum base salary threshold or clearing active filter criteria.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs inline-flex items-center gap-1.5"
            >
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {enrichedJobs.map(({ job, match }) => {
              const isSaved = savedJobIds.includes(job.id);
              const isApplied = appliedJobIds.has(job.id);

              return (
                <article
                  key={job.id}
                  className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 hover:border-primary/40 transition-colors flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => onSelectJob(job)}
                        className="flex items-center gap-3.5 cursor-pointer group min-w-0"
                      >
                        <CompanyBadge iconName={job.iconName} accent={job.brandAccent} />
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-base text-on-surface truncate group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5">
                            {job.company} · {job.location}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleSave(job.id)}
                        aria-label={isSaved ? 'Remove bookmark' : 'Bookmark role'}
                        className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                          isSaved
                            ? 'text-primary bg-primary-fixed/40'
                            : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] ${
                            isSaved ? 'material-symbols-filled' : ''
                          }`}
                        >
                          {isSaved ? 'bookmark' : 'bookmark_border'}
                        </span>
                      </button>
                    </div>

                    {/* Clean Unboxed Metadata Line */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
                      <span className="font-bold text-on-surface tabular-nums">
                        {job.salaryDisplay}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{job.batchLabel}</span>
                      {job.zeroExpRequired && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-secondary font-semibold">Zero Exp Required</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-outline">Posted {job.postedAgo}</span>
                    </div>

                    {/* Live Skill Match Gauge */}
                    <div className="p-3 rounded-xl bg-surface-container-low space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-secondary flex items-center gap-1 tabular-nums">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                          {match.score}% Skill Match
                        </span>
                        <span className="text-on-surface-variant truncate">
                          {job.requiredSkills.slice(0, 3).join(', ')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full rounded-full bg-secondary transition-all duration-300"
                          style={{ width: `${match.score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenFastApply(job)}
                      className={`flex-1 min-h-[44px] px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] whitespace-nowrap ${
                        isApplied
                          ? 'bg-secondary/15 text-secondary hover:bg-secondary/25'
                          : 'bg-primary text-on-primary hover:bg-primary-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        {isApplied ? 'check_circle' : 'bolt'}
                      </span>
                      <span>{isApplied ? 'Applied' : 'Fast Apply'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectJob(job)}
                      className="min-h-[44px] px-4 rounded-xl bg-surface-container text-primary font-display font-semibold text-xs hover:bg-surface-container-high transition-colors whitespace-nowrap"
                    >
                      Details
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Early Career Strategy Callout */}
      <aside className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/25">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">lightbulb</span>
        </div>
        <div>
          <p className="text-xs font-bold text-primary">Early Career Benchmark</p>
          <p className="text-sm text-on-surface-variant">
            Graduate applications submitted within 48 hours of cohort opening see 3.4x higher
            first-round interview conversion across verified partner employers.
          </p>
        </div>
      </aside>
    </div>
  );
}
