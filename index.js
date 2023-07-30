const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
require('dotenv').config();
const connectDB = require('./mongodb');

// Llama a la función connectDB para establecer la conexión a MongoDB
connectDB();


// Importamos el paquete de mongoose
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
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
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Conexión a la base de datos usando mongoose

client.once(Events.ClientReady, () => {
	console.log('Ready!');
	client.user.setStatus('idle');
	client.user.setActivity('Guild Wars 2');
});

client.on(Events.InteractionCreate, async interaction => {
	// Resto del código de interacción y comandos, omitido para mayor claridad...
});

client.login(token);
