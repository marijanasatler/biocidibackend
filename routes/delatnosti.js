const express = require('express');
const router = express.Router();
const {
    create,
    list,

    read,
    remove,
    update,
    photo
} = require('../controllers/delatnosti');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeleteDelatnost} = require('../controllers/auth');


router.post('/delatnost', requireSignin, adminMiddleware, create);
router.get('/delatnosti', list);
router.get('/delatnost/:slug', read);
router.delete('/delatnost/:slug', requireSignin, adminMiddleware, remove);
router.put('/delatnost/:slug', requireSignin, adminMiddleware, update);
router.get('/delatnost/photo/:slug', photo);


// auth user delatnost crud
router.post('/user/delatnost', requireSignin, authMiddleware, create);

router.delete('/user/delatnost/:slug', requireSignin, authMiddleware, canUpdateDeleteDelatnost, remove);
router.put('/user/delatnost/:slug', requireSignin, authMiddleware, canUpdateDeleteDelatnost, update);

module.exports = router;