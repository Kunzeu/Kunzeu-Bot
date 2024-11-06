const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../utility/api.js');

// Configuración de emojis
const EMOJIS = {
  GOLD: '<:gold:1134754786705674290>',
  SILVER: '<:silver:1134756015691268106>',
  COPPER: '<:Copper:1134756013195661353>'
};

// Lista de materiales
const MATERIALS = [
  { name: "Vial of Powerful Blood", itemId: 24295, stackSize: 100, type: "T6" },
  { name: "Powerful Venom Sac", itemId: 24283, stackSize: 100, type: "T6" },
  { name: "Large Bone", itemId: 24341, stackSize: 100, type: "T6" },
  { name: "Powerful Fang", itemId: 24357, stackSize: 100, type: "T6" },
  { name: "Armored Scale", itemId: 24289, stackSize: 100, type: "T6" },
  { name: "Large Claw", itemId: 24351, stackSize: 100, type: "T6" },
  { name: "Ancient Bone", itemId: 24358, stackSize: 250, type: "T5" },
  { name: "Vial of Potent Blood", itemId: 24294, stackSize: 250, type: "T5" },
  { name: "Large Fang", itemId: 24356, stackSize: 250, type: "T5" },
  { name: "Vicious Fang", itemId: 24357, stackSize: 250, type: "T5" },
  { name: "Vicious Claw", itemId: 24351, stackSize: 250, type: "T5" }
];

class MaterialPriceCalculator {
  static calculateCoins(copper) {
    const gold = Math.floor(copper / 10000);
    const remaining = copper % 10000;
    const silver = Math.floor(remaining / 100);
    const copperCoins = remaining % 100;

    return `${gold}${EMOJIS.GOLD} ${silver}${EMOJIS.SILVER} ${copperCoins}${EMOJIS.COPPER}`;
  }

  static async calculateMaterialPrices(materials) {
    const prices = await Promise.all(
      materials.map(async (material) => {
        try {
          const item = await getGw2ApiData(`commerce/prices/${material.itemId}`);
          if (!item || !item.sells || !item.sells.unit_price) {
            throw new Error(`No price data for ${material.name}`);
          }
          return {
            ...material,
            price: item.sells.unit_price,
            totalPrice: item.sells.unit_price * material.stackSize
          };
        } catch (error) {
          console.error(`Error fetching price for ${material.name}:`, error);
          return { ...material, price: 0, totalPrice: 0 };
        }
      })
    );

    const materialDetails = prices.map(item => ({
      name: item.name,
      value: `${MaterialPriceCalculator.calculateCoins(item.price)} (x${item.stackSize})`,
      inline: true
    }));

    return {
      totalPrice: prices.reduce((acc, item) => acc + item.totalPrice, 0),
      materials: materialDetails
    };
  }

  static createEmbed(totalPrice, price90Percent, materialFields) {
    return {
      title: 'Magic Material Prices',
      description: 'Current prices for magic materials on the Trading Post:',
      color: 0x4287f5,
      thumbnail: {
        url: 'https://render.guildwars2.com/file/09F42753049B20A54F6017B1F26A9447613016FE/1302179.png'
      },
      fields: [
        {
          name: 'Total Price (100%)',
          value: MaterialPriceCalculator.calculateCoins(totalPrice),
          inline: true
        },
        {
          name: 'Total Price (90%)',
          value: MaterialPriceCalculator.calculateCoins(price90Percent),
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false
        },
        ...materialFields,
        {
          name: 'Note',
          value: 'Prices are based on current Trading Post sell listings.\nThe 90% price represents the typical selling price after Trading Post fees.',
          inline: false
        }
      ],
      footer: {
        text: 'Last updated'
      },
      timestamp: new Date()
    };
  }

  static async execute(interaction) {
    try {
      await interaction.deferReply();

      const { totalPrice, materials } = await MaterialPriceCalculator.calculateMaterialPrices(MATERIALS);
      const price90Percent = Math.floor(totalPrice * 0.9);

      const embed = MaterialPriceCalculator.createEmbed(totalPrice, price90Percent, materials);
      
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in magic command:', error);
      const errorMessage = 'There was an error calculating material prices. Please try again later.';
      
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('magic')
    .setDescription('Calculate the total price of magic materials.'),

  async execute(interaction) {
    await MaterialPriceCalculator.execute(interaction);
  },
};
