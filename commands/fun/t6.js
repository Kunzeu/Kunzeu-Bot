const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js'); // Ajusta la ruta según tu estructura de archivos

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t6')
    .setDescription('Calculate the total price of materials T6.')
    .addIntegerOption(option => 
      option.setName('quantity')
        .setDescription('Enter a quantity (<= 10 will be multiplied by 250, >= 100 will be used as is)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const itemIds = [24295, 24358, 24351, 24357, 24289, 24300, 24283, 24277];
    const baseStackSize = 250;
    const userQuantity = interaction.options.getInteger('quantity');
    let totalQuantity;

    if (userQuantity <= 10) {
      totalQuantity = baseStackSize * userQuantity;
    } else if (userQuantity >= 100) {
      totalQuantity = userQuantity;
    } else {
      await interaction.reply('Please enter a quantity <= 10 or >= 100.');
      return;
    }

    try {
      let totalPrecioVenta = 0;
      let totalPrecioVentaUser = 0;

      const itemDetails = await Promise.all(itemIds.map(async (itemId) => {
        const [precioData, itemData] = await Promise.all([
          getGw2ApiData(`commerce/prices/${itemId}`, 'en'),
          getGw2ApiData(`items/${itemId}`, 'en')
        ]);

        const unitPrice = precioData?.sells?.unit_price || 0;
        totalPrecioVenta += unitPrice * baseStackSize;
        totalPrecioVentaUser += unitPrice * totalQuantity;

        return {
          name: itemData.name,
          unitPrice: unitPrice
        };
      }));

      const precioTotal90 = totalPrecioVenta * 0.9;
      const precioTotalUser90 = totalPrecioVentaUser * 0.9;

      const calcularMonedas = (precio) => {
        const oro = Math.floor(precio / 10000);
        const plata = Math.floor((precio % 10000) / 100);
        const cobre = precio % 100;
        return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
      };

      const T6_GIF_URL = 'https://cdn.discordapp.com/attachments/903356166560686190/1251039149998477312/ezgif-4-68341b97cb.gif';

      const embed = {
        title: '<:TP:1303367310538440848> T6 Materials Calculator',
        color: 0xffa500,
        thumbnail: {
          url: T6_GIF_URL
        },
        fields: [
          {
            name: '<:Mystic_Forge:1303384550138839061> Requested Amount',
            value: `${totalQuantity} units`,
            inline: false
          },
          {
            name: '<:bag:1303385936280813668> Price per Stack (250)',
            value: `<:TP:1303367310538440848> 100%: ${calcularMonedas(totalPrecioVenta)}\n<:TP:1303367310538440848> 90%: ${calcularMonedas(precioTotal90.toFixed(0))}`,
            inline: false
          },
          {
            name: '<:T6_Vial_of_Powerful_Blood:1303387201463128064> Materials Breakdown',
            value: itemDetails.map(item => 
              `• **${item.name}**: ${calcularMonedas(item.unitPrice * totalQuantity)}`
            ).join('\n'),
            inline: false
          },
          {
            name: '<:Trading_post_unlock:1303391934072623236> Total Price',
            value: `**90%:** ${calcularMonedas(precioTotalUser90.toFixed(0))}`,
            inline: false
          }
        ],
        footer: {
          text: 'Trading Post prices updated • Prices may vary',
          icon_url: T6_GIF_URL
        },
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al realizar la solicitud:', error.message);
      await interaction.reply('Oops! There was an error in calculating the total price of T6 materials.');
    }
  },
};
