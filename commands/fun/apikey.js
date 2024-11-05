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
        try {
            console.log('Comando apikey iniciado');
            console.log('Subcomando:', interaction.options.getSubcommand());
            console.log('Usuario:', interaction.user.tag);

            await interaction.reply({ 
                content: 'Procesando tu solicitud...', 
                ephemeral: true 
            });

            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;

            if (!dbManager) {
                throw new Error('Database manager not initialized');
            }

            switch (subcommand) {
                case 'add': {
                    const apiKey = interaction.options.getString('key');
                    console.log('Intentando guardar API key para:', userId);
                    
                    await dbManager.setApiKey(userId, apiKey);
                    await interaction.editReply('✅ API key guardada correctamente');
                    break;
                }
                case 'remove': {
                    console.log('Intentando eliminar API key para:', userId);
                    
                    await dbManager.deleteApiKey(userId);
                    await interaction.editReply('✅ API key eliminada correctamente');
                    break;
                }
                case 'check': {
                    console.log('Verificando API key para:', userId);
                    
                    const hasKey = await dbManager.hasApiKey(userId);
                    await interaction.editReply(
                        hasKey ? '✅ Tienes una API key guardada' : '❌ No tienes una API key guardada'
                    );
                    break;
                }
            }
        } catch (error) {
            console.error('Error en comando apikey:', error);
            console.error('Stack trace:', error.stack);
            
            try {
                if (!interaction.replied) {
                    await interaction.reply({
                        content: '❌ Ocurrió un error al procesar tu solicitud',
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply('❌ Ocurrió un error al procesar tu solicitud');
                }
            } catch (replyError) {
                console.error('Error al enviar respuesta:', replyError);
            }
        }
    },
};