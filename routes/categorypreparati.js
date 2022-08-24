const express = require('express');
const router = express.Router();
const { create, list, read, remove, listSpecific } = require('../controllers/categorypreparati');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/categorypreparati', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/categoriespreparati', list);
router.get('/categorypreparati', listSpecific);

router.get('/categorypreparati/:slug', read);
router.delete('/categorypreparati/:slug', requireSignin, adminMiddleware, remove);

module.exports = router;
