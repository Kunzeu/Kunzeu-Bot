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
  [85016, { mainName: 'Blue', altNames: ['blue'] }],
  [84731, { mainName: 'Green', altNames: ['green'] }],
  [83008, { mainName: 'Yellow', altNames: ['yellow'] }],
  [19721, { mainName: 'Glob of Ectoplasm', altNames: ['Ectos', 'ecto'] }],
  [86497, {mainName: 'Extractor', altNames: ['extractor']}],
  [29166, {mainName: 'Tooth of Frostfang', altNames: ['Diente', 'diente']}],
  [29167, {mainName: 'Spark', altNames: ['Chispa', 'chispa']}],
  [29168, {mainName: 'The Bard', altNames: ['Bardo', 'bardo']}],
  [29169, {mainName: 'Dawn', altNames: ['Alba', 'alba']}],
  [29170, {mainName: 'Coloso', altNames: ['coloso']}],
  [29171, {mainName: 'Carcharias', altNames: ['carcharias']}],
  [29172, {mainName: 'Leaf of Kudzu', altNames: ['Hoja de Kudzu', 'pkudzu']}],
  [29173, {mainName: 'The Energizer', altNames: ['Energizador', 'energizador']}],
  [29174, {mainName: 'Chaos Gun', altNames: ['Caos', 'caos']}],
  [29175, {mainName: 'The Hunter', altNames: ['cazador', 'Cazador']}],
  [29176, {mainName: 'Storm', altNames: ['Tormenta', 'tormenta']}],
  [29177, {mainName: 'The Chosen', altNames: ['Elegido', 'elegido']}],
  [29178, {mainName: 'The Lover', altNames: ['Amante', 'amante']}],
  [29179, {mainName: 'Rage', altNames: ['Rabia', 'rabia']}],
  [29180, {mainName: 'The Legend', altNames: ['Leyenda', 'leyenda']}],
  [29181, {mainName: 'Zap', altNames: ['Zas', 'zas']}],
  [29182, {mainName: "Rodgort's Flame", altNames: ['Llama de Rodgort', 'llama']}],
  [29183, {mainName: 'Venom', altNames: ['Veneno', 'veneno']}],
  [29184, {mainName: 'Howl', altNames: ['Aullido', 'aullido']}],
  [29185, {mainName: 'Dusk', altNames: ['Anochecer', 'anochecer']}],
  [48917, {mainName: 'Toxic Focusing Crystal', altNames: ['Cristal', 'cristal']}],
  [89216, {mainName: 'Charm of Skill', altNames: ['habilidad', 'Habilidad']}],
  [89103, {mainName: 'Charm of Brilliance', altNames: ['Brillantez', 'brillantez']}],
  [89103, {mainName: 'Charm of Potence', altNames: ['Potencia', 'potencia']}],
  [89141, {mainName: 'Símbolo de mejora', altNames: ['mejora', 'Mejora']}],
  [89182, {mainName: 'Símbolo de dolor', altNames: ['Dolor', 'dolor']}],
  [89098, {mainName: 'Símbolo de control', altNames: ['control', 'Control']}],
  [74326, {mainName: 'Sello superior de Transferencia', altNames: ['Transferencia', 'transferencia']}],
  [44944, {mainName: 'Sello superior de Estallido', altNames: ['Estallido', 'estallido']}],
  [24562, {mainName: 'Símbolo de Fechorias', altNames: ['Fechorias', 'fechorias']}],
  [68436, {mainName: 'Sello superior de Fortaleza', altNames: ['Fortaleza', 'fortaleza']}],
  [48911, {mainName: 'Sello superior de Tormento', altNames: ['Tormento', 'tormento']}],
  [24609, {mainName: 'Sello superior de Condena', altNames: ['Condena', 'condena']}],
  [44950, {mainName: 'Sello superior de Malicia ', altNames: ['Malicia', 'malicia']}],
  [24639, {mainName: 'Sello superior de Parálisis ', altNames: ['Parálisis', 'paralisis']}],
  [24800, {mainName: 'Runa superior de Elementalista ', altNames: ['Elementalista', 'elementalista']}],
  [24818, {mainName: 'Runa superior de ladrón', altNames: ['Ladrón', 'ladron']}],
  [24830, {mainName: 'Runa superior de Aventurero', altNames: ['Aventurero', 'aventurero']}],
  [44956, {mainName: 'Runa superior de Tormento', altNames: ['Runa Tormento', 'runa tormento']}],
  [24720, {mainName: 'Runa superior de Velocidad', altNames: ['Velocidad', 'velocidad']}],
  [24836, {mainName: 'Runa superior de Erudito', altNames: ['Erudito', 'Schoolar']}],
  [24833, {mainName: 'Runa superior del Pendenciero', altNames: ['Pendenciero', 'pendenciero']}],
  [89999, {mainName: 'Runa superior de Fuegos Artificiales', altNames: ['Fuego', 'Fuego']}],
  [24762, {mainName: 'Runa superior del Krait', altNames: ['Krait', 'Krait']}],
  [49424, {mainName: '+1 Agony Infusion', altNames: ['+1', '+1']}],
  [49428, {mainName: '+5 Agony Infusion', altNames: ['+5', '+5']}],  
  [49429, {mainName: '+6 Agony Infusion', altNames: ['+6', '+6']}],
  [49430, {mainName: '+7 Agony Infusion', altNames: ['+7', '+7']}],
  [49431, {mainName: '+8 Agony Infusion', altNames: ['+8', '+8']}],
  [49432, {mainName: '+9 Agony Infusion', altNames: ['+9', '+9']}],
  [49433, {mainName: '+10 Agony Infusion', altNames: ['+10', '+10']}],
  [49434, {mainName: '+11 Agony Infusion', altNames: ['+11', '+11']}],
  [49438, {mainName: '+15 Agony Infusion', altNames: ['+15', '+15']}],
  [49438, {mainName: '+16 Agony Infusion', altNames: ['+16', '+16']}],
  [44941, {mainName: 'Watchwork Sprocket', altNames: ['Watchwork', 'Engranaje']}],
  [73248, {mainName: 'Stabilizing Matrix', altNames: ['Matrix', 'Matrix']}],
  [72339, {mainName: 'Sello superior de concentración', altNames: ['Vor', 'vor']}],
  [48884, {mainName: 'Pristine Toxic Spore Sample', altNames: ['Espora', 'Pristine']}],
  [92687, {mainName: 'Amalgamated Draconic Lodestone', altNames: ['Amal', 'amal']}],
  [24325, {mainName: 'Destroyer Lodestone', altNames: ['Destructor', 'destructor']}],
  [24330, {mainName: 'Crystal Lodestone', altNames: ['Cristal', 'cristal']}],
  [70842, {mainName: 'Mordrem Lodestone', altNames: ['mordrem', 'Mordrem']}],
  [24340, {mainName: 'Corrupted Lodestone', altNames: ['Corrupta', 'corrupta']}],
]);


