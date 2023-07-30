const { SlashCommandBuilder } = require('discord.js');

// Map para almacenar las API personales de los usuarios
const userAPIs = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deleteapi')
    .setDescription('Elimina tu API personal del juego.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    // Verifica si el usuario tiene una API personal establecida antes de eliminarla
    if (userAPIs.has(userId)) {
      userAPIs.delete(userId);
      await interaction.reply({ content: 'Tu API personal ha sido eliminada con éxito.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'No tienes una API personal establecida.', ephemeral: true });
    }
  },
};
