const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('Displays fixed prices for gifts.'),
  async execute(interaction) {
    // Definir los precios manualmente en monedas de oro
    const GIFT_PRICES = {
      "Precio de GOJM": {
        gold: 650, // 650 de oro
        silver: 0, // 0 de plata
        copper: 0 // 0 de cobre
      },
      "Precio de GOM": {
        gold: 600, // 600 de oro
        silver: 0, // 0 de plata
        copper: 0 // 0 de cobre
      }
    };

    // Función para convertir precios en formato de monedas de oro, plata y cobre
    const calculateCoins = ({gold, silver, copper}) => {
      return `${gold}g${silver.toString().padStart(2, '0')}s${copper.toString().padStart(2, '0')}c`;
    };

    // Crear el embed con los precios
    const embed = {
      color: 0x0099ff, // Color del embed
      title: 'Gift Prices', // Título del embed
      description: 'Here are the current prices for our gifts:', // Descripción del embed
      fields: [], // Campos que se agregarán a continuación
    };

    // Agregar los precios al embed
    for (const [itemName, price] of Object.entries(GIFT_PRICES)) {
      const priceString = calculateCoins(price);
      embed.fields.push({ name: itemName, value: priceString, inline: false });
    }

    // Enviar el embed en respuesta al comando
    await interaction.reply({ embeds: [embed] });
  },
};
