const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js'); // Adjust the path according to your file structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('might')
    .setDescription('Calculate the total price of a list of materials.'),

  async execute(interaction) {
    const materials = [
      { name: 'Vicious Claw', itemId: 24351, stackSize: 100 },
      { name: 'Large Claw', itemId: 24350, stackSize: 250 },
      { name: 'Sharp Claw', itemId: 24349, stackSize: 50 },
      { name: 'Claw', itemId: 24348, stackSize: 50 },
      { name: 'Armored Scale', itemId: 24289, stackSize: 100 },
      { name: 'Large Scale', itemId: 24288, stackSize: 250 },
      { name: 'Smooth Scale', itemId: 24287, stackSize: 50 },
      { name: 'Scale', itemId: 24286, stackSize: 50 },
      { name: 'Ancient Bone', itemId: 24358, stackSize: 100 },
      { name: 'Large Bone', itemId: 24341, stackSize: 250 },
      { name: 'Heavy Bone', itemId: 24345, stackSize: 50 },
      { name: 'Bone', itemId: 24344, stackSize: 50 },
      { name: 'Vicious Fang', itemId: 24357, stackSize: 100 },
      { name: 'Large Fang', itemId: 24356, stackSize: 250 },
      { name: 'Sharp Fang', itemId: 24355, stackSize: 50 },
      { name: 'Fang', itemId: 24354, stackSize: 50 },
      // Add more materials here with their name, itemId, and stackSize
    ];

    try {
      let totalSellPrice = 0;

      // Call the function to get the sell price of each item
      await Promise.all(materials.map(async (material) => {
        const item = await getGw2ApiData(`commerce/prices/${material.itemId}`, 'es');
        if (item && item.sells) {
          totalSellPrice += item.sells.unit_price * material.stackSize;
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
        title: 'Total Price of Condensed Might',
        description: `The total price at 100% of Condensed Might is: ${calculateCoins(totalSellPrice)}.\nThe total price at 90% of Condensed Might is: ${calculateCoins(totalPrice90.toFixed(0))}.`,
        color: 7154499, // Embed border color (optional, you can change it or remove it)
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error making request:', error.message);
      await interaction.reply('Oops! There was an error calculating the total price of the materials.');
    }
  },
};
