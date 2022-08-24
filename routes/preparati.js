const express = require('express');
const router = express.Router();
const {
    create,
    list,
    listAllPreparati,
    read,
    remove,
    update,
    photo,
    listRelated,
    listSearch,
    listByUser,listSearchAll
} = require('../controllers/preparati');

const { requireSignin, adminMiddleware, authMiddleware, canUpdateDeletePreparati } = require('../controllers/auth');


router.post('/preparati', requireSignin, adminMiddleware, create);
router.get('/preparatis', list);
router.post('/preparati-all', listAllPreparati);
router.get('/preparati/:slug', read);
router.delete('/preparati/:slug', requireSignin, adminMiddleware, remove);
router.put('/preparati/:slug', requireSignin, adminMiddleware, update);
router.get('/preparati/dokument/:slug', photo);
router.post('/preparatis/related', listRelated);
router.get('/preparatis/search', listSearch);
router.get('/preparatis/searchall', listSearchAll);

// auth user preparati crud
router.post('/user/preparati', requireSignin, authMiddleware, create);

router.delete('/user/preparati/:slug', requireSignin, authMiddleware, canUpdateDeletePreparati, remove);
router.put('/user/preparati/:slug', requireSignin, authMiddleware, canUpdateDeletePreparati, update);

module.exports = router;