const { Client, GatewayIntentBits, SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const priceAlerts = new Map(); // Mapa para almacenar alertas de precios

// Mapa de ítems
const itemsMap = new Map([
  [30684, { mainName: 'Frostfang', altNames: ['Frost', 'Colmilloescarcha', 'ff'] }],
  [30685, { mainName: 'Kudzu', altNames: ['kudzu'] }],
  [30686, { mainName: 'The Dreamer', altNames: ['Soñador'] }],
  // ... (agrega el resto de los ítems aquí)
  [96357, { mainName: "Dragon's Bite", altNames: ["Mordisco", 'DBite'] }],
  [100031, { mainName: 'Relic of the Monk', altNames: ['RMonk'] }],
  // ... (continúa con el resto de los ítems)
]);

// Función para obtener la ID del objeto a partir del nombre en español o inglés
function getItemIdByName(itemName) {
  for (const [id, item] of itemsMap) {
    // Compara el nombre principal y los nombres alternativos
    if (item.mainName.toLowerCase() === itemName.toLowerCase() || 
        item.altNames.some(altName => altName.toLowerCase() === itemName.toLowerCase())) {
      return id; // Retorna la ID del objeto
    }
  }
  return null; // Retorna null si no se encuentra el objeto
}

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

// Función para establecer una alerta de precio
async function setPriceAlert(userId, itemName, threshold) {
  const objetoId = getItemIdByName(itemName);
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
  if (!priceAlerts.has(userId)) {
    return "No price alerts set.";
  }

  const alerts = priceAlerts.get(userId);
  let responseMessage = "Price alerts:\n";

  for (const alert of alerts) {
    const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${alert.objetoId}`);
    const objeto = response.data;

    if (objeto) {
      responseMessage += `Item ID: ${alert.objetoId}, Current Price: ${objeto.sells.unit_price}\n`;
    }
  }

  return responseMessage;
}

// Comando de Discord
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "pricealert") {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const itemName = interaction.options.getString("item_name");
      const threshold = interaction.options.getString("threshold");
      try {
        await setPriceAlert(interaction.user.id, itemName, threshold);
        await interaction.reply(`Price alert set for item "${itemName}" at ${threshold}.`);
      } catch (error) {
        await interaction.reply(error.message);
      }
    } else if (subcommand === "check") {
      await checkPriceAlerts(interaction.user.id);
      await interaction.reply("Price alerts have been checked. Check the console for results.");
    }
  }
});

// Iniciar el bot
const token = process.env.DISCORD_TOKEN;
