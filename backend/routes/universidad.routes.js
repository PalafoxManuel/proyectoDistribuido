const router = require('express').Router();
const u = require('../controllers/universidad.controller');
const data = require('../controllers/data.controller');

// Buscar universidades por nombre (con o sin paginación)
router.get('/busqueda/:nombre', u.getUniversidadesPorNombre);
router.get('/busqueda/:nombre/:page', u.getUniversidadesPorNombre);

// Universidades visibles sin filtro
router.get('/busqueda-visibles', data.getUniversidadesVisibles);

// Otros endpoints que ya tengas
router.get('/uabcs', u.showUabcs);
//router.get('/universidad/:nombre', u.getUniversidad);

module.exports = router;