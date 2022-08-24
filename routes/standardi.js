const express = require('express');
const router = express.Router();
const {
    create,
    list,
    remove,
    photo,

} = require('../controllers/standardi');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteStandard } = require('../controllers/auth');


router.post('/standard', requireSignin, adminMiddleware, create);
router.get('/standardi', list);
router.delete('/standard/:slug', requireSignin, adminMiddleware, remove);
router.get('/standard/dokument/:slug', photo);

// auth user standard crud
router.post('/user/standard', requireSignin, authMiddleware, create);

router.delete('/user/standard/:slug', requireSignin, authMiddleware, canUpdateDeleteStandard, remove);


module.exports = router;