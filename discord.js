const { Client, GatewayIntentBits, REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const clientId = '1134643165735944233'; // Reemplaza TU_CLIENT_ID con el ID de tu aplicación (bot)
const token = 'MTEzNDY0MzE2NTczNTk0NDIzMw.GjmWCq.UIMl_TLDj6MTxpUj9RGi-UxYNABHfdUme6vkCE'; // Reemplaza TU_TOKEN con el token de tu bot

const commands = [
  // Aquí puedes definir los comandos que deseas registrar globalmente
  {
    name: 'comando1',
    description: 'Este es el comando 1',
  },
  {
    name: 'comando2',
    description: 'Este es el comando 2',
  },
  // Puedes agregar más comandos aquí...
];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Registrando comandos globalmente...');

    // Registra los comandos globalmente utilizando el endpoint global
    await rest.put(
      // Utiliza la ruta global para registrar los comandos a nivel de aplicación (client ID)
      Routes.applicationCommands(clientId),
      { body: commands },
    );

    console.log('Comandos registrados con éxito en todos los servidores (guilds).');
    client.login(token);
  } catch (error) {
    console.error('Error al registrar los comandos:', error);
  }
})();
