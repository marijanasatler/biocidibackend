const express = require('express');
const router = express.Router();
const {    create,
    list,

    read,
    remove,
    update,
    photo,
  listByUser,
    listSearch,
} = require('../controllers/ostalo');

// validators
const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteOstalo } = require('../controllers/auth');

router.post('/ostalo', requireSignin, adminMiddleware, create);
router.get('/ostalos', list);
router.get('/ostalo/:slug', read);
router.delete('/ostalo/:slug', requireSignin, adminMiddleware, remove);
router.put('/ostalo/:slug', requireSignin, adminMiddleware, update);
router.get('/ostalo/photo/:slug', photo);

router.get('/ostalos/search', listSearch);


// auth user ostalo crud


module.exports = router;
