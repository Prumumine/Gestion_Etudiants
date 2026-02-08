export const getImageEtudiant = (sexe, id = 1) => {
  const index = (Number(id) % 99) + 1;
  const genre = sexe === 'M' ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${genre}/${index}.jpg`;
};

export const getAvatarUtilisateur = (seed = 1) => {
  const index = (String(seed).length + Number(seed || 1)) % 99 + 1;
  return `https://randomuser.me/api/portraits/men/${index}.jpg`;
};
