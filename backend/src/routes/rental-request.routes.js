const express = require('express');
const rentalRequestController = require('../controllers/rental-request.controller');
const validateRequest = require('../middleware/validate-request');
const { authenticate } = require('../middleware/auth');
const rentalRequestSchemas = require('../schemas/rental-request.schemas');

const router = express.Router();

router.use(authenticate);

router.get('/', rentalRequestController.listRentalRequests);
router.get('/:id', rentalRequestController.getRentalRequestById);
router.post('/', validateRequest(rentalRequestSchemas.create), rentalRequestController.createRentalRequest);
router.patch('/:id', validateRequest(rentalRequestSchemas.update), rentalRequestController.updateRentalRequest);
router.delete('/:id', rentalRequestController.deleteRentalRequest);

module.exports = router;
