const getAll = async (req, res) => {
  try {
    const sql = `
      SELECT 
        h.id, h.etudiant_id, h.action, h.details, h.created_at,
        e.nom, e.prenom
      FROM historique_actions h
      LEFT JOIN etudiants e ON h.etudiant_id = e.id
      ORDER BY h.created_at DESC
    `;
    const [results] = await req.db.promise().query(sql);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAll };
