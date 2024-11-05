const { SlashCommandBuilder } = require('discord.js');
const dbManager = require('../utility/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apikey')
        .setDescription('Manage your Guild Wars 2 API key')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add, remove or update your API key')
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
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            switch (subcommand) {
                case 'add': {
                    const apiKey = interaction.options.getString('key');
                    const success = await dbManager.setApiKey(userId, apiKey);
                    
                    await interaction.editReply({
                        embeds: [{
                            title: success ? '✅ Success' : '❌ Error',
                            description: success 
                                ? 'API key successfully stored!'
                                : 'Failed to store API key.',
                            color: success ? 0x00ff00 : 0xff0000,
                            timestamp: new Date()
                        }]
                    });
                    break;
                }
                case 'remove': {
                    const success = await dbManager.deleteApiKey(userId);
                    
                    await interaction.editReply({
                        embeds: [{
                            title: success ? '✅ Success' : '⚠️ Notice',
                            description: success 
                                ? 'API key removed successfully.'
                                : 'You don\'t have an API key stored.',
                            color: success ? 0x00ff00 : 0xffff00,
                            timestamp: new Date()
                        }]
                    });
                    break;
                }
                case 'check': {
                    const apiKey = await dbManager.getApiKey(userId);
                    
                    if (apiKey) {
                        const maskedKey = `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
                        await interaction.editReply({
                            embeds: [{
                                title: '✅ API Key Found',
                                description: `Your stored API key: \`${maskedKey}\``,
                                color: 0x00ff00,
                                footer: {
                                    text: 'Only showing partial key for security'
                                },
                                timestamp: new Date()
                            }]
                        });
                    } else {
                        await interaction.editReply({
                            embeds: [{
                                title: '❌ No API Key',
                                description: 'You don\'t have an API key stored.',
                                color: 0xff0000,
                                timestamp: new Date()
                            }]
                        });
                    }
                    break;
                }
            }
        } catch (error) {
            console.error('Error in apikey command:', error);
            
            await interaction.editReply({
                embeds: [{
                    title: '❌ Error',
                    description: 'An error occurred while processing your request.',
                    fields: [{
                        name: 'Error Details',
                        value: `\`\`\`${error.message}\`\`\``
                    }],
                    color: 0xff0000,
                    timestamp: new Date()
                }]
            });
        }
    },
};