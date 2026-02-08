require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/database');

const authRoutes = require('./routes/auth');
const profilRoutes = require('./routes/profil');
const etudiantsRoutes = require('./routes/etudiants');
const archiveRoutes = require('./routes/archive');
const historiqueRoutes = require('./routes/historique');
const exportRoutes = require('./routes/export');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  app.use((req, res, next) => {
    req.db = db;
    next();
  });


  app.use('/api/auth', authRoutes);
  app.use('/api/profil', profilRoutes);
  app.use('/api/etudiants', etudiantsRoutes);
  app.use('/api/archive', archiveRoutes);
  app.use('/api/historique', historiqueRoutes);
  app.use('/api/export', exportRoutes);


  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvée' });
  });

  return app;
}

module.exports = createApp;
