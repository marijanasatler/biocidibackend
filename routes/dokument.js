const express = require('express');
const router = express.Router();
const {
    create,
    list,
    remove,
    photo,

    listByUser
} = require('../controllers/dokument');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteDokument } = require('../controllers/auth');


router.post('/dokument', requireSignin, adminMiddleware, create);
router.get('/dokuments', list);
router.delete('/dokument/:slug', requireSignin, adminMiddleware, remove);
router.get('/dokumenti/dokument/:slug', photo);

// auth user dokument crud
router.post('/user/dokument', requireSignin, authMiddleware, create);

router.delete('/user/dokument/:slug', requireSignin, authMiddleware, canUpdateDeleteDokument, remove);


module.exports = router;