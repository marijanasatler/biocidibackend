const express = require('express');
const router = express.Router();
const { create, list, read, remove, listSpecific } = require('../controllers/categorynabavke');

// validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');
const { requireSignin, adminMiddleware } = require('../controllers/auth');

router.post('/categorynabavke', categoryCreateValidator, runValidation, requireSignin, adminMiddleware, create);
router.get('/categoriesnabavke', list);
router.get('/categorynabavke', listSpecific);

router.get('/categorynabavke/:slug', read);
router.delete('/categorynabavke/:slug', requireSignin, adminMiddleware, remove);

module.exports = router;
