const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra las instrucciones y comandos disponibles.'),
  async execute(interaction) {
    // Aquí colocas las instrucciones o información que deseas mostrar al usar /help
    const helpMessage = '¡Hola! Estas son las instrucciones de uso:\n' +
      '/item: Te ayudará a ver el valor de los items\n' +
      '/id: Busca items por ID\n' +
      '/ectos: Te muestra el valor del ecto y te permite mostrar el cálculo de la cantidad agregada\n' +
      '/addserver: Genera un enlace para invitar al bot a tu servidor';

    await interaction.reply({ content: helpMessage });
  },
};
