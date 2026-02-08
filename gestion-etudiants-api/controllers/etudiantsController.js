const getAll = (req, res) => {
  req.db.query('SELECT * FROM etudiants WHERE deleted_at IS NULL', (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

const getById = (req, res) => {
  const { id } = req.params;
  req.db.query('SELECT * FROM etudiants WHERE id=? AND deleted_at IS NULL', [id], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    res.json({ success: true, data: results[0] });
  });
};

const create = (req, res) => {
  const { nom, prenom, age, telephone, sexe, niveau, filiere, inscription, nationalite, autre_nationalite } = req.body;
  const finalNationalite = nationalite === 'Autre' && autre_nationalite ? autre_nationalite : nationalite;

  const sql = 'INSERT INTO etudiants (nom, prenom, age, telephone, sexe, niveau, filiere, inscription, nationalite) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  req.db.query(sql, [nom, prenom, age, telephone, sexe, niveau, filiere, inscription, finalNationalite], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    const etudiantId = result.insertId;
    req.db.query('INSERT INTO historique_actions (etudiant_id, action, details) VALUES (?, "CREATE", ?)', [etudiantId, `Création étudiant ${nom} ${prenom}`], () => {});
    if (inscription === 'Non à jour') req.db.query('INSERT INTO notifications (etudiant_id, type, message) VALUES (?, "Inscription", ?)', [etudiantId, `L'étudiant ${nom} ${prenom} n'est pas à jour`], () => {});
    res.status(201).json({ success: true, id: etudiantId });
  });
};

const update = (req, res) => {
  const { id } = req.params;
  const { nom, prenom, age, telephone, sexe, niveau, filiere, inscription, nationalite, autre_nationalite } = req.body;
  const finalNationalite = nationalite === 'Autre' && autre_nationalite ? autre_nationalite : nationalite;

  const sql = 'UPDATE etudiants SET nom=?, prenom=?, age=?, telephone=?, sexe=?, niveau=?, filiere=?, inscription=?, nationalite=? WHERE id=? AND deleted_at IS NULL';
  req.db.query(sql, [nom, prenom, age, telephone, sexe, niveau, filiere, inscription, finalNationalite, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    req.db.query('INSERT INTO historique_actions (etudiant_id, action, details) VALUES (?, "UPDATE", ?)', [id, `Mise à jour étudiant ${nom} ${prenom}`], () => {});
    res.json({ success: true, message: 'Étudiant mis à jour' });
  });
};

const deleteEtudiant = (req, res) => {
  const { id } = req.params;
  req.db.query('UPDATE etudiants SET deleted_at=NOW() WHERE id=? AND deleted_at IS NULL', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    req.db.query('INSERT INTO historique_actions (etudiant_id, action, details) VALUES (?, "DELETE", ?)', [id, `Suppression (archive) étudiant ID ${id}`], () => {});
    res.json({ success: true, message: 'Étudiant archivé' });
  });
};

const getArchived = (req, res) => {
  req.db.query('SELECT * FROM etudiants WHERE deleted_at IS NOT NULL', (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: results });
  });
};

const restore = (req, res) => {
  const { id } = req.params;
  req.db.query('UPDATE etudiants SET deleted_at=NULL WHERE id=?', [id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Étudiant non trouvé' });
    req.db.query('INSERT INTO historique_actions (etudiant_id, action, details) VALUES (?, "UPDATE", "Restauration étudiant")', [id], () => {});
    res.json({ success: true, message: 'Étudiant restauré' });
  });
};

module.exports = { getAll, getById, create, update, delete: deleteEtudiant, getArchived, restore };
