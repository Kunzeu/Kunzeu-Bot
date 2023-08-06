# Kunzeu Bot

Kunzeu Bot is a Discord bot dedicated to Guild Wars 2 players. It utilizes the Guild Wars 2 API (https://wiki.guildwars2.com/wiki/API:2) to provide accurate price information for various in-game items.

## Features

- **Ecto**: Get the current price of Glob of Ectoplasm.
- **MC**: Obtain the current price of Mystic Coins.
- **Items**: View prices for legendary items, precursor weapons, and other specified items.
- **Clovers**: Calculate the materials required to craft Mystic Clovers.
- **ID**: Perform a search using the ID of items not yet added to the items list.

## Screenshots

![Screenshot 1](https://cdn.discordapp.com/attachments/1112034916478222467/1137553827994816642/image.png)
![Screenshot 2](https://cdn.discordapp.com/attachments/1112034916478222467/1136506925320785920/image.png)
![Screenshot 3](https://cdn.discordapp.com/attachments/1112034916478222467/1136462131370401913/image.png)

## How to Use

1. Invite the bot to your Discord server using the provided invitation link.
2. Type `/ecto <quantity>` to get the current price of Glob of Ectoplasm.
3. Type `/mc <quantity>` to obtain the current price of Mystic Coins.
4. Type `/items` to view prices for specified legendary items, precursor weapons, and other items.
5. Type `/clovers <quantity>` to calculate the materials required to craft Mystic Clovers for a given quantity.
6. Type `/id <itemID>` to perform a search using the ID of an item not listed in the bot's database.

## Installation

To run the bot locally, follow these steps:

1. Clone this repository to your local machine.
2. Install the necessary dependencies using `npm install`.
3. Obtain a Guild Wars 2 API key from https://account.arena.net/applications and set it as an environment variable (`GW2_API_KEY`) or directly in the code (make sure to keep it secure).
4. Run the bot using `node index.js`.

## Contributions

Contributions to the project are welcome! If you find a bug or want to add a new feature, feel free to open an issue or submit a pull request.

## Disclaimer

Kunzeu Bot is a third-party application and is not affiliated with or endorsed by ArenaNet or Guild Wars 2. The bot is provided as-is and usage is at your own risk.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

