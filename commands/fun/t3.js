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

      const embed = {
        title: 'Total Price of T3 Materials',
        description: `The total price at 100% of T3 materials is: ${calculateCoins(totalSellPrice)}.\nThe total price at 90% of T3 materials is: ${calculateCoins(totalPrice90.toFixed(0))}.`,
        color: 0xffa500, // Embed border color (optional, you can change it or remove it)
        thumbnail: {
          url: 'https://cdn.discordapp.com/attachments/1178687540232978454/1254195627114627162/ezgif.com-animated-gif-maker.gif?ex=66789c33&is=66774ab3&hm=4a54df4684fa3ad3807728ccc8eb61372cfdefc247070d8ca8bd97f0f79fefcf&'
        }
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error making request:', error.message);
      await interaction.reply('Oops! There was an error calculating the total price of T3 materials.');
    }
  },
};
