const { SlashCommandBuilder } = require('discord.js');

// Map para almacenar las API personales de los usuarios
const userAPIs = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setapi')
    .setDescription('Establece tu API personal del juego.')
    .addStringOption(option =>
      option.setName('api')
        .setDescription('Ingresa tu API personal del juego.')
        .setRequired(true)),

  async execute(interaction) {
    const api = interaction.options.getString('api');
    const userId = interaction.user.id;

    // Guarda la API personal del usuario en el Map
    userAPIs.set(userId, api);

    await interaction.reply({ content: '¡Tu API personal ha sido establecida con éxito!', ephemeral: true });
  },
};
