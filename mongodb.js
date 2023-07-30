const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_CONNECT_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB con éxito');
  } catch (error) {
    console.error('La conexión a MongoDB ha fallado:', error.message);
  }
};

module.exports = connectDB;
