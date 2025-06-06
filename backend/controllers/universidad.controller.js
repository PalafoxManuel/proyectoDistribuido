// backend/controllers/universidad.controller.js
//
// Controlador “solo-lectura” que replica la lógica de UabcsDataController
// original de Laravel, pero devolviendo **JSON** para que React lo pinte.
//

const { col } = require('../lib/mongo');      // helper: colección nativa

/** GET /api/uabcs?universidad=UNAM  */
exports.showUabcs = async (req, res) => {
  try {
    const universidad = decodeURIComponent(req.query.universidad || '').trim();

    if (!universidad) {
      return res.status(400).json({ error: 'Falta parámetro universidad' });
    }

    const matriculaColl = col('matricula');   // ← nombre de tu colección

    /* 1️⃣  Filas de esa universidad (equiv. $datos) */
    const datos = await matriculaColl
      .find(
        { nombre_institucion: universidad },
        { projection: { _id: 0, entidad_federativa: 1, nombre_institucion: 1,
                        nivel_estudios: 1, matricula_total: 1, periodo: 1 } }
      )
      .toArray();

    if (!datos.length) {
      return res.status(404).json({ error: 'Universidad sin registros' });
    }

    /* 2️⃣  Totales — tres consultas de agregación  */
    const [totalMatriculas] = await matriculaColl.aggregate([
      { $match: { nombre_institucion: universidad } },
      { $group: { _id: null, total: { $sum: '$matricula_total' } } }
    ]).toArray();

    const [totalLicenciaturas] = await matriculaColl.aggregate([
      { $match: {
          nombre_institucion: universidad,
          $or: [
            { nivel_estudios: { $regex: /^LICENCIATURA/i } },
            { nivel_estudios: 'TECNICO SUPERIOR' }
          ]
        }},
      { $group: { _id: null, total: { $sum: '$matricula_total' } } }
    ]).toArray();

    const [totalPosgrados] = await matriculaColl.aggregate([
      { $match: {
          nombre_institucion: universidad,
          nivel_estudios: { $in: ['MAESTRÍA', 'DOCTORADO'] }
        }},
      { $group: { _id: null, total: { $sum: '$matricula_total' } } }
    ]).toArray();

    /* 3️⃣  Respuesta JSON (lo pintará tu componente React) */
    res.json({
      universidad,
      datos,
      totalMatriculas   : totalMatriculas?.total   ?? 0,
      totalLicenciaturas: totalLicenciaturas?.total?? 0,
      totalPosgrados    : totalPosgrados?.total    ?? 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
