const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const getEtudiants = async (db) => {
  const [rows] = await db.promise().query('SELECT * FROM etudiants WHERE deleted_at IS NULL');
  return rows;
};

const exportExcel = async (req, res) => {
  try {
    const rows = await getEtudiants(req.db);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Etudiants');

    const columns = [
      { header: 'ID', key: 'id' },
      { header: 'Nom', key: 'nom' },
      { header: 'Prénom', key: 'prenom' },
      { header: 'Age', key: 'age' },
      { header: 'Téléphone', key: 'telephone' },
      { header: 'Sexe', key: 'sexe' },
      { header: 'Niveau', key: 'niveau' },
      { header: 'Filière', key: 'filiere' },
      { header: 'Inscription', key: 'inscription' },
      { header: 'Nationalité', key: 'nationalite' }
    ];

    sheet.columns = columns;
    sheet.addRows(rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=etudiants.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'exportation en format Excel' });
  }
};

const exportPDF = async (req, res) => {
  try {
    const rows = await getEtudiants(req.db);
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=etudiants.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Liste des étudiants', { align: 'center' });
    doc.moveDown(1.5);

    rows.forEach((e) => {
      const line = [
        e.id, `${e.nom} ${e.prenom}`, `Age: ${e.age}`,
        `Niveau: ${e.niveau}`, `Filière: ${e.filiere}`,
        `Inscription: ${e.inscription}`, `Nationalité: ${e.nationalite}`
      ].join(' | ');
      doc.fontSize(12).text(line);
      doc.moveDown(0.3);
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'exportation en format PDF' });
  }
};

module.exports = { exportExcel, exportPDF };
