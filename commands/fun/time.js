const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const timezones = {
  "🇪🇸": "Europe/Madrid",
  "🇦🇷": "America/Argentina/Buenos_Aires",
  "🇨🇱": "America/Santiago",
  "🇩🇴": "America/Santo_Domingo",
  "🇨🇴": "America/Bogota",
  "🇵🇪": "America/Lima",
  "🇲🇽": "America/Mexico_City"
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Muestra la hora actual en diferentes países'),

  async execute(interaction) {
    const responses = await Promise.all(
      Object.entries(timezones).map(async ([flag, timezone]) => {
        try {
          const response = await axios.get(`http://worldtimeapi.org/api/timezone/${timezone}`);
          const currentTime = new Date(response.data.datetime).toLocaleString('es-ES', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
          return `${flag} ${currentTime}`;
        } catch (error) {
          console.error(`Error fetching time for ${timezone}:`, error);
          return `${flag} N/A`;
        }
      })
    );

    await interaction.reply(responses.join(' ▪️ '));
  }
};
