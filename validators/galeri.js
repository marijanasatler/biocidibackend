const { check } = require('express-validator');

exports.galeriCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
     
];
