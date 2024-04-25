const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { getUserApiKey } = require('../utility/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delivery')
    .setDescription('Displays gold and item delivery details.'),

  async execute(interaction) {
    const userId = interaction.user.id;

    try {
      const apiKey = await getUserApiKey(userId);

      if (!apiKey) {
        await interaction.reply('You don\'t have a linked API key. Use the /apikey command to link a Guild Wars 2 API key.');
        return;
      }

      const deliveryDetails = await getDeliveryDetails(apiKey);

      const embed = await formatDeliveryDetailsEmbed(deliveryDetails);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error getting delivery details:', error.message);
      await interaction.reply('Oops! There was an error getting delivery details.');
    }
  },
};

async function getDeliveryDetails(apiKey) {
  const url = 'https://api.guildwars2.com/v2/commerce/delivery';

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting delivery details:', error.message);
    throw error;
  }
}

async function formatDeliveryDetailsEmbed(details) {
  const gold = Math.floor(details.coins / 10000);
  const silver = Math.floor((details.coins % 10000) / 100);
  const copper = details.coins % 100;

  const itemsWithNames = await Promise.all(details.items.map(async item => {
    const itemName = await getItemName(item.id);
    return `**${itemName}\n** x${item.count}`;
  }));

  const embed = {
    color: 0x0099ff,
    title: 'Delivery Details',
    thumbnail: {
      url: 'https://wiki.guildwars2.com/images/8/81/Personal_Trader_Express.png' // Image URL
    },
    fields: [
      {
        name: 'Gold',
        value: `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`,
      },
      {
        name: 'Items',
        value: itemsWithNames.length > 0 ? itemsWithNames.join('\n') : 'You have no item details available at the moment.',
      }
    ],
    timestamp: new Date(),
    footer: {
      text: 'Kunzeu Bot',
    },
    
  };

  return embed;
}

async function getItemName(itemId) {
  const apiUrl = `https://api.guildwars2.com/v2/items/${itemId}?lang=en`;
  
  try {
    const response = await axios.get(apiUrl);
    const itemDetails = response.data;
    
    return itemDetails.name;
  } catch (error) {
    console.error('Error getting item name from API:', error.message);
    return `Unknown Item (ID: ${itemId})`;
  }
}
