const { SlashCommandBuilder } = require('discord.js');
const { addUserApiKey, updateUserApiKey, getUserApiKey } = require('../utility/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apikey')
    .setDescription('Agrega o actualiza tu API key de Guild Wars 2.')
    .addStringOption(option => option.setName('apikey').setDescription('Tu API key de Guild Wars 2').setRequired(true)),
  async execute(interaction) {
    const apiKey = interaction.options.getString('apikey');
    const userId = interaction.user.id;

    try {
      if (await getUserApiKey(userId)) {
        await updateUserApiKey(userId, apiKey);
        await interaction.user.send('Se ha actualizado tu API key correctamente.');
      } else {
        await addUserApiKey(userId, apiKey);
        await interaction.user.send('Se ha agregado tu API key correctamente.');
      }
    } catch (error) {
      console.error('Error al guardar la API key en la base de datos:', error);
      await interaction.user.send('Hubo un error al guardar la API key en la base de datos.');
    }
  },
};
