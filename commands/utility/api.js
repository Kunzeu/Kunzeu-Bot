const axios = require('axios');

// Función para obtener datos de la API de GW2
async function getGw2ApiData(endpoint) {
  try {
    const response = await axios.get(`https://api.guildwars2.com/v2/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error al realizar la solicitud a la API:', error.message);
    throw error;
  }
}

module.exports = { getGw2ApiData };
