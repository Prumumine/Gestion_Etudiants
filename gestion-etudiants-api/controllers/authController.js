const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const connexion = async (req, res) => {
  const { nom, email, password } = req.body;
  if (!nom || !email || !password) return res.status(400).json({ success: false, message: 'Champs requis manquants' });

  try {
    const db = req.db;
    const [[user]] = await db.promise().query('SELECT * FROM utilisateurs WHERE email=? AND deleted_at IS NULL', [email]);

    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(10).toString('hex');
      await db.promise().query('INSERT INTO utilisateurs (nom, email, password, token) VALUES (?, ?, ?, ?)', [nom, email, hash, token]);
      return res.json({ success: true, token, firstConnexion: true });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Identifiants invalides' });

    const token = crypto.randomBytes(10).toString('hex');
    await db.promise().query('UPDATE utilisateurs SET token=? WHERE id=?', [token, user.id]);
    res.json({ success: true, token, firstConnexion: false });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { connexion };
