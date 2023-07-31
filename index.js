const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

// Importar mongoose y configurar la opción strictQuery para suprimir la advertencia
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Importar la función connectDB para establecer la conexión a MongoDB
const connectDB = require('./mongodb');

// Llamar a la función connectDB para establecer la conexión a MongoDB
connectDB();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

// Iniciar sesión en el cliente usando el token
client.login(process.env.DISCORD_TOKEN);

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

// Crear el servidor HTTP usando express
const app = express();

// Ruta de inicio para verificar si el servidor está en línea
app.get('/', (req, res) => {
  res.send('El bot está en línea y funcionando.');
});

// Obtener el puerto desde la variable de entorno process.env.PORT o usar el puerto 3000 como valor predeterminado
const port = process.env.PORT || 3000;

// Escuchar en el puerto proporcionado
app.listen(port, () => {
  console.log(`Bot escuchando en el puerto ${port}`);
});
