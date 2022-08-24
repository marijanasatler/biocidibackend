const express = require('express');
const router = express.Router();
const {
    create,
    list,
    read,
    remove,
    update,
    photo,
    
} = require('../controllers/pinmali');

const { requireSignin, adminMiddleware, authMiddleware } = require('../controllers/auth');


router.post('/pinmali', requireSignin, adminMiddleware, create);
router.get('/pinmalis', list);

router.get('/pinmali/:slug', read);
router.delete('/pinmali/:slug', requireSignin, adminMiddleware, remove);
router.put('/pinmali/:slug', requireSignin, adminMiddleware, update);
router.get('/pinmali/photo/:slug', photo);

;

// auth user pinmali crud
router.post('/user/pinmali', requireSignin, authMiddleware, create);


module.exports = router;