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
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            console.log(`🔄 Processing ${subcommand} command for user ${userId}`);

            switch (subcommand) {
                case 'add': {
                    const apiKey = interaction.options.getString('key');
                    console.log('Attempting to store API key...');
                    
                    if (!apiKey) {
                        throw new Error('No API key provided');
                    }

                    const success = await dbManager.setApiKey(userId, apiKey);
                    console.log('Store API key result:', success);

                    if (success) {
                        await interaction.editReply({
                            embeds: [{
                                title: '✅ Success',
                                description: 'API key successfully stored!',
                                color: 0x00ff00,
                                timestamp: new Date()
                            }]
                        });
                    } else {
                        throw new Error('Failed to store API key');
                    }
                    break;
                }

                case 'remove': {
                    console.log('Attempting to remove API key...');
                    const hasKey = await dbManager.hasApiKey(userId);
                    
                    if (hasKey) {
                        const success = await dbManager.deleteApiKey(userId);
                        if (success) {
                            await interaction.editReply({
                                embeds: [{
                                    title: '🗑️ Success',
                                    description: 'API key removed successfully.',
                                    color: 0x00ff00,
                                    timestamp: new Date()
                                }]
                            });
                        } else {
                            throw new Error('Failed to remove API key');
                        }
                    } else {
                        await interaction.editReply({
                            embeds: [{
                                title: '⚠️ Notice',
                                description: 'You don\'t have an API key stored.',
                                color: 0xffff00,
                                timestamp: new Date()
                            }]
                        });
                    }
                    break;
                }

                case 'check': {
                    console.log('Checking for API key...');
                    const hasKey = await dbManager.hasApiKey(userId);
                    
                    await interaction.editReply({
                        embeds: [{
                            title: hasKey ? '✅ API Key Found' : '❌ No API Key',
                            description: hasKey 
                                ? 'You have an API key stored.'
                                : 'You don\'t have an API key stored.',
                            color: hasKey ? 0x00ff00 : 0xff0000,
                            timestamp: new Date()
                        }]
                    });
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