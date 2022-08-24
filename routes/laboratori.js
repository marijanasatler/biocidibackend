const express = require('express');
const router = express.Router();
const {    create,
    list,
    listLaboratori,
    read,
    remove,
    update,
    photo,
  listByUser,
    listSearch,
} = require('../controllers/laboratori');

// validators
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteLaboratori } = require('../controllers/auth');

router.post('/laboratori', requireSignin, adminMiddleware, create);
router.get('/laboratoris', list);
router.post('/laboratoris-all', listLaboratori);
router.get('/laboratori/:slug', read);
router.delete('/laboratori/:slug', requireSignin, adminMiddleware, remove);
router.put('/laboratori/:slug', requireSignin, adminMiddleware, update);
router.get('/laboratori/photo/:slug', photo);

router.get('/laboratoris/search', listSearch);


// auth user laboratori crud
router.post('/user/laboratori', requireSignin, authMiddleware, create);
router.get('/:username/laboratoris', listByUser);
router.delete('/user/laboratori/:slug', requireSignin, authMiddleware, canUpdateDeleteLaboratori, remove);
router.put('/user/laboratori/:slug', requireSignin, authMiddleware, canUpdateDeleteLaboratori, update);


module.exports = router;
