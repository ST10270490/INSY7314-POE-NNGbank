// Load environment variables from .env file
require('dotenv').config();

// Core modules and dependencies
const fs = require('fs'); // File system access
const path = require('path'); // Path utilities
const https = require('https'); // HTTPS server
const http = require('http'); // HTTP server
const express = require('express'); // Web framework
const bodyParser = require('body-parser'); // Parse incoming request bodies
const bcrypt = require('bcrypt'); // Password hashing
const mongoose = require('mongoose'); // MongoDB ODM
const helmet = require('helmet'); // Security headers
const cors = require('cors'); // Cross-Origin Resource Sharing
const rateLimit = require('express-rate-limit'); // Rate limiting middleware
const cookieParser = require('cookie-parser'); // Parse cookies
const session = require('express-session'); // Session management
const MongoStore = require('connect-mongo'); // Store sessions in MongoDB
const csurf = require('csurf'); // CSRF protection
const { Status } = require('./enums');

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// ---------- MONGOOSE CONNECTION ----------
// Connect to MongoDB using URI from environment
const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI:', uri);
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---------- EXPRESS APP & MIDDLEWARE ----------
const app = express();

// Parse JSON and URL-encoded request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigin = process.env.FRONTEND_ORIGIN || 'https://localhost:3001';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],

}));


// Apply basic rate limiting to all requests
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
}));

// Parse cookies for session and CSRF
app.use(cookieParser());

// Enforce strict query parsing in Mongoose
mongoose.set('strictQuery', true);

// ---------- SANITIZATION MIDDLEWARE ----------
// Recursively remove dangerous keys from objects
function scrubObjectInPlace(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    if (k.startsWith('$') || k.includes('.')) {
      delete obj[k];
      continue;
    }
    if (typeof obj[k] === 'object') {
      scrubObjectInPlace(obj[k]);
    }
  }
}

// Apply scrub to request body, query, and params
app.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') scrubObjectInPlace(req.body);
    if (req.query && typeof req.query === 'object') scrubObjectInPlace(req.query);
    if (req.params && typeof req.params === 'object') scrubObjectInPlace(req.params);
  } catch (e) {
    console.error('Sanitize middleware error', e);
  }
  next();
});

// Apply additional rate limiting (redundant but safe)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ---------- SESSION TIMEOUT MIDDLEWARE ----------
const MAX_INACTIVITY_PERIOD = 10 * 60 * 1000; // 10 minutes

// Destroy session if inactive for too long
app.use((req, res, next) => {
  if (req.session) {
    const last = req.session.lastActivity || Date.now();
    const now = Date.now();
    const elapsed = now - last;

    console.log(`Session check: idNumber=${req.session.idNumber}, lastActivity=${last}, now=${now}, elapsed=${elapsed}`);

    if (elapsed > MAX_INACTIVITY_PERIOD) {
      console.log('Session expired due to inactivity. Destroying session.');
      req.session.destroy(err => {
        if (err) console.error('Failed to destroy expired session', err);
        return res.status(403).json({ error: 'Session expired' });
      });
      return;
    }

    req.session.lastActivity = now;
  } else {
    console.log('No session found on request.');
  }

  next();
});

// Apply security headers using Helmet
app.use(helmet());

// Prevent clickjacking by disallowing framing
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ---------- UTILITIES ----------
// Enable trust proxy if behind reverse proxy
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Configure MongoDB session store
const sessionStore = MongoStore.create({
  mongoUrl: uri,
  collectionName: 'sessions',
  ttl: 1 * 24 * 60 * 60 // 1 days
});

// Setup session middleware
app.use(session({
  name: process.env.SESSION_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'replace-with-secure-secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    secure: true,         // ✅ Enforce HTTPS-only cookies
    sameSite: 'none',     // ✅ Allow cross-origin HTTPS
    maxAge: 1000 * 60 * 60
  }
}));

// ---------- ROUTES ----------
const routes = require('./routes');
app.use('/', routes);

// ---------- HTTPS CONFIG ----------
const KEYS_DIR = path.resolve(__dirname, 'Keys');
const CERT_PATH = process.env.SSL_CERT_PATH || path.join(KEYS_DIR, 'certificate.pem');
const KEY_PATH = process.env.SSL_KEY_PATH || path.join(KEYS_DIR, 'privatekey.pem');

if (!fs.existsSync(CERT_PATH)) {
  console.error(`SSL certificate not found at: ${CERT_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(KEY_PATH)) {
  console.error(`SSL private key not found at: ${KEY_PATH}`);
  process.exit(1);
}

const sslOptions = {
  key: fs.readFileSync(KEY_PATH, 'utf8'),
  cert: fs.readFileSync(CERT_PATH, 'utf8'),
  // passphrase: process.env.SSL_PASSPHRASE
};

const HTTPS_PORT = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT, 10) : 3443;
const HTTP_PORT = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT, 10) : 3000;

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
});

// Create simple HTTP server that redirects to HTTPS
const redirectApp = express();
redirectApp.use((req, res) => {
  const host = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
  const targetPort = HTTPS_PORT === 443 ? '' : `:${HTTPS_PORT}`;
  res.redirect(301, `https://${host}${targetPort}${req.originalUrl}`);
});

const httpServer = http.createServer(redirectApp);
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP redirect server running on http://localhost:${HTTP_PORT} -> https://localhost:${HTTPS_PORT}`);
});