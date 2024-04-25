const axios = require('axios');

// Función para llamar a la API de GW2
async function getGw2ApiData(endpoint, language = 'es') {
  try {
    const response = await axios.get(`https://api.guildwars2.com/v2/${endpoint}?lang=${language}`);
    return response.data;
  } catch (error) {
    console.error('Error al realizar la solicitud a la API de GW2:', error.message);
    return null;
  }
}

module.exports = {
  getGw2ApiData,
};
