const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t6')
    .setDescription('Calcula el precio total de los materiales T6.'),

  async execute(interaction) {
    const itemIds = [24295, 24358, 24351, 24357, 24289, 24300, 24283, 24277];
    const stackSize = 250;

    try {
      let totalPrecioVenta = 0;

      // Realiza la solicitud a la API para obtener el precio de venta de cada objeto
      await Promise.all(itemIds.map(async (itemId) => {
        const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${itemId}`);
        const objeto = response.data;
        if (objeto && objeto.sells) {
          totalPrecioVenta += objeto.sells.unit_price * stackSize;
        }
      }));

      // Calcula el 90% del precio total
      const precioTotal90 = totalPrecioVenta * 0.9;

      // Calcula el número de monedas (oro, plata y cobre) y agrega los emotes correspondientes
      const calcularMonedas = (precio) => {
        const oro = Math.floor(precio / 10000);
        const plata = Math.floor((precio % 10000) / 100);
        const cobre = precio % 100;
        return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
      };

      const embed = {
        title: 'Precio total de los materiales T6',
        description: `El precio total al 100% de los materiales T6 es: ${calcularMonedas(totalPrecioVenta)}.\nEl precio total al 90% de los materiales T6 es: ${calcularMonedas(precioTotal90.toFixed(0))}.`,
        color: 0x00ff00, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al realizar la solicitud:', error.message);
      await interaction.reply('¡Ups! Hubo un error al calcular el precio total de los materiales T6.');
    }
  },
};
