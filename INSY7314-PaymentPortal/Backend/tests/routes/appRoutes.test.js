const request = require('supertest');
const express = require('express');
const session = require('express-session');
const routes = require('../../routes'); // adjust path as needed
const { User, Staff, Payment } = require('../../models');

jest.mock('../../models');

const app = express();
app.use(express.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/', routes);
