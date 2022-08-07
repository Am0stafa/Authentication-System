const express = require('express');
const router = express.Router();
const { handelNewUser } = require('../controllers/registerController');

router.post('/', handelNewUser);

module.exports = router;