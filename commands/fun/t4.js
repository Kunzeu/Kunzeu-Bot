const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('t4')
    .setDescription('Calculate the total price of T4 materials.'),

  async execute(interaction) {
    const itemIds = [24293, 24281, 24297, 24273, 24353, 24285, 24347, 24343];
    const stackSize = 250;
    
    try {
      // First, get all item details
      const itemDetails = await Promise.all(itemIds.map(async (itemId) => {
        const [itemInfo, priceInfo] = await Promise.all([
          axios.get(`https://api.guildwars2.com/v2/items/${itemId}`),
          axios.get(`https://api.guildwars2.com/v2/commerce/prices/${itemId}`)
        ]);
        return {
          name: itemInfo.data.name,
          id: itemId,
          unitPrice: priceInfo.data.sells.unit_price
        };
      }));

      // Calculate total prices
      const totalSellPrice = itemDetails.reduce((sum, item) => sum + (item.unitPrice * stackSize), 0);
      const totalPrice90 = totalSellPrice * 0.9;

      const T4_GIF_URL = 'https://cdn.discordapp.com/attachments/1178687540232978454/1254194723107766423/ezgif.com-animated-gif-maker.gif';

      const embed = {
        title: '<:TP:1303367310538440848> T4 Materials Calculator',
        color: 0x4169E1, // Azul para T4
        thumbnail: {
          url: T4_GIF_URL
        },
        fields: [
          {
            name: '<:Mystic_Forge:1303384550138839061> Requested Amount',
            value: `${stackSize} units`,
            inline: false
          },
          {
            name: '<:bag:1303385936280813668> Price per Stack (250)',
            value: `<:TP:1303367310538440848> 100%: ${calculateCoins(totalSellPrice)}\n<:TP:1303367310538440848> 90%: ${calculateCoins(totalPrice90)}`,
            inline: false
          },
          {
            name: '<:T4_Vial_of_Blood:1303388161434456116> Materials Breakdown',
            value: itemDetails.map(item => 
              `• **${item.name}**: ${calculateCoins(item.unitPrice * stackSize)}`
            ).join('\n'),
            inline: false
          },
          {
            name: '<:Trading_post_unlock:1303391934072623236> Total Price',
            value: `**100%:** ${calculateCoins(totalSellPrice)}\n**90%:** ${calculateCoins(totalPrice90)}`,
            inline: false
          }
        ],
        footer: {
          text: 'Trading Post prices updated • Prices may vary',
          icon_url: T4_GIF_URL
        },
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error:', error);
      await interaction.reply({ 
        content: 'Oops! There was an error calculating the total price of T4 materials.', 
        ephemeral: true 
      });
    }
  },
};

function calculateCoins(price) {
  const gold = Math.floor(price / 10000);
  const silver = Math.floor((price % 10000) / 100);
  const copper = price % 100;
  return `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`;
}
