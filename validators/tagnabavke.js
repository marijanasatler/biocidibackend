const { check } = require('express-validator');

exports.createTagnabavkeValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required')
];
