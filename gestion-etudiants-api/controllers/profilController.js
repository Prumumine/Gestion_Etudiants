const bcrypt = require('bcryptjs');

const handleError = (res, err, message = 'Erreur serveur') => {
  console.error(err);
  res.status(500).json({ success: false, message });
};

exports.getProfil = async (req, res) => {
  try {
    const [rows] = await req.db.promise().query(
      'SELECT id, nom, email FROM utilisateurs WHERE id=?',
      [req.userId]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    res.json({ success: true, utilisateur: rows[0] });
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateProfil = async (req, res) => {
  try {
    const { nom, email, newPassword } = req.body;
    if (!nom && !email && !newPassword) 
      return res.status(400).json({ success: false, message: 'Au moins un champ requis (nom, email ou newPassword)' });

    const fields = [];
    const values = [];

    if (nom) { fields.push('nom=?'); values.push(nom); }
    if (email) { fields.push('email=?'); values.push(email); }
    if (newPassword) { 
      const hash = await bcrypt.hash(newPassword, 10);
      fields.push('password=?');
      values.push(hash);
    }

    fields.push('updated_at=NOW()');
    values.push(req.userId);

    await req.db.promise().query(`UPDATE utilisateurs SET ${fields.join(', ')} WHERE id=?`, values);
    res.json({ success: true, message: 'Profil mis à jour' });
  } catch (err) {
    handleError(res, err);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) 
      return res.status(400).json({ success: false, message: 'Ancien et nouveau mot de passe requis' });

    const [rows] = await req.db.promise().query('SELECT password FROM utilisateurs WHERE id=?', [req.userId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(oldPassword, rows[0].password);
    if (!valid) return res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect' });

    const hash = await bcrypt.hash(newPassword, 10);
    await req.db.promise().query('UPDATE utilisateurs SET password=?, updated_at=NOW() WHERE id=?', [hash, req.userId]);

    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    handleError(res, err);
  }
};
