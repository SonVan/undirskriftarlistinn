import express from 'express';

import { catchErrors, ensureLoggedIn } from './utils.js';
import { list, count, deleteRow } from './db.js';

export const router = express.Router();

async function admin(req, res) {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  const page = req.query.page ? req.query.page : 1;
  const registrations = await list(page);
  const rowLenght = await count();

  return res.render('admin', {
    registrations, rowLenght, page, name: req.user.name, title: 'Umsjón',
  });
}

async function deleteSignature(req, res) {
  const nationalId = req.body;

  let success = true;

  try {
    success = await deleteRow(nationalId.nationalid);
  } catch (e) {
    console.error(e);
  }

  if (success) {
    return res.redirect('/admin');
  }

  return res.render('error', { title: 'Gat ekki eytt!', text: 'Villa! Gat ekki eytt.' });
}

router.get('/admin', ensureLoggedIn, catchErrors(admin));

router.post(
  '/admin',
  // validationMiddleware,
  // xssSanitizationMiddleware,
  // catchErrors(validationCheck),
  // sanitizationMiddleware,
  catchErrors(deleteSignature),
);
