import express from 'express';

import { catchErrors, ensureLoggedIn } from './utils.js';
import { list, count } from './db.js';

export const router = express.Router();


async function admin(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  const page = req.query.page ? parseInt(req.query.page) : 1;
  const registrations = await list(page);
  const rowLenght = await count();

  res.render('admin', {
    registrations, rowLenght, page, name: req.user.name, title: 'Umsjón'
  });
}

async function register(req, res) {
  const {
    name, nationalId, comment, anonymous,
  } = req.body;

  let success = true;

  try {
    success = await insert({
      name, nationalId, comment, anonymous,
    });
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/');
  }

  return res.render('error', { title: 'Gat ekki skráð!', text: 'Hafðir þú skrifað undir áður?' });
}

router.get('/admin', ensureLoggedIn, catchErrors(admin));
/*
router.post(
  '/admin',
  validationMiddleware,
  xssSanitizationMiddleware,
  catchErrors(validationCheck),
  sanitizationMiddleware,
  catchErrors(register),
);
*/