const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { getGw2ApiData } = require('../utility/api.js'); // Adjust the path according to your file structure

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ectos')
    .setDescription('Displays the selling and buying price of Ectos.')
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('Quantity of Ectos to calculate the price.')
        .setRequired(true)),
  async execute(interaction) {
    const ectosQuantity = interaction.options.getInteger('quantity');

    if (ectosQuantity <= 0) {
      await interaction.reply('The quantity of Ectos must be greater than 0.');
      return;
    }

    try {
      const ectoPrice = await getEctoPrice();
      const buyPrice = await getBuyPrice();
      const marketQuantity = await getMarketQuantity();

      if (ectoPrice !== null && buyPrice !== null) {
        const totalPrice = ectosQuantity * ectoPrice * 0.9;
        const ectoPrice90 = Math.floor(ectoPrice * 0.9);

        const calculateCoins = (price) => {
          const gold = Math.floor(price / 10000);
          const silver = Math.floor((price % 10000) / 100);
          const copper = parseInt(price % 100);
          return `${gold} <:gold:1134754786705674290> ${silver} <:silver:1134756015691268106> ${copper} <:Copper:1134756013195661353>`;
        };

        let description = `Sell price of 1 Ecto: ${calculateCoins(ectoPrice)}`;
        description += `\nBuy price of 1 Ecto: ${calculateCoins(buyPrice)}`;
        description += `\n\n**Ecto price at 90%: ${calculateCoins(ectoPrice90)}**`;
        description += `\n\n\n**_Price of ${ectosQuantity} Ectos at 90%: ${calculateCoins(totalPrice)}_**`;
        description += `\n\n**Quantity on the market: ${marketQuantity} units**`;

        const ltcLink = `https://www.gw2bltc.com/en/item/19721`;
        const iconURL = await getIconURL('https://api.guildwars2.com/v2/items/19721');

        const embed = {
          title: `Sell Price of Ectos`,
          description: description,
          color: 0xffff00,
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
        await interaction.reply('Failed to fetch the selling or buying price of 1 Ecto from the API.');
      }
    } catch (error) {
      console.error('Error while making API request:', error.message);
      await interaction.reply('Oops! There was an error fetching the selling or buying price of Ectos from the API.');
    }
  },
};

async function getIconURL(itemId) {
  try {
    const response = await axios.get(itemId);
    const itemDetails = response.data;
    return itemDetails.icon;
  } catch (error) {
    console.error('Error fetching icon URL from API:', error.message);
    return null;
  }
}

async function getMarketQuantity() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
    const market = response.data;

    if (market && market.sells && market.buys) {
      const sellsQuantity = market.sells.quantity;
      return sellsQuantity;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching market quantity of Ectos from API:', error.message);
    return null;
  }
}

async function getEctoPrice() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
    const ecto = response.data;
    return ecto.sells.unit_price;
  } catch (error) {
    console.error('Error fetching selling price of 1 Ecto from API:', error.message);
    return null;
  }
}

async function getBuyPrice() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
    const ecto = response.data;
    return ecto.buys.unit_price;
  } catch (error) {
    console.error('Error fetching buying price of 1 Ecto from API:', error.message);
    return null;
  }
}
