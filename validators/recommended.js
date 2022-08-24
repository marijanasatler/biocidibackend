const { check } = require('express-validator');

exports.recommendedCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
];
