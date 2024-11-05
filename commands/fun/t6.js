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
        try {
          const [precioData, itemData] = await Promise.all([
            getGw2ApiData(`commerce/prices/${itemId}`, 'en'),
            getGw2ApiData(`items/${itemId}`, 'en')
          ]);

          if (!precioData || !precioData.sells || !itemData) {
            console.error(`Failed to get data for item ${itemId}:`, { precioData, itemData });
            return {
              name: `Item ${itemId}`,
              unitPrice: 0,
              error: true
            };
          }

          const unitPrice = precioData.sells.unit_price || 0;
          totalPrecioVenta += unitPrice * baseStackSize;
          totalPrecioVentaUser += unitPrice * totalQuantity;

          return {
            name: itemData.name,
            unitPrice: unitPrice
          };
        } catch (itemError) {
          console.error(`Error processing item ${itemId}:`, itemError);
          return {
            name: `Item ${itemId}`,
            unitPrice: 0,
            error: true
          };
        }
      }));

      // Verificar si hay algún error en los items
      const failedItems = itemDetails.filter(item => item.error);
      if (failedItems.length > 0) {
        await interaction.reply({
          content: 'Error: Could not fetch prices for some T6 materials. Please try again later.',
          ephemeral: true
        });
        return;
      }

      const precioTotal90 = totalPrecioVenta * 0.9;
      const precioTotalUser90 = totalPrecioVentaUser * 0.9;

      const calcularMonedas = (precio) => {
        const oro = Math.floor(precio / 10000);
        const plata = Math.floor((precio % 10000) / 100);
        const cobre = precio % 100;
        return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
      };

      const embed = {
        title: 'T6 Materials Price Calculator',
        description: `*Price calculation for ${totalQuantity} units of each T6 material*`,
        color: 0xffc0cb,
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/903356166560686190/1251039149998477312/ezgif-4-68341b97cb.gif?ex=666d2080&is=666bcf00&hm=bfcbb52c92c05c09f4d9c7421aa533667d603ed409aad64e1f0efa42de49f096&'
        },
        fields: [
          {
            name: '📊 Individual Material Prices',
            value: itemDetails.map(item => 
              `> **${item.name}**: ${calcularMonedas(item.unitPrice)} each`
            ).join('\n'),
            inline: false
          },
          {
            name: '💰 Stack Prices (250 units)',
            value: '```ml\n' +
                   `Base Price (100%): ${calcularMonedas(totalPrecioVenta)}\n` +
                   `Discounted (90%): ${calcularMonedas(precioTotal90)}\n` +
                   '```',
            inline: false
          },
          {
            name: `🎯 Total for ${totalQuantity} units each`,
            value: '```ml\n' +
                   `Base Price (100%): ${calcularMonedas(totalPrecioVentaUser)}\n` +
                   `Discounted (90%): ${calcularMonedas(precioTotalUser90)}\n` +
                   '```',
            inline: false
          }
        ],
        footer: {
          text: `Prices based on current TP sell orders • ${new Date().toLocaleString()}`,
          icon_url: 'https://wiki.guildwars2.com/images/thumb/2/24/Trading_Post_%28map_icon%29.png/20px-Trading_Post_%28map_icon%29.png'
        }
      };

      // Agregar campo de ectos si el precio es alto (por ejemplo, más de 100g)
      if (precioTotalUser90 > 1000000) { // 100g en coppers
        const ectosRequeridos = Math.ceil(precioTotalUser90 / (precioEcto * 0.9));
        const numStacksEctos = Math.floor(ectosRequeridos / 250);
        const ectosAdicionales = ectosRequeridos % 250;

        embed.fields.push({
          name: '<:glob:1134942274598490292> Ectoplasm Equivalent',
          value: '```ml\n' +
                 `Stacks: ${numStacksEctos} (${(numStacksEctos * 250).toLocaleString()} units)\n` +
                 `Extra: ${ectosAdicionales} units\n` +
                 `Total: ${ectosRequeridos.toLocaleString()} ectos\n` +
                 '```',
          inline: true
        });
      }

      // Agregar campo de monedas místicas si el precio es muy alto
      if (precioTotalUser90 > 5000000) { // 500g en coppers
        const mcRequeridas = Math.ceil(precioTotalUser90 / (precioMC * 0.9));
        const numStacksMC = Math.floor(mcRequeridas / 250);
        const mcAdicionales = mcRequeridas % 250;

        embed.fields.push({
          name: '<:mc:1276710341954502678> Mystic Coin Equivalent',
          value: '```ml\n' +
                 `Stacks: ${numStacksMC} (${(numStacksMC * 250).toLocaleString()} units)\n` +
                 `Extra: ${mcAdicionales} units\n` +
                 `Total: ${mcRequeridas.toLocaleString()} MC\n` +
                 '```',
          inline: true
        });
      }

      // Agregar campo de información adicional
      embed.fields.push({
        name: 'ℹ️ Information',
        value: '```md\n' +
               '# T6 Materials Included:\n' +
               '* Vial of Powerful Blood\n' +
               '* Ancient Bone\n' +
               '* Vicious Claw\n' +
               '* Vicious Fang\n' +
               '* Armored Scale\n' +
               '* Elaborate Totem\n' +
               '* Powerful Venom Sac\n' +
               '* Pile of Crystalline Dust\n' +
               '```',
        inline: false
      });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error calculating T6 prices:', error);
      
      const errorEmbed = {
        title: '❌ Error Calculating T6 Prices',
        description: 'There was an error while calculating the prices. This might be due to:',
        color: 0xFF0000,
        fields: [
          {
            name: 'Possible Causes',
            value: '• Trading Post API might be down\n• Network connectivity issues\n• Rate limiting from the API',
            inline: false
          },
          {
            name: 'What to do',
            value: '• Please try again in a few minutes\n• If the error persists, check the GW2 API status',
            inline: false
          }
        ],
        footer: {
          text: 'Error timestamp: ' + new Date().toLocaleString(),
          icon_url: 'https://wiki.guildwars2.com/images/thumb/2/24/Trading_Post_%28map_icon%29.png/20px-Trading_Post_%28map_icon%29.png'
        }
      };

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};