const excludedLegendaryItems = new Set([96978, 96722]);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Muestra el precio y la imagen de un objeto.')
    .addStringOption(option =>
      option.setName('objeto')
        .setDescription('ID o nombre del objeto para obtener el precio y la imagen.')
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
        const imagenObjeto = objetoDetails.icon;

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
        let ectosAdicionales = null;
        if (rarezaObjeto === 'Legendary') {
          const precioEcto = await getPrecioEcto();
          if (precioEcto !== null) {
            ectosRequeridos = Math.ceil(precioDescuento / (precioEcto * 0.9)); // Ectos al 90% del precioDescuento
            numStacksEctos = Math.floor(ectosRequeridos / 250); // Número de stacks de ectos
            ectosAdicionales = ectosRequeridos % 250; // Ectos adicionales
          }
        }

        // Crea el mensaje de tipo Embed con los precios y el número de ectos requeridos
        let description = `Precio de venta (Sell): ${calcularMonedas(precioVenta)}\n` +
          `Precio de compra (Buy): ${calcularMonedas(precioCompra)}`;

        description += `\n\n**Este es el precio al ${descuento * 100}%**: ${calcularMonedas(precioDescuento)}`;

        if (rarezaObjeto === 'Legendary' && !excludedLegendaryItems.has(objetoId) && ectosRequeridos !== null) {
          description += `\n\n**Ectos a dar/recibir**: ${numStacksEctos} stack${numStacksEctos === 1 ? '' : 's'} y ${ectosAdicionales} adicionales (Total: ${ectosRequeridos} <:glob:1134942274598490292>)`;
        }

        const embed = {
          title: `Precio e imagen del objeto: ${nombreObjeto}`,
          description: description,
          color: 0x00ffff, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
          thumbnail: {
            url: `https://render.guildwars2.com/file/${imagenObjeto}/64.png`, // Tamaño de la imagen (64x64)
          },
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