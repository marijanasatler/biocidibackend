const express = require('express');
const router = express.Router();
const {    create,
    list,
    read,
    remove,
    update,
    photo,listAllPocetna
} = require('../controllers/pocetna');

// validators
const { requireSignin, adminMiddleware, authMiddleware } = require('../controllers/auth');

router.post('/pocetna', requireSignin, adminMiddleware, create);
router.get('/pocetnas', list);
router.get('/pocetna-pin',listAllPocetna );
router.get('/pocetna/:slug', read);
router.delete('/pocetna/:slug', requireSignin, adminMiddleware, remove);
router.put('/pocetna/:slug', requireSignin, adminMiddleware, update);
router.get('/pocetna/photo/:slug', photo);


// auth user pocetna crud


module.exports = router;
