const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays instructions and available commands.'),
  async execute(interaction) {
    // Instructions or information to show when using /help
    const helpMessage = 
      'Hello! Here are the usage instructions:\n\n' +
      '• `/apikey`: Allows you to add or update your API key in the bot for certain commands.\n' +
      '• `/apidel`: Allows you to delete your API key from the bot to stop using certain commands.\n' +
      '• `/clovers`: This command informs you of the current price of a single Clover.\n' +
      '• `/delivery`: This command allows you to see the number of items you have in delivery.\n' +
      '• `/gi`: Displays fixed prices for the GOM and GOJM.\n' +
      '• `/hora`: Displays the current time.\n' +
      '• `/item`: This command helps you see the value of items.\n' +
      '• `/magic`: This command allows you to see the price of the Gift of Magic.\n' +
      '• `/might`: This command allows you to see the price of the Gift of Might.\n' +
      '• `/t3`: This command helps you see the total value of T3 items.\n' +
      '• `/t4`: This command helps you see the total value of T4 items.\n' +
      '• `/t5`: This command helps you see the total value of T5 items.\n' +
      '• `/t6`: This command helps you see the total value of T6 items.\n';


    await interaction.reply({ content: helpMessage });
  },
};
