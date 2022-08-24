const express = require('express');
const router = express.Router();
const {
    create,
    list,
    remove,
    photo,

    listByUser
} = require('../controllers/logo');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteLogo } = require('../controllers/auth');


router.post('/logo', requireSignin, adminMiddleware, create);
router.get('/logos', list);
router.delete('/logo/:slug', requireSignin, adminMiddleware, remove);
router.get('/logo/photo/:slug', photo);

// auth user logo crud
router.post('/user/logo', requireSignin, authMiddleware, create);

router.delete('/user/logo/:slug', requireSignin, authMiddleware, canUpdateDeleteLogo, remove);


module.exports = router;