const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/ostalonabavke');

// validators
const { runValidation } = require('../validators');
const { createTagValidator } = require('../validators/tag');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/ostalonabavke', createTagValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/ostalonabavkes', list);
router.get('/ostalonabavke/:slug', read);
router.delete('/ostalonabavke/:slug', requireSignin, adminMiddleware, remove);

module.exports = router; 
