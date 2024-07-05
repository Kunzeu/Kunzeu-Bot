const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const moment = require('moment-timezone');

const timezones = {
  "🇪🇸 (Madrid)": "Europe/Madrid",
  "🇪🇸 (Canarias)": "Atlantic/Canary",
  "🇦🇷": "America/Argentina/Buenos_Aires",
  "🇨🇱": "America/Santiago",
  "🇩🇴": "America/Santo_Domingo",
  "🇨🇴": "America/Bogota",
  "🇵🇪": "America/Lima",
  "🇲🇽": "America/Mexico_City"
};

const line3Emoji = '<:line3:1254465366827208826>'; // Emoji personalizado

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hora')
    .setDescription('Muestra la hora actual en diferentes países'),

  async execute(interaction) {
    const now = moment.utc(); // Obtener la hora actual en UTC

    const responses = await Promise.all(
      Object.entries(timezones).map(async ([flag, timezone]) => {
        try {
          const dateTimeInZone = now.clone().tz(timezone); // Obtener la fecha y hora en la zona horaria especificada

          const formattedTime = dateTimeInZone.format('HH:mm'); // Formatear solo la hora en formato HH:mm

          return `${flag} ${formattedTime}`;
        } catch (error) {
          console.error(`Error fetching time for ${timezone}:`, error);
          return `${flag} N/A`;
        }
      })
    );

    await interaction.reply(responses.join(` ${line3Emoji} `));
  }
};
