const router = require('express').Router();
const u       = require('../controllers/universidad.controller');   // controlador

//  GET /api/uabcs?universidad=Nombre
router.get('/uabcs', u.showUabcs);

module.exports = router;