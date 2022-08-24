const express = require('express');
const router = express.Router();

// controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { create, list, read, remove } = require('../controllers/tagnabavke');

// validators
const { runValidation } = require('../validators');
const { createTagnabavkeValidator } = require('../validators/tagnabavke');

// only difference is methods not name 'get' | 'post' | 'delete'
router.post('/tagnabavke', createTagnabavkeValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/tagnabavkes', list);
router.get('/tagnabavke/:slug', read);
router.delete('/tagnabavke/:slug', requireSignin, adminMiddleware, remove);

module.exports = router; 
