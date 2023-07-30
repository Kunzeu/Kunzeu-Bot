const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wallet')
    .setDescription('Muestra la información de tu wallet de Guild Wars 2.'),
  async execute(interaction) {
    try {
      // Lee el archivo JSON que contiene las API personales de los usuarios
      let userAPIs = {};
      if (fs.existsSync('./userApis.json')) {
        const data = fs.readFileSync('./userApis.json', 'utf8');
        userAPIs = JSON.parse(data);
      }

      const userId = interaction.user.id;
      const userAPI = userAPIs[userId];

      // Verifica si el usuario tiene una API personal establecida
      if (userAPI) {
        // Realiza la solicitud a la API de Guild Wars 2 para obtener la información del wallet
        const response = await axios.get(`https://api.guildwars2.com/v2/account/wallet`, {
          headers: { Authorization: `Bearer ${userAPI}` }
        });
        const walletInfo = response.data;

        // Crea el embed para mostrar la información del wallet
        const embed = {
          color: 0xFF6600, // Color naranja (puedes cambiarlo a tu preferencia)
          title: 'Información del wallet de Guild Wars 2',
          fields: []
        };

        // Iconos para las diferentes monedas
        const currencyIcons = {
          1: 'https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png', // Inserta el enlace del icono para el oro
          2: 'https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png', // Inserta el enlace del icono para la plata
          4: 'https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png' // Inserta el enlace del icono para el cobre
        };

        // Agrega cada entrada del wallet como un campo en el embed
        walletInfo.forEach(entry => {
          const currencyIcon = currencyIcons[entry.id] || '';
          const valueString = `${entry.value.toLocaleString()} ${currencyIcon}`;

          embed.fields.push({
            name: entry.name,
            value: valueString
          });
        });

        // Envia el embed (visible para todos los usuarios)
        await interaction.reply({ embeds: [embed], ephemeral: false });
      } else {
        // Envia el mensaje como efímero (visible solo para el autor)
        await interaction.reply({ content: 'No tienes una API personal establecida. Usa el comando /setapi para agregarla.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error al obtener la información del wallet:', error);

      // Envia el mensaje como efímero (visible solo para el autor)
      await interaction.reply({ content: '¡Ups! Hubo un error al obtener la información del wallet. Por favor, intenta nuevamente más tarde.', ephemeral: false });
    }
  },
};
