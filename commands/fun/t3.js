const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t3')
    .setDescription('Calculate the total price of T3 materials.'),

  async execute(interaction) {
    const itemIds = [24292, 24280, 24298, 24274, 24354, 24286, 24348, 24344];      
    const stackSize = 250;
    try {
      let totalSellPrice = 0;

      // Make request to the API to get the sell price of each item
      await Promise.all(itemIds.map(async (itemId) => {
        const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${itemId}`);
        const item = response.data;
        if (item && item.sells) {
          totalSellPrice += item.sells.unit_price * stackSize;
        }
      }));

      // Calculate 90% of the total price
      const totalPrice90 = totalSellPrice * 0.9;

      // Calculate the number of coins (gold, silver, and copper) and add corresponding emotes
      const calculateCoins = (price) => {
        const gold = Math.floor(price / 10000);
        const silver = Math.floor((price % 10000) / 100);
        const copper = price % 100;
        return `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`;
      };

      const T3_GIF_URL = 'https://cdn.discordapp.com/attachments/1178687540232978454/1254195627114627162/ezgif.com-animated-gif-maker.gif';

      const embed = {
        title: '<:TP:1303367310538440848> T3 Materials Calculator',
        color: 0x4169E1, // Color azul real para T3
        thumbnail: {
          url: T3_GIF_URL
        },
        fields: [
          {
            name: '<:Mystic_Forge:1303384550138839061> Requested Amount',
            value: `${stackSize} units`,
            inline: false
          },
          {
            name: '<:bag:1303385936280813668> Price per Stack (250)',
            value: `<:TP:1303367310538440848> 100%: ${calculateCoins(totalSellPrice)}\n<:TP:1303367310538440848> 90%: ${calculateCoins(totalPrice90.toFixed(0))}`,
            inline: false
          },
          {
            name: '<:T3_Vial_of_Blood:1303388161434456116> Materials Included',
            value: itemDetails.map(item => 
              `• **${item.name}**: ${calcularMonedas(item.unitPrice * totalQuantity)}`
            ).join('\n'),
            inline: false
          },
          {
            name: '<:Trading_post_unlock:1303391934072623236> Total Price',
            value: `**100%:** ${calculateCoins(totalSellPrice)}\n**90%:** ${calculateCoins(totalPrice90.toFixed(0))}`,
            inline: false
          }
        ],
        footer: {
          text: 'Trading Post prices updated • Prices may vary',
          icon_url: T3_GIF_URL
        },
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error making request:', error.message);
      await interaction.reply('Oops! There was an error calculating the total price of T3 materials.');
    }
  },
};
