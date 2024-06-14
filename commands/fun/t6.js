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

      const embed = {
        title: 'Total price of materials T6',
        description: `The total price at 100% of the T6 materials is: ${calcularMonedas(totalPrecioVenta)}.\n` +
                     `The total price at 90% of the T6 materials is: ${calcularMonedas(precioTotal90.toFixed(0))}.\n\n` +
                     `The total price for ${totalQuantity} materials at 100% is: ${calcularMonedas(totalPrecioVentaUser)}.\n` +
                     `The total price for ${totalQuantity} materials at 90% is: ${calcularMonedas(precioTotalUser90.toFixed(0))}.`,
        color: 0xffc0cb, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/903356166560686190/1251039149998477312/ezgif-4-68341b97cb.gif?ex=666d2080&is=666bcf00&hm=bfcbb52c92c05c09f4d9c7421aa533667d603ed409aad64e1f0efa42de49f096&'
        }
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error al realizar la solicitud:', error.message);
      await interaction.reply('Oops! There was an error in calculating the total price of T6 materials.');
    }
  },
};
