const express = require('express');
const router = express.Router();

const {isLoggedIn, isOwner} = require('../middleware/auth');
const {validateId} = require('../middleware/validator');
const {validateEquipment, validateResults} = require('../middleware/validator');


const controller = require('../controller/exchangeController.js');

router.get('/',controller.index);

router.get('/new', isLoggedIn, controller.new);

router.get('/equipments/:id', isLoggedIn, controller.equipments);

router.get('/:id', validateId, controller.show);

router.post('/:id', validateId, isLoggedIn, controller.watch);

router.get('/:id/edit', validateId, isLoggedIn, isOwner, controller.edit);

router.post('/', isLoggedIn, validateEquipment, validateResults, controller.create);

router.delete('/:id', validateId, isLoggedIn, isOwner, controller.delete);

router.put('/:id', validateId, isLoggedIn, isOwner, validateEquipment, validateResults, controller.update);

module.exports = router;