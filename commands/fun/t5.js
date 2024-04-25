const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js'); // Ajusta la ruta según tu estructura de archivos

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t5') 
    .setDescription('Calculate the total price of T5 materials.'), 

  async execute(interaction) {
    const itemIds = [24294, 24341, 24350, 24356, 24288, 24299, 24282]; 
    const stackSize = 250;

    try {
      let totalPrecioVenta = 0;

      // Llama a la función para obtener el precio de venta de cada objeto
      await Promise.all(itemIds.map(async (itemId) => {
        if (itemId === 24276) {
          return; // Ignora el item 24276
        }

        const objeto = await getGw2ApiData(`commerce/prices/${itemId}`, 'es');
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
        title: 'Total price of materials T5',
        description: `The total price at 100% of the T5 materials (except for the item Pile of Incandescent Dust) is: ${calcularMonedas(totalPrecioVenta)}.\nThe total price at 90% of the T5 materials (except for the item Pile of Incandescent Dust) is: ${calcularMonedas(precioTotal90.toFixed(0))}.`,
        color: 2593204, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error when making the request:', error.message);
      await interaction.reply('Oops! There was an error in calculating the total price of T5 materials.');
    }
  },
};
