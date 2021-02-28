import express from 'express';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { userStrategy, serializeUser, deserializeUser } from './users.js';

// Hægt að útfæra passport virkni hér til að létta á app.js

export const router = express.Router();
export default passport;

passport.use(new Strategy(userStrategy));

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

router.use(passport.initialize());
router.use(passport.session());

router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  let message = '';

  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', { page: 'login', title: 'Innskráning', message });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.post(
  '/login',

  passport.authenticate('local', {
    failureMessage: 'Notandi eða lykilorð vitlaust.',
    failureRedirect: '/login',
  }),

  (req, res) => {
    res.redirect('/admin');
  },
);
