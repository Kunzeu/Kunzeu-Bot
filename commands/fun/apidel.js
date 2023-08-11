const { SlashCommandBuilder } = require('discord.js');
const { deleteUserApiKey } = require('../utility/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apidel')
    .setDescription('Elimina tu API key de GW2.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      await deleteUserApiKey(userId);
      await interaction.reply('API key eliminada exitosamente.');
    } catch (error) {
      console.error('Error al eliminar la API key:', error.message);
      await interaction.reply('¡Ups! Hubo un error al eliminar la API key.');
    }
  },
};
