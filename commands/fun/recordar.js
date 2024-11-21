const cron = require('node-cron');

module.exports = (client) => {
    // Programar el recordatorio para cada jueves a las 12:15 PM (Colombia)
    cron.schedule('20 12 * * 4', () => {
        const channel = client.channels.cache.get('1178687540232978454'); // Reemplaza con el ID del canal donde deseas enviar el mensaje
        const roleId = '1239969056099012628'; // Reemplaza con el ID del rol que deseas mencionar

        if (channel) {
            channel.send(`Hoy se reinicia la semana. ¡Recuerda comprar tus ASS! <@&${roleId}>`);
        } else {
            console.error('Channel not found!');
        }
    });
};