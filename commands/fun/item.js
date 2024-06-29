const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { getGw2ApiData } = require('../utility/api.js'); // Ajusta la ruta según tu estructura de archivos


// Mapeo bidireccional de ID y nombre de objetos
const itemsMap = new Map([
  [30684, {mainName: 'Frostfang', altNames: ['Frost', 'Colmilloescarcha','ff'] }],
  [30685, {mainName: 'Kudzu', altNames: ['kudzu'] }],
  [30686, {mainName: 'The Dreamer', altNames: ['Soñador'] }],
  [30687, {mainName: 'Incinerator', altNames: ['Incineradora', 'inci'] }],
  [30688, {mainName: 'The Minstrel', altNames: ['Juglar'] }],
  [30689, {mainName: 'Eternity', altNames: ['Eternidad', 'eter'] }],
  [30690, {mainName: 'The Juggernaut', altNames: ['Juggernaut','jug'] }],
  [30691, {mainName: "Kamohoali'i Kotaki", altNames: ['Kotaki', 'lanza'] }],
  [30692, {mainName: 'The Moot', altNames: ['Festin','fes'] }],
  [30693, {mainName: 'Quip', altNames: ['Gracia'] }],
  [30694, {mainName: 'The Predator', altNames: ['Depredador', 'Pred'] }],
  [30695, {mainName: 'Meteorlogicus', altNames: ['Meteorlógico', 'meteor'] }],
  [30696, {mainName: 'The Flameseeker Prophecies', altNames: ['FSP'] }],
  [30697, {mainName: 'Frenzy', altNames: ['frenzy'] }],
  [30698, {mainName: 'The Bifrost', altNames: ['Bifrost'] }],
  [30699, {mainName: 'Bolt', altNames: ['Haz'] }],
  [30700, {mainName: 'Rodgort', altNames: ['Rodgort', 'rod'] }],
  [30701, {mainName: 'Kraitkin', altNames: ['kraitkin']}],
  [30702, {mainName: 'Howler', altNames: ['Aullador', 'aull'] }],
  [30703, {mainName: 'Sunrise', altNames: ['Amanecer','ama'] }],
  [30704, {mainName: 'Twilight', altNames: ['Crepusculo','crep'] }],
  [95612, {mainName: `Aurene's Tail`, altNames: ['maza', 'Cola de Aurene', 'Tail'] }],
  [95675, {mainName: "Aurene's Fang", altNames: ['espada', 'Colmillo de Aurene', 'Fang'] }],
  [95808, {mainName: "Aurene's Argument", altNames: ['pistola', 'Argumento de Aurene', 'Argument'] }],
  [96028, {mainName: "Aurene's Scale", altNames: ['escudo', 'Escama de Aurene', 'Scale'] }],
  [96203, {mainName: "Aurene's Claw", altNames: ['daga', 'Garra de Aurene', 'Claw'] }],
  [96221, {mainName: "Aurene's Wisdom", altNames: ['cetro', 'Sabiduría de Aurene', 'Wisdom'] }],
  [96356, {mainName: "Aurene's Bite", altNames: ['mandoble', 'mand', 'Mordisco de Aurene','Bite'] }],
  [96652, {mainName: "Aurene's Insight", altNames: ['baculo', 'Visión de Aurene', 'Insight', 'staff'] }],
  [96937, {mainName: "Aurene's Rending", altNames: ['hacha', 'Desgarramiento de Aurene', 'Rending'] }],
  [97077, {mainName: "Aurene's Wing", altNames: ['LS','ls', 'Ala de Aurene', 'Wing', 'Arco Corto'] }],
  [97099, {mainName: "Aurene's Breath", altNames: ['antorcha', 'ant', 'Aliento de Aurene', 'Breath'] }],
  [97165, {mainName: "Aurene's Gaze", altNames: ['foco', 'Mirada de Aurene', 'Gaze'] }],
  [97377, {mainName: "Aurene's Persuasion", altNames: ['rifle', 'Persuasión de Aurene', 'Persuasion'] }],
  [97590, {mainName: "Aurene's Flight", altNames: ['LB', 'lb', 'Vuelo de Aurene','Flight', 'longbow'] }],
  [95684, {mainName: `Aurene's Weight`, altNames: ['martillo', 'Peso de Aurene','Weight'] }],
  [97783, {mainName: `Aurene's Voice`, altNames: ['Voice', 'cuerno', 'Voz de Aurene', 'Voice'] }],
  [96978, {mainName: 'Antique Summoning Stone', altNames: ['ASS', 'ass'] }],
  [96722, {mainName: 'Jade Runestone', altNames: ['runestone', 'jade'] }],
  [96347, {mainName: 'Chunk of Ancient Ambergris', altNames: ['Amber', 'amber'] }],
  [85016, {mainName: 'Blue', altNames: ['blue'] }],
  [84731, {mainName: 'Green', altNames: ['green'] }],
  [83008, {mainName: 'Yellow', altNames: ['yellow'] }],
  [19721, {mainName: 'Glob of Ectoplasm', altNames: ['Ectos'] }],
  [86497, {mainName: 'Extractor', altNames: ['extractor']}],
  [29166, {mainName: 'Tooth of Frostfang', altNames: ['Diente']}],
  [29167, {mainName: 'Spark', altNames: ['Chispa']}],
  [29168, {mainName: 'The Bard', altNames: ['Bardo']}],
  [29169, {mainName: 'Dawn', altNames: ['Alba']}],
  [29170, {mainName: 'Coloso', altNames: ['coloso']}],
  [29171, {mainName: 'Carcharias', altNames: ['carcharias']}],
  [29172, {mainName: 'Leaf of Kudzu', altNames: ['Hoja de Kudzu', 'pkudzu']}],
  [29173, {mainName: 'The Energizer', altNames: ['Energizador']}],
  [29174, {mainName: 'Chaos Gun', altNames: ['Caos']}],
  [29175, {mainName: 'The Hunter', altNames: ['cazador']}],
  [29176, {mainName: 'Storm', altNames: ['Tormenta']}],
  [29177, {mainName: 'The Chosen', altNames: ['Elegido']}],
  [29178, {mainName: 'The Lover', altNames: ['Amante']}],
  [29179, {mainName: 'Rage', altNames: ['Rabia']}],
  [29180, {mainName: 'The Legend', altNames: ['Leyenda']}],
  [29181, {mainName: 'Zap', altNames: ['Zas']}],
  [29182, {mainName: "Rodgort's Flame", altNames: ['Llama de Rodgort', 'llama']}],
  [29183, {mainName: 'Venom', altNames: ['Veneno']}],
  [29184, {mainName: 'Howl', altNames: ['Aullido']}],
  [29185, {mainName: 'Dusk', altNames: ['Anochecer']}],
  [48917, {mainName: 'Toxic Focusing Crystal', altNames: ['Cristal', 'Crystal', 'Toxic']}],
  [89216, {mainName: 'Charm of Skill', altNames: ['Habilidad', 'Skill']}],
  [89258, {mainName: 'Charm of Potence', altNames: ['Potencia', 'Potence']}],
  [89103, {mainName: 'Charm of Brilliance', altNames: ['Brillantez', 'Brilliance']}],
  [89141, {mainName: 'Símbolo de mejora', altNames: ['Mejora', 'Enha']}],
  [89182, {mainName: 'Símbolo de dolor', altNames: ['Dolor', 'Pain']}],
  [89098, {mainName: 'Símbolo de control', altNames: ['Control']}],
  [74326, {mainName: 'Sello superior de Transferencia', altNames: ['Transferencia', 'Trans']}],
  [44944, {mainName: 'Sello superior de Estallido', altNames: ['Estallido', 'Bursting']}],
  [24562, {mainName: 'Sello superior de fechorías  ', altNames: ['Fechorias', 'Mischief']}],
  [68436, {mainName: 'Sello superior de Fortaleza', altNames: ['Fortaleza', 'Strength']}],
  [48911, {mainName: 'Sello superior de Tormento', altNames: ['Tormento', 'Torment']}],
  [24609, {mainName: 'Sello superior de Condena', altNames: ['Condena', 'Doom']}],
  [44950, {mainName: 'Sello superior de Malicia ', altNames: ['Malicia', 'Malice']}],
  [24639, {mainName: 'Sello superior de Parálisis ', altNames: ['Paralisis', 'Paralyzation']}],
  [24800, {mainName: 'Runa superior de Elementalista ', altNames: ['Elementalista', 'Elementalist']}],
  [24818, {mainName: 'Runa superior de ladrón', altNames: ['Ladrón', 'ladron', 'thief']}],
  [24830, {mainName: 'Runa superior de Aventurero', altNames: ['Aventurero', 'Adventurer']}],
  [44956, {mainName: 'Runa superior de Tormento', altNames: ['Runa Tormento', 'STorment']}],
  [24720, {mainName: 'Runa superior de Velocidad', altNames: ['Velocidad', 'Speed']}],
  [24836, {mainName: 'Runa superior de Erudito', altNames: ['Erudito', 'Schoolar']}],
  [24833, {mainName: 'Runa superior del Pendenciero', altNames: ['Pendenciero', 'Brawler']}],
  [89999, {mainName: 'Runa superior de Fuegos Artificiales', altNames: ['Fuego', 'Fireworks']}],
  [24762, {mainName: 'Runa superior del Krait', altNames: ['Krait']}],
  [24839, {mainName: 'Runa superior del agua', altNames: ['agua', 'water']}],
  [74978, {mainName: 'Superior Rune of the Dragonhunter', altNames: ['Dragon']}],
  [49424, {mainName: '+1 Agony Infusion', altNames: ['+1']}],
  [49428, {mainName: '+5 Agony Infusion', altNames: ['+5']}],  
  [49429, {mainName: '+6 Agony Infusion', altNames: ['+6']}],
  [49430, {mainName: '+7 Agony Infusion', altNames: ['+7']}],
  [49431, {mainName: '+8 Agony Infusion', altNames: ['+8']}],
  [49432, {mainName: '+9 Agony Infusion', altNames: ['+9']}],
  [49433, {mainName: '+10 Agony Infusion', altNames: ['+10']}],
  [49434, {mainName: '+11 Agony Infusion', altNames: ['+11']}],
  [49438, {mainName: '+15 Agony Infusion', altNames: ['+15']}],
  [49438, {mainName: '+16 Agony Infusion', altNames: ['+16']}],
  [44941, {mainName: 'Watchwork Sprocket', altNames: ['Watchwork', 'Engranaje']}],
  [73248, {mainName: 'Stabilizing Matrix', altNames: ['Matrix']}],
  [72339, {mainName: 'Sello superior de concentración', altNames: ['Vor', 'Vortus']}],
  [48884, {mainName: 'Pristine Toxic Spore', altNames: ['Espora', 'Pristine', 'Spore']}],
  [92687, {mainName: 'Amalgamated Draconic Lodestone', altNames: ['Amal', 'Draconic']}],
  [24325, {mainName: 'Destroyer Lodestone', altNames: ['Destructor', 'Destroyer']}],
  [24330, {mainName: 'Crystal Lodestone', altNames: ['Cristal', 'CrystalL']}],
  [70842, {mainName: 'Mordrem Lodestone', altNames: ['mordrem']}],
  [24340, {mainName: 'Corrupted Lodestone', altNames: ['Corrupta', 'Corrupted']}],
  [96193, {mainName: "Dragon's Wisdom", altNames: ["Sabiduría", 'DWisdom']}],
  [95814, {mainName: "Dragon's Insight", altNames: ["Visión", 'DInsight']}],
  [96303, {mainName: "Dragon's Gaze", altNames: ["Mirada", 'DGaze']}],
  [95834, {mainName: "Dragon's Flight", altNames: ["Vuelo", 'DFlight']}],
  [96915, {mainName: "Dragon's Argument", altNames: ["Argumento", 'Argument']}],
  [97267, {mainName: "Dragon's Persuasion", altNames: ["Persuasión", 'DPersuasion']}],
  [96330, {mainName: "Dragon's Wing", altNames: ["Ala", 'DWing']}],
  [96925, {mainName: "Dragon's Breath", altNames: ["Aliento", 'DBreath']}],
  [97513, {mainName: "Dragon's Voice", altNames: ["Voz", 'DVoice']}],
  [97449, {mainName: "Dragon's Rending", altNames: ["Desgarramiento", 'DRending']}],
  [95967, {mainName: "Dragon's Claw", altNames: ["Garra", 'DClaw']}],
  [96357, {mainName: "Dragon's Bite", altNames: ["Mordisco", 'DBite']}],
  [95920, {mainName: "Dragon's Weight", altNames: ["Peso", 'DWeight']}],
  [96827, {mainName: "Dragon's Tail", altNames: ["Cola", 'DTail']}],
  [97691, {mainName: "Dragon's Scale", altNames: ["Escama", 'DScale']}],
  [95994, {mainName: "Dragon's Fang", altNames: ["colmillo", 'DFang']}],
  [100893, {mainName: "Relic of the Zephyrite", altNames: ['RZephyrite'] }],
  [100455, {mainName: 'Relic of Durability', altNames: ['RDurability'] }],
  [100400, {mainName: 'Relic of the Sunless', altNames: ['RSunless'] }],
  [100579, {mainName: 'Relic of the Nightmare', altNames: ['RNightmare'] }],
  [100542, {mainName: 'Relic of the Cavalier', altNames: ['RCavalier'] }],
  [100924, {mainName: 'Relic of the Deadeye', altNames: ['RDeadeye'] }],
  [100345, {mainName: 'Relic of the Daredevil', altNames: ['RDaredevil'] }],
  [100148, {mainName: 'Relic of Speed', altNames: ['RSpeed'] }],
  [100368, {mainName: 'Relic of the Scourge', altNames: ['RScourge'] }],
  [100048, {mainName: 'Relic of the Ice', altNames: ['RIce'] }],
  [100561, {mainName: 'Relic of the Adventurer', altNames: ['RAdventurer'] }],
  [100947, {mainName: 'Relic of Fireworks', altNames: ['RFireworks'] }],
  [100450, {mainName: 'Relic of the Chronomancer', altNames: ['RChronomancer'] }],
  [100739, {mainName: 'Relic of the Reaper', altNames: ['RReaper'] }],
  [100442, {mainName: 'Relic of Dwayna', altNames: ['RDwayna'] }],
  [100934, {mainName: 'Relic of the Defender', altNames: ['RDefender'] }],
  [100144, {mainName: 'Relic of the Warrior', altNames: ['RWarrior'] }],
  [100527, {mainName: 'Relic of the Brawler', altNames: ['RBrawler'] }],
  [100219, {mainName: 'Relic of the Herald', altNames: ['RHerald'] }],
  [100194, {mainName: 'Relic of the Weaver', altNames: ['RWeaver'] }],
  [100625, {mainName: 'Relic of Leadership', altNames: ['RLeadership'] }],
  [100693, {mainName: 'Relic of the Afflicted', altNames: ['RAfflicted'] }],
  [100659, {mainName: 'Relic of the Water', altNames: ['RWater'] }],
  [100090, {mainName: 'Relic of the Dragonhunter', altNames: ['RDragonhunter'] }],
  [100916, {mainName: 'Relic of the Thief', altNames: ['RThief'] }],
  [100230, {mainName: 'Relic of the Krait', altNames: ['RKrait'] }],
  [100614, {mainName: 'Relic of Evasion', altNames: ['REvasion'] }],
  [100158, {mainName: 'Relic of the Mirage', altNames: ['RMirage'] }],
  [100849, {mainName: 'Relic of the Aristocracy', altNames: ['RAristocracy'] }],
  [100429, {mainName: 'Relic of Mercy', altNames: ['RMercy'] }],
  [100453, {mainName: 'Relic of the Firebrand', altNames: ['RFirebrand'] }],
  [100385, {mainName: 'Relic of the Centaur', altNames: ['RCentaur'] }],
  [100448, {mainName: 'Relic of the Citadel', altNames: ['RCitadel'] }],
  [100580, {mainName: 'Relic of the Necromancer', altNames: ['RNecromancer'] }],
  [100794, {mainName: 'Relic of Resistance', altNames: ['RResistance'] }],
  [99965, {mainName: 'Relic of the Flock', altNames: ['RFlock'] }],
  [100031, {mainName: 'Relic of the Monk', altNames: ['RMonk'] }],
  [100390, {mainName: 'Relic of Antitoxin', altNames: ['RAntitoxin'] }],
  [100411, {mainName: 'Relic of the Trooper', altNames: ['RTrooper'] }],
  [35986, {mainName:  'Bazar', altNames: ['express']}],
  [36038, {mainName:  'Trick-or-Treat Bag', altNames: ['tot']}],
  [99956, {mainName:  'Enchanted Music Box', altNames: ['music']}],
  [96088, {mainName:  'Memory of Aurene', altNames: ['Aurene', 'Recuerdo de Aurene']}],
  [71581, {mainName:  'Memory of Battle', altNames: ['Memoria', 'Memoria de Batalla', 'WvW']}],
  [77604, {mainName:  'Wintersday Gift', altNames: ['Navidad', 'regalos', 'gift']}],
  [83410, {mainName:  'Supreme Rune of Holding', altNames: ['Holding', 'sujecion', 'Supreme']}],
  [8920, {mainName:  'Heavy Loot Bag', altNames: ['Saco de botín pesado  ', 'Loot', 'Heavy']}],
  [70820, {mainName:  'Shard of Glory', altNames: ['Gloria', 'Esquirla de gloria  ', 'PvP']}],
  [68646, {mainName: 'Divine Lucky Envelope', altNames: ['DLE', 'Sobre de la suerte divino']}],
  [12238, {mainName: 'Lechuga', altNames: ['Head of Lettuce']}],
  [24295, {mainName: 'Vial of Powerful Blood', altNames: ['Blood']}],
  [24358, {mainName: 'Ancient Bone', altNames: ['Bone']}],
  [24351, {mainName: 'Vicious Claw', altNames: ['Claws']}],
  [24357, {mainName: 'Vicious Fang', altNames: ['Fangs']}],
  [24289, {mainName: 'Armored Scale', altNames: ['Scales']}],
  [24300, {mainName: 'Elaborate Totem', altNames: ['Tótem', 'Totem']}],
  [24283, {mainName: 'Powerful Venom Sac', altNames: ['Venom']}],
  [24277, {mainName: 'Pile of Crystalline Dust', altNames: ['Dust']}],
  [68063, {mainName: 'Amalgamated Gemstone', altNames: ['Gem', 'amalgamada']}],
  [19976, {mainName: 'Mystic Coin', altNames: ['MC', 'mc', 'Monedas Misticas']}],
  [19721, {mainName: 'Ecto', altNames: ['Ectos', 'Globs']}],
  

]);


