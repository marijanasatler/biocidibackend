const express = require('express');
const router = express.Router();
const { create, list,  remove,photo, listVideo,read } = require('../controllers/video');

// validators
const { runValidation } = require('../validators');
const { videoCreateValidator } = require('../validators/video');
const { requireSignin, adminMiddleware,authMiddleware,canUpdateDeleteVideo } = require('../controllers/auth');

router.get('/video/:slug', read);
router.post('/video',  requireSignin, adminMiddleware, create);
router.get('/videos', list);
router.post('/video-all',listVideo)
router.delete('/video/:slug', requireSignin, adminMiddleware, remove);
router.get('/video/photo/:slug', photo);
router.post('/user/video', requireSignin, authMiddleware, create);
router.delete('/user/video/:slug', requireSignin, authMiddleware, canUpdateDeleteVideo, remove);


module.exports = router;
