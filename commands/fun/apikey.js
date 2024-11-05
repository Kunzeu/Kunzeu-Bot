const { SlashCommandBuilder } = require('discord.js');
const ApiKey = require('../../models/ApiKey');

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
            // Log inicial
            console.log('🔄 Comando apikey iniciado');
            console.log('Subcomando:', interaction.options.getSubcommand());
            console.log('Usuario:', interaction.user.tag);

            await interaction.deferReply({ ephemeral: true });
            const subcommand = interaction.options.getSubcommand();
            const userId = interaction.user.id;

            // Verificar conexión a MongoDB
            console.log('Estado de Mongoose:', mongoose.connection.readyState);

            switch (subcommand) {
                case 'add': {
                    console.log('📝 Intentando añadir API key');
                    const apiKey = interaction.options.getString('key');
                    
                    // Verificar que tenemos la API key
                    console.log('API Key recibida:', apiKey ? 'Sí' : 'No');

                    const result = await ApiKey.findOneAndUpdate(
                        { user_id: userId },
                        { 
                            api_key: apiKey,
                            updated_at: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    console.log('Resultado de guardado:', result ? 'Éxito' : 'Fallo');

                    await interaction.editReply({
                        embeds: [{
                            title: '✅ Success',
                            description: 'API key stored successfully!',
                            color: 0x00ff00,
                            timestamp: new Date()
                        }]
                    });
                    break;
                }
                case 'remove': {
                    console.log('🗑️ Intentando eliminar API key');
                    const result = await ApiKey.findOneAndDelete({ user_id: userId });
                    console.log('Resultado de eliminación:', result ? 'Encontrado y eliminado' : 'No encontrado');
                    
                    await interaction.editReply({
                        embeds: [{
                            title: result ? '✅ Success' : '⚠️ Notice',
                            description: result 
                                ? 'API key removed successfully.'
                                : 'You don\'t have an API key stored.',
                            color: result ? 0x00ff00 : 0xffff00,
                            timestamp: new Date()
                        }]
                    });
                    break;
                }
                case 'check': {
                    console.log('🔍 Verificando API key');
                    const apiKey = await ApiKey.findOne({ user_id: userId });
                    console.log('API Key encontrada:', apiKey ? 'Sí' : 'No');
                    
                    await interaction.editReply({
                        embeds: [{
                            title: apiKey ? '✅ API Key Found' : '❌ No API Key',
                            description: apiKey 
                                ? 'You have an API key stored.'
                                : 'You don\'t have an API key stored.',
                            color: apiKey ? 0x00ff00 : 0xff0000,
                            timestamp: new Date()
                        }]
                    });
                    break;
                }
            }
        } catch (error) {
            // Log detallado del error
            console.error('❌ Error en comando apikey:', error);
            console.error('Stack trace:', error.stack);
            
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