const excludedLegendaryItems = new Set([96978, 96722]);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('item')
    .setDescription('Displays the price and image of an object.')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('ID or name of the object to obtain the price and the image.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantity')
        .setDescription('The quantity of the item to calculate the price for.')
        .setRequired(true)),

  async execute(interaction) {
    const input = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;
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
        await interaction.reply('The object with that ID or name was not found.');
        return;
      }

      // Realiza la solicitud a la API para obtener el precio del objeto
      const response = await axios.get(`https://api.guildwars2.com/v2/commerce/prices/${objetoId}`);
      const objeto = response.data;

      // Verifica si el objeto tiene información válida y precios de venta
      if (objeto && objeto.sells && objeto.buys) {
        const precioVenta = objeto.sells.unit_price * quantity;
        const precioCompra = objeto.buys.unit_price * quantity;

        // Realiza una segunda solicitud a la API para obtener los detalles del objeto, incluido su nombre, rareza e imagen
        const responseDetails = await axios.get(`https://api.guildwars2.com/v2/items/${objetoId}?lang=en`);
        const objetoDetails = responseDetails.data;

        // Obtiene el nombre, la rareza y la imagen del objeto
        const nombreObjeto = objetoDetails.name;
        const rarezaObjeto = objetoDetails.rarity;
        const imagenObjeto = objetoDetails.icon;

        // Calcula el precio al 85% si el objeto es legendary, de lo contrario, calcula al 90%
        const descuento = rarezaObjeto === 'Legendary' && !excludedLegendaryItems.has(objetoId) ? 0.85 : 0.9;
        const precioDescuento = Math.round(precioVenta * descuento);
        const precioDescuentoUnidad = Math.round(objeto.sells.unit_price * descuento); // Precio del ítem en cantidad 1

        // Calcula la cantidad de oro, plata y cobre para los precios
        const calcularMonedas = (precio) => {
          const oro = Math.floor(precio / 10000);
          const plata = Math.floor((precio % 10000) / 100);
          let cobre = Math.round(precio % 100);

          // Redondeo adicional para los cobres si el decimal es >= 5
          if (cobre >= 100) {
            plata += 1;
            cobre = 0;
          }

          if (plata >= 100) {
            oro += 1;
            plata = 0;
          }

          return `${oro} <:gold:1134754786705674290> ${plata} <:silver:1134756015691268106> ${cobre} <:Copper:1134756013195661353>`;
        };

        // Calcula la cantidad de ectos y Monedas Místicas requeridos si el objeto es de rareza "Legendary"
        let ectosRequeridos = null;
        let numStacksEctos = null;
        let ectosAdicionales = null;
        let monedasMisticasRequeridas = null;
        let numStacksMonedas = null;
        let monedasAdicionales = null;

        if (rarezaObjeto === 'Legendary') {
          const precioEcto = await getPrecioEcto();
          const precioMonedaMistica = await getPrecioMonedaMistica();
          if (precioEcto !== null) {
            ectosRequeridos = Math.ceil(precioDescuento / (precioEcto * 0.9)); // Ectos al 90% del precioDescuento
            numStacksEctos = Math.floor(ectosRequeridos / 250); // Número de stacks de ectos
            ectosAdicionales = ectosRequeridos % 250; // Ectos adicionales
          }
          if (precioMonedaMistica !== null) {
            monedasMisticasRequeridas = Math.ceil(precioDescuento / (precioMonedaMistica * 0.9)); // Monedas Místicas al 90% del precioDescuento
            numStacksMonedas = Math.floor(monedasMisticasRequeridas / 250); // Número de stacks de monedas místicas
            monedasAdicionales = monedasMisticasRequeridas % 250; // Monedas adicionales
          }
        }

        // Crea el mensaje de tipo Embed con los precios y el número de ectos requeridos
        let description = `Sell price (Sell): ${calcularMonedas(precioVenta)}\n` +
          `Buy price (Buy): ${calcularMonedas(precioCompra)}`;

        description += `\n\n**Sell price of ${nombreObjeto} at ${descuento * 100}%**: ${calcularMonedas(precioDescuentoUnidad)}`;
        description += `\n\n**_Sell price of ${quantity} ${nombreObjeto} at ${descuento * 100}%: ${calcularMonedas(precioDescuento)}_**`;

        if (rarezaObjeto === 'Legendary' && !excludedLegendaryItems.has(objetoId)) {
          const precioEcto = await getPrecioEcto();
          const precioMonedaMistica = await getPrecioMonedaMistica();
          description += `\n\n**Price of Ectos at 90%**: ${calcularMonedas(Math.round(precioEcto * 0.9))}`;
          description += `\n\n**Price of Mystic Coins at 90%**: ${calcularMonedas(Math.round(precioMonedaMistica * 0.9))}`;

          if (ectosRequeridos !== null) {
            description += `\n\n**Ectos to give/receive**: ${numStacksEctos} stack${numStacksEctos === 1 ? '' : 's'} and ${ectosAdicionales} additional (Total: ${ectosRequeridos} <:glob:1134942274598490292>)`;
          }
          if (monedasMisticasRequeridas !== null) {
            description += `\n\n**Mystic Coins to give/receive**: ${numStacksMonedas} stack${numStacksMonedas === 1 ? '' : 's'} and ${monedasAdicionales} additional (Total: ${monedasMisticasRequeridas} <:mystic_coin:19976>)`;
          }
        }

        const ltcLink = `https://www.gw2bltc.com/en/item/${objetoId}`;
        const iconURL = await getIconURL(objetoId);

        const embed = {
          title: `Price of the item: ${nombreObjeto}`,
          description: description,
          color: 0x00ffff, // Color del borde del Embed (opcional, puedes cambiarlo o quitarlo)
          thumbnail: { url: `${iconURL}` },
          fields: [
            {
              name: 'Link to GW2BLTC',
              value: ltcLink,
            },
          ],
        };

        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply('The object does not have a valid selling price in the API.');
      }
    } catch (error) {
      console.error('Error when making the API request:', error.message);
      await interaction.reply('Oops! There was an error getting the price of the object from the API.');
    }
  },
};

