export type TabRoute = 'discover' | 'saved' | 'tracker' | 'profile';

export type ApplicationStage = 'applied' | 'assessment' | 'interview' | 'offers';

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';

export type RoleCategory = 'Engineering' | 'Design' | 'Data' | 'Product';

export interface JobRole {
  id: string;
  title: string;
  company: string;
  companyFull: string;
  location: string;
  workMode: WorkMode;
  category: RoleCategory;
  cohortSubtitle: string;
  startDate: string;
  cohortSize: string;
  postedAgo: string;
  salaryMin: number;
  salaryMax: number;
  salaryDisplay: string;
  signOnBonus: string;
  equityGrant: string;
  annualStipend: string;
  verifiedFresher: boolean;
  zeroExpRequired: boolean;
  quickApply: boolean;
  internToHire: boolean;
  campusDrive: boolean;
  batchLabel: string;
  iconName: string;
  brandAccent: 'indigo' | 'emerald' | 'amber' | 'slate';
  requiredSkills: string[];
  mentoredSkills: string[];
  fresherHighlights: {
    icon: string;
    title: string;
    description: string;
  }[];
  responsibilities: string[];
  requirements: string[];
  officeHubName: string;
  peerPodName: string;
  prepQuestions: {
    id: string;
    type: 'Behavioral' | 'Technical' | 'Architecture';
    question: string;
    hint: string;
  }[];
}

export interface GraduateCohort {
  id: string;
  jobId: string;
  code: string;
  title: string;
  organization: string;
  statusTag: string;
  startLabel: string;
  compSummary: string;
  accent: 'indigo' | 'emerald' | 'amber';
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  stage: ApplicationStage;
  stepNumber: 1 | 2 | 3 | 4;
  stageLabel: string;
  appliedDate: string;
  statusBannerIcon: string;
  statusBannerText: string;
  urgencyRightText?: string;
  resumeUsed: string;
  attachedProjectTitle?: string;
  recruiterNote?: string;
  interviewNotes: Record<string, string>;
  assessmentScore?: number;
  offerDetails?: {
    baseSalary: number;
    signOnBonus: number;
    equityValue: number;
    relocationStipend: number;
    expiresLabel: string;
    accepted?: boolean;
  };
}

export interface ResumeDocument {
  id: string;
  filename: string;
  updatedLabel: string;
  atsScore: number;
  targetTrack: string;
  sizeLabel: string;
}

export interface CapstoneProject {
  id: string;
  title: string;
  subtitle: string;
  highlightTag: string;
  highlightTone: 'emerald' | 'amber' | 'indigo';
  description: string;
  githubUrl: string;
  liveUrl?: string;
  techStack: string[];
}

export interface Accreditation {
  id: string;
  title: string;
  issuer: string;
  year: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  headline: string;
  university: string;
  gradYear: string;
  degreeMajor: string;
  gpa: string;
  gpaScale: string;
  availabilityStatus: 'Ready to Join' | 'Actively Interviewing' | 'Offer Accepted';
  availabilityBanner: string;
  email: string;
  phone: string;
  verifiedSkills: string[];
  coursework: string[];
  resumes: ResumeDocument[];
  activeResumeId: string;
  projects: CapstoneProject[];
  accreditations: Accreditation[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
  targetTab: TabRoute;
  targetJobId?: string;
}

export interface StarFlashcard {
  id: string;
  category: string;
  prompt: string;
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface AssessmentQuestion {
  id: string;
  topic: string;
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LaunchGradState {
  profile: UserProfile;
  savedJobIds: string[];
  savedNotes: Record<string, string>;
  applications: ApplicationRecord[];
  notifications: AppNotification[];
  masteredFlashcardIds: string[];
  completedToolkitQuiz: boolean;
}
