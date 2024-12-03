const { SlashCommandBuilder } = require('discord.js');
const dbManager = require('../utility/database.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transactions')
    .setDescription('Muestra las transacciones del Trading Post'),

  async execute(interaction) {
    await interaction.deferReply();
    const userId = interaction.user.id;

    try {
      const apiKey = await dbManager.getApiKey(userId);

      if (!apiKey) {
        return await interaction.editReply({
          content: '⚠️ No tienes una API key vinculada. Usa `/apikey` para vincular tu API key de Guild Wars 2.',
          ephemeral: true
        });
      }

      const transactions = await getTransactions(apiKey);
      const embed = await formatTransactionsEmbed(transactions, interaction.user);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in transactions command:', error);
      
      if (error.message === 'Invalid API key') {
        await interaction.editReply({
          content: '❌ Tu API key es inválida o ha expirado. Por favor actualízala usando `/apikey`.',
          ephemeral: true
        });
      } else {
        await interaction.editReply({
          content: '❌ Ocurrió un error al procesar tu solicitud.',
          ephemeral: true
        });
      }
    }
  },
};

async function getTransactions(apiKey) {
  try {
    const currentBuys = await axios.get('https://api.guildwars2.com/v2/commerce/transactions/current/buys', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    const currentSells = await axios.get('https://api.guildwars2.com/v2/commerce/transactions/current/sells', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const historyBuys = await axios.get('https://api.guildwars2.com/v2/commerce/transactions/history/buys', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    const historySells = await axios.get('https://api.guildwars2.com/v2/commerce/transactions/history/sells', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    return {
      current: {
        buys: currentBuys.data,
        sells: currentSells.data
      },
      history: {
        buys: historyBuys.data,
        sells: historySells.data
      }
    };
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Invalid API key');
    }
    throw error;
  }
}

async function formatTransactionsEmbed(transactions, user) {
  const currentBuys = await formatTransactionList(transactions.current.buys, 'compra');
  const currentSells = await formatTransactionList(transactions.current.sells, 'venta');
  const historyBuys = await formatTransactionList(transactions.history.buys, 'compra');
  const historySells = await formatTransactionList(transactions.history.sells, 'venta');

  return {
    color: 0xdaa520,
    author: {
      name: `Transacciones de ${user.username}`,
      icon_url: user.displayAvatarURL()
    },
    title: '<:TP:1303367310538440848> Transacciones del Trading Post',
    thumbnail: {
      url: 'https://wiki.guildwars2.com/images/8/81/Personal_Trader_Express.png'
    },
    fields: [
      {
        name: '📥 Órdenes de Compra Actuales',
        value: currentBuys || 'No hay órdenes de compra actuales',
        inline: false
      },
      {
        name: '📤 Órdenes de Venta Actuales',
        value: currentSells || 'No hay órdenes de venta actuales',
        inline: false
      },
      {
        name: '📋 Historial de Compras',
        value: historyBuys || 'No hay historial de compras',
        inline: false
      },
      {
        name: '📊 Historial de Ventas',
        value: historySells || 'No hay historial de ventas',
        inline: false
      }
    ],
    footer: {
      text: 'Trading Post • Los precios y artículos pueden variar',
      icon_url: 'https://wiki.guildwars2.com/images/8/81/Personal_Trader_Express.png'
    },
    timestamp: new Date()
  };
}

async function formatTransactionList(transactions, type) {
  if (!transactions || transactions.length === 0) return null;

  const formattedTransactions = await Promise.all(transactions.slice(0, 5).map(async transaction => {
    try {
      const itemDetails = await getItemDetails(transaction.item_id);
      const gold = Math.floor(transaction.price / 10000);
      const silver = Math.floor((transaction.price % 10000) / 100);
      const copper = transaction.price % 100;

      return `${getRarityEmoji(itemDetails.rarity)} **${itemDetails.name}** x${transaction.quantity}\n` +
             `└ Precio: ${gold}<:gold:1134754786705674290> ${silver}<:silver:1134756015691268106> ${copper}<:Copper:1134756013195661353>`;
    } catch (error) {
      console.error(`Error fetching item ${transaction.item_id}:`, error);
      return `⚠️ Item Desconocido (ID: ${transaction.item_id}) x${transaction.quantity}`;
    }
  }));

  return formattedTransactions.join('\n\n');
}

async function getItemDetails(itemId) {
  try {
    const response = await axios.get(`https://api.guildwars2.com/v2/items/${itemId}?lang=es`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    throw error;
  }
}

function getRarityEmoji(rarity) {
  const rarityEmojis = {
    'Junk': '⚪',
    'Basic': '⚪',
    'Fine': '🔵',
    'Masterwork': '🟢',
    'Rare': '🟡',
    'Exotic': '🟠',
    'Ascended': '🔴',
    'Legendary': '💜'
  };
  return rarityEmojis[rarity] || '⚪';
}