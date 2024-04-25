const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra las instrucciones y comandos disponibles.'),
  async execute(interaction) {
    // Aquí colocas las instrucciones o información que deseas mostrar al usar /help
    const helpMessage = '¡Hola! Aquí están las instrucciones de uso:\n\n'+
      '• `/item`: Este comando te ayudará a ver el valor de los objetos.\n' +
      '• `/id`: Buscar objetos por su ID.\n' +
      '• `/ectos`: Este comando te muestra el valor de los ectos y te permite mostrar el cálculo del monto total.\n' +
      '• `/mc`: Este comando te muestra el valor de las MC (Monedas Místicas) y te permite mostrar el cálculo del monto total.\n' +
      '• `/t3`: Este comando te ayudará a ver el valor total de los objetos de nivel T3.\n' +
      '• `/t4`: Este comando te ayudará a ver el valor total de los objetos de nivel T4.\n' +
      '• `/t5`: Este comando te ayudará a ver el valor total de los objetos de nivel T5.\n' +
      '• `/t6`: Este comando te ayudará a ver el valor total de los objetos de nivel T6.\n' +
      '• `/clovers`: Este comando te permite conocer el precio de un solo Trébol en este momento. Actualmente, calcula el valor de un Trébol.\n' +
      '• `/tp`: Este comando te permite ver la cantidad de objetos que tienes en entrega.\n'+
      '• `/gem`: Este comando te permite ver el precio de las gemas (sigue en test).\n'+
      '• `/might`: Este comando te permite ver el precio del Don de Poder.\n'+
      '• `/magic`: Este comando te permite ver el precio del Don de Magia.\n'+
      '• `/apikey`: Te permite agregar o actualizar tu APIkey en el bot para usar algunos comandos.\n'+
      '• `/apidel`: Te permite eliminar tu APIkey del bot para dejar de usar algunos comandos.'


      

    
    
  

    await interaction.reply({ content: helpMessage });
  },
};
