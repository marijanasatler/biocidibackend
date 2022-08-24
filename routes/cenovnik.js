const express = require('express');
const router = express.Router();
const {    create,
    list,
    listCenovnik,
    read,
    remove,
    update,
    photo,
  listByUser,
    listSearch,
} = require('../controllers/cenovnik');

// validators
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteCenovnik } = require('../controllers/auth');

router.post('/cenovnik', requireSignin, adminMiddleware, create);
router.get('/cenovniks', list);
router.post('/cenovniks-all', listCenovnik);
router.get('/cenovnik/:slug', read);
router.delete('/cenovnik/:slug', requireSignin, adminMiddleware, remove);
router.put('/cenovnik/:slug', requireSignin, adminMiddleware, update);
router.get('/cenovnik/photo/:slug', photo);

router.get('/cenovniks/search', listSearch);


// auth user cenovnik crud
router.post('/user/cenovnik', requireSignin, authMiddleware, create);
router.get('/:username/cenovniks', listByUser);
router.delete('/user/cenovnik/:slug', requireSignin, authMiddleware, canUpdateDeleteCenovnik, remove);
router.put('/user/cenovnik/:slug', requireSignin, authMiddleware, canUpdateDeleteCenovnik, update);


module.exports = router;
