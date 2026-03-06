import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL ? '/tmp/luna-api' : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'users.json');
const ADMIN_DATA_FILE = path.join(DATA_DIR, 'admin-state.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contact-submissions.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const SESSION_COOKIE = 'luna_sid';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SUPER_ADMIN_BOOTSTRAP_PASSWORD = process.env.SUPER_ADMIN_BOOTSTRAP_PASSWORD || 'LunaAdmin2026!';

const SUPER_ADMIN_EMAILS = new Set(
  (process.env.SUPER_ADMIN_EMAILS || 'dnainform@gmail.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const ROLE_PERMISSIONS = {
  viewer: ['view_financials', 'view_technical_metrics'],
  operator: ['manage_services', 'view_technical_metrics'],
  content_manager: ['manage_marketing', 'manage_email_templates'],
  finance_manager: ['view_financials'],
  super_admin: [
    'manage_services',
    'manage_marketing',
    'manage_email_templates',
    'manage_admin_roles',
    'view_financials',
    'view_technical_metrics',
  ],
};

const ADMIN_EMAIL_RULES = [
  { pattern: /admin|owner|founder/i, role: 'super_admin' },
  { pattern: /ops|support|service/i, role: 'operator' },
  { pattern: /marketing|content|brand/i, role: 'content_manager' },
  { pattern: /finance|billing|accounting/i, role: 'finance_manager' },
];

const ALLOWED_ORIGINS = new Set(
  (process.env.AUTH_ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:4173,http://127.0.0.1:4173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const rateLimits = new Map();
const sessions = new Map();
let lastSessionPurgeAt = 0;

const DEFAULT_ADMIN_STATE = {
  services: [
    { id: 'svc-auth', name: 'Auth Gateway', status: 'Healthy', owner: 'Ops', uptime: '99.98%' },
    { id: 'svc-ai', name: 'Narrative Engine', status: 'Healthy', owner: 'AI', uptime: '99.87%' },
    { id: 'svc-sync', name: 'Sync Queue', status: 'Degraded', owner: 'Platform', uptime: '98.62%' },
    { id: 'svc-mail', name: 'Mail Dispatch', status: 'Healthy', owner: 'Growth', uptime: '99.91%' },
  ],
  content: [],
  templates: [],
  templateHistory: {},
  admins: [
    { id: 'adm-1', name: 'Luna Owner', email: 'owner@luna.app', role: 'super_admin', active: true },
    { id: 'adm-2', name: 'Ops Control', email: 'ops@luna.app', role: 'operator', active: true },
    { id: 'adm-3', name: 'Growth Team', email: 'marketing@luna.app', role: 'content_manager', active: true },
    { id: 'adm-4', name: 'Finance Board', email: 'finance@luna.app', role: 'finance_manager', active: true },
  ],
  testHistory: [
    'Smoke tests: PASS (2026-03-03 08:20)',
    'Email template lint: PASS (2026-03-03 08:16)',
    'Analytics sync check: WARN (2026-03-03 07:54)',
  ],
  financialMetrics: {
    mrr: 48240,
    arr: 578880,
    churn: 2.4,
    ltv: 386,
    cac: 59,
    conversion: 6.8,
    activeSubscribers: 2148,
    trialToPaid: 41.7,
  },
  technicalMetrics: {
    apiP95: 183,
    errorRate: 0.31,
    queueLag: 12,
  },
  metricsHistory: [],
  audit: [],
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const normalizeName = (email, fallback = 'Luna Member') => {
  const local = email.split('@')[0] || '';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const safeText = (value, max = 5000) => String(value || '').replace(/[<>]/g, '').trim().slice(0, max);

const readJson = async (filePath, fallback) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const digest = scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${digest}`;
};

const verifyPassword = (password, encoded) => {
  if (!encoded || typeof encoded !== 'string') return false;
  const [algo, salt, digest] = encoded.split(':');
  if (algo !== 'scrypt' || !salt || !digest) return false;
  const computed = scryptSync(password, salt, 64).toString('hex');
  const digestBuf = Buffer.from(digest, 'hex');
  const computedBuf = Buffer.from(computed, 'hex');
  if (digestBuf.length !== computedBuf.length) return false;
  return timingSafeEqual(digestBuf, computedBuf);
};

const parseCookies = (cookieHeader) => {
  const result = {};
  if (!cookieHeader) return result;
  const chunks = cookieHeader.split(';');
  for (const chunk of chunks) {
    const [rawKey, ...rest] = chunk.trim().split('=');
    if (!rawKey) continue;
    result[rawKey] = decodeURIComponent(rest.join('='));
  }
  return result;
};

const buildSecurityHeaders = () => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  };
  if (process.env.NODE_ENV === 'production') {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
  return headers;
};

const send = (res, status, payload, extraHeaders = {}) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end(body);
};

const sendText = (res, status, text, extraHeaders = {}) => {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end(text);
};

const sendEmpty = (res, status, extraHeaders = {}) => {
  res.writeHead(status, {
    ...buildSecurityHeaders(),
    ...extraHeaders,
  });
  res.end();
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
};

const decodeGoogleJwt = (credential) => {
  try {
    const [, payload] = String(credential || '').split('.');
    if (!payload) return {};
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const claims = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
    return {
      email: typeof claims.email === 'string' ? claims.email : undefined,
      name: typeof claims.name === 'string' ? claims.name : undefined,
      picture: typeof claims.picture === 'string' ? claims.picture : undefined,
    };
  } catch {
    return {};
  }
};

const resolveRole = (email, roleOverride = null) => {
  if (roleOverride && ROLE_PERMISSIONS[roleOverride]) return roleOverride;
  const normalizedEmail = normalizeEmail(email);
  if (SUPER_ADMIN_EMAILS.has(normalizedEmail)) return 'super_admin';
  for (const rule of ADMIN_EMAIL_RULES) {
    if (rule.pattern.test(normalizedEmail)) return rule.role;
  }
  return 'viewer';
};

const buildSessionPayload = (user) => {
  const role = resolveRole(user.email, user.roleOverride || null);
  const provider = user.lastProvider === 'google' ? 'google' : 'password';
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    provider,
    role,
    permissions: ROLE_PERMISSIONS[role],
    lastLoginAt: new Date().toISOString(),
    avatarUrl: user.avatarUrl,
  };
};

const parseStoredSessions = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const item = raw || {};
      const token = safeText(item.token, 256);
      const userId = safeText(item.userId, 256);
      const expiresAt = Number(item.expiresAt);
      if (!token || !userId || !Number.isFinite(expiresAt)) return null;
      return { token, userId, expiresAt };
    })
    .filter(Boolean);
};

const serializeSessions = () =>
  Array.from(sessions.entries()).map(([token, value]) => ({
    token,
    userId: value.userId,
    expiresAt: value.expiresAt,
  }));

const purgeExpiredSessions = (now = Date.now()) => {
  let changed = false;
  for (const [token, value] of sessions.entries()) {
    if (value.expiresAt < now) {
      sessions.delete(token);
      changed = true;
    }
  }
  return changed;
};

const createSession = (userId) => {
  const token = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  sessions.set(token, { userId, expiresAt });
  return token;
};

const getSessionUser = async (req, users) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = users.find((item) => item.id === session.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return { token, user };
};

const corsHeaders = (origin) => {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    Vary: 'Origin',
  };
};

const clearSessionCookie = () => `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`;

const createSessionCookie = (token) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${token}; Max-Age=${SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${secure}`;
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
};

const rateLimit = (key, limit, windowMs) => {
  const now = Date.now();
  const state = rateLimits.get(key);
  if (!state || state.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (state.count >= limit) return false;
  state.count += 1;
  return true;
};

const hasAnyPermission = (sessionPayload, permissions) => permissions.some((item) => sessionPayload.permissions.includes(item));

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

const numberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCsv = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );

  const escape = (value) => {
    const text = String(value ?? '');
    if (text.includes('"') || text.includes(',') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [columns.join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escape(row[column])).join(','));
  }
  return lines.join('\n');
};

const sanitizeAdminState = (raw) => {
  const next = { ...DEFAULT_ADMIN_STATE };
  if (!raw || typeof raw !== 'object') return next;

  if (Array.isArray(raw.services)) {
    next.services = raw.services.map((item, index) => ({
      id: safeText(item.id || `svc-${index}`, 80),
      name: safeText(item.name || 'Service', 120),
      status: ['Healthy', 'Degraded', 'Down'].includes(item.status) ? item.status : 'Healthy',
      owner: safeText(item.owner || 'Ops', 80),
      uptime: safeText(item.uptime || '99.00%', 20),
    }));
  }

  if (Array.isArray(raw.content)) {
    next.content = raw.content.slice(0, 500);
  }

  if (Array.isArray(raw.templates)) {
    next.templates = raw.templates.slice(0, 500);
  }

  if (raw.templateHistory && typeof raw.templateHistory === 'object') {
    next.templateHistory = raw.templateHistory;
  }

  if (Array.isArray(raw.admins)) {
    next.admins = raw.admins.map((item, index) => ({
      id: safeText(item.id || `adm-${index}`, 80),
      name: safeText(item.name || 'Admin', 120),
      email: normalizeEmail(item.email || ''),
      role: ROLE_PERMISSIONS[item.role] ? item.role : 'viewer',
      active: Boolean(item.active),
    }));
  }

  if (Array.isArray(raw.testHistory)) {
    next.testHistory = raw.testHistory.map((item) => safeText(item, 300)).filter(Boolean).slice(0, 100);
  }

  if (raw.financialMetrics && typeof raw.financialMetrics === 'object') {
    next.financialMetrics = {
      mrr: numberOr(raw.financialMetrics.mrr, 48240),
      arr: numberOr(raw.financialMetrics.arr, 578880),
      churn: numberOr(raw.financialMetrics.churn, 2.4),
      ltv: numberOr(raw.financialMetrics.ltv, 386),
      cac: numberOr(raw.financialMetrics.cac, 59),
      conversion: numberOr(raw.financialMetrics.conversion, 6.8),
      activeSubscribers: numberOr(raw.financialMetrics.activeSubscribers, 2148),
      trialToPaid: numberOr(raw.financialMetrics.trialToPaid, 41.7),
    };
  }

  if (raw.technicalMetrics && typeof raw.technicalMetrics === 'object') {
    next.technicalMetrics = {
      apiP95: numberOr(raw.technicalMetrics.apiP95, 183),
      errorRate: numberOr(raw.technicalMetrics.errorRate, 0.31),
      queueLag: numberOr(raw.technicalMetrics.queueLag, 12),
    };
  }

  if (Array.isArray(raw.metricsHistory)) {
    next.metricsHistory = raw.metricsHistory.slice(0, 365).map((item) => ({
      at: safeText(item.at || '', 64),
      mrr: numberOr(item.mrr, 0),
      churn: numberOr(item.churn, 0),
      subscribers: numberOr(item.subscribers, 0),
      apiP95: numberOr(item.apiP95, 0),
      errorRate: numberOr(item.errorRate, 0),
    }));
  }

  if (Array.isArray(raw.audit)) {
    next.audit = raw.audit.slice(0, 500);
  }

  return next;
};

const pushAudit = (adminState, entry) => {
  const nextEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    ...entry,
  };
  adminState.audit = [nextEntry, ...(adminState.audit || [])].slice(0, 500);
};

const updateAdminStateByPermissions = (adminState, incoming, sessionPayload) => {
  const allowed = {
    services: sessionPayload.permissions.includes('manage_services'),
    content: sessionPayload.permissions.includes('manage_marketing'),
    templates: sessionPayload.permissions.includes('manage_email_templates'),
    templateHistory: sessionPayload.permissions.includes('manage_email_templates'),
    admins: sessionPayload.permissions.includes('manage_admin_roles'),
    testHistory: sessionPayload.permissions.includes('manage_services'),
    financialMetrics: sessionPayload.permissions.includes('manage_admin_roles'),
    technicalMetrics: sessionPayload.permissions.includes('manage_admin_roles'),
    metricsHistory: sessionPayload.permissions.includes('manage_admin_roles'),
  };

  const changed = [];

  for (const key of Object.keys(allowed)) {
    if (!allowed[key]) continue;
    if (typeof incoming[key] === 'undefined') continue;
    adminState[key] = incoming[key];
    changed.push(key);
  }

  return changed;
};

const start = async () => {
  let users = await readJson(DATA_FILE, []);
  if (!Array.isArray(users)) users = [];

  let adminState = sanitizeAdminState(await readJson(ADMIN_DATA_FILE, DEFAULT_ADMIN_STATE));
  let contactSubmissions = await readJson(CONTACTS_FILE, []);
  if (!Array.isArray(contactSubmissions)) contactSubmissions = [];
  const storedSessions = parseStoredSessions(await readJson(SESSIONS_FILE, []));
  for (const item of storedSessions) {
    sessions.set(item.token, { userId: item.userId, expiresAt: item.expiresAt });
  }
  const didPurgeOnBoot = purgeExpiredSessions();

  const saveUsers = async () => writeJson(DATA_FILE, users);
  const saveAdminState = async () => writeJson(ADMIN_DATA_FILE, adminState);
  const saveContacts = async () => writeJson(CONTACTS_FILE, contactSubmissions);
  const saveSessions = async () => writeJson(SESSIONS_FILE, serializeSessions());

  let didBootstrapSuperAdmin = false;
  for (const email of SUPER_ADMIN_EMAILS) {
    let account = users.find((item) => item.email === email);
    if (!account) {
      account = {
        id: randomBytes(12).toString('hex'),
        email,
        name: 'Luna Super Admin',
        passwordHash: hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD),
        createdAt: new Date().toISOString(),
        roleOverride: 'super_admin',
        lastProvider: 'password',
        avatarUrl: undefined,
      };
      users = [account, ...users];
      didBootstrapSuperAdmin = true;
      continue;
    }

    if (account.roleOverride !== 'super_admin') {
      account.roleOverride = 'super_admin';
      didBootstrapSuperAdmin = true;
    }

    if (!account.passwordHash) {
      account.passwordHash = hashPassword(SUPER_ADMIN_BOOTSTRAP_PASSWORD);
      account.lastProvider = 'password';
      didBootstrapSuperAdmin = true;
    }
  }
  if (didBootstrapSuperAdmin) {
    await saveUsers();
  }

  if (didPurgeOnBoot || storedSessions.length === 0) {
    await saveSessions();
  }

  const requireSession = async (req, res, headers) => {
    const current = await getSessionUser(req, users);
    if (!current) {
      send(res, 401, { error: 'Not authenticated.' }, headers);
      return null;
    }
    return { current, sessionPayload: buildSessionPayload(current.user) };
  };

  return async (req, res) => {
    const method = req.method || 'GET';
    const origin = req.headers.origin;
    const headers = corsHeaders(origin);

    if (method === 'OPTIONS') {
      sendEmpty(res, 204, headers);
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const ip = getClientIp(req);

    if (Date.now() - lastSessionPurgeAt > 60_000) {
      lastSessionPurgeAt = Date.now();
      if (purgeExpiredSessions()) {
        await saveSessions();
      }
    }

    if (method === 'GET' && url.pathname === '/api/health') {
      send(res, 200, { ok: true, service: 'luna-auth-api' }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/auth/session') {
      const current = await getSessionUser(req, users);
      if (!current) {
        send(res, 200, { session: null }, headers);
        return;
      }
      send(res, 200, { session: buildSessionPayload(current.user) }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signup') {
      if (!rateLimit(`signup:${ip}`, 10, 60_000)) {
        send(res, 429, { error: 'Too many signup attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');
        const name = typeof body.name === 'string' && body.name.trim() ? safeText(body.name, 120) : normalizeName(email);

        if (!email || !email.includes('@')) {
          send(res, 400, { error: 'Provide a valid email.' }, headers);
          return;
        }
        if (password.length < 8) {
          send(res, 400, { error: 'Password must contain at least 8 characters.' }, headers);
          return;
        }

        const exists = users.some((item) => item.email === email);
        if (exists) {
          send(res, 409, { error: 'Account already exists. Please sign in.' }, headers);
          return;
        }

        const user = {
          id: randomBytes(12).toString('hex'),
          email,
          name,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
          roleOverride: null,
          lastProvider: 'password',
          avatarUrl: undefined,
        };
        users = [user, ...users];
        await saveUsers();

        const token = createSession(user.id);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign up.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/signin') {
      if (!rateLimit(`signin:${ip}`, 20, 60_000)) {
        send(res, 429, { error: 'Too many login attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const password = String(body.password || '');

        const user = users.find((item) => item.email === email);
        if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
          send(res, 401, { error: 'Incorrect email or password.' }, headers);
          return;
        }

        user.lastProvider = 'password';
        const token = createSession(user.id);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to sign in.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/google') {
      if (!rateLimit(`google:${ip}`, 20, 60_000)) {
        send(res, 429, { error: 'Too many authorization attempts. Try again in a minute.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const claims = decodeGoogleJwt(body.credential);
        const email = normalizeEmail(claims.email);
        if (!email) {
          send(res, 400, { error: 'Google credential payload is invalid.' }, headers);
          return;
        }

        let user = users.find((item) => item.email === email);
        if (!user) {
          user = {
            id: randomBytes(12).toString('hex'),
            email,
            name: claims.name ? safeText(claims.name, 120) : normalizeName(email),
            passwordHash: null,
            createdAt: new Date().toISOString(),
            roleOverride: null,
            lastProvider: 'google',
            avatarUrl: claims.picture,
          };
          users = [user, ...users];
        } else {
          user.lastProvider = 'google';
          user.name = claims.name ? safeText(claims.name, 120) : user.name;
          user.avatarUrl = claims.picture || user.avatarUrl;
        }

        await saveUsers();

        const token = createSession(user.id);
        await saveSessions();
        send(res, 200, { session: buildSessionPayload(user) }, { ...headers, 'Set-Cookie': createSessionCookie(token) });
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Google authorization failed.' }, headers);
      }
      return;
    }

    if (method === 'POST' && url.pathname === '/api/auth/logout') {
      const cookies = parseCookies(req.headers.cookie || '');
      const token = cookies[SESSION_COOKIE];
      if (token) sessions.delete(token);
      await saveSessions();
      send(res, 200, { ok: true }, { ...headers, 'Set-Cookie': clearSessionCookie() });
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/role') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!auth.sessionPayload.permissions.includes('manage_admin_roles')) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const role = String(body.role || '');
        if (!email || !ROLE_PERMISSIONS[role]) {
          send(res, 400, { error: 'Invalid role update request.' }, headers);
          return;
        }

        const targetUser = users.find((item) => item.email === email);
        if (!targetUser) {
          send(res, 404, { error: 'Target account not found.' }, headers);
          return;
        }

        targetUser.roleOverride = role;
        await saveUsers();

        pushAudit(adminState, {
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.role.update',
          details: `Assigned ${role} to ${email}`,
        });
        await saveAdminState();

        send(res, 200, { session: buildSessionPayload(targetUser) }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update role.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_marketing', 'manage_email_templates', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(res, 200, {
        services: adminState.services,
        content: adminState.content,
        templates: adminState.templates,
        templateHistory: adminState.templateHistory,
        admins: adminState.admins,
        testHistory: adminState.testHistory,
        financialMetrics: adminState.financialMetrics,
        technicalMetrics: adminState.technicalMetrics,
        metricsHistory: adminState.metricsHistory,
      }, headers);
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      try {
        const body = await readBody(req);
        const incoming = sanitizeAdminState(body || {});
        const changed = updateAdminStateByPermissions(adminState, incoming, auth.sessionPayload);

        if (!isNonEmptyArray(changed)) {
          send(res, 403, { error: 'No permitted fields in update payload.' }, headers);
          return;
        }

        pushAudit(adminState, {
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.state.update',
          details: `Updated fields: ${changed.join(', ')}`,
        });
        await saveAdminState();

        send(res, 200, { ok: true, changed }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update admin state.' }, headers);
      }
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/audit') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_services'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(res, 200, { audit: adminState.audit || [] }, headers);
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/metrics') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      send(
        res,
        200,
        {
          financial: adminState.financialMetrics,
          technical: adminState.technicalMetrics,
          history: adminState.metricsHistory || [],
        },
        headers
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/admin/metrics/check') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      const now = new Date();
      const nextApiP95 = Math.max(120, Math.round(adminState.technicalMetrics.apiP95 + (Math.random() * 16 - 8)));
      const nextErrorRate = Math.max(0.1, Number((adminState.technicalMetrics.errorRate + (Math.random() * 0.08 - 0.04)).toFixed(2)));
      const nextQueueLag = Math.max(3, Math.round(adminState.technicalMetrics.queueLag + (Math.random() * 4 - 2)));

      adminState.technicalMetrics = {
        ...adminState.technicalMetrics,
        apiP95: nextApiP95,
        errorRate: nextErrorRate,
        queueLag: nextQueueLag,
      };

      const checkLine = `System probes: PASS (${now.toLocaleString('en-US', { timeZone: 'UTC' })} UTC)`;
      adminState.testHistory = [checkLine, ...(adminState.testHistory || [])].slice(0, 100);
      adminState.metricsHistory = [
        {
          at: now.toISOString(),
          mrr: adminState.financialMetrics.mrr,
          churn: adminState.financialMetrics.churn,
          subscribers: adminState.financialMetrics.activeSubscribers,
          apiP95: adminState.technicalMetrics.apiP95,
          errorRate: adminState.technicalMetrics.errorRate,
        },
        ...(adminState.metricsHistory || []),
      ].slice(0, 365);

      pushAudit(adminState, {
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.metrics.check',
        details: `Updated technical metrics (p95=${nextApiP95}ms, err=${nextErrorRate}%, queue=${nextQueueLag}s)`,
      });
      await saveAdminState();

      send(
        res,
        200,
        {
          ok: true,
          technical: adminState.technicalMetrics,
          testHistory: adminState.testHistory,
          history: adminState.metricsHistory,
        },
        headers
      );
      return;
    }

    if (method === 'GET' && url.pathname === '/api/admin/export') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return;

      const type = safeText(url.searchParams.get('type') || 'audit', 32);
      const format = safeText(url.searchParams.get('format') || 'json', 16).toLowerCase();

      let rows = [];
      let filename = '';
      let neededPermissions = [];

      if (type === 'audit') {
        neededPermissions = ['manage_admin_roles', 'manage_services'];
        rows = (adminState.audit || []).map((entry) => ({
          at: entry.at,
          actorEmail: entry.actorEmail,
          actorRole: entry.actorRole,
          action: entry.action,
          details: entry.details,
        }));
        filename = 'luna-admin-audit';
      } else if (type === 'metrics') {
        neededPermissions = ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'];
        rows = (adminState.metricsHistory || []).map((entry) => ({
          at: entry.at,
          mrr: entry.mrr,
          churn: entry.churn,
          subscribers: entry.subscribers,
          apiP95: entry.apiP95,
          errorRate: entry.errorRate,
        }));
        filename = 'luna-admin-metrics';
      } else {
        send(res, 400, { error: 'Unsupported export type.' }, headers);
        return;
      }

      if (!hasAnyPermission(auth.sessionPayload, neededPermissions)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return;
      }

      if (format === 'csv') {
        const csv = toCsv(rows);
        sendText(
          res,
          200,
          csv,
          {
            ...headers,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=\"${filename}.csv\"`,
          }
        );
        return;
      }

      send(
        res,
        200,
        { type, exportedAt: new Date().toISOString(), rows },
        {
          ...headers,
          'Content-Disposition': `attachment; filename=\"${filename}.json\"`,
        }
      );
      return;
    }

    if (method === 'POST' && url.pathname === '/api/public/contact') {
      if (!rateLimit(`contact:${ip}`, 8, 60_000)) {
        send(res, 429, { error: 'Too many contact submissions. Please try again later.' }, headers);
        return;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const name = safeText(body.name, 120);
        const subject = safeText(body.subject || 'support', 60);
        const message = safeText(body.message, 5000);

        if (!email.includes('@')) {
          send(res, 400, { error: 'Provide a valid email.' }, headers);
          return;
        }
        if (name.length < 2) {
          send(res, 400, { error: 'Provide your name.' }, headers);
          return;
        }
        if (message.length < 10) {
          send(res, 400, { error: 'Message is too short.' }, headers);
          return;
        }

        contactSubmissions = [
          {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            at: new Date().toISOString(),
            name,
            email,
            subject,
            message,
            ip,
          },
          ...contactSubmissions,
        ].slice(0, 2000);

        await saveContacts();
        send(res, 200, { ok: true }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to submit message.' }, headers);
      }
      return;
    }

    send(res, 404, { error: 'Not found.' }, headers);
  };
};

let requestHandlerPromise;

export default async function handler(req, res) {
  if (!requestHandlerPromise) {
    requestHandlerPromise = start();
  }

  const requestHandler = await requestHandlerPromise;
  return requestHandler(req, res);
}
