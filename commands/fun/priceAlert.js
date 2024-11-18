const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const priceAlerts = new Map(); // Mapa para almacenar alertas de precios

// Función para convertir el umbral a cobre
function convertToCopper(threshold) {
  const regex = /(\d+)(g|s|c)/g;
  let totalCopper = 0;
  let match;

  while ((match = regex.exec(threshold)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    if (unit === "g") {
      totalCopper += value * 100; // 1 oro = 100 cobre
    } else if (unit === "s") {
      totalCopper += value * 10; // 1 plata = 10 cobre
    } else if (unit === "c") {
      totalCopper += value; // 1 cobre = 1 cobre
    }
  }

  return totalCopper;
}

// Función para obtener la ID del objeto a partir del nombre en español o inglés
async function getItemIdByName(itemName) {
  const response = await axios.get(`https://api.guildwars2.com/v2/items`);
  const items = response.data;

  for (const item of items) {
    const itemDetails = await axios.get(`https://api.guildwars2.com/v2/items/${item}`);
    
    // Verifica que itemDetails.data existe y tiene los nombres
    if (itemDetails.data && itemDetails.data.name && itemDetails.data.name_en) {
      const itemNameEs = itemDetails.data.name; // Nombre en español
      const itemNameEn = itemDetails.data.name_en; // Nombre en inglés

      // Compara el nombre en español o en inglés
      if (itemNameEs.toLowerCase() === itemName.toLowerCase() || itemNameEn.toLowerCase() === itemName.toLowerCase()) {
        return item; // Retorna la ID del objeto
      }
    }
  }
  return null; // Retorna null si no se encuentra el objeto
}

// Función para establecer una alerta de precio
async function setPriceAlert(userId, itemName, threshold) {
  const objetoId = await getItemIdByName(itemName);
  if (!objetoId) {
    throw new Error("Item not found");
  }

  const thresholdInCopper = convertToCopper(threshold);
  
  if (!priceAlerts.has(userId)) {
    priceAlerts.set(userId, []);
  }
  priceAlerts.get(userId).push({ objetoId, threshold: thresholdInCopper });
}

// Función para verificar alertas de precios
async function checkPriceAlerts(userId) {
  if (!priceAlerts.has(userId)) return;

  const alerts = priceAlerts.get(userId);
  for (const alert of alerts) {
    const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${alert.objetoId}`);
    const objeto = response.data;

    if (objeto && objeto.sells.unit_price <= alert.threshold) {
      // Aquí puedes enviar un mensaje al usuario sobre la alerta
      console.log(`Alert: The price of item ${alert.objetoId} has dropped to ${objeto.sells.unit_price}`);
      // Puedes usar interaction.user.send() para enviar un mensaje directo al usuario
    }
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pricealert')
    .setDescription('Set or check price alerts for items.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('set')
        .setDescription('Set a price alert for an item.')
        .addStringOption(option =>
          option.setName('item_name')
            .setDescription('Name of the item you want to set the alert for (in Spanish or English).')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('threshold')
            .setDescription('Price threshold for the alert (e.g., "30g 29s 0c").')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Check price alerts.')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'set') {
      const itemName = interaction.options.getString('item_name');
      const threshold = interaction.options.getString('threshold');
      try {
        await setPriceAlert(interaction.user.id, itemName, threshold);
        await interaction.reply(`Price alert set for item "${itemName}" at ${threshold}.`);
      } catch (error) {
        await interaction.reply(error.message);
      }
    } else if (subcommand === 'check') {
      await checkPriceAlerts(interaction.user.id);
      await interaction.reply('Price alerts have been checked. Check the console for results.');
    }
  },
}; 