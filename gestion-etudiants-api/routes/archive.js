const express = require('express');
const router = express.Router();

const etudiantsController = require('../controllers/etudiantsController');

// Étudiants archivés (deleted_at NOT NULL)
router.get('/', etudiantsController.getArchived);

// Restaurer un étudiant archivé
router.put('/:id/restore', etudiantsController.restore);

module.exports = router;
