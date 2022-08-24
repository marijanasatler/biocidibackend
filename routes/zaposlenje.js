const express = require('express');
const router = express.Router();
const {    create,
    list,
    listzaposlenje,
    read,
    remove,
    update,
    photo,
  listByUser,
    listSearch,
} = require('../controllers/zaposlenje');

// validators
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteZaposlenje } = require('../controllers/auth');

router.post('/zaposlenje', requireSignin, adminMiddleware, create);
router.get('/zaposlenjes', list);
router.post('/zaposlenjes-all', listzaposlenje);
router.get('/zaposlenje/:slug', read);
router.delete('/zaposlenje/:slug', requireSignin, adminMiddleware, remove);
router.put('/zaposlenje/:slug', requireSignin, adminMiddleware, update);
router.get('/zaposlenje/dokument/:slug', photo);

router.get('/zaposlenjes/search', listSearch);


// auth user zaposlenje crud
router.post('/user/zaposlenje', requireSignin, authMiddleware, create);
router.get('/:username/zaposlenjes', listByUser);
router.delete('/user/zaposlenje/:slug', requireSignin, authMiddleware, canUpdateDeleteZaposlenje, remove);
router.put('/user/zaposlenje/:slug', requireSignin, authMiddleware, canUpdateDeleteZaposlenje, update);


module.exports = router;
