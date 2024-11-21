const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alert')
        .setDescription('Suscríbete a las alertas de un ítem específico')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('El ítem al que deseas suscribirte')
                .setRequired(true)),
    async execute(interaction) {
        const item = interaction.options.getString('item');
        await subscribe(interaction, item);
    },
};

// Función de suscripción (puedes moverla a otro archivo si lo prefieres)
const subscriptions = {}; // Almacena las suscripciones en memoria

async function subscribe(interaction, item) {
    const userId = interaction.user.id;

    if (!subscriptions[item]) {
        subscriptions[item] = [];
    }

    if (!subscriptions[item].includes(userId)) {
        subscriptions[item].push(userId);
        await interaction.reply(`Te has suscrito a las alertas para el ítem: ${item}`);
    } else {
        await interaction.reply(`Ya estás suscrito a las alertas para el ítem: ${item}`);
    }
}