async function getIconURL(objetoId) {
  try {
    const response = await axios.get(`https://api.guildwars2.com/v2/items/${objetoId}`);
    const objetoDetails = response.data;
    return objetoDetails.icon;
  } catch (error) {
    console.error('Error getting the icon URL from the API:', error.message);
    return null;
  }
}

// Función para obtener el precio de los ectos
async function getPrecioEcto() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19721');
    const ecto = response.data;
    return ecto.sells.unit_price;
  } catch (error) {
    console.error('Error when getting the price of the ectos from the API:', error.message);
    return null;
  }
}

// Función para obtener el precio de las Monedas Místicas
async function getPrecioMonedaMistica() {
  try {
    const response = await axios.get('https://api.guildwars2.com/v2/commerce/prices/19976');
    const monedaMistica = response.data;
    return monedaMistica.sells.unit_price;
  } catch (error) {
    console.error('Error when getting the price of the Mystic Coins from the API:', error.message);
    return null;
  }
}

// Función para encontrar la ID del objeto por nombre
function findObjectIdByName(name) {
  for (const [id, item] of itemsMap) {
    const mainName = item.mainName.toLowerCase();
    if (mainName === name.toLowerCase() || (item.altNames && item.altNames.some(altName => altName.toLowerCase() === name.toLowerCase()))) {
      return id;
    }
  }
  return null;
}
