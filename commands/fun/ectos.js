const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ectos')
    .setDescription('Muestra el precio de venta de Ectos.')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de Ectos para calcular el precio.')
        .setRequired(true)),
  async execute(interaction) {
    const cantidadEctos = interaction.options.getInteger('cantidad');

    if (cantidadEctos <= 0) {
      await interaction.reply('La cantidad de Ectos debe ser mayor que 0.');
      return;
    }

    try {
      // Obtiene el precio de venta de 1 Ecto
      const precioEcto = await getPrecioEcto();
      if (precioEcto !== null) {
        // Calcula el precio total de la cantidad de Ectos ingresada
        const precioTotal = cantidadEctos * precioEcto *0.9;

        // Calcula el precio de venta de 1 Ecto al 90%
        const precioEcto90 = Math.floor(precioEcto * 0.9);

        // Calcula la cantidad de oro, plata y cobre para los precios
        const calcularMonedas = (precio) => {
          const oro = Math.floor(precio / 10000);
          const plata = Math.floor((precio % 10000) / 100);
          const cobre = precio % 100;
          return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
        };

        // Crea el mensaje de tipo Embed con los precios
        let description = `Precio de venta de 1 Ecto al 90%: ${calcularMonedas(precioEcto90)}`;
        description += `\nPrecio de venta de ${cantidadEctos} Ectos al 90%: ${calcularMonedas(precioTotal)}`;

        const embed = {
          title: `Precio de venta de Ectos`,
          description: description,
          color: 0x00ff00, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('No se pudo obtener el precio de venta de 1 Ecto desde la API.');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud a la API:', error.message);
      await interaction.reply('¡Ups! Hubo un error al obtener el precio de venta de Ectos desde la API.');
    }
  },
};

// Función para obtener el precio de venta de 1 Ecto
async function getPrecioEcto() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
    const ecto = response.data;
    return ecto.sells.unit_price;
  } catch (error) {
    console.error('Error al obtener el precio de venta de 1 Ecto desde la API:', error.message);
    return null;
  }
}
