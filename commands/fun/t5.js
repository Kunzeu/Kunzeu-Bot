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

      const T5_GIF_URL = 'https://cdn.discordapp.com/attachments/1178687540232978454/1254195282900553839/ezgif.com-animated-gif-maker.gif';

      const embed = {
        title: '<:TP:1303367310538440848> T5 Materials Calculator',
        color: 0xffd700, // Color dorado para T5
        thumbnail: {
          url: T5_GIF_URL
        },
        fields: [
          {
            name: '<:Mystic_Forge:1303384550138839061> Requested Amount',
            value: `${stackSize} units`,
            inline: false
          },
          {
            name: '<:bag:1303385936280813668> Price per Stack (250)',
            value: `<:TP:1303367310538440848> 100%: ${calcularMonedas(totalPrecioVenta)}\n<:TP:1303367310538440848> 90%: ${calcularMonedas(precioTotal90.toFixed(0))}`,
            inline: false
          },
          {
            name: '<:T5_Vial_of_Potent_Blood:1303387477465370728> Materials Included',
            value: itemDetails.map(item => 
              `• **${item.name}**: ${calcularMonedas(item.unitPrice * totalQuantity)}`
            ).join('\n'),
            inline: false
          },
          {
            name: '<:Trading_post_unlock:1303391934072623236> Total Price',
            value: `**100%:** ${calcularMonedas(totalPrecioVenta)}\n**90%:** ${calcularMonedas(precioTotal90.toFixed(0))}`,
            inline: false
          }
        ],
        footer: {
          text: 'Trading Post prices updated • Prices may vary',
          icon_url: T5_GIF_URL
        },
        timestamp: new Date()
      };
      

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error when making the request:', error.message);
      await interaction.reply('Oops! There was an error in calculating the total price of T5 materials.');
    }
  },
};
