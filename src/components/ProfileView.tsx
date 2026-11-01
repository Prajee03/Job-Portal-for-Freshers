import React, { useRef, useState } from 'react';
import { Accreditation, CapstoneProject, ResumeDocument, UserProfile } from '../types';
import { calculateProfileStrength } from '../utils/matchEngine';
import { UserAvatar } from './BrandVisuals';

interface ProfileViewProps {
  profile: UserProfile;
  showAddProjectExternal: boolean;
  onCloseAddProjectExternal: () => void;
  onUpdateProfile: (next: UserProfile) => void;
  onShowToast: (msg: string) => void;
}

export function ProfileView({
  profile,
  showAddProjectExternal,
  onCloseAddProjectExternal,
  onUpdateProfile,
  onShowToast,
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddProjectLocal, setShowAddProjectLocal] = useState(false);
  const [showPortfolioPreview, setShowPortfolioPreview] = useState(false);
  const [previewResume, setPreviewResume] = useState<ResumeDocument | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [showAddCert, setShowAddCert] = useState(false);

  // Edit profile form state
  const [editName, setEditName] = useState(profile.name);
  const [editHeadline, setEditHeadline] = useState(profile.headline);
  const [editUni, setEditUni] = useState(profile.university);
  const [editGradYear, setEditGradYear] = useState(profile.gradYear);
  const [editMajor, setEditMajor] = useState(profile.degreeMajor);
  const [editGpa, setEditGpa] = useState(profile.gpa);
  const [editAvailability, setEditAvailability] = useState<UserProfile['availabilityStatus']>(
    profile.availabilityStatus
  );

  // Add project form state
  const [projTitle, setProjTitle] = useState('');
  const [projSubtitle, setProjSubtitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projTech, setProjTech] = useState('');

  // Add cert form state
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');

  const strength = calculateProfileStrength(profile);
  const isAddProjectOpen = showAddProjectLocal || showAddProjectExternal;

  const closeAddProject = () => {
    setShowAddProjectLocal(false);
    onCloseAddProjectExternal();
  };

  const handleSaveProfileIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editName.trim() || profile.name,
      headline: editHeadline.trim() || profile.headline,
      university: editUni.trim() || profile.university,
      gradYear: editGradYear.trim() || profile.gradYear,
      degreeMajor: editMajor.trim() || profile.degreeMajor,
      gpa: editGpa.trim() || profile.gpa,
      availabilityStatus: editAvailability,
    });
    setShowEditProfile(false);
    onShowToast('Graduate profile details updated');
  };

  const handleUploadResumeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const kb = Math.max(42, Math.round(file.size / 1024));
    const computedAts = Math.min(99, 89 + Math.min(9, profile.verifiedSkills.length));
    const newDoc: ResumeDocument = {
      id: `res-${Date.now()}`,
      filename: file.name,
      updatedLabel: 'Uploaded just now',
      atsScore: computedAts,
      targetTrack: 'Verified Graduate Resume',
      sizeLabel: `${kb} KB`,
    };
    onUpdateProfile({
      ...profile,
      resumes: [newDoc, ...profile.resumes],
      activeResumeId: newDoc.id,
    });
    onShowToast(`Uploaded ${file.name} · ATS Score ${computedAts}/100`);
    e.target.value = '';
  };

  const handleDownloadResumeText = (doc: ResumeDocument) => {
    const content = [
      `${profile.name.toUpperCase()} — ${profile.headline}`,
      `${profile.email} | ${profile.phone} | ${profile.university} '${profile.gradYear}`,
      `Education: ${profile.degreeMajor}, GPA ${profile.gpa}/${profile.gpaScale}`,
      '',
      'VERIFIED TECHNICAL SKILLS',
      profile.verifiedSkills.join(', '),
      '',
      'FEATURED CAPSTONE & HACKATHON PROJECTS',
      ...profile.projects.map(
        (p) => `- ${p.title} (${p.subtitle}): ${p.description} [${p.techStack.join(', ')}]`
      ),
      '',
      'ACCREDITATIONS',
      ...profile.accreditations.map((a) => `- ${a.title} (${a.issuer}, ${a.year})`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.filename.replace(/\.(pdf|docx?)$/i, '') + '_ATS_Summary.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast('Downloaded formatted ATS resume summary');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;
    const tags = projTech
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const newProj: CapstoneProject = {
      id: `proj-${Date.now()}`,
      title: projTitle.trim(),
      subtitle: projSubtitle.trim() || 'Graduate Engineering Build',
      highlightTag: 'Verified Repo',
      highlightTone: 'indigo',
      description:
        projDesc.trim() ||
        'Designed and shipped full-stack architecture with automated tests and clean documentation.',
      githubUrl: projGithub.trim() || 'https://github.com/alexchen',
      techStack: tags.length > 0 ? tags : ['TypeScript', 'React'],
    };

    const mergedSkills = Array.from(new Set([...profile.verifiedSkills, ...newProj.techStack]));
    onUpdateProfile({
      ...profile,
      projects: [newProj, ...profile.projects],
      verifiedSkills: mergedSkills,
    });
    setProjTitle('');
    setProjSubtitle('');
    setProjDesc('');
    setProjGithub('');
    setProjTech('');
    closeAddProject();
    onShowToast(`Added ${newProj.title} — Job match scores updated!`);
  };

  const handleDeleteProject = (projId: string) => {
    onUpdateProfile({
      ...profile,
      projects: profile.projects.filter((p) => p.id !== projId),
    });
    onShowToast('Removed project from profile');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newSkillInput.trim();
    if (!cleaned) return;
    if (profile.verifiedSkills.some((s) => s.toLowerCase() === cleaned.toLowerCase())) {
      setNewSkillInput('');
      return;
    }
    onUpdateProfile({
      ...profile,
      verifiedSkills: [...profile.verifiedSkills, cleaned],
    });
    setNewSkillInput('');
    onShowToast(`Verified skill "${cleaned}" added`);
  };

  const handleRemoveSkill = (skill: string) => {
    onUpdateProfile({
      ...profile,
      verifiedSkills: profile.verifiedSkills.filter((s) => s !== skill),
    });
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certTitle.trim()) return;
    const nextCert: Accreditation = {
      id: `cert-${Date.now()}`,
      title: certTitle.trim(),
      issuer: certIssuer.trim() || 'Verified Credential',
      year: '2025',
      icon: 'workspace_premium',
    };
    onUpdateProfile({
      ...profile,
      accreditations: [...profile.accreditations, nextCert],
    });
    setCertTitle('');
    setCertIssuer('');
    setShowAddCert(false);
    onShowToast('Accreditation added to profile');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Identity, Strength & Resumes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Identity Hero Card */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-start gap-4">
              <UserAvatar name={profile.name} size="lg" showOnline />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="font-display font-bold text-xl text-on-surface truncate">
                    {profile.name}
                  </h1>
                  <span className="text-xs font-semibold text-secondary whitespace-nowrap">
                    {profile.availabilityStatus}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate mt-0.5">
                  {profile.headline}
                </p>
                <p className="text-xs font-semibold text-primary mt-1">
                  {profile.university} ’{profile.gradYear.slice(-2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/20">
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant block">
                  Degree & Major
                </span>
                <span className="font-display font-bold text-sm text-on-surface truncate block mt-0.5">
                  {profile.degreeMajor}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant block">
                  Cumulative GPA
                </span>
                <span className="font-display font-bold text-sm text-secondary tabular-nums block mt-0.5">
                  {profile.gpa}{' '}
                  <span className="text-xs font-normal text-on-surface-variant">
                    / {profile.gpaScale}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary-fixed/20 text-xs text-on-secondary-fixed-variant font-medium">
              <span className="material-symbols-outlined text-[17px] text-secondary shrink-0">
                verified_user
              </span>
              <span className="truncate">{profile.availabilityBanner}</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowPortfolioPreview(true)}
                className="min-h-[44px] px-3 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-container transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">public</span>
                <span>Preview Portfolio</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditName(profile.name);
                  setEditHeadline(profile.headline);
                  setEditUni(profile.university);
                  setEditGradYear(profile.gradYear);
                  setEditMajor(profile.degreeMajor);
                  setEditGpa(profile.gpa);
                  setEditAvailability(profile.availabilityStatus);
                  setShowEditProfile(true);
                }}
                className="min-h-[44px] px-3 rounded-xl bg-surface-container text-on-surface font-display font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[17px]">edit</span>
                <span>Edit Profile</span>
              </button>
            </div>
          </section>

          {/* Profile Strength Meter */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-base text-on-surface">
                Profile Strength
              </span>
              <span className="font-display font-bold text-lg text-primary tabular-nums">
                {strength.percentage}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${strength.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-surface-container-low text-xs">
              <span className="text-on-surface-variant">{strength.nextTip}</span>
              {strength.actionType === 'project' && (
                <button
                  type="button"
                  onClick={() => setShowAddProjectLocal(true)}
                  className="font-bold text-primary hover:underline whitespace-nowrap"
                >
                  + Add Repo
                </button>
              )}
            </div>
          </section>

          {/* Resume & ATS Scoring */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-base text-on-surface">
                Resume & ATS Scoring
              </h2>
              <span className="text-xs font-semibold text-secondary">ATS Verified</span>
            </div>

            <div className="space-y-2.5">
              {profile.resumes.map((doc) => {
                const isPrimary = doc.id === profile.activeResumeId;
                return (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isPrimary
                        ? 'bg-surface-container-low border-primary/40'
                        : 'bg-surface-container-lowest border-outline-variant/25'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProfile({ ...profile, activeResumeId: doc.id })
                      }
                      className="flex items-center gap-3 min-w-0 text-left flex-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          picture_as_pdf
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-xs sm:text-sm text-on-surface truncate">
                          {doc.filename}
                        </p>
                        <p className="text-[11px] text-on-surface-variant tabular-nums mt-0.5">
                          {doc.updatedLabel} · {doc.atsScore}/100 ATS
                          {isPrimary ? ' · Default' : ''}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewResume(doc)}
                        title="Preview ATS Resume"
                        className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[19px]">visibility</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadResumeText(doc)}
                        title="Download Summary"
                        className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[19px]">download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleUploadResumeFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[44px] px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-display font-semibold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[19px]">cloud_upload</span>
              <span>Upload New Resume (PDF, DOCX)</span>
            </button>
          </section>
        </div>

        {/* Right Column: Featured Projects, Verified Skills & Accreditations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Featured Academic & Capstone Projects */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-lg text-on-surface">
                  Featured Projects & Capstones
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Auto-attached during 1-Tap Fast Applications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddProjectLocal(true)}
                className="min-h-[40px] px-3.5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs flex items-center gap-1 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Project</span>
              </button>
            </div>

            <div className="space-y-3">
              {profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <h3 className="font-display font-bold text-base text-on-surface">
                          {proj.title}
                        </h3>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-secondary">{proj.highlightTag}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{proj.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Repository"
                        className="min-w-[34px] min-h-[34px] rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[17px]">code</span>
                      </a>
                      {profile.projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          title="Delete project"
                          className="min-w-[34px] min-h-[34px] rounded-lg bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-error"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {proj.description}
                  </p>
                  <p className="text-xs font-semibold text-primary">
                    {proj.techStack.join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Verified Skills & Coursework */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-on-surface">Verified Skills</h2>
              <span className="text-xs font-semibold text-secondary tabular-nums">
                {profile.verifiedSkills.length} Skills Active
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.verifiedSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  title="Click to remove skill"
                  className="min-h-[36px] px-3 py-1.5 rounded-xl bg-secondary-fixed/25 text-on-secondary-fixed-variant text-xs font-semibold flex items-center gap-1.5 hover:bg-error-container hover:text-on-error-container transition-colors group"
                >
                  <span className="material-symbols-outlined text-[15px] text-secondary group-hover:hidden">
                    check_circle
                  </span>
                  <span className="material-symbols-outlined text-[15px] hidden group-hover:inline">
                    close
                  </span>
                  <span>{skill}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleAddSkill} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Add another verified skill (e.g. Figma, Go, Docker)..."
                className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/35 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-surface-container text-primary font-display font-semibold text-xs hover:bg-surface-container-high whitespace-nowrap"
              >
                + Add Skill
              </button>
            </form>

            <div className="pt-3 border-t border-outline-variant/20">
              <span className="text-xs font-semibold text-on-surface-variant block mb-1">
                Relevant University Coursework
              </span>
              <p className="text-sm text-on-surface">{profile.coursework.join(' · ')}</p>
            </div>
          </section>

          {/* Accreditations */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-on-surface">Accreditations</h2>
              <button
                type="button"
                onClick={() => setShowAddCert((v) => !v)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showAddCert ? 'Cancel' : '+ Add Credential'}
              </button>
            </div>

            {showAddCert && (
              <form
                onSubmit={handleAddCert}
                className="p-3.5 rounded-xl bg-surface-container-low grid grid-cols-1 sm:grid-cols-3 gap-2.5"
              >
                <input
                  type="text"
                  required
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  placeholder="Credential title (e.g. GCP Associate)"
                  className="h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/35 text-xs text-on-surface"
                />
                <input
                  type="text"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  placeholder="Issuing organization"
                  className="h-10 px-3 rounded-lg bg-surface-container-lowest border border-outline-variant/35 text-xs text-on-surface"
                />
                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-primary text-on-primary font-display font-semibold text-xs"
                >
                  Save Credential
                </button>
              </form>
            )}

            <div className="space-y-2.5">
              {profile.accreditations.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary-container shrink-0">
                      <span className="material-symbols-outlined text-[21px]">{cert.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-sm text-on-surface">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant">
                        {cert.issuer} · Issued {cert.year}
                      </p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    verified
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Modal: Edit Profile */}
      {showEditProfile && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs"
            onClick={() => setShowEditProfile(false)}
          />
          <form
            onSubmit={handleSaveProfileIdentity}
            className="relative z-10 w-full sm:max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-on-surface">
                Edit Graduate Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">Full Name</span>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">Status</span>
                <select
                  value={editAvailability}
                  onChange={(e) =>
                    setEditAvailability(e.target.value as UserProfile['availabilityStatus'])
                  }
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                >
                  <option value="Ready to Join">Ready to Join</option>
                  <option value="Actively Interviewing">Actively Interviewing</option>
                  <option value="Offer Accepted">Offer Accepted</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="font-semibold text-on-surface-variant block mb-1">Headline</span>
                <input
                  type="text"
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  University
                </span>
                <input
                  type="text"
                  value={editUni}
                  onChange={(e) => setEditUni(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  Class Year
                </span>
                <input
                  type="text"
                  value={editGradYear}
                  onChange={(e) => setEditGradYear(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface tabular-nums"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  Degree & Major
                </span>
                <input
                  type="text"
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">GPA</span>
                <input
                  type="text"
                  value={editGpa}
                  onChange={(e) => setEditGpa(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface tabular-nums"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="min-h-[42px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Capstone Project */}
      {isAddProjectOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs"
            onClick={closeAddProject}
          />
          <form
            onSubmit={handleCreateProject}
            className="relative z-10 w-full sm:max-w-lg bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary">Profile Accelerator</p>
                <h3 className="font-display font-bold text-lg text-on-surface">
                  Link Capstone or Hackathon Repo
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAddProject}
                className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  Project Title
                </span>
                <input
                  type="text"
                  required
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g. DistriCache Engine"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  One-Line Summary
                </span>
                <input
                  type="text"
                  value={projSubtitle}
                  onChange={(e) => setProjSubtitle(e.target.value)}
                  placeholder="e.g. In-memory cache microservice with Raft consensus"
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                />
              </label>
              <label className="block">
                <span className="font-semibold text-on-surface-variant block mb-1">
                  Key Outcome & Architecture
                </span>
                <textarea
                  rows={2}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Quantify latency, users, or technical problem solved..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface resize-none"
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-on-surface-variant block mb-1">
                    GitHub URL
                  </span>
                  <input
                    type="url"
                    value={projGithub}
                    onChange={(e) => setProjGithub(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                  />
                </label>
                <label className="block">
                  <span className="font-semibold text-on-surface-variant block mb-1">
                    Tech Stack (comma-separated)
                  </span>
                  <input
                    type="text"
                    value={projTech}
                    onChange={(e) => setProjTech(e.target.value)}
                    placeholder="Go (Golang), Docker, React"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border border-outline-variant/40 text-sm text-on-surface"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeAddProject}
                className="min-h-[42px] px-4 rounded-xl bg-surface-container text-on-surface text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-primary text-on-primary font-display font-semibold text-xs"
              >
                Verify & Add Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Formatted ATS Resume Quick Preview */}
      {previewResume && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs"
            onClick={() => setPreviewResume(null)}
          />
          <div className="relative z-10 w-full sm:max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-secondary tabular-nums">
                  ATS Parse Score: {previewResume.atsScore}/100 · Zero Formatting Errors
                </p>
                <h3 className="font-display font-bold text-base text-on-surface">
                  {previewResume.filename}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResume(null)}
                className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white text-slate-900 space-y-4 text-xs leading-relaxed">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-display font-bold text-lg">{profile.name}</h4>
                <p className="text-slate-600">
                  {profile.email} · {profile.phone} · {profile.university} Class of{' '}
                  {profile.gradYear}
                </p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-1">
                  Education
                </p>
                <p className="font-semibold">
                  {profile.university} — {profile.degreeMajor} (GPA: {profile.gpa}/
                  {profile.gpaScale})
                </p>
                <p className="text-slate-600">Coursework: {profile.coursework.join(', ')}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-1">
                  Technical Skills
                </p>
                <p>{profile.verifiedSkills.join(' · ')}</p>
              </div>
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-1">
                  Engineering Projects
                </p>
                <div className="space-y-2">
                  {profile.projects.map((p) => (
                    <div key={p.id}>
                      <p className="font-semibold">
                        {p.title} — <span className="font-normal text-slate-600">{p.subtitle}</span>
                      </p>
                      <p className="text-slate-700">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Recruiter-Facing Public Portfolio Preview */}
      {showPortfolioPreview && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/45 backdrop-blur-xs"
            onClick={() => setShowPortfolioPreview(false)}
          />
          <div className="relative z-10 w-full sm:max-w-2xl bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl border border-outline-variant/30 shadow-2xl flex flex-col max-h-[88dvh] overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant/25 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-primary">Recruiter View</p>
                <h3 className="font-display font-bold text-base text-on-surface">
                  launchgrad.app/u/{profile.name.toLowerCase().replace(/\s+/g, '-')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href).catch(() => {});
                    onShowToast('Public portfolio link copied to clipboard');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary-fixed text-primary text-xs font-semibold"
                >
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => setShowPortfolioPreview(false)}
                  className="min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4">
                <UserAvatar name={profile.name} size="lg" showOnline />
                <div>
                  <h4 className="font-display font-bold text-xl text-on-surface">{profile.name}</h4>
                  <p className="text-sm text-on-surface-variant">
                    {profile.headline} · {profile.university} ’{profile.gradYear.slice(-2)}
                  </p>
                  <p className="text-xs text-secondary font-semibold mt-1">
                    Verified Academic Transcript (GPA {profile.gpa}) · {profile.availabilityStatus}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <h5 className="font-display font-bold text-sm text-on-surface">
                  Verified Capstone Artifacts
                </h5>
                {profile.projects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/25 space-y-1"
                  >
                    <p className="font-display font-semibold text-sm text-on-surface">
                      {p.title} · <span className="text-secondary text-xs">{p.highlightTag}</span>
                    </p>
                    <p className="text-xs text-on-surface-variant">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
