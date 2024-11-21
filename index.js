const fs = require('node:fs');
const path = require('node:path');
const Discord = require('discord.js');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();

// Verificar variables de entorno críticas
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI no está configurada en las variables de entorno');
    process.exit(1);
}

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN no está configurada en las variables de entorno');
    process.exit(1);
}

// Importar mongoose y configurar la opción strictQuery
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log(''))
    .catch(err => {
        console.error('❌ Error conectando a MongoDB:', err);
        process.exit(1);
    });

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
    console.log('✅ Bot Ready!');
    client.user.setStatus('idle');

    // Si deseas actualizar el estado de juego periódicamente, puedes hacerlo aquí
    setInterval(() => {
        // Aquí puedes actualizar otras variables si es necesario
        client.user.setActivity('Guild Wars 2', {
            type: 'PLAYING',
        });
    }, 60000); // Actualiza cada minuto
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('❌ Command execution error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: 'There was an error while executing this command!', 
                ephemeral: true 
            });
        } else {
            await interaction.editReply({ 
                content: 'There was an error while executing this command!' 
            });
        }
    }
});

// Obtener el token desde el archivo .env
const token = process.env.DISCORD_TOKEN;

// Iniciar sesión en el cliente
client.login(token);

// Servidor web con Express
const app = express();

app.get('/', (req, res) => {
    res.send('El bot está en línea.');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor web activo en el puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});