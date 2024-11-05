const { SlashCommandBuilder } = require('discord.js');
const dbManager = require('../utility/database.js');

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
                    const success = await dbManager.setApiKey(userId, apiKey);
                    
                    console.log(`API Key operation:
                    User: ${interaction.user.tag} (${userId})
                    Action: Add
                    Success: ${success}
                    Timestamp: ${new Date().toISOString()}
                    `);

                    await interaction.reply({
                        embeds: [{
                            title: success ? '✅ Success' : '❌ Error',
                            description: success 
                                ? 'API key successfully stored!'
                                : 'Failed to store API key.',
                            color: success ? 0x00ff00 : 0xff0000,
                            fields: [
                                {
                                    name: 'User',
                                    value: interaction.user.tag,
                                    inline: true
                                },
                                {
                                    name: 'Status',
                                    value: success ? 'Stored' : 'Failed',
                                    inline: true
                                }
                            ],
                            timestamp: new Date()
                        }],
                        ephemeral: true
                    });
                    break;
                }
                case 'remove': {
                    if (await dbManager.hasApiKey(userId)) {
                        await dbManager.deleteApiKey(userId);
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
                    const hasKey = await dbManager.hasApiKey(userId);
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