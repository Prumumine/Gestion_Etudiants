const express = require('express');
const router = express.Router();

const etudiantsController = require('../controllers/etudiantsController');
const { validateEtudiant } = require('../middleware/validation');

// CRUD étudiants
router.get('/', etudiantsController.getAll);
router.get('/:id', etudiantsController.getById);
router.post('/', validateEtudiant, etudiantsController.create);
router.put('/:id', validateEtudiant, etudiantsController.update);
router.delete('/:id', etudiantsController.delete);

module.exports = router;
