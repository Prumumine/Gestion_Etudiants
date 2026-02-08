// controllers/archiveController.js
const db = require('../config/database');

// ---------- Lister tous les étudiants supprimés (soft delete) ----------
exports.getArchived = (req, res) => {
    const sql = 'SELECT * FROM etudiants WHERE deleted_at IS NOT NULL';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, data: results });
    });
};

// ---------- Restaurer un étudiant ----------
exports.restore = (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE etudiants SET deleted_at=NULL WHERE id=? AND deleted_at IS NOT NULL';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Étudiant non trouvé ou déjà restauré" });

        // Historique
        const histSql = 'INSERT INTO historique_actions (etudiant_id, action, details) VALUES (?, "RESTORE", ?)';
        const details = `Restauration étudiant ID ${id}`;
        db.query(histSql, [id, details], () => {});

        res.json({ success: true, message: "Étudiant restauré avec succès" });
    });
};
