const express = require('express');
const router = express.Router();
const { create, list, read, remove, listSpecific } = require('../controllers/pincategory');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/pincategory', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/pincategories', list);
router.get('/pincategory', listSpecific);

router.get('/pincategory/:slug', read);
router.delete('/pincategory/:slug', requireSignin, adminMiddleware, remove);

module.exports = router;
