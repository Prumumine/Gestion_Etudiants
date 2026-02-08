const mysql = require('mysql2');

// Connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecole'
});

// -------------------- Table étudiants --------------------
const createEtudiantsTable = `
CREATE TABLE IF NOT EXISTS etudiants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    niveau VARCHAR(50) NOT NULL,
    filiere VARCHAR(50) NOT NULL,
    sexe ENUM('M', 'F') NOT NULL,
    inscription ENUM('A jour', 'Non à jour') NOT NULL,
    nationalite VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

// -------------------- Table historique_actions --------------------
const createHistoriqueActionsTable = `
CREATE TABLE IF NOT EXISTS historique_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id)
) ENGINE=InnoDB;
`;

// -------------------- Table notifications --------------------
const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    etudiant_id INT NOT NULL,
    type ENUM('Inscription', 'Autre') NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etudiant_id) REFERENCES etudiants(id)
) ENGINE=InnoDB;
`;

// -------------------- Table utilisateurs --------------------
const createUsersTable = `
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    token varchar(300) DEFAULT NULL,
   deleted_at timestamp NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

// -------------------- Exécution des requêtes --------------------
db.query(createEtudiantsTable, (err) => {
    if (err) console.error('Erreur création table étudiants:', err);
    else console.log('Table étudiants créée ou déjà existante');
});

db.query(createHistoriqueActionsTable, (err) => {
    if (err) console.error('Erreur création table historique_actions:', err);
    else console.log('Table historique_actions créée ou déjà existante');
});

db.query(createNotificationsTable, (err) => {
    if (err) console.error('Erreur création table notifications:', err);
    else console.log('Table notifications créée ou déjà existante');
});

db.query(createUsersTable, (err) => {
    if (err) console.error('Erreur création table utilisateurs:', err);
    else console.log('Table utilisateurs créée ou déjà existante');
});


db.end();
