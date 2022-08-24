const { check } = require('express-validator');

exports.videoCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
     
];
