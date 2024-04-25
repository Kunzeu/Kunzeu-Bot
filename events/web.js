const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN; // Acceder al token desde las variables de entorno
const channelId = '1138146387196903445';
const websiteUrl = 'https://guaridadevortus.com/';
let lastResponse = null;

client.login(token);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkWebsite();
  setInterval(checkWebsite, 300000); // Verificar cada 5 minutos
});

async function checkWebsite() {
  try {
    const response = await axios.get(websiteUrl);

    if (!lastResponse) {
      lastResponse = response.data;
      return;
    }

    if (lastResponse !== response.data) {
      const channel = client.channels.cache.get(channelId);
      if (channel) {
        channel.send('Se ha detectado un cambio en el sitio web: ' + websiteUrl);
      }
      lastResponse = response.data;
    }
  } catch (error) {
    console.error('Error al obtener el sitio web:', error);
  }
}
