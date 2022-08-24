const express = require('express');
const router = express.Router();
const {
    create,
    list,

    read,
    remove,
    update,
    photo
} = require('../controllers/zavod');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteZavod} = require('../controllers/auth');


router.post('/zavod', requireSignin, adminMiddleware, create);
router.get('/zavods', list);
router.get('/zavod/:slug', read);
router.delete('/zavod/:slug', requireSignin, adminMiddleware, remove);
router.put('/zavod/:slug', requireSignin, adminMiddleware, update);
router.get('/zavod/photo/:slug', photo);


// auth user zavod crud
router.post('/user/zavod', requireSignin, authMiddleware, create);

router.delete('/user/zavod/:slug', requireSignin, authMiddleware, canUpdateDeleteZavod, remove);
router.put('/user/zavod/:slug', requireSignin, authMiddleware, canUpdateDeleteZavod, update);

module.exports = router;