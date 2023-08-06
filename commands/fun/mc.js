const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mc')
    .setDescription('Muestra el precio de venta de Monedas Místicas.')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de Monedas Místicas para calcular el precio.')
        .setRequired(true)),
  async execute(interaction) {
    const cantidadMonedas = interaction.options.getInteger('cantidad');

    if (cantidadMonedas <= 0) {
      await interaction.reply('La cantidad de Monedas Místicas debe ser mayor que 0.');
      return;
    }

    try {
      // Obtiene el precio de venta de 1 Moneda Mística
      const precioMoneda = await getPrecioMoneda();
      if (precioMoneda !== null) {
        // Calcula el precio total de la cantidad de Monedas Místicas ingresada
        const precioTotal = cantidadMonedas * precioMoneda * 0.9;

        // Calcula el precio de venta de 1 Moneda Mística al 90%
        const precioMoneda90 = Math.floor(precioMoneda * 0.9);

        // Calcula la cantidad de oro, plata y cobre para los precios
        const calcularMonedas = (precio) => {
          const oro = Math.floor(precio / 10000);
          const plata = Math.floor((precio % 10000) / 100);
          const cobre = parseInt(precio % 100); // Convertir a número entero para eliminar decimales
          return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
        };

        // Crea el mensaje de tipo Embed con los precios
        let description = `Precio de venta de 1 Moneda Mística al 90%: ${calcularMonedas(precioMoneda90)}`;
        description += `\nPrecio de venta de ${cantidadMonedas} Monedas Místicas al 90%: ${calcularMonedas(precioTotal)}`;

        const embed = {
          title: `Precio de venta de Monedas Místicas`,
          description: description,
          color: 0xff0000, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('No se pudo obtener el precio de venta de 1 Moneda Mística desde la API.');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud a la API:', error.message);
      await interaction.reply('¡Ups! Hubo un error al obtener el precio de venta de Monedas Místicas desde la API.');
    }
  },
};

// Función para obtener el precio de venta de 1 Moneda Mística
async function getPrecioMoneda() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19976');
    const moneda = response.data;
    return moneda.sells.unit_price;
  } catch (error) {
    console.error('Error al obtener el precio de venta de 1 Moneda Mística desde la API:', error.message);
    return null;
  }
}
