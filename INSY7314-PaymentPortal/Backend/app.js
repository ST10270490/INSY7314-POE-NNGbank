// Backend/app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { Status } = require('./enums');
const routes = require('./routes');

const app = express();
const uri = process.env.MONGODB_URI;

mongoose.set('strictQuery', true);
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(cookieParser());

app.use((req, res, next) => {
  function scrub(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      if (k.startsWith('$') || k.includes('.')) {
        delete obj[k];
      } else if (typeof obj[k] === 'object') {
        scrub(obj[k]);
      }
    }
  }
  scrub(req.body);
  scrub(req.query);
  scrub(req.params);
  next();
});

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use((req, res, next) => {
  if (req.session) {
    const last = req.session.lastActivity || Date.now();
    const now = Date.now();
    if (now - last > 10 * 60 * 1000) {
      req.session.destroy(err => {
        if (err) console.error('Session destroy error:', err);
        return res.status(403).json({ error: 'Session expired' });
      });
      return;
    }
    req.session.lastActivity = now;
  }
  next();
});

app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

if (process.env.NODE_ENV !== 'test') {
  const sessionStore = MongoStore.create({
    mongoUrl: uri,
    collectionName: 'sessions',
    ttl: 1 * 24 * 60 * 60
  });

  app.use(session({
    name: process.env.SESSION_NAME || 'sid',
    secret: process.env.SESSION_SECRET || 'replace-with-secure-secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60
    }
  }));
}

app.use('/', routes);

module.exports = app;
