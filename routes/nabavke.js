const express = require('express');
const router = express.Router();
const {
    create,
    list,
    listAllNabavke,
    read,
    remove,
    update,
    photo,
    listRelated,
    listSearch,
    listByUser,listSearchEn
} = require('../controllers/nabavke');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteNabavke } = require('../controllers/auth');


router.post('/nabavke', requireSignin, adminMiddleware, create);
router.get('/nabavkes', list);
router.post('/nabavkes-all', listAllNabavke);
router.get('/nabavke/:slug', read);
router.delete('/nabavke/:slug', requireSignin, adminMiddleware, remove);
router.put('/nabavke/:slug', requireSignin, adminMiddleware, update);
router.get('/nabavke/dokument/:slug', photo);
router.post('/nabavkes/related', listRelated);
router.get('/nabavkes/search', listSearch);
router.get('/nabavkes/searchall', listSearchEn);

// auth user nabavke crud
router.post('/user/nabavke', requireSignin, authMiddleware, create);

router.delete('/user/nabavke/:slug', requireSignin, authMiddleware, canUpdateDeleteNabavke, remove);
router.put('/user/nabavke/:slug', requireSignin, authMiddleware, canUpdateDeleteNabavke, update);

module.exports = router;