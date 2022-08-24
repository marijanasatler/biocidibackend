const express = require('express');
const router = express.Router();
const {
    create,
    list,
    listAllPins,
    read,
    remove,
    update,
    photo,
    
} = require('../controllers/pin');


const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeletePin } = require('../controllers/auth');


router.post('/pin', requireSignin, adminMiddleware, create);
router.get('/pins', list);
router.post('/pins-categories-tags', listAllPins);
router.get('/pin/:slug', read);
router.delete('/pin/:slug', requireSignin, adminMiddleware, remove);
router.put('/pin/:slug', requireSignin, adminMiddleware, update);
router.get('/pin/photo/:slug', photo);

;

// auth user pin crud
router.post('/user/pin', requireSignin, authMiddleware, create);

router.delete('/user/pin/:slug', requireSignin, authMiddleware, canUpdateDeletePin, remove);
router.put('/user/pin/:slug', requireSignin, authMiddleware, canUpdateDeletePin, update);

module.exports = router;