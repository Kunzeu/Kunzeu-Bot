const { SlashCommandBuilder } = require('discord.js');
const apiKeyDB = require('../../database/database.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apikey')
        .setDescription('Manage your GW2 API key')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add or update your API key')
                .addStringOption(option =>
                    option.setName('key')
                        .setDescription('Your GW2 API key')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove your stored API key'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('check')
                .setDescription('Check if you have an API key stored')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case 'add': {
                    const apiKey = interaction.options.getString('key');
                    
                    // Verificar API key con GW2 API
                    try {
                        await axios.get('https://api.guildwars2.com/v2/account', {
                            headers: { 'Authorization': `Bearer ${apiKey}` }
                        });
                    } catch (error) {
                        return await interaction.reply({
                            content: '❌ Invalid API key. Please check your key and try again.',
                            ephemeral: true
                        });
                    }

                    // Guardar API key
                    apiKeyDB.setApiKey(userId, apiKey);
                    await interaction.reply({
                        content: '✅ API key successfully stored!',
                        ephemeral: true
                    });
                    break;
                }

                case 'remove': {
                    if (apiKeyDB.hasApiKey(userId)) {
                        apiKeyDB.deleteApiKey(userId);
                        await interaction.reply({
                            content: '🗑️ API key removed successfully.',
                            ephemeral: true
                        });
                    } else {
                        await interaction.reply({
                            content: '⚠️ You don\'t have an API key stored.',
                            ephemeral: true
                        });
                    }
                    break;
                }

                case 'check': {
                    const hasKey = apiKeyDB.hasApiKey(userId);
                    await interaction.reply({
                        content: hasKey 
                            ? '✅ You have an API key stored.'
                            : '❌ You don\'t have an API key stored.',
                        ephemeral: true
                    });
                    break;
                }
            }
        } catch (error) {
            console.error('Error in apikey command:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    },
}; 