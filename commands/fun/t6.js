const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js'); // Ajusta la ruta según tu estructura de archivos

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t6')
    .setDescription('Calculate the total price of materials T6.')
    .addIntegerOption(option => 
      option.setName('quantity')
        .setDescription('Quantity of materials to calculate the price for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemIds = [24295, 24358, 24351, 24357, 24289, 24300, 24283, 24277];
    const stackSize = 250;
    const userQuantity = interaction.options.getInteger('quantity');

    try {
      let totalPrecioVenta = 0;

      // Llama a la función para obtener el precio de venta de cada objeto
      await Promise.all(itemIds.map(async (itemId) => {
        const objeto = await getGw2ApiData(`commerce/prices/${itemId}`, 'en');
        if (objeto && objeto.sells) {
          totalPrecioVenta += objeto.sells.unit_price * stackSize;
        }
      }));

      // Calcula el 90% del precio total
      const precioTotal90 = totalPrecioVenta * 0.9;

      // Calcula el precio basado en la cantidad proporcionada por el usuario
      let totalPrecioVentaUser = 0;

      await Promise.all(itemIds.map(async (itemId) => {
        const objeto = await getGw2ApiData(`commerce/prices/${itemId}`, 'en');
        if (objeto && objeto.sells) {
          totalPrecioVentaUser += objeto.sells.unit_price * userQuantity;
        }
      }));

      // Calcula el 90% del precio total basado en la cantidad proporcionada por el usuario
      const precioTotalUser90 = totalPrecioVentaUser * 0.9;

      // Calcula el número de monedas (oro, plata y cobre) y agrega los emotes correspondientes
      const calcularMonedas = (precio) => {
        const oro = Math.floor(precio / 10000);
        const plata = Math.floor((precio % 10000) / 100);
        const cobre = precio % 100;
        return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
      };

      const embed = {
        title: 'Total price of materials T6',
        description: `The total price at 100% of the T6 materials is: ${calcularMonedas(totalPrecioVenta)}.\n` +
                     `The total price at 90% of the T6 materials is: ${calcularMonedas(precioTotal90.toFixed(0))}.\n\n` +
                     `The total price for ${userQuantity} materials at 90% is: ${calcularMonedas(precioTotalUser90.toFixed(0))}.`,
        color: 0xffc0cb, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al realizar la solicitud:', error.message);
      await interaction.reply('Oops! There was an error in calculating the total price of T6 materials.');
    }
  },
};
