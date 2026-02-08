const express = require('express');
const auth = require('../middleware/auth');
const exportController = require('../controllers/exportController');

const router = express.Router();

router.get('/pdf', auth, exportController.exportPDF);
router.get('/excel', auth, exportController.exportExcel);

module.exports = router;
