const { SlashCommandBuilder } = require('discord.js');
const { getGw2ApiData } = require('../../utility/api.js');

// Configuración de emojis
const EMOJIS = {
  GOLD: '<:gold:1134754786705674290>',
  SILVER: '<:silver:1134756015691268106>',
  COPPER: '<:Copper:1134756013195661353>'
};

// IDs de items
const ITEMS = {
  ECTOPLASM: 19721,
  MYSTIC_COIN: 19976,
  CLOVER: 19675
};

class CloverCalculator {
  static calculateCoins(copper) {
    const gold = Math.floor(copper / 10000);
    const remaining = copper % 10000;
    const silver = Math.floor(remaining / 100);
    const copperCoins = remaining % 100;

    return `${gold}${EMOJIS.GOLD} ${silver}${EMOJIS.SILVER} ${copperCoins}${EMOJIS.COPPER}`;
  }

  static async calculateMaterials(numClovers) {
    try {
      // Obtener precios actuales
      const ectoPrice = await getGw2ApiData(`commerce/prices/${ITEMS.ECTOPLASM}`);
      const coinPrice = await getGw2ApiData(`commerce/prices/${ITEMS.MYSTIC_COIN}`);

      if (!ectoPrice?.sells?.unit_price || !coinPrice?.sells?.unit_price) {
        throw new Error('Could not fetch material prices');
      }

      // Calcular cantidades y precios
      const materialsNeeded = numClovers * 3;
      const ectoTotal = ectoPrice.sells.unit_price * materialsNeeded;
      const coinTotal = coinPrice.sells.unit_price * materialsNeeded;
      const totalCost = ectoTotal + coinTotal;

      return {
        quantities: {
          ecto: materialsNeeded,
          coins: materialsNeeded,
          shards: numClovers
        },
        prices: {
          ecto: ectoTotal,
          coins: coinTotal,
          total: totalCost,
          totalDiscounted: Math.floor(totalCost * 0.9)
        }
      };
    } catch (error) {
      console.error('Error calculating materials:', error);
      throw error;
    }
  }

  static createEmbed(numClovers, materials) {
    const embed = {
      title: 'Mystic Clover Calculator',
      description: `Materials required to obtain ${numClovers} Mystic Clovers:`,
      color: 0xFFFFFF,
      thumbnail: {
        url: 'https://render.guildwars2.com/file/7E0602C36ED3C5038A45C422B3DF10F3B8BC3BD2/42684.png'
      },
      fields: [
        {
          name: 'Total Cost (100%)',
          value: this.calculateCoins(materials.prices.total),
          inline: true
        },
        {
          name: 'Total Cost (90%)',
          value: this.calculateCoins(materials.prices.totalDiscounted),
          inline: true
        },
        {
          name: '\u200b',
          value: '\u200b',
          inline: false
        },
        {
          name: 'Materials Required',
          value: `• ${materials.quantities.ecto} Glob of Ectoplasm (${this.calculateCoins(materials.prices.ecto)})\n` +
                 `• ${materials.quantities.coins} Mystic Coins (${this.calculateCoins(materials.prices.coins)})\n` +
                 `• ${materials.quantities.shards} Spirit Shards\n\n` +
                 `Average Success Rate: 33%`,
          inline: false
        },
        {
          name: 'Note',
          value: '• Prices are based on current Trading Post sell listings\n' +
                 '• 90% price accounts for Trading Post fees\n' +
                 '• Each attempt requires 3 Ectoplasm, 3 Mystic Coins and 1 Spirit Shard',
          inline: false
        }
      ]
    };

    return embed;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clovers')
    .setDescription('Calculate materials needed for Mystic Clovers')
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('Number of Mystic Clovers to craft')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const numClovers = interaction.options.getInteger('quantity');
      const materials = await CloverCalculator.calculateMaterials(numClovers);
      const embed = CloverCalculator.createEmbed(numClovers, materials);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in clovers command:', error);
      const errorMessage = 'There was an error calculating material prices. Please try again later.';
      
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};
