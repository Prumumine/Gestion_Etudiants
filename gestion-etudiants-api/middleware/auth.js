module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = auth.replace('Bearer ', '');
  const [rows] = await req.db.promise().query(
    'SELECT id FROM utilisateurs WHERE token=? AND deleted_at IS NULL',
    [token]
  );

  if (rows.length === 0)
    return res.status(401).json({ success: false, message: 'Token invalide' });

  req.userId = rows[0].id;
  next();
};
