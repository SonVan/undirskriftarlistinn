const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { select, insert } = require('./db');

/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */
function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }

    const field = req.body[fieldName];

    if (field) {
      req.body[fieldName] = xss(field);
    }

    next();
  };
}

const router = express.Router();

// Fylki af öllum validations fyrir undirskrift
const validations = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt.'),

  check('nationalid')
    .matches(/^[0-9]{6}( |-)?[0-9]{4}$/)
    .withMessage('Kennitala verður að vera á formi 0000000000 eða 000000-0000.'),
];

// Fylki af öllum hreinsunum fyrir undirskrift
const sanitazions = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('nationalid'),
  sanitize('nationalid')
    .trim().blacklist(' ').escape()
    .toInt(),

  sanitizeXss('comment'),
  sanitize('comment').trim().escape(),

  sanitizeXss('anonymous'),
  sanitize('anonymous').trim().escape(),
];

/**
 * Route handler fyrir form og töflu.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Formi fyrir umsókn
 */
async function form(req, res) {
  const list = await select();

  const data = {
    title: 'Undirskriftarlisti',
    name: '',
    nationalid: '',
    comment: '',
    anonymous: '',
    errors: [],
    list,
  };
  res.render('form', data);
}

/**
 * Route handler sem athugar stöðu á undirskrift og birtir villur ef einhverjar,
 * sendir annars áfram í næsta middleware.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 * @returns Næsta middleware ef í lagi, annars síðu með villum
 */
async function showErrors(req, res, next) {
  const list = await select();
  const {
    body: {
      name = '',
      nationalid = '',
      comment = '',
      anonymous = '',
    } = {},
  } = req;

  const data = {
    name,
    nationalid,
    comment,
    anonymous,
    list,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    data.title = 'Undirskrift – vandræði';

    return res.render('form', data);
  }

  return next();
}

/**
 * Ósamstilltur route handler sem vistar gögn í gagnagrunn og sendir
 * á þakkarsíðu
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function formPost(req, res) {
  const {
    body: {
      name = '',
      nationalid = '',
      comment = '',
      anonymous = '',
    } = {},
  } = req;

  const data = {
    name,
    nationalid,
    comment,
    anonymous,
  };

  if (data.anonymous) {
    data.name = 'Nafnlaust';
  } else { data.anonymous = false; }

  await insert(data);

  return res.redirect('/thanks');
}

/**
 * Route handler fyrir þakkarsíðu.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
function thanks(req, res) {
  return res.render('thanks', { title: 'Takk fyrir undirskriftina' });
}

router.get('/', form);
router.get('/thanks', thanks);

router.post(
  '/',
  // Athugar hvort form sé í lagi
  validations,
  // Ef form er ekki í lagi, birtir upplýsingar um það
  showErrors,
  // Öll gögn í lagi, hreinsa þau
  sanitazions,
  // Senda gögn í gagnagrunn
  catchErrors(formPost),
);

module.exports = router;
