const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra las instrucciones y comandos disponibles.'),
  async execute(interaction) {
    // Aquí colocas las instrucciones o información que deseas mostrar al usar /help
    const helpMessage = + 'Hello! Here are the usage instructions:\n\n' +
    '• `/item`: This command will help you see the value of items.\n' +
    '• `/id`: Search for items by their ID.\n' +
    '• `/ectos`: This command shows you the value of ectos and allows you to display the total amount calculation.\n' +
    '• `/mc`: This command shows you the value of MC (Mystic Coins) and allows you to display the total amount calculation.\n' +
    '• `/t3`: This command will help you see the total value of T3 level items.\n' +
    '• `/t4`: This command will help you see the total value of T4 level items.\n' +
    '• `/t5`: This command will help you see the total value of T5 level items.\n' +
    '• `/t6`: This command will help you see the total value of T6 level items.\n' +
    '• `/clovers`: This command lets you know the price of a single Clover at this moment. Currently, it calculates the value of one Clover.\n' +
    '• `/delivery`: This command allows you to see the number of items you have in delivery.\n' +
    '• `/gem`: This command lets you see the price of gems (still in testing).\n' +
    '• `/might`: This command lets you see the price of the Gift of Might.\n' +
    '• `/magic`: This command lets you see the price of the Gift of Magic.\n' +
    '• `/apikey`: Allows you to add or update your API key in the bot to use certain commands.\n' +
    '• `/apidel`: Allows you to delete your API key from the bot to stop using certain commands.'


      

    
    
  

    await interaction.reply({ content: helpMessage });
  },
};
