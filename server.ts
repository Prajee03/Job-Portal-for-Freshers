import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  ASSESSMENT_QUESTIONS,
  GRADUATE_COHORTS,
  INITIAL_STATE,
  JOB_ROLES,
  STAR_FLASHCARDS,
} from './src/data/seedData.ts';
import type { LaunchGradState } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'launchgrad-db.json');

function loadState(): LaunchGradState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as LaunchGradState;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_STATE, null, 2), 'utf-8');
    return structuredClone(INITIAL_STATE);
  } catch (err) {
    console.error('Failed to load state, using initial seed:', err);
    return structuredClone(INITIAL_STATE);
  }
}

function saveState(state: LaunchGradState): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist state:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  let dbState: LaunchGradState = loadState();

  app.get('/api/bootstrap', (_req, res) => {
    res.json({
      jobs: JOB_ROLES,
      cohorts: GRADUATE_COHORTS,
      flashcards: STAR_FLASHCARDS,
      assessmentQuestions: ASSESSMENT_QUESTIONS,
      state: dbState,
    });
  });

  app.put('/api/state', (req, res) => {
    const incoming = req.body as Partial<LaunchGradState>;
    if (!incoming || typeof incoming !== 'object') {
      res.status(400).json({ error: 'Invalid state payload' });
      return;
    }
    dbState = {
      ...dbState,
      ...incoming,
    };
    saveState(dbState);
    res.json({ ok: true, state: dbState });
  });

  app.post('/api/applications', (req, res) => {
    const { jobId, resumeUsed, attachedProjectTitle, recruiterNote, email, phone } = req.body ?? {};
    const job = JOB_ROLES.find((j) => j.id === jobId);
    if (!job) {
      res.status(404).json({ error: 'Job role not found' });
      return;
    }

    const existingIdx = dbState.applications.findIndex((a) => a.jobId === jobId);
    if (existingIdx !== -1) {
      res.json({ ok: true, application: dbState.applications[existingIdx], state: dbState });
      return;
    }

    if (email || phone) {
      dbState.profile = {
        ...dbState.profile,
        email: email || dbState.profile.email,
        phone: phone || dbState.profile.phone,
      };
    }

    const todayLabel = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const newApp = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      stage: 'applied' as const,
      stepNumber: 1 as const,
      stageLabel: 'Stage 1: Application Review',
      appliedDate: todayLabel,
      statusBannerIcon: 'check_circle',
      statusBannerText: `Fast Application delivered to ${job.company} Recruiting`,
      resumeUsed: resumeUsed || dbState.profile.resumes[0]?.filename || 'Resume.pdf',
      attachedProjectTitle: attachedProjectTitle || undefined,
      recruiterNote: recruiterNote || undefined,
      interviewNotes: {},
    };

    dbState.applications = [newApp, ...dbState.applications];
    dbState.notifications = [
      {
        id: `notif-${Date.now()}`,
        title: `Application Sent to ${job.company}`,
        body: `Your 1-tap packet for ${job.title} is in priority fresher review (5-day SLA).`,
        timeAgo: 'Just now',
        read: false,
        targetTab: 'tracker',
        targetJobId: job.id,
      },
      ...dbState.notifications,
    ];

    saveState(dbState);
    res.status(201).json({ ok: true, application: newApp, state: dbState });
  });

  app.post('/api/reset', (_req, res) => {
    dbState = structuredClone(INITIAL_STATE);
    saveState(dbState);
    res.json({ ok: true, state: dbState });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LaunchGrad server listening on http://localhost:${PORT}`);
  });
}

startServer();
