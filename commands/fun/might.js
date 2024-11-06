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
  { name: "Vicious Claw", itemId: 24351, stackSize: 100, type: "T6" },
  { name: "Large Claw", itemId: 24350, stackSize: 250, type: "T5" },
  { name: "Sharp Claw", itemId: 24349, stackSize: 50, type: "T4" },
  { name: "Claw", itemId: 24348, stackSize: 50, type: "T3" },
  { name: "Armored Scale", itemId: 24289, stackSize: 100, type: "T6" },
  { name: "Large Scale", itemId: 24288, stackSize: 250, type: "T5" },
  { name: "Smooth Scale", itemId: 24287, stackSize: 50, type: "T4" },
  { name: "Scale", itemId: 24286, stackSize: 50, type: "T3" },
  { name: "Ancient Bone", itemId: 24358, stackSize: 100, type: "T6" },
  { name: "Large Bone", itemId: 24341, stackSize: 250, type: "T5" },
  { name: "Heavy Bone", itemId: 24345, stackSize: 50, type: "T4" },
  { name: "Bone", itemId: 24344, stackSize: 50, type: "T3" },
  { name: "Vicious Fang", itemId: 24357, stackSize: 100, type: "T6" },
  { name: "Large Fang", itemId: 24356, stackSize: 250, type: "T5" },
  { name: "Sharp Fang", itemId: 24355, stackSize: 50, type: "T4" },
  { name: "Fang", itemId: 24354, stackSize: 50, type: "T3" }
];

class MaterialPriceCalculator {
  static calculateCoins(copper) {
    const gold = Math.floor(copper / 10000);
    const remaining = copper % 10000;
    const silver = Math.floor(remaining / 100);
    const copperCoins = remaining % 100;

    return `${gold}${EMOJIS.GOLD} ${silver}${EMOJIS.SILVER} ${copperCoins}${EMOJIS.COPPER}`;
  }

  static async fetchMaterialPrices(materials) {
    const results = await Promise.allSettled(
      materials.map(async (material) => {
        try {
          const data = await getGw2ApiData(`commerce/prices/${material.itemId}`);
          if (!data?.sells?.unit_price) {
            throw new Error(`No price data for ${material.name}`);
          }

          return {
            ...material,
            unitPrice: data.sells.unit_price,
            totalPrice: data.sells.unit_price * material.stackSize
          };
        } catch (error) {
          console.error(`Error fetching ${material.name}:`, error);
          return null;
        }
      })
    );

    return results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);
  }

  static createEmbed(priceData) {
    const totalPrice = priceData.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountedPrice = Math.floor(totalPrice * 0.9);

    const embed = {
      title: 'Condensed Might Material Prices',
      description: 'Current Trading Post prices for Condensed Might materials:',
      color: 7154499,
      thumbnail: {
        url: 'https://render.guildwars2.com/file/CCA4C2F8AF79D2EB0CFF381E3DDA3EA792BA7412/1302180.png'
      },
      fields: [
        {
          name: 'Total Price (100%)',
          value: this.calculateCoins(totalPrice),
          inline: true
        },
        {
          name: 'Total Price (90%)',
          value: this.calculateCoins(discountedPrice),
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false
        },
        {
          name: 'Note',
          value: '• Prices are based on current Trading Post sell listings\n' +
                 '• 90% price accounts for Trading Post fees\n' +
                 '• Prices update every few minutes',
          inline: false
        }
      ]
    };

    return embed;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('might')
    .setDescription('Calculate current prices for Condensed Might materials'),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const priceData = await MaterialPriceCalculator.fetchMaterialPrices(MATERIALS);
      if (!priceData.length) {
        throw new Error('Could not fetch material prices');
      }

      const embed = MaterialPriceCalculator.createEmbed(priceData);
      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in might command:', error);
      const errorMessage = 'There was an error calculating material prices. Please try again later.';
      
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};
