const express = require('express');
const auth = require('../middleware/auth'); // middleware de vérification du token 
const profilController = require('../controllers/profilController');

const router = express.Router();

// Recuperation du profil connecte
router.get('/', auth, profilController.getProfil);

// Mise a jour du profil
router.put('/', auth, profilController.updateProfil);

// Changement de mot de passe
router.put('/password', auth, profilController.changePassword);

module.exports = router;
