const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/connexion', authController.connexion);

module.exports = router;
