// Data controller – Puerto a Node/Express (solo lectura)
// ------------------------------------------------------
// • Usa el helper col(name) para acceder a colecciones sin modelos.
// • Devuelve JSON idéntico al controlador Laravel original.
//
// Requiere:   lib/mongo.js  (exports.col)

const { col } = require('../lib/mongo');
const buildReg = require('../lib/diacriticRegex');   // ← helper que ignora tildes

// ------------------------------------------------------------------
// 1) Oferta educativa
//    GET /oferta/:universidad
// ------------------------------------------------------------------
exports.getDataOfertaEducativa = async (req, res) => {
  try {
    const univ  = decodeURIComponent(req.params.universidad);
    const datos2     = col('datos2');
    const campForm   = col('camp_form');

    /* —— periodo más reciente —*/
    const ultimo = await datos2
      .find({ NOMBRE_INSTITUCION: univ })
      .sort({ PERIODO: -1 })
      .limit(1)
      .toArray();

    if (!ultimo.length) {
      return res.status(404).json({
        error: 'No se encontraron registros para la universidad especificada.'
      });
    }

    const periodo = ultimo[0].PERIODO;

    /* —— filas de la oferta —*/
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
        { projection: { _id: 0, R: 1, G: 1, B: 1 } }
      );

      colores.push(
        color
          ? { R: +color.R, G: +color.G, B: +color.B }
          : { R: 75, G: 192, B: 192 }   // color por defecto
      );
    }

    /* —— respuesta unificada —— */
    res.json({
      data: {
        etiquetas,
        porcentaje: porcentajes,
        matriculas,
        colores,
        total,
        periodo
      }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 2) Histórico por campo de formación
//    GET /historico/:universidad
// ------------------------------------------------------------------
exports.getHistoricoCamposFormacion = async (req, res) => {
  try {
    const univ      = decodeURIComponent(req.params.universidad);
    const datos2    = col('datos2');
    const campForm  = col('camp_form');

    /* —— 1. Totales por campo (2018-2019 en adelante) ———————————— */
    const campos = await datos2.aggregate([
      { $match: { NOMBRE_INSTITUCION: univ, PERIODO: { $gte: '2018-2019' } } },
      { $group: { _id: '$CAMPO_FORMACION', total_matricula: { $sum: '$MATRICULA' } } },
      { $sort : { total_matricula: -1 } }
    ]).toArray();

    /* —— 2. Construir respuesta ———————————————————————— */
    const data = [];

    for (const c of campos) {
      const nombreCampo = c._id.replace(/["']/g, '');

      // color del campo
      const colorDoc = await campForm.findOne(
        { nombre: nombreCampo },
        { projection: { _id: 0, R: 1, G: 1, B: 1 } }
      );

      const color = colorDoc
        ? { R: +colorDoc.R, G: +colorDoc.G, B: +colorDoc.B }
        : { R: 75, G: 192, B: 192 };      // color por defecto

      // serie histórica
      const serie = await datos2
        .find({
          NOMBRE_INSTITUCION: univ,
          CAMPO_FORMACION  : nombreCampo,
          PERIODO          : { $gte: '2018-2019' }
        })
        .project({ _id: 0, PERIODO: 1, MATRICULA: 1 })
        .sort({ PERIODO: 1 })
        .toArray();

      data.push({
        campo_formacion : nombreCampo,
        total_matricula : c.total_matricula,
        color,
        datos           : serie
      });
    }

    /* —— 3. Respuesta uniforme —— */
    res.json({ data });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 3) Buscar universidades por nombre (paginado)
//    GET /universidades?nombre=baja&page=1
// ------------------------------------------------------------------

exports.getUniversidadesPorNombre = async (req, res) => {
  try {
    /* —— 1. parámetros ————————————————————————— */
    const q       = (req.query.nombre ?? req.query.q ?? '').trim();
    const page    = +(req.query.page ?? 1);
    const perPage = 36;

    if (!q) {
      return res.status(400).json({ error: 'Falta el término de búsqueda' });
    }

    /* —— 2. condición (un regex por palabra, sin tildes) —— */
    const words = q.split(/\s+/);
    const cond  = {
      $and: words.map(w => ({
        nombre_institucion: { $regex: buildReg(w) }
      }))
    };

    const coll = col('universidades');

    /* —— 3. total + página —— */
    const total = await coll.countDocuments(cond);

    const universidades = await coll.find(cond)
      .project({ _id: 0, id: 1, nombre_institucion: 1, imagen: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();

    /* —— 4. respuesta uniforme —— */
    res.json({
      data : universidades,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / perPage))
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 4) Universidades visibles
//    GET /universidades/visibles
// ------------------------------------------------------------------
exports.getUniversidadesVisibles = async (_, res) => {
  try {
    const unis = await col('universidades')
      .find({ visible: 1 })
      .project({ _id: 0, id: 1, nombre_institucion: 1, imagen: 1 })
      .toArray();

    /* respuesta uniforme  */
    res.json({
      data : unis,
      total: unis.length,
      page : 1,
      pages: 1
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 5) Información SNI
//    GET /snii/:nombre
// ------------------------------------------------------------------
exports.getSnii = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const snii   = col('snii3');

    /* 1. ubicar la universidad con mejor ranking ------------------ */
    const primeras = await snii
      .find({ NOMBRE_INSTITUCION: nombre })
      .sort({ RANKING: 1 })
      .limit(1)
      .toArray();

    if (!primeras.length) {
      return res.status(404).json({ error: 'Universidad no encontrada en SNI' });
    }

    const entidad = primeras[0].ENTIDAD;

    /* 2. recuperar los datos definitivos -------------------------- */
    const doc = await snii.findOne(
      { NOMBRE_INSTITUCION: nombre, ENTIDAD: entidad },
      { projection: { _id: 0 } }
    );

    if (!doc) {
      return res.status(404).json({ error: 'No hay datos SNI para esa universidad' });
    }

    /* 3. normalizar valores nulos a cero -------------------------- */
    const datos = {
      CANDIDATO : doc.CANDIDATO  ?? 0,
      NIVEL_1   : doc.NIVEL_1    ?? 0,
      NIVEL_2   : doc.NIVEL_2    ?? 0,
      NIVEL_3   : doc.NIVEL_3    ?? 0,
      EMERITO   : doc.EMERITO    ?? 0,
      TOTAL     : doc.TOTAL      ?? 0,
      NOMBRE_INSTITUCION: doc.NOMBRE_INSTITUCION,
      ENTIDAD   : doc.ENTIDAD
    };

    /* 4. respuesta: objeto único en JSON -------------------------- */
    res.json(datos);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 6) Ranking SNI (Top-10 en la misma entidad)
//    GET /ranking-snii/:nombre
// ------------------------------------------------------------------
exports.getRankingSnii = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);
    const snii   = col('snii3');
    const unis   = col('universidades');

    /* 1 ▸ Averiguar la entidad de la universidad solicitada */
    let ref = await snii.findOne(
      { NOMBRE_INSTITUCION: nombre },
      { sort: { RANKING: 1 }, projection: { ENTIDAD: 1, _id: 0 } }
    );

    if (!ref) {
      ref = await unis.findOne(
        { nombre_institucion: nombre },
        { projection: { entidad_federativa: 1, _id: 0 } }
      );
      if (!ref) {
        return res.status(404).json({ error: 'Universidad no encontrada' });
      }
    }

    const entidad = ref.ENTIDAD ?? ref.entidad_federativa;

    /* 2 ▸ Top-10 de esa entidad por RANKING */
    const ranking = await snii
      .find({ ENTIDAD: entidad })
      .sort({ RANKING: 1 })
      .limit(10)
      .project({ _id: 0 })          // -_id limpio para el front
      .toArray();

    /* 3 ▸ Respuesta uniforme */
    res.json({
      entidad,
      data: ranking
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 7) Datos de una universidad (catálogo)
//    GET /universidad/:nombre
// ------------------------------------------------------------------
exports.getUniversidad = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre);

    const doc = await col('universidades').findOne(
      { nombre_institucion: nombre },
      { projection: { _id: 0 } }
    );

    if (!doc) {
      return res.status(404).json({ error: 'Universidad no encontrada' });
    }

    /* respuesta uniforme: objeto envuelto en "data" */
    res.json({ data: doc });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 8) Matrícula general EMS
//    GET /matricula/:universidad
// ------------------------------------------------------------------
exports.getMatriculaGeneralEMS = async (req, res) => {
  try {
    const univ  = decodeURIComponent(req.params.universidad);
    const mat2  = col('mat2');

    /* 1 ▸ periodo más reciente de esa institución */
    const ultimo = await mat2
      .find({ NOMBRE_INSTITUCION: univ })
      .sort({ PERIODO: -1 })
      .limit(1)
      .project({ PERIODO: 1, _id: 0 })
      .toArray();

    if (!ultimo.length) {
      return res.status(404).json({ error: 'Universidad sin datos de matrícula' });
    }

    const periodo = ultimo[0].PERIODO;

    /* 2 ▸ fila con ranking EMS y entidad federativa */
    const tablasEMSyLugarEntidad = await mat2.findOne(
      { NOMBRE_INSTITUCION: univ, PERIODO: periodo },
      { sort: { MAT_POS: -1 }, projection: { _id: 0 } }
    );

    if (!tablasEMSyLugarEntidad) {
      return res.status(404).json({ error: 'No hay filas EMS para el periodo más reciente' });
    }

    const entidad = tablasEMSyLugarEntidad.ENTIDAD_FEDERATIVA;

    /* 3 ▸ Top-5 licenciatura/TSU, posgrado y total en la misma entidad */
    const datosTablaTSUyLic = await mat2
      .find({ ENTIDAD_FEDERATIVA: entidad })
      .project({ _id: 0, RANK_LIC: 1, NOMBRE_INSTITUCION: 1, MAT_LIC: 1 })
      .sort({ RANK_LIC: 1 })
      .limit(5)
      .toArray();

    const datosTablaPos = await mat2
      .find({ ENTIDAD_FEDERATIVA: entidad })
      .project({ _id: 0, RANK_POS: 1, NOMBRE_INSTITUCION: 1, MAT_POS: 1 })
      .sort({ RANK_POS: 1 })
      .limit(5)
      .toArray();

    const datosTablaEduSup = await mat2
      .find({ ENTIDAD_FEDERATIVA: entidad })
      .project({ _id: 0, RANK_TOT: 1, NOMBRE_INSTITUCION: 1, MAT_TOT: 1 })
      .sort({ RANK_TOT: 1 })
      .limit(5)
      .toArray();

    /* 4 ▸ respuesta uniforme */
    res.json({
      data: {
        tablasEMSyLugarEntidad,
        datosTablaTSUyLic,
        datosTablaPos,
        datosTablaEduSup
      }
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 9) Financiamiento institucional
//    GET /finanzas/:universidad
// ------------------------------------------------------------------
exports.getFinanciamientoInstitucional = async (req, res) => {
  try {
    const nombre          = decodeURIComponent(req.params.universidad);
    const finanzasColl     = col('finanzas_modular');
    const subsidiosColl    = col('subsidios');
    const inversionColl    = col('inversion_por_alumno');

    // 1) Buscar la universidad en finanzas_modular
    const finanza = await finanzasColl.findOne({ UNIVERSIDAD: nombre });
    if (!finanza) {
      return res.status(404).json({ error: 'Universidad no encontrada' });
    }
    const id = finanza.id;

    // 2) Obtener el último año de subsidios e inversión
    const ultimoSubArr = await subsidiosColl
      .find({ finanzas_id: id })
      .sort({ anio: -1 })
      .limit(1)
      .toArray();
    const ultimoInvArr = await inversionColl
      .find({ finanzas_id: id })
      .sort({ anio: -1 })
      .limit(1)
      .toArray();

    const anioSub   = ultimoSubArr[0]?.anio ?? 0;
    const anioInv   = ultimoInvArr[0]?.anio ?? 0;
    const ultimoAnio= Math.max(anioSub, anioInv);

    if (!ultimoAnio) {
      return res.status(404).json({ error: 'No hay datos de financiamiento disponibles' });
    }

    // 3) Recuperar documentos para esos años
    let sub = await subsidiosColl.findOne({ finanzas_id: id, anio: anioSub });
    let inv = await inversionColl.findOne({ finanzas_id: id, anio: anioInv });

    // Si ambos subsidios son cero, buscar el último con valor > 0
    if (sub?.subsidio_federal === 0 && sub?.subsidio_estatal === 0) {
      sub = await subsidiosColl.findOne({
        finanzas_id: id,
        $or: [
          { subsidio_federal: { $gt: 0 } },
          { subsidio_estatal : { $gt: 0 } }
        ]
      }, { sort: { anio: -1 } });
    }

    // Si todas las inversiones son cero, buscar el último con valor > 0
    if (
      inv?.inversion_federal === 0 &&
      inv?.inversion_estatal === 0 &&
      inv?.inversion_publica === 0
    ) {
      inv = await inversionColl.findOne({
        finanzas_id: id,
        $or: [
          { inversion_federal : { $gt: 0 } },
          { inversion_estatal : { $gt: 0 } },
          { inversion_publica : { $gt: 0 } }
        ]
      }, { sort: { anio: -1 } });
    }

    // 4) Formatear datos de salida
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

    // 5) Responder JSON uniforme
    res.json({ data: datos });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 10) Adeudos
//     GET /adeudos/:universidad
// ------------------------------------------------------------------
exports.getAdeudo = async (req, res) => {
  try {
    const nombre       = decodeURIComponent(req.params.universidad);
    const finanzasColl = col('finanzas_modular');
    const adeudosColl  = col('adeudos');

    // 1. Verificar que la universidad exista en finanzas_modular
    const fin = await finanzasColl.findOne({ UNIVERSIDAD: nombre });
    if (!fin) {
      return res.status(404).json({ error: 'Universidad no encontrada' });
    }

    // 2. Obtener la lista de años disponibles
    const añosDocs = await adeudosColl
      .find({ finanzas_id: fin.id })
      .project({ _id: 0, anio: 1 })
      .toArray();

    const listaAños = [...new Set(añosDocs.map(a => a.anio))].sort();
    if (listaAños.length === 0) {
      return res.status(404).json({ error: 'No hay datos de adeudos' });
    }

    // 3. Recuperar todos los adeudos para esos años
    const docs = await adeudosColl
      .find({ finanzas_id: fin.id, anio: { $in: listaAños } })
      .toArray();

    // 4. Formatear la salida como [{ ADEUDO_2019: X }, { ADEUDO_2020: Y }, …]
    const data = listaAños.map(anio => {
      const registro = docs.find(d => d.anio === anio);
      return { [`ADEUDO_${anio}`]: registro?.adeudo_estatal ?? 0 };
    });

    // 5. Responder JSON uniforme
    res.json({ data });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 11) Población docente / administrativa
//     GET /poblacion/:universidad
// ------------------------------------------------------------------
exports.getPoblacionDocente = async (req, res) => {
  try {
    // 1) Recibimos el nombre y construimos un regex que ignora tildes y mayúsculas
    const nombre = decodeURIComponent(req.params.universidad ?? '').trim();
    if (!nombre) {
      return res
        .status(400)
        .json({ error: 'Debe proveer el nombre de la universidad.' });
    }

    const regex = buildReg(nombre);

    // 2) Consultamos en la colección "poblacion" sobre el campo "institucion"
    const doc = await col('poblacion').findOne(
      { institucion: { $regex: regex } },
      { projection: { _id: 0 } }
    );

    // 3) Si no existe, devolvemos 404 con mensaje claro
    if (!doc) {
      return res
        .status(404)
        .json({ error: 'No se encontraron registros de población para la universidad indicada.' });
    }

    // 4) Devolvemos el objeto directamente en JSON
    return res.json(doc);

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// ------------------------------------------------------------------
// 12) Datos EMS
//     GET /ems/:universidad
// ------------------------------------------------------------------
exports.getDatosEms = async (req, res) => {
  try {
    const nombre = decodeURIComponent(req.params.universidad ?? '').trim();
    if (!nombre) {
      return res.status(400).json({ error: 'Debe proveer el nombre de la universidad.' });
    }

    const doc = await col('EMS').findOne(
      { nombre_institucion: nombre },
      { projection: { _id: 0 } }
    );

    if (!doc) {
      return res
        .status(404)
        .json({ error: 'No se encontraron registros EMS para la institución indicada.' });
    }

    // Devolvemos los datos de la institución dentro de "data"
    return res.json({ data: doc });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
