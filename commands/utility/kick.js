const { Client, GatewayIntentBits, InteractionResponseType } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Define un comando para dar kick, ban o timeout a un usuario
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'kick' || commandName === 'ban' || commandName === 'timeout') {
    const userId = interaction.options.getString('user'); // Obtén la ID del usuario desde los argumentos

    if (!userId) {
      return interaction.reply('Debes proporcionar la ID del usuario.');
    }

    const guild = interaction.guild;
    const member = await guild.members.fetch(userId);

    if (!member) {
      return interaction.reply('No se pudo encontrar al usuario.');
    }

    if (commandName === 'kick') {
      await member.kick();
      interaction.reply(`Se ha expulsado al usuario con ID ${userId}.`);
    } else if (commandName === 'ban') {
      await guild.members.ban(userId);
      interaction.reply(`Se ha baneado al usuario con ID ${userId}.`);
    } else if (commandName === 'timeout') {
      // Implementa tu lógica para aplicar un "timeout" al usuario aquí
      // Esto podría ser mutear al usuario durante un período de tiempo específico, por ejemplo.
      interaction.reply(`Se ha aplicado un "timeout" al usuario con ID ${userId}.`);
    }
  }
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('.')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'kick') {
    const userId = args[0];
    
    if (!userId) {
      return message.reply('Debes proporcionar la ID del usuario.');
    }

    try {
      const member = await message.guild.members.fetch(userId);
      
      if (!member) {
        return message.reply('No se pudo encontrar al usuario.');
      }

      await member.kick();
      message.reply(`Se ha expulsado al usuario con ID ${userId}.`);
    } catch (error) {
      message.reply('No se pudo expulsar al usuario. Verifica que tengo los permisos necesarios y que el ID sea válido.');
    }
  }
});

const token = process.env.DISCORD_TOKEN;

