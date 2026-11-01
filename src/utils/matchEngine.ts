import { JobRole, UserProfile } from '../types';

function normalizeSkill(skill: string): string {
  const s = skill.trim().toLowerCase();
  if (s === 'react.js' || s === 'reactjs') return 'react';
  if (s === 'ts') return 'typescript';
  if (s === 'js') return 'javascript';
  if (s === 'golang' || s === 'go (golang)') return 'go';
  if (s === 'git workflows') return 'git';
  if (s === 'node' || s === 'nodejs') return 'node.js';
  return s;
}

export function getCandidateSkillSet(profile: UserProfile): Set<string> {
  const set = new Set<string>();
  for (const s of profile.verifiedSkills) {
    set.add(normalizeSkill(s));
  }
  for (const p of profile.projects) {
    for (const tech of p.techStack) {
      set.add(normalizeSkill(tech));
    }
  }
  if (profile.accreditations.some((a) => a.title.toLowerCase().includes('aws'))) {
    set.add('aws cloud');
  }
  return set;
}

export interface JobMatchBreakdown {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  mentoredSkills: string[];
}

export function calculateJobMatch(job: JobRole, profile: UserProfile): JobMatchBreakdown {
  const candidateSet = getCandidateSkillSet(profile);
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const req of job.requiredSkills) {
    if (candidateSet.has(normalizeSkill(req))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  }

  const ratio =
    job.requiredSkills.length > 0 ? matchedSkills.length / job.requiredSkills.length : 1;

  // Base graduate alignment + skill overlap + capstone boost
  const projectBonus = Math.min(6, profile.projects.length * 2);
  const rawScore = Math.round(64 + ratio * 30 + projectBonus);
  const score = Math.max(68, Math.min(99, rawScore));

  return {
    score,
    matchedSkills,
    missingSkills,
    mentoredSkills: job.mentoredSkills,
  };
}

export interface ProfileStrengthBreakdown {
  percentage: number;
  nextTip: string;
  actionType: 'project' | 'skill' | 'cert' | 'complete';
}

export function calculateProfileStrength(profile: UserProfile): ProfileStrengthBreakdown {
  let points = 30; // Academic identity verified
  if (profile.resumes.length > 0) points += 20;
  if (profile.verifiedSkills.length >= 6) points += 15;
  else points += profile.verifiedSkills.length * 2;

  if (profile.projects.length >= 3) points += 25;
  else if (profile.projects.length === 2) points += 15;
  else if (profile.projects.length === 1) points += 8;

  if (profile.accreditations.length >= 1) points += 10;

  const percentage = Math.min(100, points);

  if (profile.projects.length < 3) {
    return {
      percentage,
      nextTip: 'Add 1 more Capstone or Hackathon repo to hit 100%',
      actionType: 'project',
    };
  }
  if (profile.verifiedSkills.length < 8) {
    return {
      percentage,
      nextTip: 'Verify 1 more technical skill to reach peak visibility',
      actionType: 'skill',
    };
  }
  return {
    percentage: 100,
    nextTip: 'All-Star Graduate Profile — Priority Recruiter Shortlist Active',
    actionType: 'complete',
  };
}
