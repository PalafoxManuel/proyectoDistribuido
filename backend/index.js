// backend/index.js
//
// Punto de arranque del servidor Express.
// 1. Carga variables de entorno (.env)
// 2. Conecta a MongoDB Atlas (Mongoose)
// 3. Expone las rutas REST en /api
//

require('dotenv').config();          // Carga PORT y MONGO_URI

const express   = require('express');
const mongoose  = require('mongoose');
const morgan    = require('morgan'); // (opcional) logs HTTP legibles
const cors     = require('cors');

//––––––––––––––––  Configuración básica  ––––––––––––––
const PORT = process.env.PORT      || 3000;
const URI  = process.env.MONGO_URI;               // ← sin fallback

if (!URI) {
  console.error('❌  Falta la variable MONGO_URI en .env');
  process.exit(1);
}

//––––––––––––––––  Arrancar Express  ––––––––––––––––––
const app = express();

app.use(cors({ origin: 'http://localhost:3001' })); // ↖️  permite al front
app.use(express.json());
app.use(morgan('dev'));              // Log de peticiones

app.use('/', require('./routes/universidad.routes'));

// Rutas de la API (versión 1)
app.use('/', require('./routes/data.routes'));

//––––––––––––––––  Conexión Mongo  ––––––––––––––––––––
mongoose.connect(URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,   // falla en 10 s si no conecta
})
.then(() => {
  console.log('✅  MongoDB conectado');
  app.listen(PORT, () =>
    console.log(`🚀  API escuchando en http://localhost:${PORT}`)
  );
})
.catch(err => {
  console.error('❌  Error al conectar MongoDB:', err.message);
  process.exit(1);
});
