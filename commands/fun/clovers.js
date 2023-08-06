const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

const API_BASE_URL = 'https://api.guildwars2.com/v2';

// Función para obtener el precio actual de un material por su ID
async function getItemPrice(itemId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/commerce/prices/${itemId}`);
    return response.data.sells.unit_price;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Función para formatear la cantidad de oro con emojis personalizados
function formatGoldWithEmojis(gold) {
  const goldEmoji = '<:gold:1134754786705674290>';
  const silverEmoji = '<:silver:1134756015691268106>';
  const copperEmoji = '<:Copper:1134756013195661353>';

  const goldAmount = Math.floor(gold / 10000);
  const silverAmount = Math.floor((gold % 10000) / 100);
  const copperAmount = gold % 100;

  return `${goldEmoji} ${goldAmount}${goldEmoji} ${silverAmount}${silverEmoji} ${copperAmount.toFixed(0)}${copperEmoji}`;
}

// Función para calcular los materiales requeridos para Mystic Clovers
async function calculateMaterialsForMysticClovers(numMysticClovers) {
  const materialsPerClover = {
    ectoplasm: 0.9 * await getItemPrice(19721), // ID de Glob of Ectoplasm, 90% del precio de venta
    mysticCoin: 0.9 * await getItemPrice(19976), // ID de Mystic Coin, 90% del precio de venta
    philosophersStone: 1400 * 0.25, // Precio de cada Spirit Shard para obtener Philosophers Stone
    spiritShardPrice: 0.25 // Precio de Spirit Shard (se considera para constancia)
  };

  const materials = {
    ectoplasm: materialsPerClover.ectoplasm,
    mysticCoin: materialsPerClover.mysticCoin,
    philosophersStone: materialsPerClover.philosophersStone,
    spiritShards: materialsPerClover.spiritShardPrice
  };

  const totalMaterials = {
    ectoplasm: materials.ectoplasm * numMysticClovers * 3, // 3 Ectos por cada Mystic Clover
    mysticCoin: materials.mysticCoin * numMysticClovers * 3, // 3 Monedas Místicas por cada Mystic Clover
    philosophersStone: materials.philosophersStone * Math.ceil(numMysticClovers / 3), // Se redondea hacia arriba para obtener suficientes Philosophers Stone
    spiritShards: materials.spiritShards * Math.ceil(numMysticClovers / 3) // Se redondea hacia arriba para obtener suficientes Spirit Shards
  };

  return totalMaterials;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clovers')
    .setDescription('Calcula el valor de los materiales requeridos para fabricar Mystic Clovers.')
    .addIntegerOption(option =>
      option
        .setName('cantidad')
        .setDescription('La cantidad de Mystic Clovers a fabricar')
        .setRequired(true)
    ),
  async execute(interaction) {
    const numMysticClovers = interaction.options.getInteger('cantidad');

    if (isNaN(numMysticClovers) || numMysticClovers <= 0) {
      return interaction.reply('Por favor, proporciona una cantidad válida de Mystic Clovers para fabricar.');
    }

    // Cálculo de los materiales requeridos para obtener los Mystic Clovers
    const materialsRequired = await calculateMaterialsForMysticClovers(numMysticClovers);

    // Cálculo del costo total para obtener los Mystic Clovers
    const totalCost = materialsRequired.ectoplasm + materialsRequired.mysticCoin + materialsRequired.philosophersStone + materialsRequired.spiritShards;

    // Crea el mensaje de tipo Embed con los precios
    const embed = {
      title: `Materiales requeridos para obtener ${numMysticClovers} Mystic Clovers:`,
      url: 'https://www.gw2bltc.com/en/item/19675-Mystic-Clover',
       thumbnail: { url:'https://render.guildwars2.com/file/FE9DC3E10D4B2AE16DADEB07CF28A058570E2EF3/455855.png'},
      fields: [
        {
          name: `${numMysticClovers * 3} Glob of Ectoplasm:`,
          value: formatGoldWithEmojis(materialsRequired.ectoplasm),
        },
        {
            name: `${numMysticClovers * 3} Mystic Coin:`,
          value: formatGoldWithEmojis(materialsRequired.mysticCoin),
        },
      ],
      description: `Costo total para obtener ${numMysticClovers} Mystic Clovers: ${formatGoldWithEmojis(totalCost)}`,
      color: 0xFFFFFF, // Color blanco
    };

    await interaction.reply({ embeds: [embed] });
  },
};
