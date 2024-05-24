const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gi')
    .setDescription('Displays fixed prices for the GOM and GOJM.'),
  async execute(interaction) {
    // Definir los precios manualmente en monedas de oro
    const GIFT_PRICES = {
      "Price of GOJM": {
        gold: 650, // 650 de oro
        silver: 0, // 0 de plata
        copper: 0 // 0 de cobre
      },
      "Price of GOM": {
        gold: 600, // 600 de oro
        silver: 0, // 0 de plata
        copper: 0 // 0 de cobre
      }
    };

    // Función para convertir precios en formato de monedas de oro, plata y cobre

    const calculateCoins = ({gold, silver, copper}) => {
      return `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`;
    };

    // Crear el embed con los precios
    const embed = {
      color: 0x0099ff, // Color del embed
      title: 'Prices for the GOM and GOJM', // Título del embed
      description: 'These are the current prices of the Gifts:', // Descripción del embed
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
