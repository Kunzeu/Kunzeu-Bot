const fs = require('node:fs');
const path = require('node:path');
const Discord = require('discord.js');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

// Importar mongoose y configurar la opción strictQuery para suprimir la advertencia
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log('Ready!');
  client.user.setStatus('idle');
  client.user.setActivity('Guild Wars 2');
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// Obtener el token desde el archivo .env
const token = process.env.DISCORD_TOKEN;

// Iniciar sesión en el cliente usando el token
client.login(token);

// Crear un servidor web con Express
const app = express();

app.get('/', (req, res) => {
  res.send('El bot está en línea.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor web activo en el puerto ${PORT}`);
});