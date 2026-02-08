const express = require('express');
const router = express.Router();
const { getAll } = require('../controllers/historiqueController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAll); // Lister l'historique complet

module.exports = router;
