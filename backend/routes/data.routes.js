const r = require('express').Router();
const c = require('../controllers/data.controller');

r.get('/oferta/:universidad',      c.getDataOfertaEducativa);
r.get('/historico/:universidad',   c.getHistoricoCamposFormacion);
r.get('/universidades',            c.getUniversidadesPorNombre);
r.get('/universidades/visibles',   c.getUniversidadesVisibles);
r.get('/snii/:nombre',             c.getSnii);
r.get('/ranking-snii/:nombre',     c.getRankingSnii);
r.get('/universidad/:nombre',      c.getUniversidad);
r.get('/matricula/:universidad',   c.getMatriculaGeneralEMS);
r.get('/finanzas/:universidad',    c.getFinanciamientoInstitucional);
r.get('/adeudos/:universidad',     c.getAdeudo);
r.get('/poblacion/:universidad',   c.getPoblacionDocente);
r.get('/ems/:universidad',         c.getDatosEms);

module.exports = r;