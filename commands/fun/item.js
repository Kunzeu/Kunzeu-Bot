const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

// Mapeo bidireccional de ID y nombre de objetos
const itemsMap = new Map([
  [30684, { mainName: 'Frostfang', altNames: ['Frost', 'Colmilloescarcha', 'colmillo', 'frost','ff'] }],
  [30685, { mainName: 'Kudzu', altNames: ['kudzu'] }],
  [30686, { mainName: 'The Dreamer', altNames: ['Soñador','soñador'] }],
  [30687, { mainName: 'Incinerator', altNames: ['Incineradora', 'incineradora', 'inci'] }],
  [30688, { mainName: 'The Minstrel', altNames: ['Juglar', 'juglar'] }],
  [30689, { mainName: 'Eternity', altNames: ['Eternidad', 'eter', 'eternidad'] }],
  [30690, { mainName: 'The Juggernaut', altNames: ['Juggernaut','juggernaut', 'jug'] }],
  [30691, { mainName: "Kamohoali'i Kotaki", altNames: ['Kotaki', ' lanza'] }],
  [30692, { mainName: 'The Moot', altNames: ['festin', 'Festin','fes'] }],
  [30693, { mainName: 'Quip', altNames: ['Gracia', 'gra', 'gracia'] }],
  [30694, { mainName: 'The Predator', altNames: ['Depredador', 'Pred', 'pred'] }],
  [30695, { mainName: 'Meteorlogicus', altNames: ['Meteorlógico', 'meteor', 'Meteor'] }],
  [30696, { mainName: 'The Flameseeker Prophecies', altNames: ['FSP', 'fsp'] }],
  [30697, { mainName: 'Frenzy', altNames: ['frenzy'] }],
  [30698, { mainName: 'The Bifrost', altNames: ['Bifrost', 'bifrost'] }],
  [30699, { mainName: 'Bolt', altNames: ['Haz'] }],
  [30700, { mainName: 'Rodgort', altNames: ['rodgort', 'rod'] }],
  [30701, { mainName: 'Kraitkin', altNames: ['kraitkin'] }],
  [30702, { mainName: 'Howler', altNames: ['Aullador', 'aull'] }],
  [30703, { mainName: 'Sunrise', altNames: ['amanecer', 'Amanecer','ama'] }],
  [30704, { mainName: 'Twilight', altNames: ['Crepusculo','crepusculo', 'crep'] }],
  [95612, { mainName: `Aurene's Tail`, altNames: ['maza'] }],
  [95675, { mainName: "Aurene's Fang", altNames: ['espada'] }],
  [95808, { mainName: "Aurene's Argument", altNames: ['pistola'] }],
  [96028, { mainName: "Aurene's Scale", altNames: ['escudo'] }],
  [96203, { mainName: "Aurene's Claw", altNames: ['daga'] }],
  [96221, { mainName: "Aurene's Wisdom", altNames: ['cetro'] }],
  [96356, { mainName: "Aurene's Bite", altNames: ['mandoble', 'mand'] }],
  [96652, { mainName: "Aurene's Insight", altNames: ['baculo'] }],
  [96937, { mainName: "Aurene's Rending", altNames: ['hacha'] }],
  [97077, { mainName: "Aurene's Wing", altNames: ['LS','ls'] }],
  [97099, { mainName: "Aurene's Breath", altNames: ['antorcha', 'ant'] }],
  [97165, { mainName: "Aurene's Gaze", altNames: ['foco'] }],
  [97377, { mainName: "Aurene's Persuasion", altNames: ['rifle'] }],
  [97590, { mainName: "Aurene's Flight", altNames: ['LB', 'lb'] }],
  [95684, { mainName: `Aurene's Weight`, altNames: ['martillo'] }],
  [96978, { mainName: 'Antique Summoning Stone', altNames: ['ASS', 'ass'] }],
  [96722, { mainName: 'Jade Runestone', altNames: ['runestone', 'jade'] }],
  [96347, { mainName: 'Chunk of Ancient Ambergris', altNames: ['Amber', 'amber'] }],
  [84731, { mainName: 'Blue', altNames: ['blue'] }],
  [85016, { mainName: 'Green', altNames: ['green'] }],
  [83008, { mainName: 'Yellow', altNames: ['yellow'] }],
  [19721, { mainName: 'Glob of Ectoplasm', altNames: ['Ectos', 'ecto'] }],
]);

const excludedLegendaryItems = new Set([96978, 96722]);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Muestra el precio de un objeto.')
    .addStringOption(option =>
      option.setName('objeto')
        .setDescription('ID o nombre del objeto para obtener el precio.')
        .setRequired(true)),
  async execute(interaction) {
    const input = interaction.options.getString('objeto');
    let objetoId = null;

    // Verifica si el input es un número (ID) o una cadena (nombre)
    if (!isNaN(input)) {
      objetoId = parseInt(input);
    } else {
      objetoId = findObjectIdByName(input);
    }

    try {
      // Verifica si se encontró la ID del objeto
      if (!objetoId || !itemsMap.has(objetoId)) {
        await interaction.reply('No se encontró el objeto con ese ID o nombre.');
        return;
      }

      // Realiza la solicitud a la API para obtener el precio del objeto
      const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${objetoId}`);
      const objeto = response.data;

      // Verifica si el objeto tiene información válida y precios de venta
      if (objeto && objeto.sells && objeto.buys) {
        const precioVenta = objeto.sells.unit_price;
        const precioCompra = objeto.buys.unit_price;

        // Realiza una segunda solicitud a la API para obtener los detalles del objeto, incluido su nombre, rareza e imagen
        const responseDetails = await axios.get(`https://api.guildwars2.com/v2/items/${objetoId}`);
        const objetoDetails = responseDetails.data;

        // Obtiene el nombre, la rareza y la imagen del objeto
        const nombreObjeto = objetoDetails.name;
        const rarezaObjeto = objetoDetails.rarity;

        // Calcula el precio al 85% si el objeto es legendary, de lo contrario, calcula al 90%
        const descuento = rarezaObjeto === 'Legendary' && !excludedLegendaryItems.has(objetoId) ? 0.85 : 0.9;
        const precioDescuento = Math.floor(precioVenta * descuento);

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
          const precioEcto = await getPrecioEcto();
          if (precioEcto !== null) {
            ectosRequeridos = Math.ceil(precioDescuento / (precioEcto * 0.9)); // Ectos al 90% del precioDescuento
            numStacksEctos = (ectosRequeridos / 250).toFixed(2); // Número de stacks de ectos (con 2 decimales)
          }
        }

        // Crea el mensaje de tipo Embed con los precios y el número de ectos requeridos
        let description = `Precio de venta (Sell): ${calcularMonedas(precioVenta)}\n` +
          `Precio de compra (Buy): ${calcularMonedas(precioCompra)}`;

        description += `\n\n**Este es el precio al ${descuento * 100}%**: ${calcularMonedas(precioDescuento)}`;

        if (rarezaObjeto === 'Legendary' && !excludedLegendaryItems.has(objetoId) && ectosRequeridos !== null) {
          description += `\n\n**Ectos a dar/recibir**: ${ectosRequeridos} <:glob:1134942274598490292>`;
          description += `\n**Número de Stacks de Ectos**: ${numStacksEctos} <:glob:1134942274598490292>`;
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

// Función para encontrar la ID del objeto por nombre
function findObjectIdByName(name) {
  for (const [id, item] of itemsMap) {
    if (item.mainName.toLowerCase() === name.toLowerCase() || item.altNames.some(altName => altName.toLowerCase() === name.toLowerCase())) {
      return id;
    }
  }
  return null;
}
