const { SlashCommandBuilder } = require('discord.js');
const { deleteUserApiKey } = require('../utility/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apidel')
    .setDescription('Delete your GW2 API key.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      await deleteUserApiKey(userId);
      await interaction.reply({ content: 'API key successfully deleted.', ephemeral: true });
    } catch (error) {
      console.error('Error deleting API key:', error.message);
      await interaction.reply({ content: 'Oops! There was an error deleting the API key.', ephemeral: true });
    }
  },
};
