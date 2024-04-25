const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

const API_BASE_URL = 'https://api.guildwars2.com/v2';

// Function to get the current price of an item by its ID
async function getItemPrice(itemId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/commerce/prices/${itemId}`);
    return response.data.sells.unit_price;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Function to format gold amount with custom emojis
function formatGoldWithEmojis(gold) {
  const goldEmoji = '<:gold:1134754786705674290>';
  const silverEmoji = '<:silver:1134756015691268106>';
  const copperEmoji = '<:Copper:1134756013195661353>';

  const goldAmount = Math.floor(gold / 10000);
  const silverAmount = Math.floor((gold % 10000) / 100);
  const copperAmount = gold % 100;

  return `${goldEmoji} ${goldAmount}${goldEmoji} ${silverAmount}${silverEmoji} ${copperAmount.toFixed(0)}${copperEmoji}`;
}

// Function to calculate materials required for Mystic Clovers
async function calculateMaterialsForMysticClovers(numMysticClovers) {
  const materialsPerClover = {
    ectoplasm: 0.9 * await getItemPrice(19721), // Glob of Ectoplasm ID, 90% of sell price
    mysticCoin: 0.9 * await getItemPrice(19976), // Mystic Coin ID, 90% of sell price
    philosophersStone: 1400 * 0.25, // Price of each Spirit Shard to obtain Philosophers Stone
    spiritShardPrice: 0.25 // Price of Spirit Shard (considered for consistency)
  };

  const materials = {
    ectoplasm: materialsPerClover.ectoplasm,
    mysticCoin: materialsPerClover.mysticCoin,
    philosophersStone: materialsPerClover.philosophersStone,
    spiritShards: materialsPerClover.spiritShardPrice
  };

  const totalMaterials = {
    ectoplasm: materials.ectoplasm * numMysticClovers * 3, // 3 Ectos per Mystic Clover
    mysticCoin: materials.mysticCoin * numMysticClovers * 3, // 3 Mystic Coins per Mystic Clover
    philosophersStone: materials.philosophersStone * Math.ceil(numMysticClovers / 3), // Rounded up to get enough Philosophers Stone
    spiritShards: materials.spiritShards * Math.ceil(numMysticClovers / 3) // Rounded up to get enough Spirit Shards
  };

  return totalMaterials;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clovers')
    .setDescription('Calculates the value of materials required to craft Mystic Clovers.')
    .addIntegerOption(option =>
      option
        .setName('quantity')
        .setDescription('The quantity of Mystic Clovers to craft')
        .setRequired(true)
    ),
  async execute(interaction) {
    const numMysticClovers = interaction.options.getInteger('quantity');

    if (isNaN(numMysticClovers) || numMysticClovers <= 0) {
      return interaction.reply('Please provide a valid quantity of Mystic Clovers to craft.');
    }

    // Calculate required materials to obtain Mystic Clovers
    const materialsRequired = await calculateMaterialsForMysticClovers(numMysticClovers);

    // Calculate total cost to obtain Mystic Clovers
    const totalCost = materialsRequired.ectoplasm + materialsRequired.mysticCoin;

    // Create Embed message with prices
    const ltcLink = `https://www.gw2bltc.com/en/item/19976`;
    const iconURL = await getIconURL('https://api.guildwars2.com/v2/items/19976'); 

    const embed = {
      title: `Materials required to obtain ${numMysticClovers} Mystic Clovers:`,
      thumbnail: { url: `${iconURL}` },
      fields: [
        {
          name: `${numMysticClovers * 3} Glob of Ectoplasm:`,
          value: formatGoldWithEmojis(materialsRequired.ectoplasm),
        },
        {
          name: `${numMysticClovers * 3} Mystic Coin:`,
          value: formatGoldWithEmojis(materialsRequired.mysticCoin),
        },
        {
          name: 'Link to GW2BLTC',
          value: `${ltcLink}`,
        },
      ],
      description: `Total cost to obtain ${numMysticClovers} Mystic Clovers: ${formatGoldWithEmojis(totalCost)}`,
      color: 0xFFFFFF, // White color
    };

    async function getIconURL(itemId) {
      try {
        const response = await axios.get(`https://api.guildwars2.com/v2/items/19675`);
        const itemDetails = response.data;
        return itemDetails.icon;
      } catch (error) {
        console.error('Error getting icon URL from API:', error.message);
        return null;
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};
