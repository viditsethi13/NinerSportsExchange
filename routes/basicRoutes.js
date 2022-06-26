const express = require('express');
const router = express.Router();

const controller = require('../controller/basicController.js');

router.get('/about',controller.about);

router.get('/contact',controller.contact);

router.get('/',controller.index);

module.exports = router;