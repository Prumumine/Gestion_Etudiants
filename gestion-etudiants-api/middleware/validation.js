const validateEtudiant = (req, res, next) => {
  const { nom, prenom, age, telephone, niveau, filiere, sexe, inscription, nationalite, autre_nationalite } = req.body;
  const errors = [];

  if (!nom || nom.trim().length < 2) errors.push('Nom doit contenir au moins 2 caractères');
  if (!prenom || prenom.trim().length < 2) errors.push('Prénom doit contenir au moins 2 caractères');
  if (!age || age < 16 || age > 100) errors.push('Âge doit être entre 16 et 100 ans');
  if (!telephone || !/^\d+$/.test(telephone)) errors.push('Téléphone doit contenir uniquement des chiffres');
  if (!niveau || niveau.trim() === '') errors.push('Niveau obligatoire');
  if (!filiere || filiere.trim() === '') errors.push('Filière obligatoire');
  if (!sexe || !['M', 'F'].includes(sexe.toUpperCase())) errors.push('Sexe doit être M ou F');
  if (!inscription || !['A jour', 'Non à jour'].includes(inscription)) errors.push('Inscription doit être "A jour" ou "Non à jour"');
  if (!nationalite || (nationalite === 'Autre' && (!autre_nationalite || autre_nationalite.trim() === ''))) errors.push('Nationalité obligatoire ou préciser "Autre nationalité"');

  if (errors.length) return res.status(400).json({ success: false, errors });

  next();
};

const validateConnexion = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) errors.push('Email obligatoire');
  if (!password || !password.trim()) errors.push('Mot de passe obligatoire');

  if (errors.length) return res.status(400).json({ success: false, errors });

  next();
};

module.exports = { validateEtudiant, validateConnexion };
