const mongoose = require('mongoose');

exports.col = name => mongoose.connection.collection(name);