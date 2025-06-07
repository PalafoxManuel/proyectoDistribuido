// backend/controllers/universidad.controller.js
//
// Controlador “solo-lectura” que replica la lógica de UabcsDataController
// original de Laravel, pero devolviendo **JSON** para que React lo pinte.
//

const { col } = require('../lib/mongo');      // helper: colección nativa
const buildReg  = require('../lib/diacriticRegex');

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

// ──────────────────────────────────────────────────────────────
//  Buscar universidades por nombre (con /busqueda/:nombre/:page?)
// ──────────────────────────────────────────────────────────────
exports.getUniversidadesPorNombre = async (req, res) => {
  try {
    // nombre puede venir como parámetro de ruta ó querystring (?nombre=)
    const q     = decodeURIComponent(
                    req.params.nombre ?? req.query.nombre ?? req.query.q ?? ''
                  ).trim();
    const page  = +(req.params.page ?? req.query.page ?? 1);
    const per   = 10;

    if (!q) return res.status(400).json({ error: 'Falta el término de búsqueda' });

    // Regex que ignora tildes y mayúsculas
    const regex = buildReg(q);
    const cond  = { nombre_institucion: { $regex: regex } };

    const universidadesColl = col('universidades');

    const total = await universidadesColl.countDocuments(cond);
    const universidades = await universidadesColl
      .find(cond)
      .project({ _id: 0, id: 1, nombre_institucion: 1, imagen: 1 })
      .skip((page - 1) * per)
      .limit(per)
      .toArray();

    res.json({
      universidades,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / per))
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

// ──────────────────────────────────────────────────────────────
//  Universidades visibles  ( /busqueda-visibles )
// ──────────────────────────────────────────────────────────────
exports.getUniversidadesVisibles = async (_, res) => {
  try {
    const unis = await col('universidades')
      .find({ visible: 1 })
      .project({ _id: 0, id: 1, nombre_institucion: 1, imagen: 1 })
      .toArray();

    res.json({ universidades: unis, total: unis.length, pages: 1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
