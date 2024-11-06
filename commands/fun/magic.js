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
  { name: "Vial of Potent Blood", itemId: 24294, stackSize: 250, type: "T5" },
  { name: "Vial of Thick Blood", itemId: 24293, stackSize: 50, type: "T4" },
  { name: "Vial of Blood", itemId: 24292, stackSize: 50, type: "T3" },
  { name: "Powerful Venom Sac", itemId: 24283, stackSize: 100, type: "T6" },
  { name: "Potent Venom Sac", itemId: 24282, stackSize: 250, type: "T5" },
  { name: "Full Venom Sac", itemId: 24281, stackSize: 50, type: "T4" },
  { name: "Venom Sac", itemId: 24280, stackSize: 50, type: "T3" },
  { name: "Elaborate Totem", itemId: 24300, stackSize: 100, type: "T6" },
  { name: "Intricate Totem", itemId: 24299, stackSize: 250, type: "T5" },
  { name: "Engraved Totem", itemId: 24298, stackSize: 50, type: "T4" },
  { name: "Totem", itemId: 24297, stackSize: 50, type: "T3" },
  { name: "Pile of Crystalline Dust", itemId: 24277, stackSize: 100, type: "T6" },
  { name: "Pile of Incandescent Dust", itemId: 24276, stackSize: 250, type: "T5" },
  { name: "Pile of Luminous Dust", itemId: 24275, stackSize: 50, type: "T4" },
  { name: "Pile of Radiant Dust", itemId: 24274, stackSize: 50, type: "T3" }
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
      title: 'Gift of Condensed Magic Material Prices',
      description: 'Current Trading Post prices for Condensed Might materials:',
      color: 7154499,
      thumbnail: {
        url: 'https://render.guildwars2.com/file/09F42753049B20A54F6017B1F26A9447613016FE/1302179.png'
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
          name: 'Note',
          value: '• Prices are based on current Trading Post sell listings\n• 90% price accounts for Trading Post fees\n• Prices update every few minutes',
          inline: false
        }
      ]
    };

    return embed;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('magic')
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
