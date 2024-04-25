  const { SlashCommandBuilder } = require('discord.js');
  const axios = require('axios');
  const { getGw2ApiData } = require('../utility/api.js'); // Ajusta la ruta según tu estructura de archivos
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('id')
      .setDescription('Muestra el precio de un objeto.')
      .addIntegerOption(option =>
        option.setName('objeto_id')
          .setDescription('ID del objeto para obtener el precio.')
          .setRequired(true)),
    async execute(interaction) {
      const objetoId = interaction.options.getInteger('objeto_id');
  
      try {
        // Realiza la solicitud a la API para obtener el precio del objeto
        const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${objetoId}`);
        const objeto = response.data;
  
        // Verifica si el objeto tiene información válida y precios de venta
        if (objeto && objeto.sells && objeto.buys) {
          const precioVenta = objeto.sells.unit_price;
          const precioCompra = objeto.buys.unit_price;
  
          // Realiza una segunda solicitud a la API para obtener los detalles del objeto, incluido su nombre, rareza e imagen
          const responseDetails = await axios.get(`https://api.guildwars2.com/v2/items/${objetoId}?lang=es`);
          const objetoDetails = responseDetails.data;
  
          // Obtiene el nombre, la rareza y la imagen del objeto
          const nombreObjeto = objetoDetails.name;
          const rarezaObjeto = objetoDetails.rarity;
  
          // Calcula el precio al 90% solo si el objeto no es legendary
          const descuento90 = rarezaObjeto !== 'Legendary' ? 0.9 : 0;
          const precioDescuento90 = descuento90 ? Math.floor(precioVenta * descuento90) : null;
  
          // Calcula la cantidad de oro, plata y cobre para los precios
          const calcularMonedas = (precio) => {
            const oro = Math.floor(precio / 10000);
            const plata = Math.floor((precio % 10000) / 100);
            const cobre = precio % 100;
            return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
          };
  
          // Calcula el número de ectos requeridos si el objeto es de rareza "Legendary"
          let ectosRequeridos = null;
          let numStacksEctos = null;
          if (rarezaObjeto === 'Legendary') {
            const descuento85 = 0.85;
            const precioDescuento85 = Math.floor(precioVenta * descuento85);
  
            // Llama a la función getPrecioEcto para obtener el precio de los ectos
            const precioEcto = await getPrecioEcto();
  
            if (precioEcto !== null) {
              ectosRequeridos = Math.ceil(precioDescuento85 / (precioEcto * 0.9)); // Ectos al 85% y ajuste al 90%
              numStacksEctos = (ectosRequeridos / 250).toFixed(2); // Número de stacks de ectos (con 4 decimales)
            }
          }
  
          // Crea el mensaje de tipo Embed con los precios y el número de ectos requeridos
          let description = `Precio de venta (Sell): ${calcularMonedas(precioVenta)}\n` +
            `Precio de compra (Buy): ${calcularMonedas(precioCompra)}`;
  
          if (precioDescuento90 !== null) {
            description += `\n\n**Este es el precio del 90%**: ${calcularMonedas(precioDescuento90)}`;
          }
  
          if (rarezaObjeto === 'Legendary') {
            const descuento85 = 0.85;
            const precioDescuento85 = Math.floor(precioVenta * descuento85);
            description += `\n\n**Este es el precio del 85%**: ${calcularMonedas(precioDescuento85)}`;
            if (ectosRequeridos !== null) {
              description += `\n\n**Ectos a dar/recibir**: ${ectosRequeridos} <:glob:1134942274598490292>`;
              description += `\n**Número de Stacks de Ectos**: ${numStacksEctos} <:glob:1134942274598490292>`;
            }
          }
  
          const embed = {
            title: `Precio del objeto ${nombreObjeto}`,
            description: description,
            color: 0x00ff00, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
          };
  
          await interaction.reply({ embeds: [embed] });
        } else {
          await interaction.reply('El objeto no tiene un precio de venta válido en la API.');
        }
      } catch (error) {
        console.error('Error al realizar la solicitud a la API:', error.message);
        await interaction.reply('¡Ups! Hubo un error al obtener el precio del objeto desde la API.');
      }
    },
  };
  
  // Función para obtener el precio de los ectos
  async function getPrecioEcto() {
    try {
      const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
      const ecto = response.data;
      return ecto.sells.unit_price;
    } catch (error) {
      console.error('Error al obtener el precio de los ectos desde la API:', error.message);
      return null;
    }
  }