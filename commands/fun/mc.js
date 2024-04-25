const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mc')
    .setDescription('Displays the selling and buying price of Mystic Coins.')
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Number of Mystic Coins to calculate the price for.')
        .setRequired(true)),
  async execute(interaction) {
    const coinQuantity = interaction.options.getInteger('quantity');

    if (coinQuantity <= 0) {
      await interaction.reply('The quantity of Mystic Coins must be greater than 0.');
      return;
    }

    try {
      const coinPrice = await getCoinPrice();
      const buyPrice = await getBuyPrice();
      const marketQuantity = await getMarketQuantity();

      if (coinPrice !== null && marketQuantity !== null) {
        const totalPrice = coinQuantity * coinPrice * 0.9;
        const coinPrice90 = Math.floor(coinPrice * 0.9);

        const calculateCoins = (price) => {
          const gold = Math.floor(price / 10000);
          const silver = Math.floor((price % 10000) / 100);
          const copper = parseInt(price % 100);
          return `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`;
        };

        let description = `Sell price of 1 Mystic Coin: ${calculateCoins(coinPrice)}`;
        description += `\nBuy price of 1 Mystic Coin: ${calculateCoins(buyPrice)}`;
        description += `\n\n**Sell price of Mystic Coin at 90%: ${calculateCoins(coinPrice90)}**`;
        description += `\n\n\n**_Sell price of ${coinQuantity} Mystic Coins at 90%: ${calculateCoins(totalPrice)}_**`;
        description += `\n\n**Quantity in market: ${marketQuantity} units**`;

        const ltcLink = `https://www.gw2bltc.com/en/item/19976`;
        const iconURL = await getIconURL('https://api.guildwars2.com/v2/items/19976');

        const embed = {
          title: `Sell price of Mystic Coins`,
          description: description,
          color: 0xff0000,
          thumbnail: { url: `${iconURL}` },
          fields: [
            {
              name: 'Link to GW2BLTC',
              value: `${ltcLink}`,
            },
          ],
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('Failed to fetch information from the API.');
      }
    } catch (error) {
      console.error('Error making request to the API:', error.message);
      await interaction.reply('Oops! There was an error fetching information from the API.');
    }
  },
};

async function getIconURL(itemId) {
  try {
    const response = await axios.get(itemId);
    const itemDetails = response.data;
    return itemDetails.icon;
  } catch (error) {
    console.error('Error getting icon URL from the API:', error.message);
    return null;
  }
}

async function getMarketQuantity() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19976');
    const market = response.data;

    if (market && market.sells && market.buys) {
      const sellQuantity = market.sells.quantity;
      return sellQuantity;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting market quantity of Mystic Coins from the API:', error.message);
    return null;
  }
}

async function getCoinPrice() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19976');
    const coin = response.data;
    return coin.sells.unit_price;
  } catch (error) {
    console.error('Error getting sell price of 1 Mystic Coin from the API:', error.message);
    return null;
  }
}

async function getBuyPrice() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19976');
    const coin = response.data;
    return coin.buys.unit_price;
  } catch (error) {
    console.error('Error getting buy price of 1 Mystic Coin from the API:', error.message);
    return null;
  }
}
