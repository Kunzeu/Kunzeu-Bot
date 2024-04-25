const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js'); // Adjust the path according to your file structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('magic')
    .setDescription('Calculate the total price of a list of materials.'),

  async execute(interaction) {
    const materials = [
      { name: 'Vial of Powerful Blood', itemId: 24295, stackSize: 100 },
      { name: 'Vial of Potent Blood', itemId: 24294, stackSize: 250 },
      { name: 'Vial of Thick Blood', itemId: 24293, stackSize: 50 },
      { name: 'Vial of Blood', itemId: 24292, stackSize: 50 },
      { name: 'Powerful Venom Sac', itemId: 24283, stackSize: 100 },
      { name: 'Potent Venom Sac', itemId: 24282, stackSize: 250 },
      { name: 'Full Venom Sac', itemId: 24281, stackSize: 50 },
      { name: 'Venom Sac', itemId: 24280, stackSize: 50 },
      { name: 'Elaborate Totem', itemId: 24300, stackSize: 100 },
      { name: 'Intricate Totem', itemId: 24299, stackSize: 250 },
      { name: 'Engraved Totem', itemId: 24363, stackSize: 50 },
      { name: 'Totem', itemId: 24298, stackSize: 50 },
      { name: 'Pile of Crystalline Dust', itemId: 24277, stackSize: 100 },
      { name: 'Pile of Incandescent Dust', itemId: 24276, stackSize: 250 },
      { name: 'Pile of Luminous Dust', itemId: 24275, stackSize: 50 },
      { name: 'Pile of Radiant Dust', itemId: 24274, stackSize: 50 },
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
        title: 'Total Price of Condensed Magic',
        description: `The total price at 100% of Condensed Magic is: ${calculateCoins(totalSellPrice)}.\nThe total price at 90% of Condensed Magic is: ${calculateCoins(totalPrice90.toFixed(0))}.`,
        color: 4746549, // Embed border color (optional, you can change it or remove it)
      };

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error making request:', error.message);
      await interaction.reply('Oops! There was an error calculating the total price of the materials.');
    }
  },
};
