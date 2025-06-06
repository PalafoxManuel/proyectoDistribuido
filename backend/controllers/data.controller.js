// Data controller – Puerto a Node/Express (solo lectura)
// ------------------------------------------------------
// • Usa el helper col(name) para acceder a colecciones sin modelos.
// • Devuelve JSON idéntico al controlador Laravel original.
//
// Requiere:   lib/mongo.js  (exports.col)

const { col } = require('../lib/mongo');

// ------------------------------------------------------------------
// 1) Oferta educativa
//    GET /api/oferta/:universidad
// ------------------------------------------------------------------
exports.getDataOfertaEducativa = async (req, res) => {
  try {
    const univ = decodeURIComponent(req.params.universidad);
    const datos2 = col('datos2');
    const campForm = col('camp_form');

    const periodoDoc = await datos2
      .find({ NOMBRE_INSTITUCION: univ })
      .sort({ PERIODO: -1 })
      .limit(1)
      .toArray();

    if (!periodoDoc.length) return res.status(404).json({ error: 'No se encontraron registros para la universidad especificada.' });

    const periodo = periodoDoc[0].PERIODO;
    const filas = await datos2
      .find({ NOMBRE_INSTITUCION: univ, PERIODO: periodo })
      .sort({ MATRICULA: -1 })
      .toArray();

    const total       = filas.reduce((t, f) => t + f.MATRICULA, 0);
    const etiquetas   = [];
    const porcentajes = [];
    const matriculas  = [];
    const colores     = [];

    for (const f of filas) {
      etiquetas.push(f.CAMPO_FORMACION);
      matriculas.push(f.MATRICULA);
      porcentajes.push(total ? +(f.MATRICULA * 100 / total).toFixed(2) : 0);

      const color = await campForm.findOne(
        { nombre: f.CAMPO_FORMACION.replace(/["']/g, '') },
        { projection: { _id:0, R:1, G:1, B:1 } }
      );

      colores.push(color
        ? { R:+color.R, G:+color.G, B:+color.B }
        : { R:75, G:192, B:192 });
    }

    res.json({ etiquetas, porcentaje: porcentajes, matriculas, colores, total, periodo });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 2) Histórico por campo de formación
//    GET /api/historico/:universidad
// ------------------------------------------------------------------
exports.getHistoricoCamposFormacion = async (req, res) => {
  try {
    const univ = decodeURIComponent(req.params.universidad);
    const datos2 = col('datos2');
    const campForm = col('camp_form');

    // suma total por campo
    const campos = await datos2.aggregate([
      { $match: { NOMBRE_INSTITUCION: univ, PERIODO: { $gte: '2018-2019' } } },
      { $group: { _id: '$CAMPO_FORMACION', total_matricula: { $sum: '$MATRICULA' } } },
      { $sort: { total_matricula: -1 } }
    ]).toArray();

    const data = [];
    for (const c of campos) {
      const nombreCampo = c._id.replace(/["']/g, '');

      const color = await campForm.findOne(
        { nombre: nombreCampo },
        { projection: { _id:0, R:1, G:1, B:1 } }
      );

      const serie = await datos2
        .find({
          NOMBRE_INSTITUCION: univ,
          CAMPO_FORMACION: nombreCampo,
          PERIODO: { $gte: '2018-2019' }
        })
        .project({ _id:0, PERIODO:1, MATRICULA:1 })
        .sort({ PERIODO: 1 })
        .toArray();

      data.push({
        campo_formacion : nombreCampo,
        total_matricula : c.total_matricula,
        color           : color ? { R:+color.R, G:+color.G, B:+color.B } : { R:75,G:192,B:192 },
        datos           : serie
      });
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 3) Buscar universidades por nombre (paginado)
//    GET /api/universidades?q=texto&page=n
// ------------------------------------------------------------------
exports.getUniversidadesPorNombre = async (req, res) => {
  try {
    const q        = (req.query.q ?? '').trim();
    const page     = +(req.query.page ?? 1);
    const perPage  = 36;
    const words    = q.split(/\s+/);

    const cond = words.map(w => ({ nombre_institucion: { $regex: w, $options: 'i' } }));
    const coll = col('universidades');

    const total = await coll.countDocuments({ $and: cond });
    const universidades = await coll.find({ $and: cond })
      .project({ _id:0, id:1, nombre_institucion:1, imagen:1 })
      .skip((page-1)*perPage).limit(perPage).toArray();

    res.json({ universidades, total, page, pages: Math.ceil(total/perPage) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 4) Universidades visibles
//    GET /api/universidades/visibles
// ------------------------------------------------------------------
exports.getUniversidadesVisibles = async (_, res) => {
  try {
    const unis = await col('universidades')
      .find({ visible: 1 })
      .project({ _id:0, id:1, nombre_institucion:1, imagen:1 })
      .toArray();
    res.json({ universidades: unis });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 5) Información SNI
//    GET /api/snii/:nombre
// ------------------------------------------------------------------
exports.getSnii = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const snii3  = col('snii3');

    const universidades = await snii3
      .find({ NOMBRE_INSTITUCION: nombre })
      .sort({ RANKING: 1 })
      .toArray();

    if (!universidades.length) return res.status(404).json({ data:null, codigo:404 });

    const { ENTIDAD } = universidades[0];

    const doc = await snii3.findOne({ NOMBRE_INSTITUCION: nombre, ENTIDAD });
    if (!doc) return res.status(404).json({ data:null, codigo:404 });

    const datos = {
      CANDIDATO        : doc.CANDIDATO  ?? 0,
      NIVEL_1          : doc.NIVEL_1    ?? 0,
      NIVEL_2          : doc.NIVEL_2    ?? 0,
      NIVEL_3          : doc.NIVEL_3    ?? 0,
      EMERITO          : doc.EMERITO    ?? 0,
      NOMBRE_INSTITUCION: doc.NOMBRE_INSTITUCION,
      ENTIDAD          : doc.ENTIDAD,
      TOTAL            : doc.TOTAL      ?? 0
    };

    res.json({ data:[datos], codigo:200 });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 6) Ranking SNI
//    GET /api/ranking-snii/:nombre
// ------------------------------------------------------------------
exports.getRankingSnii = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const snii3  = col('snii3');
    const universidades = col('universidades');

    let doc = await snii3.findOne({ NOMBRE_INSTITUCION: nombre }, { sort:{ RANKING:1 } });
    let ENTIDAD;
    if (doc) {
      ENTIDAD = doc.ENTIDAD;
    } else {
      const alt = await universidades.findOne({ nombre_institucion: nombre });
      if (!alt) return res.status(404).json({ datos:[], codigo:404 });
      ENTIDAD = alt.entidad_federativa;
    }

    const ranking = await snii3
      .find({ ENTIDAD })
      .sort({ RANKING: 1 })
      .limit(10)
      .toArray();

    res.json({ data: ranking, entidad: ENTIDAD, codigo:200 });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 7) Datos de una universidad (catálogo)
//    GET /api/universidad/:nombre
// ------------------------------------------------------------------
exports.getUniversidad = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const doc = await col('universidades').findOne({ nombre_institucion: nombre }, { projection: { _id:0 } });
    if (!doc) return res.status(404).json({ error:'Universidad no encontrada' });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// ------------------------------------------------------------------
// 8) Matricula general EMS
//    GET /api/matricula/:universidad
// ------------------------------------------------------------------
exports.getMatriculaGeneralEMS = async (req, res) => {
  try {
    const univ = decodeURIComponent(req.params.universidad);
    const mat2 = col('mat2');

    const periodo = await mat2
      .find({ NOMBRE_INSTITUCION: univ })
      .sort({ PERIODO: -1 })
      .limit(1)
      .project({ PERIODO:1, _id:0 })
      .toArray();

    if (!periodo.length) return res.status(404).json({ success:false, data:null });

    const per = periodo[0].PERIODO;

    const tablasEMSyLugarEntidad = await mat2.findOne(
      { NOMBRE_INSTITUCION: univ, PERIODO: per },
      { sort:{ MAT_POS:-1 }, projection:{ _id:0 } }
    );

    const ent = tablasEMSyLugarEntidad.ENTIDAD_FEDERATIVA;

    const datosTablaTSUyLic = await mat2.find({ ENTIDAD_FEDERATIVA: ent })
      .project({ _id:0, RANK_LIC:1, NOMBRE_INSTITUCION:1, MAT_LIC:1 })
      .sort({ RANK_LIC:1 }).limit(5).toArray();

    const datosTablaPos = await mat2.find({ ENTIDAD_FEDERATIVA: ent })
      .project({ _id:0, RANK_POS:1, NOMBRE_INSTITUCION:1, MAT_POS:1 })
      .sort({ RANK_POS:1 }).limit(5).toArray();

    const datosTablaEduSup = await mat2.find({ ENTIDAD_FEDERATIVA: ent })
      .project({ _id:0, RANK_TOT:1, NOMBRE_INSTITUCION:1, MAT_TOT:1 })
      .sort({ RANK_TOT:1 }).limit(5).toArray();

    res.json({
      tablasEMSyLugarEntidad,
      datosTablaTSUyLic,
      datosTablaPos,
      datosTablaEduSup
    });
  } catch (e) { res.status(500).json({ error:e.message }); }
};

// ------------------------------------------------------------------
// 9) Financiamiento institucional
//    GET /api/finanzas/:universidad
// ------------------------------------------------------------------
exports.getFinanciamientoInstitucional = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.universidad);
    const finanzas = col('finanzas_modular');
    const subsidios = col('subsidios');
    const inversion = col('inversion_por_alumno');

    const finanza = await finanzas.findOne({ UNIVERSIDAD: nombre });
    if (!finanza) return res.status(404).json({ data:[], codigo:404 });

    const id = finanza.id;

    const ultimoSub = await subsidios.find({ finanzas_id: id }).sort({ anio:-1 }).limit(1).toArray();
    const ultimoInv = await inversion.find({ finanzas_id: id }).sort({ anio:-1 }).limit(1).toArray();
    const anioSub   = ultimoSub[0]?.anio ?? 0;
    const anioInv   = ultimoInv[0]?.anio ?? 0;
    const ultimoAnio= Math.max(anioSub, anioInv);

    if (!ultimoAnio) return res.status(404).json({ data:[], codigo:404 });

    let sub = await subsidios.findOne({ finanzas_id:id, anio: anioSub });
    let inv = await inversion.findOne({ finanzas_id:id, anio: anioInv });

    // Reintento si todo es 0
    if (sub?.subsidio_federal === 0 && sub?.subsidio_estatal === 0) {
      sub = await subsidios.findOne({
        finanzas_id:id,
        $or:[ { subsidio_federal:{ $gt:0 } }, { subsidio_estatal:{ $gt:0 } } ]
      }, { sort:{ anio:-1 } });
    }
    if (inv && inv.inversion_federal === 0 && inv.inversion_estatal === 0 && inv.inversion_publica === 0) {
      inv = await inversion.findOne({
        finanzas_id:id,
        $or:[ { inversion_federal:{ $gt:0 } }, { inversion_estatal:{ $gt:0 } }, { inversion_publica:{ $gt:0 } } ]
      }, { sort:{ anio:-1 } });
    }

    const datos = {
      anio               : Math.max(sub?.anio ?? 0, inv?.anio ?? 0),
      anio_inversion     : inv?.anio ?? null,
      sub_federal        : sub?.subsidio_federal ?? 0,
      sub_estatal        : sub?.subsidio_estatal ?? 0,
      sub_total          : (sub?.subsidio_federal ?? 0) + (sub?.subsidio_estatal ?? 0),
      porcentaje_federal : sub?.porcentaje_subsidio_federal ?? 0,
      porcentaje_estatal : sub?.porcentaje_subsidio_estatal ?? 0,
      inv_fed_alumno     : inv?.inversion_federal ?? 0,
      inv_est_alumno     : inv?.inversion_estatal ?? 0,
      inv_pub_alumno     : inv?.inversion_publica ?? 0
    };

    res.json({ data:[datos], codigo:200 });
  } catch (e) { res.status(500).json({ error:e.message }); }
};

// ------------------------------------------------------------------
// 10) Adeudos
//     GET /api/adeudos/:universidad
// ------------------------------------------------------------------
exports.getAdeudo = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.universidad);
    const finanzas = col('finanzas_modular');
    const adeudos  = col('adeudos');

    const fin = await finanzas.findOne({ UNIVERSIDAD: nombre });
    if (!fin) return res.status(404).json({ data:[], mensaje:'Universidad no encontrada', codigo:404 });

    const años = await adeudos.find({ finanzas_id: fin.id })
      .project({ _id:0, anio:1 })
      .toArray();

    const listaAños = [...new Set(años.map(a => a.anio))].sort();

    if (!listaAños.length) return res.status(404).json({ data:[], mensaje:'No hay datos de adeudos', codigo:404 });

    const docs = await adeudos.find({ finanzas_id: fin.id, anio: { $in: listaAños } }).toArray();
    const data = listaAños.map(a => {
      const d = docs.find(x => x.anio === a);
      return { [`ADEUDO_${a}`]: d ? d.adeudo_estatal : 0 };
    });

    res.json({ data, mensaje:'Datos obtenidos correctamente', codigo:200 });
  } catch (e) { res.status(500).json({ error:e.message }); }
};

// ------------------------------------------------------------------
// 11) Población docente / administrativa
//     GET /api/poblacion/:universidad
// ------------------------------------------------------------------
exports.getPoblacionDocente = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.universidad);
    const doc = await col('poblacion').findOne({ institucion: nombre }, { projection:{ _id:0 } });

    if (!doc) {
      return res.status(404).json({ data: [], mensaje: 'No se encontraron registros', codigo: 404 });
    }

    // Enviar como array aunque sea un solo objeto
    res.json({ data: [doc], mensaje: 'Datos obtenidos correctamente.', codigo: 200 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 12) Datos EMS
//     GET /api/ems/:universidad
// ------------------------------------------------------------------
exports.getDatosEms = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.universidad);
    const doc = await col('EMS').findOne({ nombre_institucion: nombre }, { projection:{ _id:0 } });
    if (!doc) return res.status(404).json({ datos:[], mensaje:'No se encontraron registros', codigo:404 });

    res.json({ data:doc, mensaje:'Datos de la institución obtenidos correctamente.', codigo:200 });
  } catch (e) { res.status(500).json({ error:e.message }); }
};
