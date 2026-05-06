const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');

router.get('/children', regionController.children);
router.get('/search', regionController.search);
router.get('/:code', regionController.detail);

module.exports = router;
