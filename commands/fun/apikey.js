const { SlashCommandBuilder } = require('discord.js');
const dbManager = require('../utility/database.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apikey')
    .setDescription('Add or update your Guild Wars 2 API key.')
    .addStringOption(option => option.setName('apikey').setDescription('Your Guild Wars 2 API key').setRequired(true)),

  async execute(interaction) {
    const apiKey = interaction.options.getString('apikey');
    const userId = interaction.user.id;

    try {
      const existingKey = await dbManager.getApiKey(userId);

      if (existingKey) {
        await dbManager.setApiKey(userId, apiKey);
        await interaction.reply({ content: '✅ Your API key has been updated successfully.', ephemeral: true });
      } else {
        await dbManager.setApiKey(userId, apiKey);
        await interaction.reply({ content: '✅ Your API key has been added successfully.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error saving API key to the database:', error);
      await interaction.reply({ content: '❌ There was an error saving the API key to the database.', ephemeral: true });
    }
  },
};