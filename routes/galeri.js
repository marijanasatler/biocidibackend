const express = require('express');
const router = express.Router();
const { create, list,  remove,photo,listGaleri,update,read} = require('../controllers/galeri');

// validators
const { runValidation } = require('../validators');
const { galeriCreateValidator } = require('../validators/galeri');
const { requireSignin, adminMiddleware ,authMiddleware, canUpdateDeleteGalery } = require('../controllers/auth');

router.post('/galeri', requireSignin, adminMiddleware, create);
router.get('/galeris', list);
router.post('/galeri-all',listGaleri)
router.delete('/galeri/:slug', requireSignin, adminMiddleware, remove);
router.get('/galeri/photo/:slug', photo);
router.get('/galeri/:slug', read);
router.put('/galeri/:slug', requireSignin, adminMiddleware, update);
router.post('/user/galeri', requireSignin, authMiddleware, create);
router.delete('/user/galeri/:slug', requireSignin, authMiddleware, canUpdateDeleteGalery, remove);


module.exports = router;
